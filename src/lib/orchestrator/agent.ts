import type { OrchestratorConfig, AgentMessage, SprintState, PipelineStage, StreamChunk } from '@/lib/types';
import { getPersonaPrompt, getPersona } from '@/lib/personas';
import { createShortTermMemory, type ShortTermMemory } from '@/lib/memory/short-term';
import { chatWithUserKey, streamChatWithUserKey } from '@/lib/llm';
import { LLM_CONFIG } from '@/lib/constants';

export type { OrchestratorConfig, AgentMessage, SprintState, PipelineStage };

// ── Agent Base Class ─────────────────────────────────────

export abstract class Agent {
  id: string;
  name: string;
  protected systemPrompt: string;
  protected shortTermMemory: ShortTermMemory;

  constructor(id: string, name: string, systemPrompt: string) {
    this.id = id;
    this.name = name;
    this.systemPrompt = systemPrompt;
    this.shortTermMemory = createShortTermMemory();
  }

  protected buildMessages(
    history: AgentMessage[],
    currentInput?: string
  ): Array<{ role: string; content: string }> {
    const msgs: Array<{ role: string; content: string }> = [];

    if (this.systemPrompt) {
      msgs.push({ role: 'system', content: this.systemPrompt });
    }

    for (const msg of history) {
      msgs.push({ role: msg.role, content: msg.content });
    }

    if (currentInput) {
      msgs.push({ role: 'user', content: currentInput });
    }

    return msgs;
  }

  clearMemory(): void {
    this.shortTermMemory.clear();
  }
}

// ── Persona Agent ──────────────────────────────────────

export class PersonaAgent extends Agent {
  private personaId: string;

  constructor(personaId: string) {
    const persona = getPersona(personaId);
    if (!persona) throw new Error(`Persona not found: ${personaId}`);

    const prompt = getPersonaPrompt(personaId) || '';
    super(personaId, persona.name, prompt);
    this.personaId = personaId;
  }

  getPersonaId(): string {
    return this.personaId;
  }

  async chat(
    userId: string,
    history: AgentMessage[],
    input: string,
    options?: { temperature?: number }
  ): Promise<AgentMessage> {
    const messages = this.buildMessages(history, input);

    // Add short-term memory context
    const memoryContext = this.shortTermMemory.getContext();
    if (memoryContext) {
      messages[0].content += `\n\n[Recent context from this conversation]:\n${memoryContext}`;
    }

    const response = await chatWithUserKey(userId, messages, {
      temperature: options?.temperature ?? LLM_CONFIG.TEMPERATURE,
      systemPrompt: messages[0].content,
    });

    // Store in short-term memory
    this.shortTermMemory.add(input, 'user');
    this.shortTermMemory.add(response.content, this.name);

    return {
      role: 'assistant',
      content: response.content,
      agentId: this.id,
      providerUsed: response.provider,
      modelUsed: response.model,
      tokensUsed: response.tokensUsed,
    };
  }

  async streamChat(
    userId: string,
    history: AgentMessage[],
    input: string,
    onChunk: (chunk: StreamChunk) => void,
    options?: { temperature?: number }
  ): Promise<AgentMessage> {
    const messages = this.buildMessages(history, input);

    const memoryContext = this.shortTermMemory.getContext();
    if (memoryContext) {
      messages[0].content += `\n\n[Recent context]:\n${memoryContext}`;
    }

    let fullContent = '';

    const response = await streamChatWithUserKey(
      userId,
      messages,
      {
        temperature: options?.temperature ?? LLM_CONFIG.TEMPERATURE,
        systemPrompt: messages[0].content,
      },
      (chunk) => {
        if (chunk.type === 'text') {
          fullContent += chunk.content;
        }
        onChunk({ ...chunk, personaId: this.personaId });
      }
    );

    this.shortTermMemory.add(input, 'user');
    this.shortTermMemory.add(fullContent, this.name);

    return {
      role: 'assistant',
      content: fullContent,
      agentId: this.id,
      providerUsed: response.provider,
      modelUsed: response.model,
      tokensUsed: response.tokensUsed,
    };
  }
}

// ── Synthesizer Agent ───────────────────────────────────

export class SynthesizerAgent extends Agent {
  constructor() {
    super(
      'synthesizer',
      'Synthesizer',
      `You are a synthesis agent that combines multiple perspectives into a coherent, insightful summary.
Your role:
- Identify consensus points across different viewpoints
- Highlight key disagreements and tensions
- Provide a nuanced conclusion that respects complexity
- Rate confidence in each perspective (0-1)

Respond in Chinese when the user writes in Chinese, otherwise in English.`
    );
  }

  async synthesize(
    userId: string,
    perspectives: Array<{ personaName: string; content: string }>,
    question: string
  ): Promise<{ synthesis: string; consensus: string[]; divergences: string[] }> {
    const prompt = `Question: ${question}

Perspectives from different thinkers:\n${perspectives.map(p => `## ${p.personaName}:\n${p.content}`).join('\n\n')}

Please synthesize these perspectives. Identify:
1. Key consensus points
2. Major divergences or tensions
3. A nuanced conclusion

Respond in the same language as the question.`;

    const response = await chatWithUserKey(userId, [
      { role: 'system', content: this.systemPrompt },
      { role: 'user', content: prompt },
    ]);

    // Simple parsing — in production, use structured output
    const lines = response.content.split('\n');
    const consensus = lines.filter(l => l.startsWith('- 共识:') || l.startsWith('- Consensus:')).map(l => l.replace(/^[-\s]+/, ''));
    const divergences = lines.filter(l => l.startsWith('- 分歧:') || l.startsWith('- Divergence:')).map(l => l.replace(/^[-\s]+/, ''));

    return {
      synthesis: response.content,
      consensus,
      divergences,
    };
  }
}

// ── Sprint Pipeline Orchestrator ─────────────────────────

const PIPELINE_STAGES: PipelineStage[] = ['think', 'plan', 'build', 'review', 'test', 'ship'];

export class SprintOrchestrator {
  private config: OrchestratorConfig;
  private personaAgents: Map<string, PersonaAgent> = new Map();
  private synthesizer: SynthesizerAgent;
  private history: AgentMessage[] = [];

  constructor(config: OrchestratorConfig) {
    this.config = config;
    this.synthesizer = new SynthesizerAgent();

    // Initialize persona agents
    for (const personaId of config.personas) {
      this.personaAgents.set(personaId, new PersonaAgent(personaId));
    }
  }

  getPersonaAgent(personaId: string): PersonaAgent | undefined {
    return this.personaAgents.get(personaId);
  }

  async runSprint(
    userId: string,
    input: string,
    stageConfig?: Partial<Record<PipelineStage, boolean>>
  ): Promise<SprintState> {
    const state: SprintState = {
      currentStage: 'think',
      confidence: 0,
      iterations: 0,
    };

    const cfg = { ...{ think: true, plan: true, build: true, review: true, test: true, ship: true }, ...stageConfig };

    // Sprint pipeline
    if (cfg.think) {
      state.thinkResult = await this.think(input);
      state.currentStage = 'plan';
    }

    if (cfg.plan) {
      state.planResult = await this.plan(state.thinkResult || input);
      state.currentStage = 'build';
    }

    if (cfg.build) {
      const perspectives = await Promise.all(
        Array.from(this.personaAgents.values()).map(agent =>
          agent.chat(userId, this.history, state.planResult || input).then(r => ({
            personaName: agent.name,
            content: r.content,
          }))
        )
      );
      state.buildResult = JSON.stringify(perspectives);
      state.currentStage = 'review';
    }

    if (cfg.review) {
      state.reviewResult = await this.review(state.buildResult || '');
      state.currentStage = 'test';
    }

    if (cfg.test) {
      state.testResult = await this.test(state.reviewResult || '');
      state.currentStage = 'ship';
    }

    if (cfg.ship) {
      state.shipResult = state.testResult;
      state.confidence = this.estimateConfidence(state);
    }

    return state;
  }

  private async think(input: string): Promise<string> {
    const agents = Array.from(this.personaAgents.values());
    if (agents.length === 0) return input;

    const responses = await Promise.all(
      agents.map(agent =>
        agent.chat('', [], `What is the core question or insight in: "${input}"? Think deeply.`)
      )
    );

    return responses.map(r => r.content).join('\n---\n');
  }

  private async plan(input: string): Promise<string> {
    return `Plan based on input:\n${input.slice(0, 500)}...`;
  }

  private async review(input: string): Promise<string> {
    return `Review notes for:\n${input.slice(0, 500)}...`;
  }

  private async test(input: string): Promise<string> {
    return `Refined response:\n${input.slice(0, 500)}...`;
  }

  private estimateConfidence(state: SprintState): number {
    let score = 0.5;
    if (state.thinkResult) score += 0.1;
    if (state.buildResult) score += 0.2;
    if (state.reviewResult) score += 0.1;
    return Math.min(1, score);
  }
}

// ── Moderator Agent ─────────────────────────────────────

export class ModeratorAgent extends Agent {
  constructor() {
    super(
      'moderator',
      'Moderator',
      `You are a thoughtful moderator who guides discussions, asks clarifying questions, and helps synthesize insights. You are fair, curious, and focused on getting the best out of every participant.
You respond in the same language as the conversation.`
    );
  }

  generateFollowUp(
    userId: string,
    topic: string,
    participants: string[]
  ): Promise<string> {
    return chatWithUserKey(
      userId,
      [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: `Given the topic "${topic}" and participants ${participants.join(', ')}, generate a thoughtful follow-up question to deepen the discussion.` },
      ]
    ).then(r => r.content);
  }
}
