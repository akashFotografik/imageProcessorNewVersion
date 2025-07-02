// types/calendar.ts
export interface User {
    id: string;
    name: string;
    avatar?: string;
  }
  
  export interface Task {
    id: string;
    title: string;
    description?: string;
    duration: number; // in minutes
    color?: string;
    priority?: 'low' | 'medium' | 'high';
  }
  
  export interface TimeSlot {
    hour: number;
    minute: number;
  }
  
  export interface Assignment {
    id: string;
    taskId: string;
    userId: string;
    timeSlot: TimeSlot;
  }
  
  export interface CalendarData {
    users: User[];
    tasks: Task[];
    assignments: Assignment[];
  }