import { io, Socket } from 'socket.io-client';
import { MindMapNode, MindMapEdge } from '../services/api';

interface WebSocketEvents {
  connect: () => void;
  disconnect: () => void;
  mindmap_state: (data: { nodes: MindMapNode[]; edges: MindMapEdge[] }) => void;
  node_created: (node: MindMapNode) => void;
  node_updated: (data: { nodeId: string; label?: string; position?: { x: number; y: number } }) => void;
  node_deleted: (data: { nodeId: string }) => void;
  edge_created: (edge: MindMapEdge) => void;
  edge_deleted: (data: { edgeId: string }) => void;
  user_joined: (data: { userId: string; timestamp: string }) => void;
  user_left: (data: { userId: string; timestamp: string }) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private eventHandlers: Partial<WebSocketEvents> = {};

  connect() {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io('http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true
    });

    // Set up event listeners
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.eventHandlers.connect?.();
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.eventHandlers.disconnect?.();
    });

    this.socket.on('mindmap_state', (data) => {
      console.log('Received mindmap state:', data);
      this.eventHandlers.mindmap_state?.(data);
    });

    this.socket.on('node_created', (node) => {
      console.log('Node created:', node);
      this.eventHandlers.node_created?.(node);
    });

    this.socket.on('node_updated', (data) => {
      console.log('Node updated:', data);
      this.eventHandlers.node_updated?.(data);
    });

    this.socket.on('node_deleted', (data) => {
      console.log('Node deleted:', data);
      this.eventHandlers.node_deleted?.(data);
    });

    this.socket.on('edge_created', (edge) => {
      console.log('Edge created:', edge);
      this.eventHandlers.edge_created?.(edge);
    });

    this.socket.on('edge_deleted', (data) => {
      console.log('Edge deleted:', data);
      this.eventHandlers.edge_deleted?.(data);
    });

    this.socket.on('user_joined', (data) => {
      console.log('User joined:', data);
      this.eventHandlers.user_joined?.(data);
    });

    this.socket.on('user_left', (data) => {
      console.log('User left:', data);
      this.eventHandlers.user_left?.(data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on<T extends keyof WebSocketEvents>(event: T, handler: WebSocketEvents[T]) {
    this.eventHandlers[event] = handler;
  }

  off<T extends keyof WebSocketEvents>(event: T) {
    delete this.eventHandlers[event];
  }

  // Mindmap events
  joinMindmap(mindmapId: string, userId: string) {
    this.socket?.emit('join_mindmap', { mindmapId, userId });
  }

  leaveMindmap(mindmapId: string, userId: string) {
    this.socket?.emit('leave_mindmap', { mindmapId, userId });
  }

  addNode(mindmapId: string, userId: string, label: string, position: { x: number; y: number }) {
    this.socket?.emit('node_added', {
      mindmapId,
      userId,
      label,
      position
    });
  }

  updateNode(mindmapId: string, userId: string, nodeId: string, updates: { label?: string; position?: { x: number; y: number } }) {
    this.socket?.emit('node_updated', {
      mindmapId,
      userId,
      nodeId,
      ...updates
    });
  }

  deleteNode(mindmapId: string, nodeId: string) {
    this.socket?.emit('node_deleted', {
      mindmapId,
      nodeId
    });
  }

  addEdge(mindmapId: string, userId: string, sourceId: string, targetId: string) {
    this.socket?.emit('edge_added', {
      mindmapId,
      userId,
      sourceId,
      targetId
    });
  }

  deleteEdge(mindmapId: string, edgeId: string) {
    this.socket?.emit('edge_deleted', {
      mindmapId,
      edgeId
    });
  }
}

export const websocketService = new WebSocketService();
