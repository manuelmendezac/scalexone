import React from 'react';
import Draggable from 'react-draggable';

interface DraggableProgressCircleProps {
  progress: number;
  children?: React.ReactNode;
}

const DraggableProgressCircle: React.FC<DraggableProgressCircleProps> = ({ progress, children }) => {
  const size = 80;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <Draggable>
      <div 
        className="fixed bottom-10 right-10 z-50 cursor-move"
        style={{ width: size, height: size }}
      >
        {children}
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            className="text-gray-700"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={center}
            cy={center}
          />
          <circle
            className="text-yellow-400"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={center}
            cy={center}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white">
            {`${Math.round(progress)}%`}
          </span>
        </div>
      </div>
    </Draggable>
  );
};

export default DraggableProgressCircle; 