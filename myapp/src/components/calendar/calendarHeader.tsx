import React from 'react';
import { Plus, Calendar, Users } from 'lucide-react';

interface CalendarHeaderProps {
  onAddAppointment: () => void;
  totalAppointments: number;
  totalUsers: number;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  onAddAppointment,
  totalAppointments,
  totalUsers
}) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar size={28} />
              Multi-User Calendar
            </h1>
            <p className="text-blue-100 mt-1">{today}</p>
          </div>
          
          <div className="hidden md:flex items-center gap-6 ml-8">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalAppointments}</div>
              <div className="text-xs text-blue-200">Appointments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold flex items-center gap-1">
                <Users size={20} />
                {totalUsers}
              </div>
              <div className="text-xs text-blue-200">Users</div>
            </div>
          </div>
        </div>

        <button
          onClick={onAddAppointment}
          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Plus size={18} />
          Add Appointment
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;