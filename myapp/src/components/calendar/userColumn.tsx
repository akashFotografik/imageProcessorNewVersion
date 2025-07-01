import React, { useState } from 'react';
import { User as UserIcon } from 'lucide-react';
import { User, Appointment } from '../../types/calendar';
import { TIME_SLOTS, arrangeOverlappingAppointments } from '../../utils/calendar';
import AppointmentCard from './appointmentCard';

interface UserColumnProps {
  user: User;
  appointments: Appointment[];
  onDragStart: (appointment: Appointment, dragType: 'move' | 'resize-start' | 'resize-end') => void;
  onDragEnd: (appointmentId: number, newStartTime?: string, newEndTime?: string, newUserId?: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, userId: number) => void;
  onDeleteAppointment: (appointmentId: number) => void;
}

const UserColumn: React.FC<UserColumnProps> = ({
  user,
  appointments,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onDeleteAppointment
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const userAppointments = appointments.filter(apt => apt.userId === user.id);
  const arrangedAppointments = arrangeOverlappingAppointments(userAppointments);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
    onDragOver(e);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set to false if we're actually leaving the column
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // Handle HTML5 drag and drop
    const appointmentId = e.dataTransfer.getData('appointmentId');
    const appointmentData = e.dataTransfer.getData('appointmentData');
    
    if (appointmentId && appointmentData) {
      const appointment = JSON.parse(appointmentData);
      if (appointment.userId !== user.id) {
        onDragEnd(parseInt(appointmentId), undefined, undefined, user.id);
      }
    }
    
    // Handle custom drop logic
    onDrop(e, user.id);
  };

  return (
    <div
      className={`flex-1 border-r border-gray-200 last:border-r-0 min-h-0 user-column transition-all duration-200 ${
        isDragOver ? 'bg-blue-50 border-blue-300 shadow-inner' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-user-id={user.id}
    >
      {/* User Header */}
      <div className={`h-16 border-b border-gray-200 flex items-center justify-center sticky top-0 z-20 transition-colors ${
        isDragOver ? 'bg-blue-100' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className={`w-10 h-10 ${user.color} rounded-full mx-auto mb-1 flex items-center justify-center shadow-sm transition-transform ${
            isDragOver ? 'scale-110' : ''
          }`}>
            <UserIcon size={18} className="text-white" />
          </div>
          <div className="text-sm font-medium text-gray-700">{user.name}</div>
          <div className="text-xs text-gray-500">
            {userAppointments.length} appointment{userAppointments.length !== 1 ? 's' : ''}
          </div>
          {isDragOver && (
            <div className="text-xs text-blue-600 font-medium mt-1">
              Drop to assign
            </div>
          )}
        </div>
      </div>

      {/* Time Slots Grid */}
      <div className={`relative bg-white transition-colors ${isDragOver ? 'bg-blue-25' : ''}`}>
        {TIME_SLOTS.map((time, index) => (
          <div
            key={time}
            className={`h-7.5 border-b transition-colors ${
              index % 2 === 0 ? 'border-gray-200' : 'border-gray-100'
            } ${
              isDragOver 
                ? 'hover:bg-blue-100 bg-blue-25' 
                : 'hover:bg-blue-50'
            }`}
            style={{ height: '30px' }}
            data-time={time}
          />
        ))}

        {/* Drop Zone Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-30 border-2 border-dashed border-blue-400 rounded-md flex items-center justify-center pointer-events-none">
            <div className="text-blue-600 font-medium text-sm bg-white px-3 py-1 rounded-full shadow-sm">
              Drop appointment here
            </div>
          </div>
        )}

        {/* Appointments */}
        <div className="absolute inset-0 pointer-events-none">
          {arrangedAppointments.map(appointment => (
            <div key={appointment.id} className="pointer-events-auto">
              <AppointmentCard
                appointment={appointment}
                user={user}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDelete={onDeleteAppointment}
                column={appointment.column}
                totalColumns={appointment.totalColumns}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserColumn;