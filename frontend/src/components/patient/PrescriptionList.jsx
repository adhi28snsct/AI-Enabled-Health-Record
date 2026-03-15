import React from "react";
import { Pill } from "lucide-react";

export default function PrescriptionList({ prescriptions }) {
    if (!prescriptions || prescriptions.length === 0) {
        return <p className="text-gray-500 text-center py-10 border border-dashed rounded-lg">No prescriptions recorded.</p>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Pill className="w-5 h-5 text-blue-500" /> Prescription History
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prescriptions.map(p => (
                    <div key={p._id} className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{p.medication_name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{new Date(p.prescribed_at).toLocaleDateString()}</p>

                        <div className="space-y-2 text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                            <p><span className="font-semibold">Dosage:</span> {p.dosage}</p>
                            <p><span className="font-semibold">Frequency:</span> {p.frequency}</p>
                            <p><span className="font-semibold">Duration:</span> {p.duration}</p>
                        </div>

                        {p.notes && (
                            <p className="mt-3 text-sm italic text-gray-600 border-l-2 border-blue-400 pl-2">
                                " {p.notes} "
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
