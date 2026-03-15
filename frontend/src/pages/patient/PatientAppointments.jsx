import React, { useEffect, useState } from "react";
import { Calendar, User } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getMyAppointments } from "../../api/patient";

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAppointments()
      .then(res => {
        console.log("Appointments response:", res.data); // DEBUG
        setAppointments(res.data || []);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch appointments");
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Pending</span>;
      case "confirmed":
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Confirmed</span>;
      case "completed":
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Completed</span>;
      case "cancelled":
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Cancelled</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ToastContainer />

      <header className="bg-white border-b shadow-sm sticky top-0 z-30 px-6 py-4 flex gap-3 items-center">
        <Calendar className="text-blue-600 w-6 h-6" />
        <h1 className="text-xl font-bold flex-1">My Appointments</h1>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow border overflow-hidden">

          {loading ? (
            <div className="text-center p-10 text-gray-500">
              Loading your schedule...
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center p-10 text-gray-500">
              No appointments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Doctor</th>
                    <th className="px-6 py-4 font-semibold">Hospital</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Time</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => {
                    const dt = new Date(
                      appt.requested_at ||
                      appt.start_at ||
                      appt.scheduled_at ||
                      appt.createdAt
                    );

                    return (
                      <tr key={appt._id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900 border-r flex items-center gap-2 text-nowrap">
                          <User className="w-4 h-4 text-blue-500" />
                          Dr. {appt.doctor?.name || "Unknown"}
                        </td>

                        <td className="px-6 py-4 border-r">
                          {appt.hospital?.name || "Independent"}
                        </td>

                        <td className="px-6 py-4 border-r">
                          {dt.toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4 border-r">
                          {dt.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>

                        <td className="px-6 py-4">
                          {getStatusBadge(appt.status)}
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