"use client";

import React, { useState, useCallback } from 'react';
import { User, Appointment, NewAppointment, DragState } from '../../../types/calendar';
import CalendarHeader from '@/components/calendar/calendarHeader';
import TimeColumn from '@/components/calendar/timeColumn';
import UserColumn from '@/components/calendar/userColumn';
import AddAppointmentModal from '@/components/calendar/addAppointmentModel';

const INITIAL_USERS: User[] = [
  { id: 1, name: 'Alice Johnson', color: 'bg-blue-500' },
  { id: 2, name: 'Bob Smith', color: 'bg-green-500' },
  { id: 3, name: 'Carol Davis', color: 'bg-purple-500' },
  { id: 4, name: 'David Wilson', color: 'bg-orange-500' },
  { id: 5, name: 'Emma Brown', color: 'bg-pink-500' },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    title: 'Team Meeting',
    startTime: '09:00',
    endTime: '10:00',
    userId: 1,
    description: 'Weekly team sync and planning session'
  },
  {
    id: 2,
    title: 'Client Call',
    startTime: '14:30',
    endTime: '15:30',
    userId: 2,
    description: 'Project discussion with client'
  },
  {
    id: 3,
    title: 'Code Review',
    startTime: '11:00',
    endTime: '12:00',
    userId: 3,
    description: 'Review pull requests and discuss improvements'
  },
  {
    id: 4,
    title: 'Design Workshop',
    startTime: '10:30',
    endTime: '12:00',
    userId: 1,
    description: 'UI/UX design brainstorming session'
  },
  {
    id: 5,
    title: 'Sprint Planning',
    startTime: '09:00',
    endTime: '10:30',
    userId: 3,
    description: 'Plan next sprint tasks and deliverables'
  }
];

const MultiUserCalendar: React.FC = () => {
  const [users] = useState<User[]>(INITIAL_USERS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dragState, setDragState] = useState<DragState>({ isDragging: false });
  const [newAppointment, setNewAppointment] = useState<NewAppointment>({
    title: '',
    startTime: '',
    endTime: '',
    userId: '',
    description: ''
  });

  const handleAddAppointment = useCallback((appointmentData: NewAppointment) => {
    const appointment: Appointment = {
      id: Date.now(),
      ...appointmentData,
      userId: parseInt(appointmentData.userId)
    };
    setAppointments(prev => [...prev, appointment]);
    setNewAppointment({ title: '', startTime: '', endTime: '', userId: '', description: '' });
    setShowAddModal(false);
  }, []);

  const handleDragStart = useCallback((appointment: Appointment, dragType: 'move' | 'resize-start' | 'resize-end') => {
    setDragState({
      isDragging: true,
      appointmentId: appointment.id,
      dragType,
      originalPosition: {
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        userId: appointment.userId
      }
    });
  }, []);

  const handleDragEnd = useCallback((appointmentId: number, newStartTime?: string, newEndTime?: string, newUserId?: number) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === appointmentId) {
        return {
          ...apt,
          ...(newStartTime && { startTime: newStartTime }),
          ...(newEndTime && { endTime: newEndTime }),
          ...(newUserId && { userId: newUserId })
        };
      }
      return apt;
    }));
    setDragState({ isDragging: false });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, userId: number) => {
    e.preventDefault();
    if (dragState.appointmentId && dragState.originalPosition) {
      handleDragEnd(dragState.appointmentId, undefined, undefined, userId);
    }
  }, [dragState, handleDragEnd]);

  const handleDeleteAppointment = useCallback((appointmentId: number) => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <CalendarHeader
          onAddAppointment={() => setShowAddModal(true)}
          totalAppointments={appointments.length}
          totalUsers={users.length}
        />

        <div className="flex max-h-screen overflow-hidden">
          <TimeColumn />
          
          <div className="flex-1 flex overflow-x-auto">
            {users.map(user => (
              <UserColumn
                key={user.id}
                user={user}
                appointments={appointments}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDeleteAppointment={handleDeleteAppointment}
              />
            ))}
          </div>
        </div>

        <div className="p-4 bg-blue-50 border-t">
          <div className="text-sm text-blue-700">
            <strong>Features:</strong> 
            • Add appointments by clicking "Add Appointment" 
            • Drag appointments between users to reassign 
            • Resize appointments by dragging top/bottom edges 
            • Move appointments to different times by dragging 
            • Multiple overlapping appointments are automatically arranged 
            • Delete appointments using the X button
          </div>
        </div>
      </div>

      <AddAppointmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddAppointment}
        users={users}
        newAppointment={newAppointment}
        setNewAppointment={setNewAppointment}
      />
    </div>
  );
};

export default MultiUserCalendar;