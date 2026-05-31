import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { WorkflowNodeData } from '../types';

export function CustomNode({ data, selected }: { data: WorkflowNodeData, selected: boolean }) {
  let headerColor = 'bg-gray-200';
  let titleColor = 'text-gray-900';
  
  switch(data.category) {
    case 'trigger':
      headerColor = 'bg-blue-50';
      titleColor = 'text-blue-700';
      break;
    case 'action':
      headerColor = 'bg-green-50';
      titleColor = 'text-green-700';
      break;
    case 'condition':
      headerColor = 'bg-amber-50';
      titleColor = 'text-amber-700';
      break;
    case 'utility':
      headerColor = 'bg-purple-50';
      titleColor = 'text-purple-700';
      break;
  }

  return (
    <div className={`w-[280px] bg-white rounded-xl border ${selected ? 'border-[#1B5E20] shadow-[0_0_0_2px_rgba(27,94,32,0.2)]' : 'border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5'} transition-all duration-200 overflow-hidden`}>
      {/* Input Handle (if not trigger) */}
      {data.category !== 'trigger' && (
        <Handle 
          type="target" 
          position={Position.Left} 
          className="w-3 h-3 bg-[#94a3b8] rounded-full border-2 border-white -ml-1.5" 
        />
      )}

      {/* Header */}
      <div className={`${headerColor} px-4 py-3 flex items-center gap-2 border-b border-gray-100`}>
        <span className="text-base">{data.icon}</span>
        <span className={`text-xs font-black uppercase tracking-wider ${titleColor}`}>{data.label}</span>
      </div>

      {/* Body */}
      <div className="p-4 bg-white space-y-3">
        <p className="text-xs text-gray-500 font-medium leading-relaxed">
          {data.description}
        </p>
        
        {data.config && Object.keys(data.config).length > 0 && (
           <div className="pt-2 border-t border-gray-50 flex flex-col gap-1">
             {Object.entries(data.config).slice(0, 3).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center text-[10px]">
                   <span className="text-gray-400 font-bold uppercase track-wide truncate w-1/3">{key}</span>
                   <span className="text-gray-700 font-semibold truncate w-2/3 text-right">
                     {typeof val === 'string' ? val : '...'}
                   </span>
                </div>
             ))}
           </div>
        )}
      </div>

      {/* Output Handle */}
      {data.category === 'condition' ? (
         <>
           <Handle 
             id="true"
             type="source" 
             position={Position.Right} 
             style={{ top: '40%' }}
             className="w-3 h-3 bg-green-500 rounded-full border-2 border-white -mr-1.5" 
           />
           <Handle 
             id="false"
             type="source" 
             position={Position.Right} 
             style={{ top: '80%' }}
             className="w-3 h-3 bg-red-500 rounded-full border-2 border-white -mr-1.5" 
           />
         </>
      ) : (
         <Handle 
           type="source" 
           position={Position.Right} 
           className="w-3 h-3 bg-[#94a3b8] rounded-full border-2 border-white -mr-1.5" 
         />
      )}
    </div>
  );
}
