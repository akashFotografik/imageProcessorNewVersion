// hooks/useCalendarData.ts
import { useState, useCallback } from 'react';
import { CalendarData, Assignment, TimeSlot } from '../types/calendar';

export const useCalendarData = (initialData: CalendarData) => {
  const [data, setData] = useState<CalendarData>(initialData);

  const assignTask = useCallback((userId: string, timeSlot: TimeSlot, taskId: string) => {
    const newAssignment: Assignment = {
      id: `assignment_${Date.now()}_${Math.random()}`,
      taskId,
      userId,
      timeSlot
    };

    setData(prev => ({
      ...prev,
      assignments: [...prev.assignments, newAssignment]
    }));
  }, []);

  const moveTask = useCallback((assignmentId: string, newUserId: string, newTimeSlot: TimeSlot) => {
    setData(prev => ({
      ...prev,
      assignments: prev.assignments.map(assignment =>
        assignment.id === assignmentId
          ? { ...assignment, userId: newUserId, timeSlot: newTimeSlot }
          : assignment
      )
    }));
  }, []);

  const removeAssignment = useCallback((assignmentId: string) => {
    setData(prev => ({
      ...prev,
      assignments: prev.assignments.filter(assignment => assignment.id !== assignmentId)
    }));
  }, []);

  const getUnassignedTasks = useCallback(() => {
    const assignedTaskIds = new Set(data.assignments.map(a => a.taskId));
    return data.tasks.filter(task => !assignedTaskIds.has(task.id));
  }, [data.tasks, data.assignments]);

  return {
    data,
    assignTask,
    moveTask,
    removeAssignment,
    getUnassignedTasks
  };
};
