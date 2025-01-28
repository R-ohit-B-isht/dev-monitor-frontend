import * as React from 'react';
import { useState } from 'react';
import { Task } from '../../types/Task';
import { TaskColumn } from '../TaskColumn';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { TaskCreateDialog } from '../TaskCreateDialog';

interface BoardViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function BoardView({ tasks, onTaskClick }: BoardViewProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  console.log('BoardView received tasks:', tasks); // Debug log

  const filterTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-6 pb-4 overflow-x-auto min-h-[calc(100vh-12rem)] px-4 sm:px-6">
        <TaskColumn
          title="To-Do"
          tasks={filterTasksByStatus('To-Do')}
          onTaskClick={onTaskClick}
          createButton={
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(true)}
              className="whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Task
            </Button>
          }
        />
        <TaskColumn
          title="In-Progress"
          tasks={filterTasksByStatus('In-Progress')}
          onTaskClick={onTaskClick}
        />
        <TaskColumn
          title="Done"
          tasks={filterTasksByStatus('Done')}
          onTaskClick={onTaskClick}
        />
      </div>

      <TaskCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTaskCreated={() => {
          // Trigger a refetch in the parent component
          const event = new CustomEvent('taskCreated');
          window.dispatchEvent(event);
        }}
      />
    </>
  );
}
