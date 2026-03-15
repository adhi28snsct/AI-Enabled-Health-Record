import React from "react";
import { FileText, Download } from "lucide-react";
import { toast } from "react-toastify";

export default function LabReportViewer({ labs }) {
    if (!labs || labs.length === 0) {
        return <p className="text-gray-500 text-center py-10 border border-dashed rounded-lg">No lab reports found.</p>;
    }

    const handleDownload = () => {
        // In a real application, this would trigger an actual file download
        toast.info("Downloading report...");
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-purple-500" /> Lab Reports
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Test Name</th>
                            <th className="px-6 py-3 font-semibold">Type</th>
                            <th className="px-6 py-3 font-semibold">Doctor</th>
                            <th className="px-6 py-3 font-semibold">Date</th>
                            <th className="px-6 py-3 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {labs.map(lab => (
                            <tr key={lab._id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-bold text-gray-900 border-r">{lab.test_name}</td>
                                <td className="px-6 py-4 border-r capitalize">{lab.test_type}</td>
                                <td className="px-6 py-4 border-r">Dr. {lab.doctor?.name || "Unknown"}</td>
                                <td className="px-6 py-4 border-r">{new Date(lab.test_date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={handleDownload}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-xs font-medium"
                                    >
                                        <Download className="w-4 h-4" /> Download
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
