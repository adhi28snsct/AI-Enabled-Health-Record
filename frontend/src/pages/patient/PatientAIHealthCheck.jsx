import React, { useState } from "react";
import { BrainCircuit } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { predictRisk } from "../../api/patient";
import AIDiagnosisResult from "../../components/patient/AIDiagnosisResult";
import { useAuth } from "../../context/AuthContext";

export default function PatientAIHealthCheck() {
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    blood_pressure: "",
    heart_rate: "",
    diabetes_history: false,
    smoking: false,
    alcohol: false,
    symptoms: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setLoading(true);

      // 🔥 NO patientId — backend gets it from JWT
      const res = await predictRisk({
        age: Number(formData.age),
        weight: Number(formData.weight),
        blood_pressure: formData.blood_pressure,
        heart_rate: Number(formData.heart_rate),
        diabetes_history: formData.diabetes_history,
        smoking: formData.smoking,
        alcohol: formData.alcohol,
        symptoms: formData.symptoms,
      });

      setResult(res.data?.prediction);
      toast.success("Health assessment completed");

    } catch (err) {
      console.error("AI Error:", err.response?.data || err.message);
      toast.error(
        err.response?.data?.message || "Failed to generate AI diagnosis"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ToastContainer />

      <header className="bg-white border-b shadow-sm sticky top-0 z-30 px-6 py-4 flex gap-3 items-center">
        <BrainCircuit className="text-indigo-600 w-6 h-6" />
        <h1 className="text-xl font-bold flex-1">AI Health Check</h1>
      </header>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white rounded-xl shadow border p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-6">
            Self-Assessment Questionnaire
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                className="border rounded-lg p-2"
                required
              />

              <input
                type="number"
                name="weight"
                placeholder="Weight (kg)"
                value={formData.weight}
                onChange={handleChange}
                className="border rounded-lg p-2"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="blood_pressure"
                placeholder="BP (120/80)"
                value={formData.blood_pressure}
                onChange={handleChange}
                className="border rounded-lg p-2"
                required
              />

              <input
                type="number"
                name="heart_rate"
                placeholder="Heart Rate"
                value={formData.heart_rate}
                onChange={handleChange}
                className="border rounded-lg p-2"
                required
              />
            </div>

            <textarea
              name="symptoms"
              rows="3"
              placeholder="Describe symptoms..."
              value={formData.symptoms}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg"
            >
              {loading ? "Analyzing..." : "Generate AI Diagnosis"}
            </button>
          </form>
        </div>

        <div className="flex-1">
          {result ? (
            <AIDiagnosisResult summary={result} />
          ) : (
            <div className="h-full border border-dashed rounded-xl flex items-center justify-center text-gray-500 min-h-[400px]">
              Fill the form to receive AI risk assessment.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}