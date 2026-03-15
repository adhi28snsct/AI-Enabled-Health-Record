import React, { useEffect, useState } from "react";
import { FolderHeart } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
    getMyVitals,
    getMyPrescriptions,
    getMyLabReports,
    getMyAISummary
} from "../../api/patient";

import VitalsHistory from "../../components/patient/VitalsHistory";
import PrescriptionList from "../../components/patient/PrescriptionList";
import LabReportViewer from "../../components/patient/LabReportViewer";
import MedicalTimeline from "../../components/patient/MedicalTimeline";
import AIDiagnosisResult from "../../components/patient/AIDiagnosisResult";

export default function PatientRecords() {
    const [activeTab, setActiveTab] = useState("timeline");
    const [loading, setLoading] = useState(true);

    const [vitals, setVitals] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [labReports, setLabReports] = useState([]);
    const [aiSummary, setAiSummary] = useState(null);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                setLoading(true);
                const [vitalsRes, presRes, labRes, aiRes] = await Promise.all([
                    getMyVitals().catch(() => ({ data: [] })),
                    getMyPrescriptions().catch(() => ({ data: [] })),
                    getMyLabReports().catch(() => ({ data: [] })),
                    getMyAISummary().catch(() => ({ data: null }))
                ]);

                setVitals(vitalsRes.data || []);
                setPrescriptions(presRes.data || []);
                setLabReports(labRes.data || []);
                setAiSummary(aiRes.data || null);

            } catch (err) {
                toast.error("Failed to load medical records");
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, []);

    const tabs = [
        { id: "timeline", label: "Medical Timeline" },
        { id: "vitals", label: "Vitals History" },
        { id: "prescriptions", label: "Prescriptions" },
        { id: "labs", label: "Lab Reports" },
        { id: "ai", label: "AI Diagnosis" }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <ToastContainer />
            <header className="bg-white border-b shadow-sm sticky top-0 z-30 px-6 py-4 flex gap-3 items-center">
                <FolderHeart className="text-blue-600 w-6 h-6" />
                <h1 className="text-xl font-bold flex-1">My Medical Records</h1>
            </header>

            <main className="flex-1 p-6 max-w-6xl mx-auto w-full flex flex-col gap-6">

                {/* TABS COMPONENT */}
                <div className="bg-white rounded-xl shadow border p-2 flex overflow-x-auto gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 font-medium rounded-lg text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                                    ? "bg-blue-100 text-blue-700"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* CONTENT RENDERER */}
                <div className="bg-white rounded-xl shadow border p-6 min-h-[500px]">
                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Loading your medical history...</div>
                    ) : (
                        <>
                            {activeTab === "timeline" && (
                                <MedicalTimeline
                                    vitals={vitals}
                                    prescriptions={prescriptions}
                                    labs={labReports}
                                    aiSummaries={aiSummary}
                                />
                            )}
                            {activeTab === "vitals" && <VitalsHistory vitals={vitals} />}
                            {activeTab === "prescriptions" && <PrescriptionList prescriptions={prescriptions} />}
                            {activeTab === "labs" && <LabReportViewer labs={labReports} />}
                            {activeTab === "ai" && <AIDiagnosisResult summary={aiSummary} />}
                        </>
                    )}
                </div>

            </main>
        </div>
    );
}
