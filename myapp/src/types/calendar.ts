export interface User {
  id: number;
  name: string;
  color: string;
}

export interface Appointment {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  userId: number;
  description?: string;
}

export interface NewAppointment {
  title: string;
  startTime: string;
  endTime: string;
  userId: string;
  description: string;
}

export interface DragState {
  isDragging: boolean;
  appointmentId?: number;
  dragType?: 'move' | 'resize-start' | 'resize-end';
  originalPosition?: { startTime: string; endTime: string; userId: number };
}