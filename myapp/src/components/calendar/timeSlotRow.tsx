// components/TimeSlotRow.tsx
import React from 'react';
import { TimeSlot } from '../../types/calendar';

interface TimeSlotRowProps {
  timeSlot: TimeSlot;
  height: number;
}

export const TimeSlotRow: React.FC<TimeSlotRowProps> = ({ timeSlot, height }) => {
  const formatTime = (hour: number, minute: number) => {
    const time = new Date();
    time.setHours(hour, minute);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div 
      className="bg-gray-50 border-b border-gray-200 px-3 flex items-center font-medium text-sm text-gray-600 sticky left-0 z-10"
      style={{ height: `${height}px`, minWidth: '80px' }}
    >
      {formatTime(timeSlot.hour, timeSlot.minute)}
    </div>
  );
};