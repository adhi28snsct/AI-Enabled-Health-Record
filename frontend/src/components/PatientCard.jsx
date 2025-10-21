import { AlertCircle } from 'lucide-react';

const PatientCard = ({ patient, isSelected, onSelect, getRiskBadge }) => {
  const age = patient?.dob
    ? `${new Date().getFullYear() - new Date(patient.dob).getFullYear()}y`
    : 'Age N/A';

  const lastVisit = patient?.last_visit
    ? new Date(patient.last_visit).toLocaleDateString()
    : 'N/A';

  const showAlert = ['high', 'critical'].includes(patient?.risk_level);

  return (
    <button
      onClick={() => onSelect(patient._id)}
      className={`w-full p-4 text-left rounded-md transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'
      }`}
      role="button"
      aria-pressed={isSelected}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900">
          {patient?.name || 'Unnamed'}
        </h3>
        {showAlert && <AlertCircle className="w-5 h-5 text-red-600" />}
      </div>

      {/* Info Row */}
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${getRiskBadge(
            patient?.risk_level
          )}`}
        >
          {patient?.risk_level || 'Unknown'}
        </span>
        <span className="text-xs text-gray-500 capitalize">
          {patient?.gender || 'N/A'}
        </span>
        <span className="text-xs text-gray-500">{age}</span>
      </div>

      {/* Last Visit */}
      <p className="text-xs text-gray-500">Last visit: {lastVisit}</p>
    </button>
  );
};

export default PatientCard;