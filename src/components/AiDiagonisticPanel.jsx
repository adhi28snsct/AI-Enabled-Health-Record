const AIDiagnosticPanel = ({ diagnostics, getRiskColor }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Diagnostic Suggestions</h3>
      <div className="space-y-3">
        {[
          { label: 'Hypertension', value: diagnostics.hypertension_risk, color: 'red' },
          { label: 'Diabetes', value: diagnostics.diabetes_risk, color: 'yellow' },
          { label: 'Cardiac Risk', value: diagnostics.cardiac_risk, color: 'blue' },
          { label: 'Anemia', value: diagnostics.anemia_risk, color: 'green' },
        ].map((risk) => (
          <div key={risk.label} className={`flex justify-between p-3 bg-gradient-to-r from-${risk.color}-50 to-${risk.color}-100 rounded-lg`}>
            <span className="text-sm font-medium text-gray-900">{risk.label}</span>
            <span className={`text-lg font-bold ${getRiskColor(risk.value)}`}>{risk.value}%</span>
          </div>
        ))}
      </div>
    </div>
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Clinical Suggestions</h4>
      <ul className="space-y-2">
        {diagnostics.suggestions.map((s, i) => (
          <li key={i} className="text-sm text-gray-700 p-2 bg-blue-50 rounded">{s}</li>
        ))}
      </ul>
    </div>
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Recommended Tests</h4>
      <div className="space-y-2">
        {diagnostics.recommended_tests.map((test, i) => (
          <div key={i} className="p-2 bg-purple-50 rounded text-sm text-gray-900">{test}</div>
        ))}
      </div>
    </div>
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-xs text-gray-600 italic">
        AI analysis based on patient vitals, medical history, and current symptoms. Always use clinical judgment.
      </p>
    </div>
  </div>
);

export default AIDiagnosticPanel;