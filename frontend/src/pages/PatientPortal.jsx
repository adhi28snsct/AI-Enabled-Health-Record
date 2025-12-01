import { useState, useEffect } from "react";
import { Menu, X, Heart, FileText, User, Activity, AlertCircle, Calendar, Pill, FlaskConical } from "lucide-react";
import { api, setAuthToken } from "../api/api";
import AppointmentBooker from "../components/AppointmentBooker";

export default function PatientPortal() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [aiSummary, setAiSummary] = useState({});

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (token) setAuthToken(token);

    const fetchData = async () => {
      try {
        const [
          userRes,
          recordsRes,
          prescriptionsRes,
          labReportsRes,
          alertsRes,
          aiRes,
        ] = await Promise.all([
          api.get(`/patients/${userId}`),
          api.get(`/patients/${userId}/records`),
          api.get(`/patients/${userId}/prescriptions`),
          api.get(`/patients/${userId}/lab-reports`),
          api.get(`/patients/${userId}/alerts`),
          api.get(`/patients/${userId}/ai-summary`),
        ]);

        setUser(userRes.data);
        setFormData(userRes.data);
        setRecords(recordsRes.data);
        setPrescriptions(prescriptionsRes.data);
        setLabReports(labReportsRes.data);
        setAlerts(alertsRes.data);
        setAiSummary(aiRes.data || {});
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [token, userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const res = await api.patch(`/patients/${userId}`, formData);
      setUser(res.data);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };
  // Inside the PatientPortal function, before the main return:
const calculateOverallRisk = (aiSummary) => {
    // 1. Get all calculated risk percentages (excluding nulls or zeros)
    const risks = [
        aiSummary?.diabetes_risk, 
        aiSummary?.hypertension_risk, 
        aiSummary?.anemia_risk, 
        aiSummary?.cardiac_risk
    ].filter(r => r > 0);

    if (risks.length === 0) return 'low'; // Default if no scores are available

    // 2. Find the highest risk percentage
    const maxRisk = Math.max(...risks);
    
    // 3. Map the highest percentage to a categorical level (for the badge color/triage)
    if (maxRisk >= 70) return "critical"; 
    if (maxRisk >= 50) return "high";
    if (maxRisk >= 30) return "moderate";
    return "low";
};

// ... (Your existing utility functions: getRiskColor, getRiskBg, etc., follow here)

  const getRiskColor = (risk) => {
    if (risk < 30) return "text-green-600";
    if (risk < 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskBg = (risk) => {
    if (risk < 30) return "bg-green-100";
    if (risk < 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">HealthConnect</h1>
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <nav className="hidden md:flex gap-6">
              {[
                { name: "Dashboard", icon: Activity, page: "dashboard" },
                { name: "My Records", icon: FileText, page: "records" },
                { name: "Profile", icon: User, page: "profile" },
              ].map((item) => (
                <button
                  key={item.page}
                  onClick={() => setCurrentPage(item.page)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === item.page ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5" /> {item.name}
                </button>
              ))}
            </nav>
          </div>

          {menuOpen && (
            <nav className="md:hidden pb-4 space-y-2">
              {[
                { name: "Dashboard", icon: Activity, page: "dashboard" },
                { name: "My Records", icon: FileText, page: "records" },
                { name: "Profile", icon: User, page: "profile" },
              ].map((item) => (
                <button
                  key={item.page}
                  onClick={() => {
                    setCurrentPage(item.page);
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    currentPage === item.page ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5" /> {item.name}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === "dashboard" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
              <p className="text-blue-100">Here's your health overview</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Health Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {["diabetes_risk", "anemia_risk", "hypertension_risk", "cardiac_risk"].map((key) => (
                  <div key={key} className={`${getRiskBg(aiSummary[key] || 0)} rounded-lg p-4`}>
                    <div className="text-sm text-gray-600 mb-1 capitalize">{key.replace("_", " ")}</div>
                    <div className={`text-3xl font-bold ${getRiskColor(aiSummary[key] || 0)}`}>
                      {aiSummary[key] || 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 💡 INSERT APPOINTMENT BOOKER HERE */}
        <AppointmentBooker 
            patientId={userId} // Pass the patient's ID
            currentRiskLevel={calculateOverallRisk(aiSummary)} // Pass the calculated risk level
        />

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
              </div>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert._id}
                    className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-900">{alert.message}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(alert.created_at)} at {formatTime(alert.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentPage === "records" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Health Records</h2>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Medical History</h3>
              </div>
              <div className="space-y-4">
                {records.map((record, index) => (
                  <div key={record._id} className="relative pl-8 pb-8 last:pb-0">
                    {index < records.length - 1 && <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gray-200" />}
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-600" />
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{record.title}</h4>
                          <p className="text-sm text-gray-500">{record.recorded_by}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {record.record_type}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{record.description}</p>
                      <p className="text-sm text-gray-500">{formatDate(record.recorded_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prescriptions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Pill className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Prescriptions</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {prescriptions.map((p) => (
                  <div key={p._id} className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{p.medication_name}</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Dosage:</span> {p.dosage}</p>
                      <p><span className="font-medium">Frequency:</span> {p.frequency}</p>
                      <p><span className="font-medium">Duration:</span> {p.duration}</p>
                      {p.notes && <p className="text-gray-600 mt-2">{p.notes}</p>}
                      <p className="text-gray-500 mt-2">Prescribed: {formatDate(p.prescribed_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lab Reports */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FlaskConical className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Lab Reports</h3>
              </div>
              <div className="space-y-4">
                {labReports.map((r) => (
                  <div key={r._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{r.test_name}</h4>
                        <p className="text-sm text-gray-500">{r.test_type}</p>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(r.test_date)}</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 mb-3">
                      {Object.entries(r.results).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded p-3">
                          <div className="text-sm text-gray-600">{key}</div>
                          <div className="flex items-baseline gap-2">
                            <span className={`text-lg font-semibold ${value.status === "high" ? "text-red-600" : "text-gray-900"}`}>
                              {value.value}
                            </span>
                            <span className="text-sm text-gray-500">{value.unit}</span>
                          </div>
                          <div className="text-xs text-gray-500">Range: {value.range}</div>
                        </div>
                      ))}
                    </div>
                    {r.notes && <p className="text-sm text-gray-600 bg-blue-50 rounded p-2">{r.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentPage === "profile" && user && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Full Name", key: "name" },
                  { label: "Email", key: "email" },
                  { label: "DOB", key: "dob", type: "date" },
                  { label: "Gender", key: "gender" },
                  { label: "Blood Type", key: "blood_type" },
                  { label: "Phone", key: "phone" },
                  { label: "Address", key: "address" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-sm text-gray-600 mb-1">{label}</label>
                    {editing ? (
                      <input
                        type={type || "text"}
                        name={key}
                        value={formData[key] || ""}
                        onChange={handleInputChange}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p>{key === "dob" ? formatDate(user[key]) : user[key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Preferred Language</label>
                  {editing ? (
                    <select
                      name="preferred_language"
                      value={formData.preferred_language || ""}
                      onChange={handleInputChange}
                      className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  ) : (
                    <p>{user.preferred_language}</p>
                  )}
                </div>
              </div>
            </div>

            {editing && (
              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
