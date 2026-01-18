import React, { memo, useState, useCallback } from 'react';
import { NodeProps, NodeResizer, useReactFlow } from 'reactflow';

const GroupNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(data.title || 'Group Name');

  const onDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const onBlur = useCallback(() => {
    setIsEditing(false);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, title } };
        }
        return node;
      })
    );
  }, [id, title, setNodes]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onBlur();
    }
  }, [onBlur]);

  return (
    <div className={`w-full h-full border-2 border-dashed rounded-[32px] transition-all duration-300 pointer-events-none relative ${
      selected ? 'border-indigo-400 bg-indigo-50/5' : 'border-blue-400/60 bg-transparent'
    }`}>
      <NodeResizer 
        minWidth={200} 
        minHeight={150} 
        isVisible={selected} 
        lineClassName="!border-indigo-400" 
        handleClassName="!bg-white !border-2 !border-indigo-400 !w-3 !h-3 !rounded-full pointer-events-auto"
      />
      
      <div className="absolute top-4 left-6 flex items-center pointer-events-auto">
        {isEditing ? (
          <input
            autoFocus
            className="bg-white border border-indigo-400 rounded-lg px-2 py-0.5 text-[11px] font-bold text-gray-700 outline-none shadow-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
          />
        ) : (
          <div 
            onDoubleClick={onDoubleClick}
            className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-text hover:text-indigo-500 transition-colors"
          >
            {title || 'Double click to edit'}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(GroupNode);