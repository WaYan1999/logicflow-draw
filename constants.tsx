import { Node, Edge, MarkerType } from 'reactflow';
import { NodeType } from './types';

export const INITIAL_NODES: Node[] = [
  {
    id: 'node-app',
    type: 'customNode',
    position: { x: 50, y: 150 },
    data: {
      title: 'OrderService',
      type: NodeType.APP,
    },
  },
  {
    id: 'node-trigger',
    type: 'customNode',
    position: { x: 300, y: 150 },
    data: {
      title: 'OnOrderCreated',
      description: 'System event triggered when a new order is finalized.',
      type: NodeType.TRIGGER
    },
  },
  {
    id: 'node-api-create',
    type: 'customNode',
    position: { x: 600, y: 50 },
    data: {
      title: 'PostPayment',
      method: 'POST',
      path: '/v1/payments',
      type: NodeType.API,
      description: 'Initiates a payment request via the payment gateway.'
    },
  },
  {
    id: 'node-logic',
    type: 'customNode',
    position: { x: 600, y: 250 },
    data: {
      title: 'InventoryValidation',
      description: 'Check if all ordered items are available in stock.',
      type: NodeType.LOGIC
    },
  },
  {
    id: 'node-mysql',
    type: 'customNode',
    position: { x: 900, y: 250 },
    data: {
      title: 'InventoryDB',
      type: NodeType.MYSQL
    },
  },
  {
    id: 'text-1',
    type: 'customNode',
    position: { x: 50, y: 400 },
    data: {
      title: 'Project Setup 2025\nService Mesh Integration',
      type: NodeType.TEXT,
    },
  },
];

export const INITIAL_EDGES: Edge[] = [
  { 
    id: 'e1', 
    source: 'node-app', 
    target: 'node-trigger', 
    animated: true,
    sourceHandle: 's-r',
    targetHandle: 't-l',
    style: { stroke: '#3b82f6', strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
  },
  { 
    id: 'e2', 
    source: 'node-trigger', 
    target: 'node-api-create', 
    animated: true,
    sourceHandle: 's-r',
    targetHandle: 't-l',
    style: { stroke: '#3b82f6', strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
  },
  { 
    id: 'e3', 
    source: 'node-trigger', 
    target: 'node-logic', 
    animated: true,
    sourceHandle: 's-r',
    targetHandle: 't-l',
    style: { stroke: '#3b82f6', strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
  },
  { 
    id: 'e4', 
    source: 'node-logic', 
    target: 'node-mysql', 
    animated: true,
    sourceHandle: 's-r',
    targetHandle: 't-l',
    style: { stroke: '#3b82f6', strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
  },
];