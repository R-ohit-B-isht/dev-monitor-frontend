import * as React from 'react';
import { TaskCard } from './TaskCard';
import { Task } from '../types/Task';
import { cn } from '../lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  createButton?: React.ReactNode;
}

export function TaskColumn({ title, tasks, onTaskClick, onDelete, createButton }: TaskColumnProps) {
  const tasksInColumn = tasks.filter(task => task.status === title);

  return (
    <div className="flex-1 flex-col min-w-[280px] sm:min-w-[300px] bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground bg-card/50 px-2 py-0.5 rounded-full">
            {tasksInColumn.length}
          </span>
          {createButton}
        </div>
      </div>
      <div className="space-y-3 min-h-[200px]">
        {tasksInColumn.map(task => (
          <div key={task._id} className="mb-4">
            <TaskCard
              task={task}
              onClick={() => onTaskClick(task)}
              onDelete={onDelete}
            />
          </div>
        ))}
        {tasksInColumn.length === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg bg-card/50">
            <p className="text-sm text-muted-foreground">No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
