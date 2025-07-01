import React, { useState, useRef } from 'react';
import { Clock, X, GripVertical } from 'lucide-react';
import { Appointment, User } from '../../types/calendar';
import { getAppointmentPosition, getTimeSlotFromPosition, SLOT_HEIGHT } from '../../utils/calendar';

interface AppointmentCardProps {
  appointment: Appointment;
  user: User;
  onDragStart: (appointment: Appointment, dragType: 'move' | 'resize-start' | 'resize-end') => void;
  onDragEnd: (appointmentId: number, newStartTime?: string, newEndTime?: string, newUserId?: number) => void;
  onDelete: (appointmentId: number) => void;
  column?: number;
  totalColumns?: number;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  user,
  onDragStart,
  onDragEnd,
  onDelete,
  column = 0,
  totalColumns = 1
}) => {
  const [isResizing, setIsResizing] = useState<'start' | 'end' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [tempTimes, setTempTimes] = useState({ startTime: appointment.startTime, endTime: appointment.endTime });
  const cardRef = useRef<HTMLDivElement>(null);

  const position = getAppointmentPosition(tempTimes.startTime, tempTimes.endTime);
  
  const cardWidth = totalColumns > 1 ? `${(1 / totalColumns) * 100}%` : 'calc(100% - 8px)';
  const cardLeft = totalColumns > 1 ? `${(column / totalColumns) * 100}%` : '4px';

  const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'resize-start' | 'resize-end') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'resize-start' || type === 'resize-end') {
      setIsResizing(type);
    }
    
    if (type === 'move') {
      setIsDragging(true);
    }
    
    onDragStart(appointment, type);

    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      
      if (type === 'move') {
        // Handle moving to different users and times
        const calendarContainer = document.querySelector('.calendar-grid');
        if (!calendarContainer) return;
        
        const rect = calendarContainer.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;
        
        // Calculate which user column we're over
        const timeColumnWidth = 80; // w-20 = 80px
        const userColumnsWidth = rect.width - timeColumnWidth;
        const userColumnWidth = userColumnsWidth / 5; // 5 users
        const userColumnIndex = Math.floor((relativeX - timeColumnWidth) / userColumnWidth);
        
        // Calculate time position
        const headerHeight = 64; // h-16 = 64px
        const timePosition = Math.max(0, relativeY - headerHeight);
        const newTime = getTimeSlotFromPosition(timePosition);
        
        // Calculate end time maintaining duration
        const currentHeight = getAppointmentPosition(appointment.startTime, appointment.endTime).height;
        const slotsSpan = currentHeight / SLOT_HEIGHT;
        const endSlotIndex = Math.floor(timePosition / SLOT_HEIGHT) + slotsSpan;
        const endTime = getTimeSlotFromPosition(endSlotIndex * SLOT_HEIGHT);
        
        setTempTimes({ startTime: newTime, endTime });
        
        // Visual feedback for cross-user dragging
        const targetUserId = Math.max(1, Math.min(5, userColumnIndex + 1));
        if (targetUserId !== appointment.userId && cardRef.current) {
          cardRef.current.style.opacity = '0.7';
          cardRef.current.style.transform = 'scale(0.95)';
          cardRef.current.style.zIndex = '100';
        } else if (cardRef.current) {
          cardRef.current.style.opacity = '1';
          cardRef.current.style.transform = 'scale(1)';
        }
        
      } else {
        // Handle resize operations
        const rect = cardRef.current.parentElement?.getBoundingClientRect();
        if (!rect) return;
        
        const relativeY = e.clientY - rect.top;
        const newTime = getTimeSlotFromPosition(relativeY);
        
        if (type === 'resize-start') {
          setTempTimes(prev => ({ ...prev, startTime: newTime }));
        } else if (type === 'resize-end') {
          setTempTimes(prev => ({ ...prev, endTime: newTime }));
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsResizing(null);
      setIsDragging(false);
      
      // For move operations, calculate final user assignment
      if (type === 'move') {
        const calendarContainer = document.querySelector('.calendar-grid');
        if (calendarContainer) {
          const rect = calendarContainer.getBoundingClientRect();
          const relativeX = e.clientX - rect.left;
          const timeColumnWidth = 80;
          const userColumnsWidth = rect.width - timeColumnWidth;
          const userColumnWidth = userColumnsWidth / 5;
          const userColumnIndex = Math.floor((relativeX - timeColumnWidth) / userColumnWidth);
          const newUserId = Math.max(1, Math.min(5, userColumnIndex + 1));
          
          onDragEnd(appointment.id, tempTimes.startTime, tempTimes.endTime, newUserId);
        } else {
          onDragEnd(appointment.id, tempTimes.startTime, tempTimes.endTime);
        }
      } else {
        onDragEnd(appointment.id, tempTimes.startTime, tempTimes.endTime);
      }
      
      // Reset visual styles
      if (cardRef.current) {
        cardRef.current.style.transform = '';
        cardRef.current.style.opacity = '';
        cardRef.current.style.zIndex = '';
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // HTML5 Drag and Drop as fallback
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('appointmentId', appointment.id.toString());
    e.dataTransfer.setData('appointmentData', JSON.stringify(appointment));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(appointment, 'move');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (cardRef.current) {
      cardRef.current.style.transform = '';
      cardRef.current.style.opacity = '';
      cardRef.current.style.zIndex = '';
    }
  };

  return (
    <div
      ref={cardRef}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`absolute ${user.color} bg-opacity-90 rounded-md shadow-sm border border-opacity-20 border-white cursor-move hover:bg-opacity-100 transition-all group appointment-card ${isDragging ? 'dragging' : ''}`}
      style={{
        top: `${position.top}px`,
        height: `${position.height}px`,
        left: cardLeft,
        width: cardWidth,
        minHeight: `${SLOT_HEIGHT}px`,
        zIndex: isResizing ? 50 : isDragging ? 100 : 10
      }}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
    >
      {/* Resize handle - top */}
      <div
        className="absolute top-0 left-0 right-0 h-2 cursor-n-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onMouseDown={(e) => handleMouseDown(e, 'resize-start')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full h-1 bg-white bg-opacity-50 rounded-t-md"></div>
      </div>

      {/* Content */}
      <div className="p-2 h-full flex flex-col justify-between text-white relative pointer-events-none">
        <div className="flex-1 min-h-0">
          <div className="flex items-start justify-between gap-1">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{appointment.title}</div>
              <div className="text-xs opacity-90 flex items-center gap-1 mt-1">
                <Clock size={10} />
                <span>{tempTimes.startTime} - {tempTimes.endTime}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
              <GripVertical size={12} className="cursor-move" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete(appointment.id);
                }}
                className="text-white hover:text-red-200 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>
          {appointment.description && position.height > 60 && (
            <div className="text-xs opacity-80 mt-1 truncate">{appointment.description}</div>
          )}
        </div>
      </div>

      {/* Resize handle - bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onMouseDown={(e) => handleMouseDown(e, 'resize-end')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full h-1 bg-white bg-opacity-50 rounded-b-md"></div>
      </div>
    </div>
  );
};

export default AppointmentCard;