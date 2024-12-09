'use client';

import React, { useState, useEffect } from 'react';

const colors: { rgb: string; name: string }[] = [
  { rgb: '39, 252, 174', name: 'Green' },
  { rgb: '255, 92, 0', name: 'Orange' },
  { rgb: '252, 33, 138', name: 'Reflect pink' },
  { rgb: '252, 33, 113', name: 'Pink 2' },
  { rgb: '252, 33, 179', name: 'Pink 3' },
  { rgb: '39, 252, 220', name: 'Green 2' },
];

const ColorTester: React.FC = () => {
  const [currentColorIndex, setCurrentColorIndex] = useState<number>(0);

  useEffect(() => {
    // Update the CSS variable
    const currentColor = colors[currentColorIndex].rgb;
    document.documentElement.style.setProperty('--primary-highlight', `rgb(${currentColor})`);
  }, [currentColorIndex]);

  const handleColorChange = (): void => {
    const nextIndex = (currentColorIndex + 1) % colors.length;
    setCurrentColorIndex(nextIndex);
  };

  const currentColor = colors[currentColorIndex];

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'black',
        border: '1px solid lightgray',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 1000,
        cursor: 'pointer',
        color: 'white',
      }}
      onClick={handleColorChange}
    >
      <p style={{ margin: 0, fontSize: '12px' }}>Click to Change Highlight</p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: '5px',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            backgroundColor: `rgb(${currentColor.rgb})`,
            borderRadius: '50%',
            border: '1px solid white',
            marginRight: '10px',
          }}
        />
        <span style={{ fontSize: '14px' }}>{currentColor.name}</span>
      </div>
    </div>
  );
};

export default ColorTester;