import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Task } from '../types/Task';
import { Github, Trello, LineChart, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../services/api';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onDelete?: (taskId: string) => void;
}

const integrationIcons = {
  github: <Github className="h-4 w-4" />,
  jira: <Trello className="h-4 w-4" />,
  linear: <LineChart className="h-4 w-4" />
};

export const statusStyles = {
  'To-Do': 'bg-zinc-100 text-zinc-900 group-hover:bg-zinc-200/80 border-zinc-200/50',
  'In-Progress': 'bg-blue-50 text-blue-700 group-hover:bg-blue-100/80 border-blue-200/50',
  'Done': 'bg-green-50 text-green-700 group-hover:bg-green-100/80 border-green-200/50',
  'Deleted': 'bg-red-50 text-red-700 group-hover:bg-red-100/80 border-red-200/50'
};

const priorityStyles = {
  high: 'border-l-4 border-red-500/70 hover:border-red-500',
  medium: 'border-l-4 border-yellow-500/70 hover:border-yellow-500',
  low: 'border-l-4 border-blue-500/70 hover:border-blue-500',
  default: 'border-l-4 border-transparent'
} as const;

export function TaskCard({ task, onClick, onDelete }: TaskCardProps) {
  const getPriorityStyle = () => {
    if (!task.priority) return priorityStyles.default;
    return priorityStyles[task.priority] || priorityStyles.default;
  };

  return (
    <Card
      className={cn(
        "cursor-pointer group",
        "hover:shadow-lg hover:translate-y-[-2px]",
        "active:translate-y-[1px]",
        "transition-all duration-300 ease-in-out",
        "border border-border/50",
        "bg-card/50 backdrop-blur-sm",
        getPriorityStyle()
      )}
      onClick={onClick}
    >
      <CardHeader className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-sm font-medium line-clamp-1 flex-grow">{task.title}</CardTitle>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="hidden sm:inline">
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
            {integrationIcons[task.integration]}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{task.description}</p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={cn(
                "transition-colors whitespace-nowrap",
                statusStyles[task.status]
              )}
            >
              {task.status}
            </Badge>
            {task.priority && (
              <Badge variant="outline" className="whitespace-nowrap">
                Priority: {task.priority}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center text-gray-500 text-xs whitespace-nowrap">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(task.updatedAt).toLocaleDateString()}
              </div>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task._id);
                  }}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                  title="Delete task"
                >
                  🗑️
                </button>
              )}
              <div className="flex items-center gap-1">
                {task.status !== 'To-Do' && task.status !== 'Deleted' && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const newStatus = task.status === 'Done' ? 'In-Progress' : 'To-Do';
                      await api.updateTaskStatus(task._id, newStatus);
                      window.dispatchEvent(new CustomEvent('taskCreated')); // Trigger refresh
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    title={`Move to ${task.status === 'Done' ? 'In Progress' : 'To Do'}`}
                  >
                    <ArrowLeft className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                  </button>
                )}
                {task.status !== 'Done' && task.status !== 'Deleted' && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const newStatus = task.status === 'To-Do' ? 'In-Progress' : 'Done';
                      await api.updateTaskStatus(task._id, newStatus);
                      window.dispatchEvent(new CustomEvent('taskCreated')); // Trigger refresh
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    title={`Move to ${task.status === 'To-Do' ? 'In Progress' : 'Done'}`}
                  >
                    <ArrowRight className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}
