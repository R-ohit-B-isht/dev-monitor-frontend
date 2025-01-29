import { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Task } from '../../../types/Task';
import { Relationship } from '../../../services/api';
import { ErrorBoundary } from '../../ErrorBoundry';

interface RelationshipGraphProps {
  task: Task;
  relationships: Relationship[];
  allTasks: Task[];
}

export function RelationshipGraph({ task, relationships, allTasks }: RelationshipGraphProps) {
  // Convert tasks and relationships to nodes and edges
  const getInitialNodes = useCallback(() => {
    const nodes: Node[] = [];
    const addedTaskIds = new Set<string>();

    if (task && task._id && task.title && task.status) {
      // Add central task node
      nodes.push({
        id: task._id,
        data: { label: task.title, status: task.status },
        position: { x: 0, y: 0 },
        type: 'default',
        style: {
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '10px',
        },
      });
      addedTaskIds.add(task._id);

      // Add related task nodes in a circular layout
      relationships.forEach((rel, index) => {
        const relatedTask = allTasks.find(t => t._id === rel.targetTaskId);
        if (!relatedTask || addedTaskIds.has(rel.targetTaskId)) return;

        const angle = (2 * Math.PI * index) / relationships.length;
        const radius = 200;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        nodes.push({
          id: relatedTask._id,
          data: { label: relatedTask.title, status: relatedTask.status },
          position: { x, y },
          type: 'default',
          style: {
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '10px',
          },
        });
        addedTaskIds.add(relatedTask._id);
      });
    }

    return nodes;
  }, [task, relationships, allTasks]);

  const getInitialEdges = useCallback(() => {
    return relationships
      .filter(rel => rel._id && rel.sourceTaskId && rel.targetTaskId)
      .map((rel): Edge => ({
        id: rel._id!,
        source: rel.sourceTaskId,
        target: rel.targetTaskId,
        label: rel.type,
        type: 'smoothstep',
        animated: rel.type === 'blocks',
        style: { stroke: rel.type === 'blocks' ? '#ef4444' : '#94a3b8' }
      }));
  }, [relationships]);

  const memoizedNodes = useMemo(() => getInitialNodes(), [getInitialNodes]);
  const memoizedEdges = useMemo(() => getInitialEdges(), [getInitialEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(memoizedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(memoizedEdges);

  useEffect(() => {
    setNodes(memoizedNodes);
    setEdges(memoizedEdges);
  }, [memoizedNodes, memoizedEdges, setNodes, setEdges]);

  const nodeTypes = useMemo(() => ({
    default: ({ data }: { data: { label: string; status: string } }) => {
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'To-Do':
            return 'bg-yellow-100 border-yellow-300';
          case 'In-Progress':
            return 'bg-blue-100 border-blue-300';
          case 'Done':
            return 'bg-green-100 border-green-300';
          default:
            return 'bg-white';
        }
      };

      return (
        <div className={`px-4 py-2 shadow-lg rounded-lg border hover:shadow-xl transition-shadow ${getStatusColor(data.status)}`}>
          <div className="font-medium text-center">{data.label}</div>
          <div className="mt-2 text-xs text-center opacity-75">{data.status}</div>
        </div>
      );
    },
  }), []);

  // Removed custom edge component in favor of built-in smoothstep edges

  // Error handling is now managed by ErrorBoundary

  const Flow = () => {
    const { fitView } = useReactFlow();
    
    // Call fitView on mount
    useEffect(() => {
      fitView();
    }, [fitView]);
    
    return (
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        attributionPosition="bottom-right"
      >
        <Background />
        <Controls />
      </ReactFlow>
    );
  };

  return (
    <div className="w-full h-[calc(100vh-12rem)] border rounded-lg overflow-hidden relative">
      <ErrorBoundary fallback={<div className="p-4 text-destructive">Failed to render relationship graph</div>}>
        <ReactFlowProvider>
          <Flow />
        </ReactFlowProvider>
      </ErrorBoundary>
    </div>
  );
}
