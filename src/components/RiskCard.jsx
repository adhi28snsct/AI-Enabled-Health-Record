import { AlertTriangle } from 'lucide-react';

const RiskCard = ({ title, level, description, icon: Icon = AlertTriangle }) => {
  const levelStyles = {
    Low: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
    },
    Moderate: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-300',
    },
    High: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
    },
  };

  const { bg, text, border } = levelStyles[level] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
  };

  return (
    <div className={`rounded-xl p-6 shadow-sm border ${border} ${bg}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow">
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <span className={`text-sm font-medium ${text}`}>{level} Risk</span>
        </div>
      </div>
      <p className="text-sm text-gray-700">{description}</p>
    </div>
  );
};

export default RiskCard;