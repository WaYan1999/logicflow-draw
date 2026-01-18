
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Sparkles, Loader2, Zap } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { NodeType } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: any) => void;
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, onGenerate }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是你的逻辑架构助手。你可以用中文描述你想要的业务流程，我会为你自动生成节点。例如：\n"建立一个登录验证流程，包含API接口、Redis缓存和MySQL查询"'
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '正在思考并构建流程...', isLoading: true };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: input,
        config: {
          systemInstruction: `You are a professional workflow architect. Convert the user's Chinese description into a JSON workflow structure.
          
          Supported Node Types: ${Object.values(NodeType).join(', ')}.
          
          JSON Rules:
          1. Root object must have 'nodes' (array) and 'edges' (array).
          2. Nodes must have: id (unique), type (valid NodeType), title (Chinese), description (Chinese), and optional 'method'/'path' for API type.
          3. Edges must have: source (node id), target (node id).
          4. Logic Nodes like REDIS, MYSQL, MQ, APP are visual icons. API, TRIGGER, LOGIC are more detailed.
          5. Use realistic logic.
          6. Respond ONLY with the JSON object.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    method: { type: Type.STRING },
                    path: { type: Type.STRING }
                  },
                  required: ['id', 'type', 'title']
                }
              },
              edges: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    source: { type: Type.STRING },
                    target: { type: Type.STRING }
                  },
                  required: ['source', 'target']
                }
              }
            },
            required: ['nodes', 'edges']
          }
        }
      });

      const result = JSON.parse(response.text);
      onGenerate(result);

      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: `我已经为你构建好了 "${userMessage.content}" 相关的流程节点。`, isLoading: false }
          : msg
      ));
    } catch (error) {
      console.error('AI Generation Error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: '抱歉，生成过程中遇到了问题。请稍后再试。', isLoading: false }
          : msg
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`fixed right-0 top-0 h-full bg-white border-l border-gray-200 z-[100] shadow-2xl transition-all duration-500 ease-in-out flex flex-col ${isOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-gray-900">AI 流程助手</h2>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Powered by Gemini</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center gap-2 mb-1.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center ${msg.role === 'user' ? 'bg-gray-100' : 'bg-indigo-50'}`}>
                {msg.role === 'user' ? <User size={12} className="text-gray-500" /> : <Bot size={12} className="text-indigo-600" />}
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{msg.role === 'user' ? 'You' : 'Architect'}</span>
            </div>
            <div className={`max-w-[90%] px-4 py-2.5 rounded-2xl text-[12px] leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-gray-50 text-gray-600 border border-gray-100 rounded-tl-none'
            }`}>
              {msg.isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  <span>正在处理请求...</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 shrink-0 bg-gray-50/50">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="描述你想要的流程..."
            className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
              !input.trim() || isGenerating ? 'text-gray-300' : 'text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">AI Agent Online</span>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
