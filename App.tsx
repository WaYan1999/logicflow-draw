
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReactFlowProvider, Node, Edge, Connection, addEdge, MarkerType, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'reactflow';
import NodeCanvas, { NodeCanvasRef } from './components/NodeCanvas';
import Sidebar from './components/Sidebar';
import AIChat from './components/AIChat';
import { INITIAL_NODES, INITIAL_EDGES } from './constants';
import { NodeType } from './types';

const STORAGE_KEY = 'logic-flow-canvas-data';

const App: React.FC = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [nodes, setNodes] = useState<Node[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.nodes || INITIAL_NODES;
      } catch (e) {
        return INITIAL_NODES;
      }
    }
    return INITIAL_NODES;
  });

  const [edges, setEdges] = useState<Edge[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.edges || INITIAL_EDGES;
      } catch (e) {
        return INITIAL_EDGES;
      }
    }
    return INITIAL_EDGES;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<NodeCanvasRef | null>(null);

  useEffect(() => {
    const data = JSON.stringify({ nodes, edges });
    localStorage.setItem(STORAGE_KEY, data);
  }, [nodes, edges]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const handleExport = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.nodes && parsed.edges) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleAIGeneration = (data: { nodes: any[], edges: any[] }) => {
    const newNodes: Node[] = data.nodes.map((node, index) => ({
      id: node.id,
      type: node.type === NodeType.GROUP ? 'groupNode' : 'customNode',
      position: { x: index * 50, y: index * 50 },
      data: {
        title: node.title,
        description: node.description || '',
        type: node.type as NodeType,
        method: node.method,
        path: node.path
      },
      zIndex: node.type === NodeType.GROUP ? -1 : 0,
    }));

    const newEdges: Edge[] = data.edges.map((edge) => ({
      id: `e-ai-${Date.now()}-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
    }));

    setNodes((nds) => [...nds, ...newNodes]);
    setEdges((eds) => [...eds, ...newEdges]);

    // Trigger auto layout after a short delay to allow nodes to mount
    setTimeout(() => {
      canvasRef.current?.autoLayout();
    }, 100);
  };

  return (
    <div className="flex h-full w-full bg-background overflow-hidden relative">
      <main className="flex-1 relative flex h-full overflow-hidden">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImport} 
          accept=".json" 
          className="hidden" 
        />
        
        <ReactFlowProvider>
          <Sidebar 
            onAddNode={(type) => canvasRef.current?.addNode(type)} 
            onImportClick={onImportClick}
            onExportClick={handleExport}
          />
          <div className={`flex-1 relative h-full transition-all duration-500 ${isAIChatOpen ? 'mr-80' : 'mr-0'}`}>
            <NodeCanvas 
              ref={canvasRef}
              isLocked={isLocked}
              onLockChange={setIsLocked}
              isAIChatOpen={isAIChatOpen}
              onToggleAIChat={() => setIsAIChatOpen(!isAIChatOpen)}
              nodes={nodes} 
              edges={edges} 
              setNodes={setNodes}
              setEdges={setEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={() => {}}
            />
          </div>
          <AIChat 
            isOpen={isAIChatOpen} 
            onClose={() => setIsAIChatOpen(false)}
            onGenerate={handleAIGeneration}
          />
        </ReactFlowProvider>
      </main>
    </div>
  );
};

export default App;
