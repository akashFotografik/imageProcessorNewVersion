// components/UserColumn.tsx
import React from 'react';
import { User } from '../../types/calendar';

interface UserColumnProps {
  user: User;
  width: number;
}

export const UserColumn: React.FC<UserColumnProps> = ({ user, width }) => {
  return (
    <div 
      className="bg-gray-50 border-r border-gray-200 p-3 text-center sticky top-0 z-10"
      style={{ width: `${width}px` }}
    >
      <div className="flex flex-col items-center space-y-2">
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="font-medium text-sm text-gray-700">{user.name}</span>
      </div>
    </div>
  );
};