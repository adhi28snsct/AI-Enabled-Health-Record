import React from 'react';
import clsx from 'clsx';

const DiseaseBar = ({ name, value = 0, color = 'blue' }) => {
  const percentage = Math.min(Math.max(value, 0), 100); // Clamp between 0–100

  const textColor = {
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
  }[color] || 'text-blue-600';

  const gradientColor = {
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
  }[color] || 'from-blue-500 to-blue-600';

  return (
    <div className="w-full" role="progressbar" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100">
      {/* Label and Value */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{name}</span>
        <span className={clsx('text-sm font-semibold', textColor)}>{percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={clsx('absolute top-0 left-0 h-full rounded-full bg-gradient-to-r', gradientColor)}
          style={{ width: `${percentage}%`, transition: 'width 0.5s ease-in-out' }}
          title={`${percentage}% risk`}
        />
      </div>
    </div>
  );
};

export default DiseaseBar;