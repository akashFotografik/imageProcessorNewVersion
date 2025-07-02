// components/TaskCalendar.tsx
import React from 'react';
import { CalendarData, TimeSlot } from '../../types/calendar';
import { UserColumn } from './userColumn';
import { TimeSlotRow } from './timeSlotRow';
import { CalendarCell } from './calendarCell';
import { TaskSidebar } from './taskSidebar';
import { useCalendarData } from '../../hooks/useCalendarData';

interface TaskCalendarProps {
  initialData: CalendarData;
  startHour?: number;
  endHour?: number;
  timeInterval?: number; // in minutes
  cellWidth?: number;
  cellHeight?: number;
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({
  initialData,
  startHour = 9,
  endHour = 17,
  timeInterval = 60,
  cellWidth = 200,
  cellHeight = 80
}) => {
  const { data, assignTask, moveTask, getUnassignedTasks } = useCalendarData(initialData);

  // Generate time slots
  const timeSlots: TimeSlot[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += timeInterval) {
      if (hour === endHour && minute > 0) break;
      timeSlots.push({ hour, minute });
    }
  }

  const unassignedTasks = getUnassignedTasks();

  return (
    <div className="flex h-screen bg-gray-100">
      <TaskSidebar tasks={data.tasks} unassignedTasks={unassignedTasks} />
      
      <div className="flex-1 overflow-auto">
        <div className="inline-block min-w-full">
          {/* Header with users */}
          <div className="flex sticky top-0 z-20 bg-white border-b-2 border-gray-300">
            <div style={{ width: '80px' }} className="bg-gray-100 border-r border-gray-200"></div>
            {data.users.map(user => (
              <UserColumn key={user.id} user={user} width={cellWidth} />
            ))}
          </div>

          {/* Calendar grid */}
          {timeSlots.map(timeSlot => (
            <div key={`${timeSlot.hour}-${timeSlot.minute}`} className="flex">
              <TimeSlotRow timeSlot={timeSlot} height={cellHeight} />
              {data.users.map(user => (
                <CalendarCell
                  key={`${user.id}-${timeSlot.hour}-${timeSlot.minute}`}
                  userId={user.id}
                  timeSlot={timeSlot}
                  assignments={data.assignments}
                  tasks={data.tasks}
                  width={cellWidth}
                  height={cellHeight}
                  onDrop={assignTask}
                  onTaskMove={moveTask}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};