import { Edge, Node } from '@xyflow/react';

export type NodeType = 'trigger' | 'action' | 'condition' | 'utility';

export interface WorkflowNodeData extends Record<string, unknown> {
  type: NodeType;
  label: string;
  category: string;
  icon: string;
  description: string;
  config: Record<string, any>;
}

export type AutomationsNode = Node<WorkflowNodeData>;

export interface Workflow {
  id?: string;
  name: string;
  description?: string;
  nodes: AutomationsNode[];
  edges: Edge[];
  is_active: boolean;
  trigger_type?: string;
  last_run_at?: string;
  run_count?: number;
}
