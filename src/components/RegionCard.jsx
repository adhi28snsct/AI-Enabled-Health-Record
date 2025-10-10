const RegionCard = ({ region, patients, highRisk, total }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{region}</h4>
        <span className="text-sm text-red-600 font-medium">{highRisk} high risk</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{patients} patients</span>
        <span className="text-xs text-gray-500">
          {((highRisk / patients) * 100).toFixed(1)}% high risk
        </span>
      </div>
      <div className="mt-2 relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-green-600 rounded-full"
          style={{ width: `${(patients / total) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default RegionCard;