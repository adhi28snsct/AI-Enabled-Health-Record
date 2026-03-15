import React from "react";
import { Activity, Pill, FileText, BrainCircuit, Calendar } from "lucide-react";

export default function MedicalTimeline({ vitals, prescriptions, labs, aiSummaries }) {

    // Aggregate all events
    const events = [];

    vitals?.forEach(v => {
        events.push({
            id: v._id,
            date: new Date(v.recorded_at),
            type: "vitals",
            title: "Vitals Recorded",
            icon: <Activity className="w-5 h-5 text-blue-500" />,
            color: "border-blue-500"
        });
    });

    prescriptions?.forEach(p => {
        events.push({
            id: p._id,
            date: new Date(p.prescribed_at),
            type: "prescription",
            title: `Prescription: ${p.medication_name}`,
            icon: <Pill className="w-5 h-5 text-green-500" />,
            color: "border-green-500"
        });
    });

    labs?.forEach(l => {
        events.push({
            id: l._id,
            date: new Date(l.test_date),
            type: "lab",
            title: `Lab Report: ${l.test_name}`,
            icon: <FileText className="w-5 h-5 text-purple-500" />,
            color: "border-purple-500"
        });
    });

    if (aiSummaries && aiSummaries.timestamp) {
        events.push({
            id: aiSummaries._id,
            date: new Date(aiSummaries.timestamp),
            type: "ai",
            title: "AI Risk Assessment Generated",
            icon: <BrainCircuit className="w-5 h-5 text-indigo-500" />,
            color: "border-indigo-500"
        });
    }

    if (events.length === 0) {
        return <div className="text-center py-10 text-gray-500 border border-dashed rounded-lg">No unified timeline history available.</div>;
    }

    events.sort((a, b) => b.date - a.date);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-gray-500" /> Chronological Journey
            </h2>

            <div className="relative border-l ml-6 border-gray-200 space-y-8 pl-8">
                {events.map((evt, idx) => (
                    <div key={`${evt.id}-${idx}`} className="relative">
                        {/* Context Node */}
                        <span className="absolute -left-[45px] top-1.5 flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded-full shadow-sm">
                            {evt.icon}
                        </span>

                        <div className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${evt.color}`}>
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="font-bold text-gray-900">{evt.title}</h4>
                                <span className="text-xs text-gray-500 font-medium">{evt.date.toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-gray-600 capitalize">Category: {evt.type}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
