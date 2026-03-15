import React, { useEffect, useState } from "react";
import { Users, ExternalLink } from "lucide-react";
import { getMyPatients } from "../../api/doctor";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyPatients()
      .then((res) => setPatients(res.data.data))
      .catch(() => toast.error("Failed to load patients"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Loading patients...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ToastContainer />
      <header className="bg-white border-b shadow-sm sticky top-0 z-40 px-6 py-4 flex items-center gap-3">
        <Users className="text-blue-600 w-6 h-6" />
        <h1 className="text-xl font-bold">Assigned Patients</h1>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow border p-6">
          {patients.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              No patients assigned yet. Accept appointments to view patients here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Patient Name</th>
                    <th className="px-6 py-4 font-semibold">Age</th>
                    <th className="px-6 py-4 font-semibold">Gender</th>
                    <th className="px-6 py-4 font-semibold">Last Visit</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => {
                    const age = patient?.dob ? `${new Date().getFullYear() - new Date(patient.dob).getFullYear()} yrs` : "N/A";
                    const lastVisit = patient?.last_visit ? new Date(patient.last_visit).toLocaleDateString() : "No history";

                    return (
                      <tr key={patient._id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900 border-r">{patient.name || "Unknown"}</td>
                        <td className="px-6 py-4 border-r">{age}</td>
                        <td className="px-6 py-4 border-r capitalize">{patient.gender || "N/A"}</td>
                        <td className="px-6 py-4 border-r">{lastVisit}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigate(`/doctor/patients/${patient._id}`)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                          >
                            Open Profile <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}