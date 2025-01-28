import * as React from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { Task } from '../types/Task';
import { api } from '../services/api';

interface TaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: (taskId: string) => void;
}

export function TaskCreateDialog({ open, onOpenChange, onTaskCreated }: TaskCreateDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('To-Do');
  const [integration, setIntegration] = useState<Task['integration']>('github');
  const [priority, setPriority] = useState<Task['priority']>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubtasks, setHasSubtasks] = useState(false);
  const [subtasks, setSubtasks] = useState<Array<{
    title: string;
    description: string;
    status: Task['status'];
    integration: Task['integration'];
    priority?: Task['priority'];
  }>>([]);

  const addSubtask = () => {
    setSubtasks([...subtasks, {
      title: '',
      description: '',
      status: 'To-Do',
      integration: integration,
      priority: undefined
    }]);
  };

  const updateSubtask = (
    index: number,
    field: 'title' | 'description' | 'status' | 'integration' | 'priority',
    value: string | Task['status'] | Task['integration'] | Task['priority']
  ) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index] = {
      ...updatedSubtasks[index],
      [field]: value
    };
    setSubtasks(updatedSubtasks);
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create parent task
      const parentTask = await api.createTask({
        title: title.trim(),
        description: description.trim(),
        status,
        integration,
        priority,
      });

      // If we have subtasks, create them and establish relationships
      if (hasSubtasks && subtasks.length > 0) {
        for (const subtask of subtasks) {
          if (!subtask.title.trim()) continue;
          
          const subtaskResult = await api.createTask({
            title: subtask.title.trim(),
            description: subtask.description.trim(),
            status: subtask.status,
            integration: subtask.integration,
            priority: subtask.priority,
          });

          // Create parent-child relationship
          await api.createRelationship({
            sourceTaskId: parentTask._id,
            targetTaskId: subtaskResult._id,
            type: 'parent-of'
          });
        }
      }

      onTaskCreated?.(parentTask._id);
      onOpenChange(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setStatus('To-Do');
      setIntegration('github');
      setPriority(undefined);
      setHasSubtasks(false);
      setSubtasks([]);
    } catch (err) {
      console.error('Failed to create task:', err);
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Input
              id="title"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <div className="space-y-2">
            <Input
              id="description"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as Task['status'])}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To-Do">To-Do</SelectItem>
                  <SelectItem value="In-Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Select
                value={integration}
                onValueChange={(value) => setIntegration(value as Task['integration'])}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select integration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="jira">Jira</SelectItem>
                  <SelectItem value="linear">Linear</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Select
              value={priority || ''}
              onValueChange={(value) => setPriority(value as Task['priority'])}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 mt-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasSubtasks"
                checked={hasSubtasks}
                onChange={(e) => {
                  setHasSubtasks(e.target.checked);
                  if (!e.target.checked) {
                    setSubtasks([]);
                  }
                }}
                className="rounded border-gray-300"
              />
              <label htmlFor="hasSubtasks" className="text-sm font-medium">
                Add Subtasks
              </label>
            </div>

            {hasSubtasks && (
              <div className="space-y-4 mt-4">
                {subtasks.map((subtask, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md relative">
                    <button
                      onClick={() => removeSubtask(index)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                    <Input
                      placeholder="Subtask title"
                      value={subtask.title}
                      onChange={(e) => updateSubtask(index, 'title', e.target.value)}
                      disabled={loading}
                    />
                    <Input
                      placeholder="Subtask description (optional)"
                      value={subtask.description}
                      onChange={(e) => updateSubtask(index, 'description', e.target.value)}
                      disabled={loading}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        value={subtask.status}
                        onValueChange={(value) => updateSubtask(index, 'status', value)}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="To-Do">To-Do</SelectItem>
                          <SelectItem value="In-Progress">In Progress</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={subtask.priority || ''}
                        onValueChange={(value) => updateSubtask(index, 'priority', value)}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addSubtask}
                  disabled={loading}
                  className="w-full"
                >
                  Add Subtask
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
