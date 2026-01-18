
import React, { useState, useCallback, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import ReactFlow, { 
  Background, 
  MiniMap, 
  addEdge, 
  Edge, 
  Node,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
  NodeMouseHandler
} from 'reactflow';
import dagre from 'dagre';
// Fix: MessageSquareSparkles is not exported by lucide-react, using Bot as an alternative for AI-related actions.
import { Plus, MousePointer, Link2, RotateCcw, RotateCw, Sparkles, Minus, Maximize, Lock, Unlock, X, Bot } from 'lucide-react';
import CustomNode from './CustomNode';
import GroupNode from './GroupNode';
import { NodeType } from '../types';

const nodeTypes = {
  customNode: CustomNode,
  groupNode: GroupNode,
};

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

interface NodeCanvasProps {
  isLocked: boolean;
  onLockChange: (locked: boolean) => void;
  isAIChatOpen: boolean;
  onToggleAIChat: () => void;
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
}

export interface NodeCanvasRef {
  addNode: (type: NodeType) => void;
  autoLayout: () => void;
}

const NodeCanvas = forwardRef<NodeCanvasRef, NodeCanvasProps>(({ 
  isLocked,
  onLockChange,
  isAIChatOpen,
  onToggleAIChat,
  nodes, 
  edges, 
  setNodes, 
  setEdges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect 
}, ref) => {
  const rf = useReactFlow();
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  
  const past = useRef<HistoryState[]>([]);
  const future = useRef<HistoryState[]>([]);
  const clipboard = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null);
  
  const [activeTool, setActiveTool] = useState<'select' | 'connect'>('select');
  const [connectStartNodeId, setConnectStartNodeId] = useState<string | null>(null);
  const startNodeIdRef = useRef<string | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const resetToolState = useCallback(() => {
    setActiveTool('select');
    startNodeIdRef.current = null;
    setConnectStartNodeId(null);
    setNodes(nds => nds.map(n => ({ 
      ...n, 
      data: { ...n.data, isConnectSource: false } 
    })));
  }, [setNodes]);

  const takeSnapshot = useCallback(() => {
    past.current.push({
      nodes: JSON.parse(JSON.stringify(rf.getNodes())),
      edges: JSON.parse(JSON.stringify(rf.getEdges()))
    });
    if (past.current.length > 50) past.current.shift();
    future.current = [];
  }, [rf]);

  const onUndo = useCallback(() => {
    if (past.current.length === 0) return;
    const currentState = {
      nodes: JSON.parse(JSON.stringify(rf.getNodes())),
      edges: JSON.parse(JSON.stringify(rf.getEdges()))
    };
    future.current.push(currentState);
    const prevState = past.current.pop();
    if (prevState) {
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
    }
  }, [rf, setNodes, setEdges]);

  const onRedo = useCallback(() => {
    if (future.current.length === 0) return;
    const currentState = {
      nodes: JSON.parse(JSON.stringify(rf.getNodes())),
      edges: JSON.parse(JSON.stringify(rf.getEdges()))
    };
    past.current.push(currentState);
    const nextState = future.current.pop();
    if (nextState) {
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
    }
  }, [rf, setNodes, setEdges]);

  const onCopy = useCallback(() => {
    const selectedNodes = rf.getNodes().filter(n => n.selected);
    if (selectedNodes.length > 0) {
      clipboard.current = {
        nodes: JSON.parse(JSON.stringify(selectedNodes)),
        edges: [] 
      };
    }
  }, [rf]);

  const onPaste = useCallback(() => {
    if (!clipboard.current) return;
    takeSnapshot();
    const position = rf.screenToFlowPosition({ x: lastMousePos.current.x, y: lastMousePos.current.y });
    
    const nodesToPaste = clipboard.current.nodes.map((node, index) => {
      const id = `node-${Date.now()}-${index}`;
      return {
        ...node,
        id,
        selected: true,
        position: {
          x: position.x + (index * 20),
          y: position.y + (index * 20)
        }
      };
    });

    setNodes(nds => nds.map(n => ({ ...n, selected: false })).concat(nodesToPaste));
  }, [rf, takeSnapshot, setNodes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName);
      if (isInput) return;

      if (e.code === 'Space') {
        setIsSpacePressed(true);
        if (e.target === document.body) e.preventDefault();
      }

      if (e.key === 'Escape') {
        resetToolState();
        setNodes(nds => nds.map(n => ({ ...n, selected: false })));
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        takeSnapshot();
        const selectedNodes = rf.getNodes().filter(n => n.selected);
        const selectedEdges = rf.getEdges().filter(e => e.selected);
        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          rf.deleteElements({ nodes: selectedNodes, edges: selectedEdges });
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        onRedo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        onCopy();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        onPaste();
      }
      
      if (e.key === 'v' && !e.ctrlKey && !e.metaKey) {
        resetToolState();
      }
      if (e.key === 'l' && !e.ctrlKey && !e.metaKey) {
        setActiveTool('connect');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsDraggingCanvas(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onUndo, onRedo, onCopy, onPaste, setNodes, rf, takeSnapshot, resetToolState]);

  const getSmartHandles = useCallback((sourceNode: Node, targetNode: Node) => {
    const sW = sourceNode.width || 240;
    const sH = sourceNode.height || 140;
    const tW = targetNode.width || 240;
    const tH = targetNode.height || 140;

    const scX = sourceNode.position.x + sW / 2;
    const scY = sourceNode.position.y + sH / 2;
    const tcX = targetNode.position.x + tW / 2;
    const tcY = targetNode.position.y + tH / 2;

    const dx = tcX - scX;
    const dy = tcY - scY;
    
    if (Math.abs(dx) > Math.abs(dy) * 0.8) {
      return { sourceHandle: dx > 0 ? 's-r' : 's-l', targetHandle: dx > 0 ? 't-l' : 't-r' };
    } else {
      return { sourceHandle: dy > 0 ? 's-b' : 's-t', targetHandle: dy > 0 ? 't-t' : 't-b' };
    }
  }, []);

  const updateEdgeHandles = useCallback((nodesToUpdate: Node[], edgesToUpdate: Edge[]) => {
    return edgesToUpdate.map(edge => {
      const sourceNode = nodesToUpdate.find(n => n.id === edge.source);
      const targetNode = nodesToUpdate.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) return edge;
      const { sourceHandle, targetHandle } = getSmartHandles(sourceNode, targetNode);
      return { ...edge, sourceHandle, targetHandle };
    });
  }, [getSmartHandles]);

  const handleNodesChange: OnNodesChange = useCallback((changes) => {
    if (isLocked || activeTool === 'connect') return;
    onNodesChange(changes);
    const isDragging = changes.some(c => c.type === 'position' && (c as any).dragging);
    if (isDragging) {
      const currentNodes = rf.getNodes();
      setEdges(eds => updateEdgeHandles(currentNodes, eds));
    }
  }, [isLocked, activeTool, onNodesChange, setEdges, updateEdgeHandles, rf]);

  const onNodeClick: NodeMouseHandler = useCallback((event, clickedNode) => {
    if (isLocked) return;
    if (activeTool === 'connect') {
      const currentStartId = startNodeIdRef.current;
      if (!currentStartId) {
        startNodeIdRef.current = clickedNode.id;
        setConnectStartNodeId(clickedNode.id);
        setNodes(nds => nds.map(n => ({
          ...n,
          selected: n.id === clickedNode.id,
          data: { ...n.data, isConnectSource: n.id === clickedNode.id }
        })));
      } else if (currentStartId !== clickedNode.id) {
        takeSnapshot();
        const allNodes = rf.getNodes();
        const startNode = allNodes.find(n => n.id === currentStartId);
        if (startNode) {
          const { sourceHandle, targetHandle } = getSmartHandles(startNode, clickedNode);
          const newEdge = {
            source: currentStartId,
            target: clickedNode.id,
            sourceHandle,
            targetHandle,
            id: `e${Date.now()}`,
            style: { stroke: '#6366f1', strokeWidth: 2.5 },
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
          };
          setEdges((eds) => addEdge(newEdge, eds));
        }
        startNodeIdRef.current = null;
        setConnectStartNodeId(null);
        setNodes(nds => nds.map(n => ({
          ...n,
          selected: n.id === clickedNode.id,
          data: { ...n.data, isConnectSource: false }
        })));
      } else {
        startNodeIdRef.current = null;
        setConnectStartNodeId(null);
        setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, isConnectSource: false } })));
      }
    }
  }, [activeTool, isLocked, getSmartHandles, setNodes, setEdges, takeSnapshot, rf]);

  const onPaneClick = useCallback(() => {
    if (activeTool === 'connect') {
      startNodeIdRef.current = null;
      setConnectStartNodeId(null);
      setNodes(nds => nds.map(n => ({
        ...n,
        selected: false,
        data: { ...n.data, isConnectSource: false }
      })));
    }
  }, [activeTool, setNodes]);

  const toggleConnectTool = useCallback(() => {
    if (activeTool !== 'connect') {
      setActiveTool('connect');
      const selectedNode = rf.getNodes().find(n => n.selected);
      if (selectedNode) {
        startNodeIdRef.current = selectedNode.id;
        setConnectStartNodeId(selectedNode.id);
        setNodes(nds => nds.map(n => ({
          ...n,
          data: { ...n.data, isConnectSource: n.id === selectedNode.id }
        })));
      }
    } else {
      resetToolState();
    }
  }, [activeTool, rf, setNodes, resetToolState]);

  const addNode = useCallback((type: NodeType) => {
    takeSnapshot();
    const id = `node-${Date.now()}`;
    const x = (rf.getNodes().length * 40) % 200 + 100;
    const y = (rf.getNodes().length * 40) % 200 + 100;

    let defaultTitle = `New ${type}`;
    if (type === NodeType.REDIS) defaultTitle = 'Redis';
    if (type === NodeType.MYSQL) defaultTitle = 'MySQL';
    if (type === NodeType.MQ) defaultTitle = 'MQ';
    if (type === NodeType.APP) defaultTitle = 'Application';
    if (type === NodeType.VALUE) defaultTitle = 'Value';
    if (type === NodeType.GROUP) defaultTitle = 'New Group';

    const newNode: Node = {
      id,
      type: type === NodeType.GROUP ? 'groupNode' : 'customNode',
      position: { x, y },
      zIndex: type === NodeType.GROUP ? -1 : 0,
      data: { 
        title: defaultTitle, 
        type, 
        description: '', 
        path: type === NodeType.API ? '/auth/login' : undefined, 
        method: type === NodeType.API ? 'POST' : undefined 
      },
    };
    if (type === NodeType.GROUP) newNode.style = { width: 400, height: 300 };
    setNodes((nds) => [...nds, newNode]);
  }, [rf, setNodes, takeSnapshot]);

  const autoLayout = useCallback(() => {
    takeSnapshot();
    const currentNodes = rf.getNodes();
    const currentEdges = rf.getEdges();
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'LR', nodesep: 120, ranksep: 200, marginx: 100, marginy: 100 });
    currentNodes.filter(n => n.type !== 'groupNode').forEach((node) => {
      dagreGraph.setNode(node.id, { width: node.width || 240, height: node.height || 140 });
    });
    currentEdges.forEach((edge) => {
      if (dagreGraph.hasNode(edge.source) && dagreGraph.hasNode(edge.target)) {
        dagreGraph.setEdge(edge.source, edge.target);
      }
    });
    dagre.layout(dagreGraph);
    const layoutedNodes = currentNodes.map((node) => {
      if (node.type === 'groupNode') return node;
      const nodeWithPosition = dagreGraph.node(node.id);
      if (!nodeWithPosition) return node;
      return { ...node, position: { x: nodeWithPosition.x - (node.width || 240) / 2, y: nodeWithPosition.y - (node.height || 140) / 2 } };
    });
    const updatedEdges = updateEdgeHandles(layoutedNodes, currentEdges);
    setNodes(layoutedNodes);
    setEdges(updatedEdges);
    setTimeout(() => rf.fitView({ duration: 800 }), 50);
  }, [updateEdgeHandles, rf, takeSnapshot, setNodes, setEdges]);

  useImperativeHandle(ref, () => ({
    addNode,
    autoLayout
  }));

  const onCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const canvasCursor = isSpacePressed || (isLocked && isDraggingCanvas)
    ? 'grabbing' 
    : isSpacePressed || isLocked 
    ? 'grab'
    : activeTool === 'connect' ? 'crosshair' : 'default';

  return (
    <div 
      className={`w-full h-full relative group overflow-hidden ${activeTool === 'connect' ? 'connect-mode-active' : ''}`}
      style={{ cursor: canvasCursor, backgroundColor: '#faf9f7' }}
      onMouseMove={onCanvasMouseMove}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onMoveStart={() => (isSpacePressed || isLocked) && setIsDraggingCanvas(true)}
        onMoveEnd={() => setIsDraggingCanvas(false)}
        nodeTypes={nodeTypes}
        panOnScroll
        panOnDrag={isSpacePressed || activeTool === 'connect' || isLocked}
        selectionOnDrag={!isSpacePressed && activeTool !== 'connect' && !isLocked}
        nodesDraggable={!isLocked && activeTool !== 'connect'}
        nodesConnectable={false}
        elementsSelectable={!isLocked}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={24} color="#e2e8f0" size={1} />
        
        {activeTool === 'connect' && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-[0_20px_40px_-15px_rgba(79,70,229,0.4)] ring-4 ring-indigo-500/10 transition-all border border-indigo-500/50">
                <Link2 size={18} strokeWidth={3} className="animate-pulse" />
                <span className="text-[14px] font-bold tracking-tight">
                  {connectStartNodeId ? '请点击目标节点建立连接' : '请点击起始节点开始连线'}
                </span>
                <div className="w-[1px] h-4 bg-white/20 mx-1" />
                <button onClick={resetToolState} className="hover:bg-white/10 p-1 rounded-md transition-colors"><X size={16} /></button>
              </div>
              <div className="bg-white/90 backdrop-blur-md border border-gray-200/50 px-3 py-1 rounded-full shadow-sm">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Esc 退出模式 · 点击空白处重置起始节点选择</span>
              </div>
            </div>
          </div>
        )}

        <MiniMap 
          style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)', bottom: 24, right: 24 }}
          maskColor="rgba(241, 245, 249, 0.4)"
          nodeColor="#e2e8f0"
        />

        <div className="absolute bottom-24 left-8 flex flex-col gap-2 z-20">
          <div className="flex flex-col gap-1 p-1 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-[20px] shadow-xl">
             <button onClick={() => rf.zoomIn()} className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"><Plus size={18} /></button>
             <button onClick={() => rf.zoomOut()} className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"><Minus size={18} /></button>
             <button onClick={() => rf.fitView({ duration: 800 })} className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"><Maximize size={18} /></button>
          </div>
          <div className="p-1 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-[20px] shadow-xl">
            <button onClick={() => onLockChange(!isLocked)} className={`p-3 rounded-2xl transition-all ${isLocked ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600'}`}>
              {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
            </button>
          </div>
          <div className="flex flex-col gap-1 p-1 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-[20px] shadow-xl">
             <button onClick={onUndo} disabled={past.current.length === 0} className={`p-3 rounded-2xl transition-all ${past.current.length > 0 ? 'text-gray-400 hover:text-indigo-600' : 'text-gray-200 cursor-not-allowed'}`} title="Undo (Ctrl+Z)">
               <RotateCcw size={18} />
             </button>
             <button onClick={onRedo} disabled={future.current.length === 0} className={`p-3 rounded-2xl transition-all ${future.current.length > 0 ? 'text-gray-400 hover:text-indigo-600' : 'text-gray-200 cursor-not-allowed'}`} title="Redo (Ctrl+Y)">
               <RotateCw size={18} />
             </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 bg-white/70 backdrop-blur-3xl border border-gray-200/50 rounded-full shadow-2xl z-50">
          <button onClick={autoLayout} className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition-all group" title="Smart Tidy Layout">
            <Sparkles size={20} className="fill-indigo-50 group-hover:fill-indigo-100 transition-all" />
          </button>
          
          <div className="w-[1px] h-6 bg-gray-200 mx-1" />
          
          <div className="flex bg-gray-100/50 p-1 rounded-full items-center">
            <button 
              onClick={resetToolState} 
              className={`p-2 rounded-full transition-all ${activeTool === 'select' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
              title="Select Tool (V)"
            >
              <MousePointer size={18} />
            </button>
            <button 
              onClick={toggleConnectTool} 
              className={`p-2 rounded-full transition-all ${activeTool === 'connect' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
              title="Connect Tool (L)"
            >
              <Link2 size={18} />
            </button>
          </div>

          <div className="w-[1px] h-6 bg-gray-200 mx-1" />

          <button 
            onClick={onToggleAIChat} 
            className={`p-2 rounded-full transition-all ${isAIChatOpen ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-400 hover:text-indigo-600'}`}
            title="AI Workflow Generator"
          >
            {/* Fix: Replaced MessageSquareSparkles with Bot */}
            <Bot size={18} />
          </button>
        </div>
      </ReactFlow>
    </div>
  );
});

export default NodeCanvas;
