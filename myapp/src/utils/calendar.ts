export const TIME_SLOTS = (() => {
  const slots: string[] = [];
  for (let hour = 8; hour < 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
})();

export const SLOT_HEIGHT = 30; // pixels per 30-minute slot

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const getAppointmentPosition = (startTime: string, endTime: string) => {
  const startIndex = TIME_SLOTS.indexOf(startTime);
  const endIndex = TIME_SLOTS.indexOf(endTime);
  const top = startIndex * SLOT_HEIGHT;
  const height = Math.max((endIndex - startIndex) * SLOT_HEIGHT, SLOT_HEIGHT);
  return { top, height };
};

export const getTimeSlotFromPosition = (yPosition: number): string => {
  const slotIndex = Math.floor(yPosition / SLOT_HEIGHT);
  return TIME_SLOTS[Math.min(Math.max(slotIndex, 0), TIME_SLOTS.length - 1)];
};

export const checkAppointmentOverlap = (
  appointment1: { startTime: string; endTime: string },
  appointment2: { startTime: string; endTime: string }
): boolean => {
  const start1 = timeToMinutes(appointment1.startTime);
  const end1 = timeToMinutes(appointment1.endTime);
  const start2 = timeToMinutes(appointment2.startTime);
  const end2 = timeToMinutes(appointment2.endTime);
  
  return start1 < end2 && start2 < end1;
};

export const arrangeOverlappingAppointments = (appointments: any[]) => {
  const arranged = appointments.map(apt => ({ ...apt, column: 0, totalColumns: 1 }));
  
  for (let i = 0; i < arranged.length; i++) {
    const overlapping = [arranged[i]];
    
    for (let j = i + 1; j < arranged.length; j++) {
      if (checkAppointmentOverlap(arranged[i], arranged[j])) {
        overlapping.push(arranged[j]);
      }
    }
    
    if (overlapping.length > 1) {
      overlapping.forEach((apt, index) => {
        apt.column = index;
        apt.totalColumns = overlapping.length;
      });
    }
  }
  
  return arranged;
};