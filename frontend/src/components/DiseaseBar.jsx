const DiseaseBar = ({ name, value, color }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{name}</span>
        <span className={`text-sm font-semibold text-${color}-600`}>{value}%</span>
      </div>
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-full`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

export default DiseaseBar;