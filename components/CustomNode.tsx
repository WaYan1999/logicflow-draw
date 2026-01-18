import React, { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow, NodeResizer } from 'reactflow';
import { 
  Link2, Zap, Clock, Share2, Type, FileText, Database, 
  MessageSquareMore, Code2, Globe, ShieldAlert, Cpu, 
  Binary, Layers, Terminal 
} from 'lucide-react';
import { NodeData, NodeType } from '../types';

const CustomNode: React.FC<NodeProps<NodeData>> = ({ id, data, selected }) => {
  const { setNodes } = useReactFlow();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isEditingMethod, setIsEditingMethod] = useState(false);
  const [isEditingPath, setIsEditingPath] = useState(false);

  const [tempTitle, setTempTitle] = useState(data.title);
  const [tempDesc, setTempDesc] = useState(data.description || '');
  const [tempMethod, setTempMethod] = useState(data.method || 'POST');
  const [tempPath, setTempPath] = useState(data.path || '/auth/login');

  const isConnectSource = data.isConnectSource;

  useEffect(() => {
    setTempTitle(data.title);
    setTempDesc(data.description || '');
    setTempMethod(data.method || 'POST');
    setTempPath(data.path || '/auth/login');
  }, [data]);

  const isIconNode = [NodeType.REDIS, NodeType.MYSQL, NodeType.MQ, NodeType.APP, NodeType.VALUE].includes(data.type);

  const getHeaderStyle = () => {
    switch (data.type) {
      case NodeType.API:
        return { bg: 'bg-lime-400', icon: <Link2 size={16} className="text-lime-900" /> };
      case NodeType.TRIGGER:
        return { bg: 'bg-blue-500', icon: <Share2 size={16} className="text-white" /> };
      case NodeType.JOB:
        return { bg: 'bg-orange-500', icon: <Clock size={16} className="text-white" /> };
      case NodeType.INFO:
        return { bg: 'bg-indigo-500', icon: <FileText size={16} className="text-white" /> };
      case NodeType.METHOD:
        return { bg: 'bg-purple-500', icon: <Terminal size={16} className="text-white" /> };
      case NodeType.INTERCEPTOR:
        return { bg: 'bg-rose-500', icon: <ShieldAlert size={16} className="text-white" /> };
      case NodeType.LOGIC:
        return { bg: 'bg-emerald-500', icon: <Cpu size={16} className="text-white" /> };
      case NodeType.IMPL:
        return { bg: 'bg-cyan-500', icon: <Layers size={16} className="text-white" /> };
      case NodeType.TEXT:
        return { bg: 'bg-transparent', icon: <Type size={16} className="text-gray-400" /> };
      case NodeType.APP:
        return { bg: 'bg-gray-900', icon: <Globe size={28} className="text-white" /> };
      case NodeType.REDIS:
        return { bg: 'bg-rose-600', icon: <Database size={28} className="text-white" /> };
      case NodeType.MYSQL:
        return { bg: 'bg-sky-600', icon: <Database size={28} className="text-white" /> };
      case NodeType.MQ:
        return { bg: 'bg-emerald-600', icon: <MessageSquareMore size={28} className="text-white" /> };
      case NodeType.VALUE:
        return { bg: 'bg-amber-400', icon: <Binary size={28} className="text-amber-900" /> };
      default:
        return { bg: 'bg-gray-400', icon: <Zap size={16} className="text-white" /> };
    }
  };

  const style = getHeaderStyle();

  const handleUpdate = useCallback((newData: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  const onTitleBlur = () => {
    setIsEditingTitle(false);
    handleUpdate({ title: tempTitle });
  };

  const onDescBlur = () => {
    setIsEditingDesc(false);
    handleUpdate({ description: tempDesc });
  };

  const onMethodBlur = () => {
    setIsEditingMethod(false);
    handleUpdate({ method: tempMethod as any });
  };

  const onPathBlur = () => {
    setIsEditingPath(false);
    handleUpdate({ path: tempPath });
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && data.type !== NodeType.TEXT) onTitleBlur();
  };

  const allHandles = (
    <>
      <Handle type="source" position={Position.Top} id="s-t" style={{ left: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="s-b" style={{ left: '50%' }} />
      <Handle type="source" position={Position.Left} id="s-l" style={{ top: '50%' }} />
      <Handle type="source" position={Position.Right} id="s-r" style={{ top: '50%' }} />
      <Handle type="target" position={Position.Top} id="t-t" style={{ left: '50%' }} />
      <Handle type="target" position={Position.Bottom} id="t-b" style={{ left: '50%' }} />
      <Handle type="target" position={Position.Left} id="t-l" style={{ top: '50%' }} />
      <Handle type="target" position={Position.Right} id="t-r" style={{ top: '50%' }} />
    </>
  );

  if (isIconNode) {
    return (
      <div className={`group flex flex-col items-center gap-3 transition-all duration-300 ${selected || isConnectSource ? 'scale-[1.05]' : ''}`}>
        <NodeResizer isVisible={selected} minWidth={80} minHeight={80} lineClassName="!border-indigo-400" handleClassName="!bg-white !border-2 !border-indigo-400 !w-3 !h-3 !rounded-full" />
        <div className={`relative w-24 h-24 flex items-center justify-center`}>
          {isConnectSource && (
            <div className="absolute inset-0 border-2 border-dashed border-indigo-500 rounded-[32px] animate-[pulse_2s_infinite] scale-[1.15] pointer-events-none" />
          )}
          <div className={`w-20 h-20 rounded-[24px] ${style.bg} shadow-elevated flex items-center justify-center border-4 border-white ring-4 transition-all ${selected || isConnectSource ? 'ring-indigo-500/20' : 'ring-transparent'}`}>
            {style.icon}
          </div>
        </div>
        <div className={`bg-white/95 backdrop-blur-md border px-5 py-1.5 rounded-full shadow-soft transition-colors ${isConnectSource ? 'border-indigo-500 border-dashed' : (selected ? 'border-indigo-500 shadow-lg' : 'border-gray-200/50')}`}>
          {isEditingTitle ? (
            <input
              autoFocus
              className="text-[13px] font-bold text-gray-800 bg-transparent border-none outline-none w-24 text-center"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={onTitleBlur}
              onKeyDown={handleTitleKeyDown}
            />
          ) : (
            <span onDoubleClick={() => setIsEditingTitle(true)} className="text-[13px] font-extrabold text-gray-800 whitespace-nowrap cursor-text">{data.title}</span>
          )}
        </div>
        {allHandles}
      </div>
    );
  }

  if (data.type === NodeType.TEXT) {
    return (
      <div className={`group relative p-6 bg-white/40 border-2 border-dashed rounded-[24px] min-w-[240px] min-h-[120px] flex flex-col items-center justify-center transition-all duration-300 hover:bg-white/70 hover:border-indigo-300 hover:-translate-y-1 hover:shadow-xl ${selected || isConnectSource ? 'border-indigo-400 bg-white/60 ring-4 ring-indigo-500/10' : 'border-gray-200'}`}>
        <NodeResizer minWidth={160} minHeight={80} isVisible={selected} lineClassName="!border-indigo-400" handleClassName="!bg-white !border-2 !border-indigo-400 !w-3 !h-3 !rounded-full" />
        <div className="w-full h-full flex items-center justify-center">
          {isEditingTitle ? (
            <textarea autoFocus className="w-full h-full text-sm font-semibold text-gray-800 bg-white border border-indigo-300 rounded-2xl p-4 outline-none resize-none text-center" value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} onBlur={onTitleBlur} placeholder="Enter text here..." />
          ) : (
            <div onDoubleClick={() => setIsEditingTitle(true)} className="text-sm font-semibold text-gray-600 cursor-text whitespace-pre-wrap leading-relaxed px-4 text-center hover:text-gray-900 transition-colors">
              {data.title || 'Double click to edit text'}
            </div>
          )}
        </div>
        {allHandles}
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col bg-white border-2 ${selected ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-elevated scale-[1.01]' : (isConnectSource ? 'border-indigo-500 border-dashed ring-4 ring-indigo-500/10 shadow-lg scale-[1.02]' : 'border-white shadow-soft')} hover:border-indigo-100 transition-all duration-300 min-w-[240px] min-h-[140px] relative rounded-[24px]`}>
      <NodeResizer minWidth={240} minHeight={140} isVisible={selected} lineClassName="!border-indigo-400" handleClassName="!bg-white !border-2 !border-indigo-400 !w-3 !h-3 !rounded-full" />
      <div className="flex-1 flex flex-col rounded-[22px] overflow-hidden">
        <div className={`p-4 flex items-center gap-3 border-b border-gray-50 bg-white shrink-0 transition-colors ${isConnectSource ? 'bg-indigo-50/20' : ''}`}>
          <div className={`p-2 rounded-[14px] ${style.bg} flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-110`}>{style.icon}</div>
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <input autoFocus className="text-[13px] font-bold text-gray-800 border border-indigo-300 rounded-lg px-2 py-1 outline-none w-full" value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} onBlur={onTitleBlur} onKeyDown={handleTitleKeyDown} />
            ) : (
              <span onDoubleClick={() => setIsEditingTitle(true)} className="text-[13px] font-bold text-gray-800 truncate cursor-text block">{data.title}</span>
            )}
          </div>
        </div>
        <div className="p-5 bg-white flex-1 flex flex-col min-h-0">
          {data.type === NodeType.API && (
            <div className="flex items-center gap-3 mb-4 shrink-0">
              {isEditingMethod ? (
                <select autoFocus className="text-[10px] font-bold px-2 py-1 rounded-lg border border-indigo-300 outline-none" value={tempMethod} onChange={(e) => setTempMethod(e.target.value as any)} onBlur={onMethodBlur}>
                  <option value="GET">GET</option><option value="POST">POST</option><option value="PUT">PUT</option><option value="DELETE">DELETE</option>
                </select>
              ) : (
                <span onDoubleClick={() => setIsEditingMethod(true)} className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-all uppercase">{data.method}</span>
              )}
              {isEditingPath ? (
                <input autoFocus className="text-[11px] text-gray-400 font-mono border border-indigo-300 rounded-lg px-2 py-1 outline-none flex-1" value={tempPath} onChange={(e) => setTempPath(e.target.value)} onBlur={onPathBlur} />
              ) : (
                <span onDoubleClick={() => setIsEditingPath(true)} className="text-[11px] text-gray-400 font-mono truncate cursor-pointer hover:text-gray-600">{data.path}</span>
              )}
            </div>
          )}
          <div className="relative flex-1 min-h-[60px]">
            <div className={`w-full h-full p-4 rounded-2xl border-2 border-dashed transition-all node-scroll-area overflow-y-auto ${isEditingDesc ? 'border-indigo-400 bg-indigo-50/10' : 'border-gray-50 bg-gray-50/30'}`} onDoubleClick={() => setIsEditingDesc(true)}>
              {isEditingDesc ? (
                <textarea autoFocus className="w-full h-full text-[12px] text-gray-500 leading-relaxed bg-transparent outline-none resize-none" value={tempDesc} onChange={(e) => setTempDesc(e.target.value)} onBlur={onDescBlur} />
              ) : (
                <p className="text-[12px] text-gray-400 leading-relaxed cursor-text whitespace-pre-wrap">{data.description || 'Double click to edit description...'}</p>
              )}
            </div>
          </div>
          {data.cron && (
            <div className="mt-3 flex items-center gap-2 p-2 bg-gray-50/50 rounded-xl border border-gray-100 shrink-0">
              <Clock size={12} className="text-gray-400" />
              <span className="text-[10px] text-gray-500 font-mono">{data.cron}</span>
            </div>
          )}
        </div>
      </div>
      {allHandles}
    </div>
  );
};

export default memo(CustomNode);