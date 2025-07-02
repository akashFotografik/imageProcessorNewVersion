// components/TaskCard.tsx
import React from 'react';
import { Task } from '../../types/calendar';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging }) => {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-300';
      case 'medium': return 'bg-yellow-100 border-yellow-300';
      case 'low': return 'bg-green-100 border-green-300';
      default: return 'bg-blue-100 border-blue-300';
    }
  };

  return (
    <div
      className={`
        p-2 rounded-md border-2 cursor-move shadow-sm
        ${getPriorityColor(task.priority)}
        ${isDragging ? 'opacity-50 transform rotate-2' : 'hover:shadow-md'}
        transition-all duration-200
      `}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ 
          type: 'task', 
          taskId: task.id 
        }));
      }}
    >
      <div className="font-medium text-sm text-gray-800">{task.title}</div>
      {task.description && (
        <div className="text-xs text-gray-600 mt-1">{task.description}</div>
      )}
      <div className="text-xs text-gray-500 mt-1">{task.duration}min</div>
    </div>
  );
};