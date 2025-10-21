import React from 'react';

const AgeBar = ({ ageGroup, count, total, color = 'blue' }) => {
  const percentage = ((count / total) * 100).toFixed(1);
  const barColor = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
  }[color] || 'from-blue-500 to-blue-600';

  return (
    <div className="flex items-center gap-4" role="progressbar" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100">
      {/* Label */}
      <div className="w-24 text-sm font-medium text-gray-700">{ageGroup}</div>

      {/* Bar */}
      <div className="flex-1">
        <div className="relative h-8 bg-gray-100 rounded overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${barColor} flex items-center justify-end pr-3 transition-all duration-500 ease-in-out`}
            style={{ width: `${percentage}%` }}
            title={`${count} out of ${total} patients`}
          >
            <span className="text-xs font-semibold text-white">{count}</span>
          </div>
        </div>
      </div>

      {/* Percentage */}
      <div className="w-16 text-sm text-gray-600 text-right">{percentage}%</div>
    </div>
  );
};

export default AgeBar;