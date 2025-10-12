const TrendBar = ({ month, patients, visits, total }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{month}</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-600 font-medium">{patients} patients</span>
          <span className="text-sm text-green-600 font-medium">{visits} visits</span>
        </div>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
          style={{ width: `${(patients / total) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default TrendBar;