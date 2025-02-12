import * as React from 'react';
import { useState, useMemo } from 'react';
import { Task } from '../../types/Task';
import { Badge } from '../../components/ui/badge';
import { statusStyles } from '../TaskCard';
import { cn } from '../../lib/utils';
import { Github, Trello, LineChart, ArrowUpDown } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const integrationIcons = {
  github: <Github className="h-4 w-4" />,
  jira: <Trello className="h-4 w-4" />,
  linear: <LineChart className="h-4 w-4" />
};

interface TableViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;

}

type SortField = 'title' | 'status' | 'priority' | 'updatedAt' | 'integration';
type SortDirection = 'asc' | 'desc';

export function TableView({ tasks, onTaskClick }: TableViewProps) {
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTasks = useMemo(() => {
    // First get parent tasks (no parentTaskId)
    const parentTasks = tasks.filter(task => !task.parentTaskId);

    // Sort parent tasks
    const sortedParents = [...parentTasks].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (sortField === 'updatedAt') {
        return direction * (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }
      
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      return direction * String(aValue).localeCompare(String(bValue));
    });

    // For each parent, find and sort its subtasks
    return sortedParents.map(parent => ({
      ...parent,
      subtasks: tasks
        .filter(task => task.parentTaskId === parent._id)
        .sort((a, b) => {
          const direction = sortDirection === 'asc' ? 1 : -1;
          
          if (sortField === 'updatedAt') {
            return direction * (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          }
          
          const aValue = a[sortField] || '';
          const bValue = b[sortField] || '';
          
          return direction * String(aValue).localeCompare(String(bValue));
        })
    }));
  }, [tasks, sortField, sortDirection]);

  const renderSortButton = (field: SortField, label: string) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="hover:bg-muted/50 h-8 px-2 w-full justify-start text-left font-medium sm:w-auto"
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">{renderSortButton('title', 'Title')}</TableHead>
              <TableHead className="min-w-[100px]">{renderSortButton('status', 'Status')}</TableHead>
              <TableHead className="hidden sm:table-cell">{renderSortButton('priority', 'Priority')}</TableHead>
              <TableHead className="hidden md:table-cell">{renderSortButton('integration', 'Integration')}</TableHead>
              <TableHead className="hidden lg:table-cell">Created</TableHead>
              <TableHead className="min-w-[100px]">{renderSortButton('updatedAt', 'Updated')}</TableHead>

            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => (
              <React.Fragment key={task._id}>
                <TableRow
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onTaskClick(task)}
                >
                  <TableCell className="font-medium min-w-[200px] truncate">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 md:hidden">
                        {integrationIcons[task.integration]}
                      </div>
                      {task.title}
                    </div>
                  </TableCell>
                <TableCell className="min-w-[100px]">
                  <Badge 
                    variant="secondary"
                    className={cn(
                      "transition-colors whitespace-nowrap",
                      statusStyles[task.status]
                    )}
                  >
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {task.priority && (
                    <Badge variant="outline" className="whitespace-nowrap">
                      {task.priority}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center">
                    {integrationIcons[task.integration]}
                    <span className="ml-2">{task.integration}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell whitespace-nowrap">
                  {new Date(task.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="min-w-[100px] whitespace-nowrap">
                  {new Date(task.updatedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
              {task.subtasks?.map((subtask) => (
                <TableRow
                  key={subtask._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onTaskClick(subtask)}
                >
                  <TableCell className="font-medium min-w-[200px] truncate">
                    <div className="flex items-center gap-2">
                      <div className="w-6" /> {/* Indentation spacer */}
                      <div className="border-l-2 h-6 border-gray-200 mr-2" />
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 md:hidden">
                          {integrationIcons[subtask.integration]}
                        </div>
                        {subtask.title}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[100px]">
                    <Badge 
                      variant="secondary"
                      className={cn(
                        "transition-colors whitespace-nowrap",
                        statusStyles[subtask.status]
                      )}
                    >
                      {subtask.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {subtask.priority && (
                      <Badge variant="outline" className="whitespace-nowrap">
                        {subtask.priority}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center">
                      {integrationIcons[subtask.integration]}
                      <span className="ml-2">{subtask.integration}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell whitespace-nowrap">
                    {new Date(subtask.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="min-w-[100px] whitespace-nowrap">
                    {new Date(subtask.updatedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
