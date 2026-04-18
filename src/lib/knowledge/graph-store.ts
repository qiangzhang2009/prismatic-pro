import type { GraphNode, GraphEdge } from '@/lib/types';

export function buildPersonaGraph(personaIds: string[]): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const id of personaIds) {
    nodes.push({
      id,
      type: 'persona',
      label: id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      personaId: id,
      size: 40,
      color: '#D4A853',
    });
  }

  // Add mental model nodes
  const mentalModels = [
    { id: 'first-principles', label: 'First Principles', color: '#7CA1D4' },
    { id: 'value-investment', label: 'Value Investment', color: '#82C49A' },
    { id: 'minimalism', label: 'Minimalism', color: '#D4A853' },
    { id: 'stoicism', label: 'Stoicism', color: '#C4A882' },
    { id: 'confucianism', label: 'Confucianism', color: '#D4A87C' },
  ];

  for (const mm of mentalModels) {
    nodes.push({
      id: mm.id,
      type: 'mental_model',
      label: mm.label,
      modelId: mm.id,
      size: 20,
      color: mm.color,
    });
  }

  // Connect personas to mental models
  const connections: Record<string, string[]> = {
    'elon-musk': ['first-principles'],
    'benjamin-graham': ['value-investment'],
    'charlie-munger': ['value-investment'],
    'steve-jobs': ['minimalism'],
    'seneca': ['stoicism'],
    'marcus-aurelius': ['stoicism'],
    'confucius': ['confucianism'],
    'wang-yangming': ['confucianism'],
  };

  for (const [personaId, models] of Object.entries(connections)) {
    if (personaIds.includes(personaId)) {
      for (const modelId of models) {
        edges.push({
          source: personaId,
          target: modelId,
          type: 'uses',
          strength: 0.8,
        });
      }
    }
  }

  return { nodes, edges };
}

export function formatGraphForD3(nodes: GraphNode[], edges: GraphEdge[]) {
  return {
    nodes: nodes.map(n => ({ ...n })),
    links: edges.map(e => ({
      source: e.source,
      target: e.target,
      type: e.type,
      strength: e.strength,
    })),
  };
}
