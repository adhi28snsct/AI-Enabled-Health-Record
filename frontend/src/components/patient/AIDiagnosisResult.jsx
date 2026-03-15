import React from "react";
import { BrainCircuit, AlertTriangle, CheckCircle } from "lucide-react";

export default function AIDiagnosisResult({ summary }) {
    if (!summary) {
        return (
            <div className="text-center py-16 flex flex-col items-center justify-center opacity-70">
                <BrainCircuit className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-500">No Assessment Found</h3>
                <p className="text-gray-400">Please complete the AI Health Check questionnaire first.</p>
            </div>
        );
    }

    const { risk_level, prediction, timestamp } = summary;

    const isHighRisk = risk_level === "high" || risk_level === "critical";

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className={`p-6 rounded-xl border-l-4 shadow-sm flex items-start gap-4 ${isHighRisk ? "bg-red-50 border-red-500" : "bg-green-50 border-green-500"
                }`}>
                {isHighRisk ? (
                    <AlertTriangle className="w-8 h-8 text-red-500 mt-1" />
                ) : (
                    <CheckCircle className="w-8 h-8 text-green-500 mt-1" />
                )}

                <div className="flex-1">
                    <h2 className={`text-xl font-bold mb-1 ${isHighRisk ? "text-red-900" : "text-green-900"}`}>
                        AI Health Assessment
                    </h2>
                    <p className={`text-sm font-medium uppercase tracking-wider ${isHighRisk ? "text-red-700" : "text-green-700"}`}>
                        Risk Level: {risk_level || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Generated on: {timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-6 py-4 border-b">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-indigo-500" />
                        Diagnostic Findings
                    </h3>
                </div>
                <div className="p-6">
                    <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                        {prediction?.summary || "No specific findings available. Please consult your physician."}
                    </p>
                </div>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-6 py-4 border-b">
                    <h3 className="font-semibold text-gray-800">Recommendations & Preventive Advice</h3>
                </div>
                <div className="p-6">
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {prediction?.recommendations ? (
                            prediction.recommendations.map((rec, i) => <li key={i}>{rec}</li>)
                        ) : (
                            <>
                                <li>Maintain a balanced diet and regular exercise routine.</li>
                                <li>Monitor your vitals consistently.</li>
                                <li>Consult a physician if any immediate severe symptoms occur.</li>
                            </>
                        )}
                    </ul>
                </div>
            </div>

        </div>
    );
}
