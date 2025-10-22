import { Pencil } from 'lucide-react'; // 💡 Import the Pencil icon

// 💡 Accept the new handler prop: onEditVitals
const VitalsPanel = ({ vitals, onAddVitals, onEditVitals }) => { 
  const hasVitals = !!vitals;

 const vitalsData = [
  {
    label: 'Blood Pressure',
    value:
      vitals?.blood_pressure_systolic && vitals?.blood_pressure_diastolic
        ? `${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}`
        : 'N/A',
    unit: 'mmHg',
  },
  {
    label: 'Heart Rate',
    value: vitals?.heart_rate ?? 'N/A',
    unit: 'BPM',
  },
  {
    label: 'Temperature',
    value: vitals?.temperature ?? 'N/A',
    unit: 'ºF',
  },
  {
    label: 'Respiration Rate',
    value: vitals?.respiration_rate ?? 'N/A',
    unit: 'breaths/min',
  },
  {
    label: 'SpO₂',
    value:
      vitals?.oxygen_saturation !== undefined
        ? `${vitals.oxygen_saturation}%`
        : 'N/A',
    unit: 'Oxygen',
  },
];
  return (
    <div className="bg-white rounded-lg shadow-sm p-6" role="region" aria-label="Vitals Panel">
        
        {/* 💡 FIX: Container to hold the title and the edit button */}
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Latest Vitals</h3>

            {/* 💡 THE EDIT BUTTON: Only visible if vitals exist AND the edit handler is passed */}
            {hasVitals && onEditVitals && (
                <button
                    onClick={() => onEditVitals(vitals)} // Calls handler, passing the latest data object
                    className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                >
                    <Pencil className="w-4 h-4" /> 
                    Edit Last Entry
                </button>
            )}
        </div>

      {hasVitals ? (
        <>
          {/* Vitals Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {vitalsData.map((v, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 mb-1">{v.label}</div>
                <div className="text-xl font-semibold text-gray-900">{v.value}</div>
                <div className="text-xs text-gray-500">{v.unit}</div>
              </div>
            ))}
          </div>

          {/* Symptoms */}
          {vitals?.symptoms && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-1">Symptoms:</p>
              <p className="text-sm text-gray-700">{vitals.symptoms}</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-sm text-gray-500">
          No vitals data available for this patient.
          {onAddVitals && (
            <button
              onClick={onAddVitals}
              className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              + Add Vitals
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VitalsPanel;