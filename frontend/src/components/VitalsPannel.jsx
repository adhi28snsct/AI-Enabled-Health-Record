const VitalsPanel = ({ vitals }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Vitals</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Blood Pressure', value: `${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}`, unit: 'mmHg' },
        { label: 'Heart Rate', value: vitals.heart_rate, unit: 'BPM' },
        { label: 'Temperature', value: vitals.temperature, unit: 'ºF' },
        { label: 'SpO₂', value: `${vitals.oxygen_saturation}%`, unit: 'Oxygen' },
      ].map((v, i) => (
        <div key={i} className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600 mb-1">{v.label}</div>
          <div className="text-xl font-semibold text-gray-900">{v.value}</div>
          <div className="text-xs text-gray-500">{v.unit}</div>
        </div>
      ))}
    </div>
    {vitals.symptoms && (
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <p className="text-sm font-medium text-gray-900 mb-1">Symptoms:</p>
        <p className="text-sm text-gray-700">{vitals.symptoms}</p>
      </div>
    )}
  </div>
);

export default VitalsPanel;