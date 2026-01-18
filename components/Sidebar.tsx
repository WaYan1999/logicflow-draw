import React from 'react';
import { 
  Type, FileText, Terminal, Globe, Link2, Share2, 
  ShieldAlert, Cpu, Binary, Layers, Database, 
  MessageSquareMore, BoxSelect, ChevronRight, Clock,
  Upload, Download, Zap
} from 'lucide-react';
import { NodeType } from '../types';

interface SidebarProps {
  onAddNode: (type: NodeType) => void;
  onImportClick: () => void;
  onExportClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddNode, onImportClick, onExportClick }) => {
  const categories = [
    {
      title: '通用节点',
      items: [
        { type: NodeType.TEXT, label: '纯文本节点', icon: <Type size={16} />, color: 'text-gray-600' },
        { type: NodeType.INFO, label: '注释内容', icon: <FileText size={16} />, color: 'text-indigo-600' },
        { type: NodeType.METHOD, label: '方法节点', icon: <Terminal size={16} />, color: 'text-purple-600' },
      ]
    },
    {
      title: '开发节点',
      items: [
        { type: NodeType.APP, label: '应用程序', icon: <Globe size={16} />, color: 'text-gray-900' },
        { type: NodeType.API, label: 'API 节点', icon: <Link2 size={16} />, color: 'text-lime-600' },
        { type: NodeType.TRIGGER, label: '触发器', icon: <Share2 size={16} />, color: 'text-blue-600' },
        { type: NodeType.JOB, label: '定时任务', icon: <Clock size={16} />, color: 'text-orange-600' },
        { type: NodeType.INTERCEPTOR, label: '拦截器', icon: <ShieldAlert size={16} />, color: 'text-rose-600' },
        { type: NodeType.LOGIC, label: '业务处理', icon: <Cpu size={16} />, color: 'text-emerald-600' },
        { type: NodeType.VALUE, label: '数值节点', icon: <Binary size={16} />, color: 'text-amber-600' },
        { type: NodeType.IMPL, label: '实现类', icon: <Layers size={16} />, color: 'text-cyan-600' },
      ]
    },
    {
      title: '基础架构',
      items: [
        { type: NodeType.REDIS, label: 'Redis', icon: <Database size={16} />, color: 'text-rose-600' },
        { type: NodeType.MYSQL, label: 'MySQL', icon: <Database size={16} />, color: 'text-sky-600' },
        { type: NodeType.MQ, label: 'MQ', icon: <MessageSquareMore size={16} />, color: 'text-emerald-600' },
      ]
    },
    {
      title: '容器',
      items: [
        { type: NodeType.GROUP, label: '分组容器', icon: <BoxSelect size={16} />, color: 'text-indigo-500' },
      ]
    }
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200/60 flex flex-col z-20 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.05)]">
      {/* Branding Section */}
      <div className="p-6 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <Zap size={16} className="text-white fill-current" />
          </div>
          <h1 className="font-bold text-gray-900 text-sm tracking-tight leading-none">LogicFlow Studio</h1>
        </div>
        <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Automation Engine</p>
      </div>
      
      {/* Node Categories List */}
      <div className="flex-1 p-4 flex flex-col gap-8 overflow-y-auto">
        {categories.map((cat, idx) => (
          <section key={idx} className="flex flex-col gap-2">
            <h3 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <ChevronRight size={10} className="text-gray-300" />
              {cat.title}
            </h3>
            <div className="flex flex-col gap-1">
              {cat.items.map((item) => (
                <button
                  key={item.type}
                  onClick={() => onAddNode(item.type)}
                  className="group flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50/50 rounded-xl transition-all text-left"
                >
                  <div className={`p-2 rounded-lg bg-gray-50 group-hover:bg-white group-hover:shadow-sm transition-all ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="text-[12px] font-bold text-gray-600 group-hover:text-indigo-600 transition-colors">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      
      {/* Action Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3 shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onImportClick}
            className="flex items-center justify-center gap-2 px-3 py-2 text-[11px] font-bold text-gray-600 bg-white border border-gray-200 hover:border-indigo-400 hover:text-indigo-600 rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Upload size={14} /> Import
          </button>
          <button 
            onClick={onExportClick}
            className="flex items-center justify-center gap-2 px-3 py-2 text-[11px] font-bold text-gray-600 bg-white border border-gray-200 hover:border-indigo-400 hover:text-indigo-600 rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Download size={14} /> Export
          </button>
        </div>
        
        <button className="w-full py-2.5 text-xs font-bold bg-gray-900 text-white hover:bg-black rounded-xl shadow-lg shadow-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2">
          Deploy Workflow
        </button>

        <div className="p-3 rounded-xl bg-white/60 border border-gray-100">
          <p className="text-[9px] text-gray-400 font-semibold leading-relaxed">
            PRO TIP: <br/> 
            Double click nodes to edit. <br/> 
            Use L key for connect tool.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;