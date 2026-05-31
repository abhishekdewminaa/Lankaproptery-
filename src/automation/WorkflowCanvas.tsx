import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  ReactFlowProvider,
  Connection,
  Edge,
  Node,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Workflow, AutomationsNode } from './types';
import { NodeLibrary } from './NodeLibrary';
import { NodeConfigPanel } from './NodeConfigPanel';
import { X, Play, Save, Settings } from 'lucide-react';
import { CustomNode } from './nodes/CustomNode';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const nodeTypes = {
  customNode: CustomNode,
};

function FlowCanvas({ initialWorkflow, onBack }: { initialWorkflow: Workflow | null, onBack: () => void }) {
  const [nodes, setNodes] = useNodesState(initialWorkflow?.nodes || []);
  const [edges, setEdges] = useEdgesState(initialWorkflow?.edges || []);
  const [workflowName, setWorkflowName] = useState(initialWorkflow?.name || 'Untitled Workflow');
  const [isActive, setIsActive] = useState(initialWorkflow?.is_active || false);
  const [selectedNode, setSelectedNode] = useState<AutomationsNode | null>(null);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
  const onConnect = useCallback((connection: Connection) => setEdges((eds) => addEdge(connection, eds)), [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow/type');
    const label = event.dataTransfer.getData('application/reactflow/label');
    const category = event.dataTransfer.getData('application/reactflow/category');
    const icon = event.dataTransfer.getData('application/reactflow/icon');
    const description = event.dataTransfer.getData('application/reactflow/description');

    if (!type || !label) return;

    // We don't have reactFlowInstance here easily unless we use useReactFlow, 
    // but we can just use generic viewport position for now or hardcode for drop
    const position = {
      x: event.clientX - 260 - 50, // rough offset
      y: event.clientY - 60 - 50,
    };

    const newNode: AutomationsNode = {
      id: `${type}-${Date.now()}`,
      type: 'customNode',
      position,
      data: {
        type: type as any,
        label,
        category,
        icon,
        description,
        config: {}
      },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as AutomationsNode);
  };

  const handleUpdateNodeConfig = (nodeId: string, newConfig: any) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          n.data = { ...n.data, config: newConfig };
        }
        return n;
      })
    );
    setSelectedNode((prev) => {
       if (prev && prev.id === nodeId) {
          return { ...prev, data: { ...prev.data, config: newConfig } };
       }
       return prev;
    });
  };

  const handleSave = async () => {
    const payload = {
      name: workflowName,
      nodes,
      edges,
      is_active: isActive,
      trigger_type: nodes.find(n => n.data.type === 'trigger')?.data.label || 'Unknown',
    };

    try {
      if (initialWorkflow?.id) {
         await supabase.from('workflows').update(payload).eq('id', initialWorkflow.id);
      } else {
         await supabase.from('workflows').insert([payload]);
      }
      toast.success('Workflow saved');
    } catch (e: any) {
      toast.error('Error saving workflow. Pls check if table exists.');
    }
  };

  return (
    <div className="flex w-full h-full">
      {/* LEFT PANEL */}
      <div className="w-[260px] h-full border-r border-gray-200 bg-white flex flex-col z-10 shadow-sm">
        <NodeLibrary />
      </div>

      {/* CENTER CANVAS */}
      <div className="flex-1 h-full flex flex-col bg-[#0f172a] relative" onDrop={onDrop} onDragOver={onDragOver}>
        {/* TOP TOOLBAR */}
        <div className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2">
                <X size={20} className="text-gray-500" />
             </button>
             <input 
               type="text" 
               value={workflowName} 
               onChange={e => setWorkflowName(e.target.value)}
               className="text-lg font-black text-gray-900 bg-transparent border-none focus:ring-0 w-64 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors cursor-text"
               placeholder="Workflow Name"
             />
             <div className="h-6 w-px bg-gray-200 mx-2" />
             <label className="flex items-center gap-2 cursor-pointer">
               <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${isActive ? 'bg-[#1B5E20]' : 'bg-gray-300'}`}>
                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{isActive ? 'ACTIVE' : 'PAUSED'}</span>
             </label>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={async () => {
                 const { runWorkflow } = await import('./workflowEngine');
                 toast.loading('Running workflow...', { id: 'run' });
                 const wf: Workflow = {
                   id: initialWorkflow?.id,
                   name: workflowName,
                   nodes,
                   edges,
                   is_active: isActive
                 };
                 const res = await runWorkflow(wf, { test: true });
                 toast.success(`Workflow run completed: ${res.status}`, { id: 'run' });
               }}
               className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
             >
               <Play size={14} /> Run Now
             </button>
             <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-[#1B5E20] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:bg-[#2E7D32] transition-colors">
               <Save size={14} /> Save
             </button>
          </div>
        </div>

        {/* CANVAS */}
        <div className="flex-1 h-full w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={() => setSelectedNode(null)}
            nodeTypes={nodeTypes}
            fitView
            defaultEdgeOptions={{ animated: true, style: { strokeDasharray: 5, strokeWidth: 2, stroke: '#94a3b8' } }}
          >
            <Background color="#334155" size={1} gap={20} />
            <Controls className="bg-white border-none shadow-xl rounded-xl overflow-hidden fill-gray-700" />
            <MiniMap className="bg-[#1e293b] rounded-xl border border-gray-700 overflow-hidden" maskColor="rgba(15, 23, 42, 0.7)" />
          </ReactFlow>
        </div>
      </div>

      {/* RIGHT PANEL - Config */}
      <NodeConfigPanel 
        node={selectedNode} 
        onClose={() => setSelectedNode(null)} 
        onUpdate={handleUpdateNodeConfig} 
      />
    </div>
  );
}

export function WorkflowCanvas(props: any) {
   return (
     <ReactFlowProvider>
       <FlowCanvas {...props} />
     </ReactFlowProvider>
   );
}
