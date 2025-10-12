import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtext, delta }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 border-${color}-600`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-8 h-8 text-${color}-600`} />
        <TrendingUp className={`w-5 h-5 text-${color}-600`} />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtext && <div className={`text-xs text-${color}-600 mt-2`}>{subtext}</div>}
      {delta && <div className="text-xs text-gray-500 mt-1">{delta}</div>}
    </div>
  );
};

export default StatCard;