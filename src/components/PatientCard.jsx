import { AlertCircle } from 'lucide-react';

const PatientCard = ({ patient, isSelected, onSelect, getRiskBadge }) => (
  <button
    onClick={() => onSelect(patient.id)}
    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
      isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
    }`}
  >
    <div className="flex items-start justify-between mb-2">
      <h3 className="font-semibold text-gray-900">{patient.full_name}</h3>
      {(patient.risk_level === 'high' || patient.risk_level === 'critical') && (
        <AlertCircle className="w-5 h-5 text-red-600" />
      )}
    </div>
    <div className="flex items-center gap-2 mb-1">
      <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskBadge(patient.risk_level)}`}>
        {patient.risk_level}
      </span>
      <span className="text-xs text-gray-500 capitalize">{patient.gender}</span>
      <span className="text-xs text-gray-500">
        {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()}y
      </span>
    </div>
    <p className="text-xs text-gray-500">Last visit: {new Date(patient.last_visit).toLocaleDateString()}</p>
  </button>
);

export default PatientCard;