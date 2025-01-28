import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Task } from '../types/Task';
import { api } from '../services/api';
import { Github, Trello, LineChart, Clock, Loader2, Plus, Trash2, Edit2, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { statusStyles } from './TaskCard';

const integrationIcons = {
  github: <Github className="h-4 w-4" />,
  jira: <Trello className="h-4 w-4" />,
  linear: <LineChart className="h-4 w-4" />
};

interface TaskDetailDialogProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTask?: (taskId: string) => void;
}

export function TaskDetailDialog({ taskId, isOpen, onClose, onNavigateToTask }: TaskDetailDialogProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSubtask, setNewSubtask] = useState({ title: '', description: '' });
  const [subtaskBeingEdited, setSubtaskBeingEdited] = useState<Task | null>(null);
  const [editFormData, setEditFormData] = useState({ title: '', description: '' });

  useEffect(() => {
    if (!taskId || !isOpen) return;
    
    const fetchTask = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getTask(taskId);
        setTask(data);
      } catch (err) {
        setError('Failed to load task details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" aria-label="Task details dialog">
        {loading ? (
          <div className="flex items-center justify-center py-8" aria-label="Loading task details">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="text-center py-8" role="alert" aria-live="polite">
            <p className="text-red-500">{error}</p>
          </div>
        ) : task ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Task Details: {task.title}</DialogTitle>
                <div className="flex items-center space-x-2" aria-label={`Integration: ${task.integration}`}>
                  {integrationIcons[task.integration]}
                </div>
              </div>
              <DialogDescription className="mt-2">
                {task.description || 'No description provided'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Status and Priority */}
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary"
                  className={cn(
                    "transition-colors",
                    statusStyles[task.status]
                  )}
                >
                  {task.status}
                </Badge>
                {task.priority && (
                  <Badge variant="outline">
                    Priority: {task.priority}
                  </Badge>
                )}
              </div>

              {/* Timestamps */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Updated: {new Date(task.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Subtasks Section */}
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Subtasks</h3>
              
              {/* Add Subtask Form */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subtask
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Subtask</DialogTitle>
                    <DialogDescription>
                      Create a new subtask for {task.title}. The subtask will inherit the parent task's status and priority.
                    </DialogDescription>
                  </DialogHeader>
                  <form aria-label="Create subtask form" onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newSubtask.title.trim() || !task) return;
                    
                    setLoading(true);
                    try {
                      const subtask = await api.createTask({
                        title: newSubtask.title.trim(),
                        description: newSubtask.description.trim(),
                        status: task.status,
                        integration: task.integration,
                        priority: task.priority,
                      });

                      await api.createRelationship({
                        sourceTaskId: task._id,
                        targetTaskId: subtask._id,
                        type: 'parent-of'
                      });

                      setNewSubtask({ title: '', description: '' });
                      
                      // Refetch task to get updated subtasks
                      const updatedTask = await api.getTask(task._id);
                      setTask(updatedTask);
                    } catch (err) {
                      console.error('Failed to create subtask:', err);
                      setError('Failed to create subtask');
                    } finally {
                      setLoading(false);
                    }
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="new-subtask-title" className="text-sm font-medium">Title</label>
                        <input
                          id="new-subtask-title"
                          type="text"
                          placeholder="Subtask title"
                          value={newSubtask.title}
                          onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
                          disabled={loading}
                          className="w-full px-3 py-2 border rounded-md"
                          aria-label="Subtask title"
                          required
                        />
                        <label htmlFor="new-subtask-description" className="text-sm font-medium">Description (optional)</label>
                        <input
                          id="new-subtask-description"
                          type="text"
                          placeholder="Subtask description (optional)"
                          value={newSubtask.description}
                          onChange={(e) => setNewSubtask({ ...newSubtask, description: e.target.value })}
                          disabled={loading}
                          className="w-full px-3 py-2 border rounded-md"
                          aria-label="Subtask description"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={loading || !newSubtask.title.trim()}
                      >
                        Create Subtask
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Existing Subtasks */}
              {task.subtasks && task.subtasks.length > 0 ? (
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask._id}>
                      {subtaskBeingEdited?._id === subtask._id ? (
                        <Dialog open={true} onOpenChange={() => {
                          setSubtaskBeingEdited(null);
                          setEditFormData({ title: '', description: '' });
                        }}>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Edit Subtask</DialogTitle>
                              <DialogDescription>
                                Make changes to your subtask here. Click save when you're done.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <label htmlFor="edit-subtask-title" className="text-sm font-medium">Title</label>
                                <input
                                  id="edit-subtask-title"
                                  type="text"
                                  placeholder="Subtask title"
                                  value={editFormData.title}
                                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                  disabled={loading}
                                  className="w-full px-3 py-2 border rounded-md"
                                  aria-label="Subtask title"
                                />
                                <label htmlFor="edit-subtask-description" className="text-sm font-medium">Description</label>
                                <input
                                  id="edit-subtask-description"
                                  type="text"
                                  placeholder="Subtask description"
                                  value={editFormData.description}
                                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                  disabled={loading}
                                  className="w-full px-3 py-2 border rounded-md"
                                  aria-label="Subtask description"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSubtaskBeingEdited(null);
                                  setEditFormData({ title: '', description: '' });
                                }}
                                disabled={loading}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="default"
                                onClick={async () => {
                                  if (!editFormData.title.trim()) return;
                                  
                                  setLoading(true);
                                  try {
                                    await api.updateTask(subtask._id, {
                                      title: editFormData.title.trim(),
                                      description: editFormData.description.trim(),
                                    });
                                    
                                    // Refetch task to get updated subtasks
                                    const updatedTask = await api.getTask(task._id);
                                    setTask(updatedTask);
                                    setSubtaskBeingEdited(null);
                                    setEditFormData({ title: '', description: '' });
                                  } catch (err) {
                                    console.error('Failed to update subtask:', err);
                                    setError('Failed to update subtask');
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                                disabled={loading || !editFormData.title.trim()}
                              >
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <div>
                            <h4 className="font-medium">{subtask.title}</h4>
                            {subtask.description && (
                              <p className="text-sm text-muted-foreground">{subtask.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary"
                              className={cn(
                                "transition-colors",
                                statusStyles[subtask.status]
                              )}
                            >
                              {subtask.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSubtaskBeingEdited(subtask);
                                setEditFormData({
                                  title: subtask.title,
                                  description: subtask.description || '',
                                });
                              }}
                              disabled={loading}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (onNavigateToTask) {
                                  onNavigateToTask(subtask._id);
                                }
                              }}
                              title="View subtask details"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                if (!confirm('Are you sure you want to delete this subtask?')) return;
                                
                                setLoading(true);
                                try {
                                  await api.deleteTask(subtask._id);
                                  
                                  // Refetch task to get updated subtasks
                                  const updatedTask = await api.getTask(task._id);
                                  setTask(updatedTask);
                                } catch (err) {
                                  console.error('Failed to delete subtask:', err);
                                  setError('Failed to delete subtask');
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-20 border-2 border-dashed border-border rounded-lg bg-card/50">
                  <p className="text-sm text-muted-foreground">No subtasks yet</p>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-500 mt-2">
                  {error}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
