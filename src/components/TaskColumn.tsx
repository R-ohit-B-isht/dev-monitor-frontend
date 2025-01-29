import * as React from 'react';
import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { Task } from '../types/Task';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronRight } from 'lucide-react';

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  createButton?: React.ReactNode;
}

export function TaskColumn({ title, tasks, onTaskClick, onDelete, createButton }: TaskColumnProps) {
  const [collapsedTasks, setCollapsedTasks] = useState<Record<string, boolean>>({});

  // Get tasks that should be shown in this column
  const getVisibleTasks = () => {
    // Get parent tasks that either have this status or have subtasks in this status
    return tasks.filter(task => {
      if (task.parentId) return false; // Skip subtasks, they'll be shown under parents
      
      // Show if task has this status
      if (task.status === title) return true;
      
      // Show if task has subtasks in this status
      const subtasks = tasks.filter(t => t.parentId === task._id);
      return subtasks.some(st => st.status === title);
    });
  };

  // Get subtasks for a parent task that belong in this column
  const getSubtasksInColumn = (parentId: string) => {
    return tasks.filter(task => 
      task.parentId === parentId && 
      task.status === title
    );
  };

  return (
    <div className="flex-1 flex-col min-w-[280px] sm:min-w-[300px] bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground bg-card/50 px-2 py-0.5 rounded-full">
            {tasks.filter(t => t.status === title).length}
          </span>
          {createButton}
        </div>
      </div>
      <div className="space-y-3 min-h-[200px]">
        {getVisibleTasks().map((task) => {
          const subtasksInColumn = getSubtasksInColumn(task._id);
          const hasSubtasks = subtasksInColumn.length > 0;
          const isCollapsed = collapsedTasks[task._id];

          return (
            <div key={task._id} className="relative group">
              <div className="flex items-start">
                {hasSubtasks && (
                  <button
                    onClick={() => setCollapsedTasks(prev => ({
                      ...prev,
                      [task._id]: !prev[task._id]
                    }))}
                    className="absolute left-[-20px] top-[12px] p-1 hover:bg-accent rounded-sm transition-transform duration-200"
                    style={{
                      transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)'
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
                <TaskCard
                  task={task}
                  onClick={() => onTaskClick(task)}
                  onDelete={onDelete}
                />
              </div>
              
              {hasSubtasks && !isCollapsed && (
                <div className="pl-6 mt-2 space-y-2">
                  {subtasksInColumn.map((subtask) => (
                    <TaskCard
                      key={subtask._id}
                      task={subtask}
                      onClick={() => onTaskClick(subtask)}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {getVisibleTasks().length === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg bg-card/50">
            <p className="text-sm text-muted-foreground">No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
