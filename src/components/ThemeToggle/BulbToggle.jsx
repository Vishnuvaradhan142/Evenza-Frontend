import React, { useEffect, useState } from 'react';
import './BulbToggle.css';

const BulbToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="bulb-wrapper" onClick={toggleTheme}>
      <div className={`bulb ${theme}`}>
        <div className="glow"></div>
        <div className="filament"></div>
        <div className="base"></div>
      </div>
      <div className="cord"></div>
    </div>
  );
};

export default BulbToggle;