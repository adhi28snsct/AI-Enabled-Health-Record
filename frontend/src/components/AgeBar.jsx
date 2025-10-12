const AgeBar = ({ ageGroup, count, total }) => {
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-sm font-medium text-gray-700">{ageGroup}</div>
      <div className="flex-1">
        <div className="relative h-8 bg-gray-100 rounded overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-end pr-3"
            style={{ width: `${(count / total) * 100}%` }}
          >
            <span className="text-xs font-semibold text-white">{count}</span>
          </div>
        </div>
      </div>
      <div className="w-16 text-sm text-gray-600 text-right">
        {((count / total) * 100).toFixed(1)}%
      </div>
    </div>
  );
};

export default AgeBar;