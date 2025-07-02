"use client";

import React from 'react';
import { TaskCalendar } from '@/components/calendar/taskCalendar';
import { CalendarData } from '../../../types/calendar';

const sampleData: CalendarData = {
  users: [
    { id: 'user1', name: 'Alice Johnson' },
    { id: 'user2', name: 'Bob Smith' },
    { id: 'user3', name: 'Carol Brown' },
    { id: 'user4', name: 'David Wilson' }
  ],
  tasks: [
    {
      id: 'task1',
      title: 'Design Review',
      description: 'Review UI mockups',
      duration: 60,
      priority: 'high'
    },
    {
      id: 'task2',
      title: 'Code Review',
      description: 'Review pull requests',
      duration: 30,
      priority: 'medium'
    },
    {
      id: 'task3',
      title: 'Team Meeting',
      description: 'Weekly standup',
      duration: 45,
      priority: 'low'
    },
    {
      id: 'task4',
      title: 'Client Call',
      description: 'Discuss project requirements',
      duration: 90,
      priority: 'high'
    },
    {
      id: 'task5',
      title: 'Documentation',
      description: 'Update API docs',
      duration: 120,
      priority: 'medium'
    }
  ],
  assignments: [
    {
      id: 'assignment1',
      taskId: 'task1',
      userId: 'user1',
      timeSlot: { hour: 10, minute: 0 }
    }
  ]
};

export default function CalendarPage() {
  return (
    <div className="w-full h-screen">
      <TaskCalendar 
        initialData={sampleData}
        startHour={9}
        endHour={17}
        timeInterval={60}
        cellWidth={220}
        cellHeight={100}
      />
    </div>
  );
}