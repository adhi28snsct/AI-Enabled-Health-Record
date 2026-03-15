import React from "react";
import { Activity, Pill, FlaskConical, Brain } from "lucide-react";

const getIcon = (type) => {
    switch (type) {
        case "vitals": return <Activity className="w-5 h-5 text-blue-500" />;
        case "prescription": return <Pill className="w-5 h-5 text-green-500" />;
        case "labReport": return <FlaskConical className="w-5 h-5 text-purple-500" />;
        case "aiSummary": return <Brain className="w-5 h-5 text-indigo-500" />;
        default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
};

const PatientMedicalTimeline = ({ vitals, prescriptions, labs, aiSummaries }) => {

    // Flatten and normalize items
    const timelineItems = [
        ...(vitals ? [{
            id: vitals._id || 'vitals-1',
            type: "vitals",
            date: new Date(vitals.recorded_at),
            title: "Vitals Recorded",
            summary: `BP: ${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}, HR: ${vitals.heart_rate} bpm. ${vitals.symptoms || ''}`,
        }] : []),
        ...(prescriptions || []).map(p => ({
            id: p._id,
            type: "prescription",
            date: new Date(p.prescribed_at),
            title: "Prescription Added",
            summary: `${p.medication_name} - ${p.dosage} (${p.frequency}) for ${p.duration}`,
        })),
        ...(labs || []).map(l => ({
            id: l._id,
            type: "labReport",
            date: new Date(l.test_date),
            title: `Lab Report: ${l.test_name}`,
            summary: `Type: ${l.test_type}${l.notes ? ' - ' + l.notes : ''}`,
        })),
        // If aiSummaries is a single object, wrap it in array
        ...(Array.isArray(aiSummaries) ? aiSummaries : aiSummaries ? [aiSummaries] : []).map(ai => ({
            id: ai._id || 'ai-1',
            type: "aiSummary",
            date: new Date(ai.createdAt || ai.date || Date.now()),
            title: "AI Risk Assessment",
            summary: ai.summary || ai.analysis || "Risk assessment generated based on recent data.",
        }))
    ].sort((a, b) => b.date - a.date); // Sort descending (newest first)

    if (timelineItems.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
                No medical history found for this patient.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Patient Medical Timeline</h3>
            <div className="relative border-l-2 border-gray-200 ml-3">
                {timelineItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="mb-8 ml-6 relative">
                        <span className="absolute -left-[35px] top-1 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                            {getIcon(item.type)}
                        </span>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold text-gray-800">{item.title}</h4>
                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                                    {item.date.toLocaleDateString()} {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{item.summary}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PatientMedicalTimeline;
