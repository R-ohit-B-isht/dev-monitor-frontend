export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'To-Do' | 'In-Progress' | 'Done' | 'Deleted';
  integration: 'github' | 'jira' | 'linear';
  createdAt: string;
  updatedAt: string;
  devinSessionUrl?: string;
  sourceUrl?: string;
  sourceId?: string;
  issueKey?: string;
  priority?: 'high' | 'medium' | 'low';
  // Subtask relationship fields
  parentId?: string;         // Reference to parent task if this is a subtask
  childIds?: string[];       // Array of subtask IDs if this is a parent task
}
