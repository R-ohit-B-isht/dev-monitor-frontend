import * as React from 'react';
import { useEffect, useState } from 'react';
import { RelationshipGraph } from '../components/views/RelationshipGraph';
import { Task } from '../types/Task';
import { api, Relationship } from '../services/api';
import { Breadcrumb } from '../components/Breadcrumb';
import { websocketService } from '../services/websocket';
import { Badge } from '../components/ui/badge';
import { Users } from 'lucide-react';

interface MindmapNode extends Task {
  position?: { x: number; y: number };
  label?: string;
  sourceId?: string;
  targetId?: string;
}

interface MindmapEdge extends Relationship {
  sourceId: string;
  targetId: string;
  sourceTaskId: string;
  targetTaskId: string;
  type: 'relates-to';
}

interface WebSocketMindmapNode {
  _id: string;
  label: string;
  position: { x: number; y: number };
  createdAt: string;
  updatedAt: string;
}

interface WebSocketMindmapEdge {
  _id: string;
  sourceId: string;
  targetId: string;
  createdAt: string;
  updatedAt: string;
}

export function MindmapPage() {
  const [nodes, setNodes] = useState<MindmapNode[]>([]);
  const [edges, setEdges] = useState<MindmapEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const fetchMindmap = async () => {
      setLoading(true);
      setError(null);
      try {
        const [nodesData, edgesData] = await Promise.all([
          api.getMindMapNodes(),
          api.getMindMapEdges()
        ]);

        // Convert mindmap nodes to task format for RelationshipGraph
        const formattedNodes: MindmapNode[] = nodesData.map((node: WebSocketMindmapNode) => ({
          _id: node._id,
          title: node.label,
          label: node.label,
          status: 'In-Progress',
          integration: 'github',
          createdAt: node.createdAt,
          updatedAt: node.updatedAt,
          position: node.position
        }));

        // Convert mindmap edges to relationship format
        const formattedEdges: MindmapEdge[] = edgesData.map((edge: WebSocketMindmapEdge) => ({
          _id: edge._id,
          sourceId: edge.sourceId,
          targetId: edge.targetId,
          sourceTaskId: edge.sourceId,
          targetTaskId: edge.targetId,
          type: 'relates-to',
          createdAt: edge.createdAt,
          updatedAt: edge.updatedAt
        }));

        setNodes(formattedNodes);
        setEdges(formattedEdges);
      } catch (err) {
        setError('Failed to load mindmap data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMindmap();
    
    // Initialize WebSocket connection
    websocketService.connect();
    
    // Set up WebSocket event handlers
    websocketService.on('connect', () => {
      setIsConnected(true);
      websocketService.joinMindmap('default', 'current');
    });
    
    websocketService.on('disconnect', () => {
      setIsConnected(false);
      setConnectedUsers(new Set());
    });
    
    websocketService.on('mindmap_state', (data) => {
      const formattedNodes: MindmapNode[] = data.nodes.map((node: WebSocketMindmapNode) => ({
        _id: node._id,
        title: node.label,
        label: node.label,
        status: 'In-Progress',
        integration: 'github',
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
        position: node.position
      }));

      const formattedEdges: MindmapEdge[] = data.edges.map((edge: WebSocketMindmapEdge) => ({
        _id: edge._id,
        sourceId: edge.sourceId,
        targetId: edge.targetId,
        sourceTaskId: edge.sourceId,
        targetTaskId: edge.targetId,
        type: 'relates-to',
        createdAt: edge.createdAt,
        updatedAt: edge.updatedAt
      }));

      setNodes(formattedNodes);
      setEdges(formattedEdges);
    });
    
    websocketService.on('node_created', (node) => {
      const formattedNode: MindmapNode = {
        _id: node._id,
        title: node.label,
        label: node.label,
        status: 'In-Progress',
        integration: 'github',
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
        position: node.position
      };
      setNodes(prev => [...prev, formattedNode]);
    });
    
    websocketService.on('node_updated', (data) => {
      setNodes(prev => prev.map(node => 
        node._id === data.nodeId 
          ? { ...node, title: data.label || node.title, position: data.position || node.position }
          : node
      ));
    });
    
    websocketService.on('node_deleted', (data) => {
      setNodes(prev => prev.filter(node => node._id !== data.nodeId));
    });
    
    websocketService.on('edge_created', (edge) => {
      const formattedEdge: MindmapEdge = {
        _id: edge._id,
        sourceId: edge.sourceId,
        targetId: edge.targetId,
        sourceTaskId: edge.sourceId,
        targetTaskId: edge.targetId,
        type: 'relates-to',
        createdAt: edge.createdAt,
        updatedAt: edge.updatedAt
      };
      setEdges(prev => [...prev, formattedEdge]);
    });
    
    websocketService.on('edge_deleted', (data) => {
      setEdges(prev => prev.filter(edge => edge._id !== data.edgeId));
    });
    
    websocketService.on('user_joined', (data) => {
      setConnectedUsers(prev => new Set([...prev, data.userId]));
    });
    
    websocketService.on('user_left', (data) => {
      setConnectedUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });
    
    return () => {
      websocketService.disconnect();
    };
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb items={[{ label: 'Mindmap' }]} />
        <div className="flex items-center gap-4">
          <Badge variant={isConnected ? "success" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">
              {connectedUsers.size} online
            </span>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading mindmap...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <div className="mt-6">
          <RelationshipGraph
            tasks={nodes}
            relationships={edges}
            onTaskClick={(node) => console.log('Node clicked:', node)}
          />
        </div>
      )}
    </div>
  );
}
