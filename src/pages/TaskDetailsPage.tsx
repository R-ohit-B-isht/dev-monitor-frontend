import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Task } from '../types/Task';
import { api } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/views/Skeleton';
import { Breadcrumb } from '../components/Breadcrumb';
import { ArrowLeft, ArrowRight, Clock, Github, Trello, LineChart, XCircle } from 'lucide-react';
import { Relationships } from '../components/views/Relationships';
import { cn } from '../lib/utils';
import { statusStyles } from '../components/TaskCard';
import { TaskCard } from '../components/TaskCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ChevronRight, ChevronDown, Plus, Trash2, Edit2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';

const integrationIcons = {
  github: <Github className="h-4 w-4" />,
  jira: <Trello className="h-4 w-4" />,
  linear: <LineChart className="h-4 w-4" />
};

export function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isCreateSubtaskDialogOpen, setIsCreateSubtaskDialogOpen] = useState(false);
  const [isEditSubtaskDialogOpen, setIsEditSubtaskDialogOpen] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState<Task | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskDescription, setNewSubtaskDescription] = useState('');
  // Fetch all tasks for relationships
  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const tasks = await api.getTasks();
        setAllTasks(tasks);
      } catch (error) {
        console.error('Error loading all tasks:', error);
      }
    };

    fetchAllTasks();
  }, []);

  useEffect(() => {
    const fetchTaskAndSubtasks = async () => {
      setLoading(true);
      try {
        const response = await api.getTask(id!, true); // Pass includeSubtasks as true
        setTask(response);
      } catch (error: unknown) {
        console.error('Error loading task details:', error);
        setError('Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskAndSubtasks();
  }, [id]);

  if (loading) return (
    <div className="p-6 max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Tasks', href: '/tasks' },
          { label: 'Loading...' }
        ]}
      />
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-24" /> {/* Back button */}
      </div>
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-3/4" /> {/* Title */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" /> {/* Status badge */}
            <Skeleton className="h-6 w-24" /> {/* Priority badge */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" /> {/* Description label */}
              <Skeleton className="h-20 w-full" /> {/* Description content */}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" /> {/* Timeline label */}
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-48" />
              </div>
            </div>
          </div>

          {/* Task Relationships */}
          <div className="mt-6">
            <Skeleton className="h-[400px] rounded-lg" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
  if (error || !task) {
    const message = error || 'Task not found';
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Breadcrumb
          items={[
            { label: 'Tasks', href: '/tasks' },
            { label: 'Error' }
          ]}
        />
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/tasks')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-6">
              <div className="rounded-full bg-red-100 p-3 mb-4">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Task</h3>
              <p className="text-red-600">{message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Tasks', href: '/tasks' },
          { label: task.title }
        ]}
      />
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="h-4 w-px bg-border" />
        <Button
          variant="destructive"
          onClick={async () => {
            try {
              await api.deleteTask(id!);
              navigate('/tasks');
            } catch (error) {
              console.error('Error deleting task:', error);
              setError('Failed to delete task');
            }
          }}
        >
          Delete Task
        </Button>
      </div>
      <Card className="transition-all duration-200 hover:shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">{task.title}</CardTitle>
            {integrationIcons[task.integration]}
          </div>
          <div className="flex flex-wrap gap-2">
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
              <Select
                value={task.status}
                onValueChange={async (newStatus) => {
                  try {
                    await api.updateTaskStatus(task._id, newStatus as Task['status']);
                    setTask({ ...task, status: newStatus as Task['status'] });
                  } catch (error) {
                    console.error('Error updating task status:', error);
                    setError('Failed to update task status');
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To-Do">To-Do</SelectItem>
                  <SelectItem value="In-Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {task.priority && (
              <Badge variant="outline">Priority: {task.priority}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="space-y-2">
              <h3 className="font-medium">Description</h3>
              <p className="text-sm text-gray-500">{task.description || 'No description provided'}</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Timeline</h3>
              <div className="grid gap-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Updated: {new Date(task.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {task.devinSessionUrl && (
                <div className="space-y-2">
                  <h3 className="font-medium">Devin Session</h3>
                  <a
                    href={task.devinSessionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    View Session
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              )}

              {task.sourceUrl && (
                <div className="space-y-2">
                  <h3 className="font-medium">Source</h3>
                  <a
                    href={task.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    View Original Issue
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
            {/* Optional links section removed until Task interface is updated */}
            <div className="grid sm:grid-cols-2 gap-4"></div>
          </div>

          {/* Subtasks Section */}
          {/* Subtasks Section */}
          <div className="mt-6">
            <Collapsible defaultOpen>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CollapsibleTrigger className="flex items-center gap-2 hover:text-primary transition-colors">
                    <ChevronRight className="h-4 w-4" />
                    <h3 className="font-medium">Subtasks ({task.subtasks?.length || 0})</h3>
                  </CollapsibleTrigger>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateSubtaskDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Subtask
                </Button>
              </div>
              <CollapsibleContent>
                <div className="space-y-3 pl-6">
                  {task.subtasks?.map((subtask) => (
                    <div key={subtask._id} className="group relative">
                      <TaskCard
                        task={subtask}
                        onClick={() => navigate(`/tasks/${subtask._id}`)}
                      />
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubtask(subtask);
                            setIsEditSubtaskDialogOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this subtask?')) {
                              try {
                                await api.deleteTask(subtask._id);
                                // Refresh task data
                                const updatedTask = await api.getTask(id!, true);
                                setTask(updatedTask);
                              } catch (error) {
                                console.error('Failed to delete subtask:', error);
                                setError('Failed to delete subtask');
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Create Subtask Dialog */}
          <Dialog open={isCreateSubtaskDialogOpen} onOpenChange={setIsCreateSubtaskDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Subtask</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Enter subtask title"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Enter subtask description"
                    value={newSubtaskDescription}
                    onChange={(e) => setNewSubtaskDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewSubtaskTitle('');
                    setNewSubtaskDescription('');
                    setIsCreateSubtaskDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!newSubtaskTitle.trim()) {
                      setError('Title is required');
                      return;
                    }
                    try {
                      await api.createTask({
                        title: newSubtaskTitle.trim(),
                        description: newSubtaskDescription.trim(),
                        status: 'To-Do',
                        integration: task?.integration || 'github',
                        parentId: task?._id,
                      });
                      // Refresh task data
                      const updatedTask = await api.getTask(id!, true);
                      setTask(updatedTask);
                      // Reset form
                      setNewSubtaskTitle('');
                      setNewSubtaskDescription('');
                      setIsCreateSubtaskDialogOpen(false);
                    } catch (error) {
                      console.error('Failed to create subtask:', error);
                      setError('Failed to create subtask');
                    }
                  }}
                >
                  Create Subtask
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Subtask Dialog */}
          <Dialog open={isEditSubtaskDialogOpen} onOpenChange={setIsEditSubtaskDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Subtask</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Enter subtask title"
                    value={selectedSubtask?.title || ''}
                    onChange={(e) => setSelectedSubtask(prev => prev ? { ...prev, title: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Enter subtask description"
                    value={selectedSubtask?.description || ''}
                    onChange={(e) => setSelectedSubtask(prev => prev ? { ...prev, description: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Parent Task</Label>
                  <Select
                    value={selectedSubtask?.parentId || task._id}
                    onValueChange={(newParentId) => {
                      setSelectedSubtask(prev => prev ? { ...prev, parentId: newParentId } : null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent task" />
                    </SelectTrigger>
                    <SelectContent>
                      {allTasks
                        .filter(t => t._id !== selectedSubtask?._id && !t.parentId) // Only show non-subtasks as potential parents
                        .map((potentialParent) => (
                          <SelectItem key={potentialParent._id} value={potentialParent._id}>
                            {potentialParent.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSubtask(null);
                    setIsEditSubtaskDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!selectedSubtask?.title.trim()) {
                      setError('Title is required');
                      return;
                    }
                    try {
                      await api.updateTask(selectedSubtask._id, {
                        title: selectedSubtask.title.trim(),
                        description: selectedSubtask.description?.trim(),
                        parentId: selectedSubtask.parentId,
                      });
                      // Refresh task data
                      const updatedTask = await api.getTask(id!, true);
                      setTask(updatedTask);
                      setSelectedSubtask(null);
                      setIsEditSubtaskDialogOpen(false);
                    } catch (error) {
                      console.error('Failed to update subtask:', error);
                      setError('Failed to update subtask');
                    }
                  }}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Task Relationships */}
          {task && (
            <div className="mt-6">
              <Relationships
                task={task}
                allTasks={allTasks}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );


}
