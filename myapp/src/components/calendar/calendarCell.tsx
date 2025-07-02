// components/CalendarCell.tsx
import React from 'react';
import { Task, Assignment, TimeSlot } from '../../types/calendar';
import { TaskCard } from './taskCard';

interface CalendarCellProps {
  userId: string;
  timeSlot: TimeSlot;
  assignments: Assignment[];
  tasks: Task[];
  width: number;
  height: number;
  onDrop: (userId: string, timeSlot: TimeSlot, taskId: string) => void;
  onTaskMove: (assignmentId: string, newUserId: string, newTimeSlot: TimeSlot) => void;
}

export const CalendarCell: React.FC<CalendarCellProps> = ({
  userId,
  timeSlot,
  assignments,
  tasks,
  width,
  height,
  onDrop,
  onTaskMove
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const cellAssignments = assignments.filter(
    assignment => 
      assignment.userId === userId &&
      assignment.timeSlot.hour === timeSlot.hour &&
      assignment.timeSlot.minute === timeSlot.minute
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      if (data.type === 'task') {
        onDrop(userId, timeSlot, data.taskId);
      } else if (data.type === 'assignment') {
        onTaskMove(data.assignmentId, userId, timeSlot);
      }
    } catch (error) {
      console.error('Error parsing drop data:', error);
    }
  };

  return (
    <div
      className={`
        border-b border-r border-gray-200 p-1 min-h-full
        ${isDragOver ? 'bg-blue-100 border-blue-300' : 'bg-white hover:bg-gray-50'}
        transition-colors duration-200
      `}
      style={{ width: `${width}px`, height: `${height}px` }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="space-y-1">
        {cellAssignments.map(assignment => {
          const task = tasks.find(t => t.id === assignment.taskId);
          if (!task) return null;
          
          return (
            <div
              key={assignment.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                  type: 'assignment',
                  assignmentId: assignment.id
                }));
              }}
            >
              <TaskCard task={task} />
            </div>
          );
        })}
      </div>
    </div>
  );
};