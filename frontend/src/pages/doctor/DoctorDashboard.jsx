import React, { useState, useEffect } from "react";
import {
  Activity,
  Users,
  Calendar,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

/* ================= API ================= */
import {
  getDoctorProfile,
  getMyAppointments,
  getMyPatients,
  updateDoctorProfile,
} from "../../api/doctor";

import DoctorProfileModal from "../../components/doctor-components/DoctorProfileModal";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  /* ================= LOAD DATA ================= */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [profileRes, apptsRes, patientsRes] = await Promise.all([
        getDoctorProfile().catch(() => null),
        getMyAppointments().catch(() => ({ data: { data: [] } })),
        getMyPatients().catch(() => ({ data: { data: [] } })),
      ]);

      if (profileRes) {
        const profile = profileRes.data?.data;
        setDoctorProfile(profile);

        // 🔥 Auto-open modal if profile incomplete
        if (!profile?.isProfileComplete) {
          setShowProfileModal(true);
        }
      }

      setAppointments(apptsRes.data?.data || []);
      setPatients(patientsRes.data?.data || []);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /* ================= PROFILE SAVE ================= */
  const handleProfileSave = async (formData) => {
    try {
      setSavingProfile(true);

      await updateDoctorProfile(formData);

      toast.success("Profile updated successfully");

      setShowProfileModal(false);

      await fetchDashboardData();
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  /* ================= CALCULATIONS ================= */
  const today = new Date().toDateString();

  const todaysAppointments = appointments.filter((a) => {
    const d = new Date(a.requested_at || a.scheduled_at).toDateString();
    return d === today && a.status !== "cancelled";
  });

  const highRiskPatients = patients
    .filter((p) => p.risk_level === "high" || p.risk_level === "critical")
    .slice(0, 5);

  if (loading)
    return (
      <div className="p-6 text-gray-500">
        Loading Doctor Dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />

      {/* ================= HEADER ================= */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-600 w-6 h-6" />
            <h1 className="text-xl font-bold text-gray-800">
              Doctor Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-600">
              Dr. {doctorProfile?.name || "Loading..."}
            </div>

            <button
              onClick={() => setShowProfileModal(true)}
              className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="Today's Appointments"
            value={todaysAppointments.length}
            color="blue"
          />

          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Total Patients"
            value={patients.length}
            color="green"
          />

          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            label="Pending Approvals"
            value={appointments.filter((a) => a.status === "pending").length}
            color="orange"
          />

          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="High Risk Patients"
            value={highRiskPatients.length}
            color="red"
          />
        </div>
      </main>

      {/* ================= PROFILE MODAL ================= */}
      {showProfileModal && doctorProfile && (
        <DoctorProfileModal
          doctor={doctorProfile}
          onClose={() => setShowProfileModal(false)}
          onSave={handleProfileSave}
          saving={savingProfile}
        />
      )}
    </div>
  );
}

/* ================= REUSABLE STAT CARD ================= */

function StatCard({ icon, label, value, color }) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );
}