import * as React from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
  const [subtasks, setSubtasks] = useState<Array<{ title: string; description: string }>>([]);

  const addSubtask = () => {
    setSubtasks([...subtasks, { title: '', description: '' }]);
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const updateSubtask = (index: number, field: 'title' | 'description', value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = { ...newSubtasks[index], [field]: value };
    setSubtasks(newSubtasks);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create the parent task first
      const parentTask = await api.createTask({
        title: title.trim(),
        description: description.trim(),
        status,
        integration,
        priority,
        childIds: [], // Initialize empty childIds array
      });

      // Create all subtasks if any exist
      if (subtasks.length > 0) {
        const subtaskPromises = subtasks
          .filter(st => st.title.trim()) // Only create subtasks with titles
          .map(st => api.createTask({
            title: st.title.trim(),
            description: st.description.trim(),
            status: 'To-Do', // Default status for subtasks
            integration,
            priority,
            parentId: parentTask._id,
          }));

        const createdSubtasks = await Promise.all(subtaskPromises);
        
        // Create parent-child relationships for each subtask
        const relationshipPromises = createdSubtasks.map(subtask => 
          api.createRelationship({
            sourceTaskId: parentTask._id,
            targetTaskId: subtask._id,
            type: 'parent-child'
          })
        );
        
        await Promise.all(relationshipPromises);
      }

      onTaskCreated?.(parentTask._id);
      onOpenChange(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setStatus('To-Do');
      setIntegration('github');
      setPriority(undefined);
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Main Task Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-background/50">
            <h3 className="text-lg font-semibold border-b pb-2">Main Task</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as Task['status'])}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To-Do">To-Do</SelectItem>
                    <SelectItem value="In-Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Integration</Label>
                <Select
                  value={integration}
                  onValueChange={(value) => setIntegration(value as Task['integration'])}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="jira">Jira</SelectItem>
                    <SelectItem value="linear">Linear</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={priority || ''}
                  onValueChange={(value) => setPriority(value as Task['priority'])}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-semibold">Subtasks</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSubtask}
                disabled={loading}
                className="hover:bg-primary hover:text-primary-foreground"
              >
                Add Subtask
              </Button>
            </div>
            
            <div className="space-y-4">
              {subtasks.map((subtask, index) => (
                <div key={index} className="p-4 border rounded-lg bg-background/50 relative group">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-opacity"
                    onClick={() => removeSubtask(index)}
                    disabled={loading}
                  >
                    ×
                  </Button>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="Enter subtask title"
                        value={subtask.title}
                        onChange={(e) => updateSubtask(index, 'title', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="Enter subtask description (optional)"
                        value={subtask.description}
                        onChange={(e) => updateSubtask(index, 'description', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
