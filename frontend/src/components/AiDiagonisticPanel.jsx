import React from 'react';

const AIDiagnosticPanel = ({ diagnostics, getRiskColor }) => {
  const risks = [
    { label: 'Hypertension', value: diagnostics?.hypertension_risk, color: 'red' },
    { label: 'Diabetes', value: diagnostics?.diabetes_risk, color: 'yellow' },
    { label: 'Cardiac Risk', value: diagnostics?.cardiac_risk, color: 'blue' },
    { label: 'Anemia', value: diagnostics?.anemia_risk, color: 'green' },
  ];

  const gradientMap = {
    red: 'from-red-50 to-red-100',
    yellow: 'from-yellow-50 to-yellow-100',
    blue: 'from-blue-50 to-blue-100',
    green: 'from-green-50 to-green-100',
  };

  return (
    <div className="space-y-6">
      {/* Diagnostic Risks */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Diagnostic Suggestions</h3>
        <div className="space-y-3">
          {risks.map((risk) => (
            <div
              key={risk.label}
              className={`flex justify-between items-center p-3 rounded-lg bg-gradient-to-r ${gradientMap[risk.color]}`}
              role="region"
              aria-label={`${risk.label} risk`}
            >
              <span className="text-sm font-medium text-gray-900">{risk.label}</span>
              <span className={`text-lg font-bold ${getRiskColor(risk.value)}`}>
                {risk.value !== undefined ? `${risk.value}%` : 'N/A'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Clinical Suggestions */}
      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Clinical Suggestions</h4>
        <ul className="space-y-2">
          {diagnostics?.suggestions?.length > 0 ? (
            diagnostics.suggestions.map((s, i) => (
              <li key={i} className="text-sm text-gray-700 p-2 bg-blue-50 rounded">
                {s}
              </li>
            ))
          ) : (
            <p className="text-xs text-gray-500">No clinical suggestions available.</p>
          )}
        </ul>
      </section>

      {/* Recommended Tests */}
      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Recommended Tests</h4>
        <div className="space-y-2">
          {diagnostics?.recommended_tests?.length > 0 ? (
            diagnostics.recommended_tests.map((test, i) => (
              <div key={i} className="p-2 bg-purple-50 rounded text-sm text-gray-900">
                {test}
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500">No tests recommended at this time.</p>
          )}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 italic">
          AI analysis based on patient vitals, medical history, and current symptoms. Always use clinical judgment.
        </p>
      </section>
    </div>
  );
};

export default AIDiagnosticPanel;