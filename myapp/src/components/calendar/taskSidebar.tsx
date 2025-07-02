// components/TaskSidebar.tsx
import React from 'react';
import { Task } from '../../types/calendar';
import { TaskCard } from './taskCard';

interface TaskSidebarProps {
  tasks: Task[];
  unassignedTasks: Task[];
}

export const TaskSidebar: React.FC<TaskSidebarProps> = ({ unassignedTasks }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h3 className="font-semibold text-lg mb-4 text-gray-800">Available Tasks</h3>
      <div className="space-y-2">
        {unassignedTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
      {unassignedTasks.length === 0 && (
        <p className="text-gray-500 text-sm italic">All tasks are assigned</p>
      )}
    </div>
  );
};