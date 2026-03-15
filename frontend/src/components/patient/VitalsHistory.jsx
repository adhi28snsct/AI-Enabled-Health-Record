import React from "react";
import { Activity } from "lucide-react";

export default function VitalsHistory({ vitals }) {
    if (!vitals || vitals.length === 0) {
        return <p className="text-gray-500 text-center py-10 border border-dashed rounded-lg">No vitals history recorded.</p>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-blue-500" /> Vitals History
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Date</th>
                            <th className="px-6 py-3 font-semibold">BP (SYS/DIA)</th>
                            <th className="px-6 py-3 font-semibold">Heart Rate</th>
                            <th className="px-6 py-3 font-semibold">Temp (°F)</th>
                            <th className="px-6 py-3 font-semibold">SpO2 (%)</th>
                            <th className="px-6 py-3 font-semibold">Weight/Height</th>
                            <th className="px-6 py-3 font-semibold">Symptoms</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vitals.map(v => (
                            <tr key={v._id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 border-r">{new Date(v.recorded_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 border-r">{v.blood_pressure_systolic}/{v.blood_pressure_diastolic}</td>
                                <td className="px-6 py-4 border-r">{v.heart_rate} bpm</td>
                                <td className="px-6 py-4 border-r">{v.temperature}</td>
                                <td className="px-6 py-4 border-r">{v.oxygen_saturation}</td>
                                <td className="px-6 py-4 border-r">{v.weight ? `${v.weight}kg` : '-'} / {v.height ? `${v.height}cm` : '-'}</td>
                                <td className="px-6 py-4 italic">{v.symptoms || "None reported"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
