import React from 'react';
import { Clock } from 'lucide-react';
import { TIME_SLOTS } from '../../utils/calendar';

const TimeColumn: React.FC = () => {
  return (
    <div className="w-20 bg-gray-100 border-r border-gray-300 flex-shrink-0">
      {/* Header */}
      <div className="h-16 border-b border-gray-300 flex items-center justify-center bg-gray-200 sticky top-0 z-20">
        <div className="text-center">
          <Clock size={16} className="text-gray-600 mx-auto mb-1" />
          <div className="text-xs font-medium text-gray-600">Time</div>
        </div>
      </div>

      {/* Time Slots */}
      <div className="relative">
        {TIME_SLOTS.map((time, index) => (
          <div
            key={time}
            className={`h-7.5 border-b ${index % 2 === 0 ? 'border-gray-300' : 'border-gray-200'} flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors`}
            style={{ height: '30px' }}
          >
            {index % 2 === 0 && (
              <div className="text-xs text-gray-600 font-medium">
                {time}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeColumn;