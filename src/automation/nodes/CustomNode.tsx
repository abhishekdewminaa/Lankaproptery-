import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { WorkflowNodeData } from '../types';
import { Settings, X } from 'lucide-react';

export function CustomNode({ data, selected }: { data: WorkflowNodeData, selected: boolean }) {
  let headerColor = 'bg-gray-100';
  let titleColor = 'text-gray-500';
  let dotColor = 'bg-gray-500';
  
  switch(data.category?.toLowerCase()) {
    case 'trigger':
      headerColor = 'bg-blue-50 text-blue-600 border-blue-100';
      titleColor = 'text-blue-600';
      dotColor = 'bg-blue-500';
      break;
    case 'action':
      headerColor = 'bg-green-50 text-green-600 border-green-100';
      titleColor = 'text-green-600';
      dotColor = 'bg-green-500';
      break;
    case 'condition':
      headerColor = 'bg-yellow-50 text-yellow-600 border-yellow-100';
      titleColor = 'text-yellow-600';
      dotColor = 'bg-yellow-500';
      break;
    case 'agent':
      headerColor = 'bg-purple-50 text-purple-600 border-purple-100';
      titleColor = 'text-purple-600';
      dotColor = 'bg-purple-500';
      break;
  }

  // Assuming node states could be passed later via data.status 
  // 'idle', 'running', 'success', 'error', 'disabled'
  const status = data.status || 'idle';
  
  let wrapperClass = 'border-gray-200 shadow-sm';
  if (selected) wrapperClass = 'border-blue-500 shadow-md';
  if (status === 'running') wrapperClass = 'border-blue-500 shadow-md animate-pulse';
  if (status === 'success') wrapperClass = 'border-green-500 shadow-sm';
  if (status === 'error') wrapperClass = 'border-red-500 shadow-sm animate-bounce';
  
  const opacity = status === 'disabled' ? 'opacity-50' : 'opacity-100';

  return (
    <div className={`w-[260px] bg-white rounded-xl border-2 ${wrapperClass} ${opacity} transition-all duration-200 overflow-hidden font-sans group`}>
      {data.category?.toLowerCase() !== 'trigger' && (
        <Handle 
          type="target" 
          position={Position.Left} 
          className="w-3 h-3 bg-gray-300 rounded-full border-2 border-white -ml-1.5" 
        />
      )}

      {/* Header */}
      <div className={`${headerColor} px-3 py-2 border-b flex justify-between items-center`}>
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
           <span className={`text-[10px] font-black uppercase tracking-widest ${titleColor}`}>
             {data.category}
           </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button className="text-gray-500 hover:text-gray-900"><Settings size={12} /></button>
           <button className="text-gray-500 hover:text-red-500"><X size={12} /></button>
        </div>
      </div>

      {/* Body */}
      <div className={`p-3 bg-white flex flex-col gap-2 ${status === 'disabled' ? 'line-through text-gray-400' : 'text-gray-600'}`}>
        <div className="flex items-center gap-2 mb-1">
           <span className="text-sm">{data.icon}</span>
           <span className="text-sm font-bold text-gray-900 leading-tight">{data.label}</span>
        </div>
        
        {data.config && Object.keys(data.config).length > 0 ? (
           <div className="pt-2 border-t border-gray-100 flex flex-col gap-1">
             {Object.entries(data.config).slice(0, 3).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center text-[10px]">
                   <span className="text-gray-400 font-bold uppercase tracking-wider truncate w-1/3">{key}</span>
                   <span className="text-gray-600 font-medium truncate w-2/3 text-right">
                     {typeof val === 'string' ? val : '...'}
                   </span>
                </div>
             ))}
           </div>
        ) : (
           <div className="pt-2 border-t border-gray-100">
             <div className="w-2/3 h-2 bg-gray-100 rounded-full mb-1"></div>
             <div className="w-1/2 h-2 bg-gray-100 rounded-full"></div>
           </div>
        )}
      </div>

      <div className="bg-gray-50 px-3 py-1.5 text-[10px] text-gray-500 font-mono border-t border-gray-200 flex items-center justify-between">
         <span>○ Output</span>
         <span className="text-gray-400 block w-full h-px bg-gray-200 mx-2"></span>
         <div className={`w-2 h-2 rounded-full border border-gray-300 ${dotColor.replace('bg-', 'border-')} bg-transparent`}></div>
      </div>

      {data.category?.toLowerCase() === 'condition' ? (
         <>
           <Handle 
             id="true"
             type="source" 
             position={Position.Right} 
             style={{ top: '65%' }}
             className="w-3 h-3 bg-green-500 rounded-full border-2 border-white -mr-1.5" 
           />
           <Handle 
             id="false"
             type="source" 
             position={Position.Right} 
             style={{ top: '85%' }}
             className="w-3 h-3 bg-red-500 rounded-full border-2 border-white -mr-1.5" 
           />
         </>
      ) : (
         <Handle 
           type="source" 
           position={Position.Right} 
           style={{ top: 'auto', bottom: '11px' }}
           className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white -mr-1.5" 
         />
      )}
    </div>
  );
}
