'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import '../app/modeToggle.css';

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isChecked, setIsChecked] = useState(false);

  // Initialize toggle based on current theme
  useEffect(() => {
    setIsChecked(resolvedTheme === 'light');
  }, [resolvedTheme]);

  const handleToggle = () => {
    setIsChecked(prev => {
      const newVal = !prev;

      // Allow transition before applying theme
      setTimeout(() => {
        setTheme(newVal ? 'light' : 'dark');
      }, 10); // Adjust this duration to match your CSS transition duration

      return newVal;
    });
  };

  return (
    <div className="">
      <div className="container">
        <div className="switch">
          <label htmlFor="toggle">
            <input
              id="toggle"
              className="toggle-switch"
              type="checkbox"
              checked={isChecked}
              onChange={handleToggle}
            />
            <div className="sun-moon">
              <div className="dots"></div>
            </div>
            <div className="background">
              <div className="stars1"></div>
              <div className="stars2"></div>
            </div>
            <div className="fill"></div>
            <span className="sr-only">Toggle theme</span>
          </label>
        </div>
      </div>
    </div>
  );
}
