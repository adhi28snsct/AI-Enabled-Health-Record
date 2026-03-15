import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  getVitals,
  getLabReports,
  getPrescriptions,
  getAISummary,
  getPatientAlerts,
  getMyAppointments,
  addVitals,
  updateVitals,
  addPrescription,
  addLabReport,
  predictRisk
} from "../../api/doctor";

import PatientCard from "../../components/PatientCard";
import VitalsPanel from "../../components/VitalsPannel";
import AIDiagnosticPanel from "../../components/patient/AiDiagonisticPanel";

import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

import VitalsModal from "../../components/doctor-components/VitalsModal";
import PrescriptionForm from "../../components/doctor-components/PrescriptionForm";
import LabReportForm from "../../components/LabReportForm";
import PatientMedicalTimeline from "../../components/doctor-components/PatientMedicalTimeline";

export default function DoctorPatientDetail() {

  const { patientId } = useParams();
  const { user } = useAuth();

  /* ================= STATE ================= */

  const [vitals, setVitals] = useState(null);
  const [labs, setLabs] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [aiSummary, setAISummary] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const [currentAppointmentId, setCurrentAppointmentId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [isVitalsOpen, setIsVitalsOpen] = useState(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [isLabOpen, setIsLabOpen] = useState(false);

  const [prescriptionData, setPrescriptionData] = useState({});

  /* 🔥 FIXED LAB INITIAL STATE */
  const initialLabState = {
    test_name: "",
    test_type: "",
    notes: "",
    results: {}
  };

  const [labData, setLabData] = useState(initialLabState);

  /* ================= LOAD PATIENT DATA ================= */

  const loadPatientData = async () => {
    try {
      const [v, l, p, a, al] = await Promise.all([
        getVitals(patientId),
        getLabReports(patientId),
        getPrescriptions(patientId),
        getAISummary(patientId),
        getPatientAlerts(patientId)
      ]);

      setVitals(v.data.data?.[0] || null);
      setLabs(l.data.data || []);
      setPrescriptions(p.data.data || []);
      setAISummary(a.data.data || null);
      setAlerts(al.data.data || []);

    } catch (err) {
      console.error("Load patient error:", err);
      toast.error("Error fetching patient data");
    }
  };

  /* ================= FETCH APPOINTMENT ================= */

  useEffect(() => {

    loadPatientData();

    getMyAppointments()
      .then(res => {

        const apts = res.data.data || [];

        const ptApt = apts.find(
          a => a.patient?._id === patientId || a.patient === patientId
        );

        if (ptApt) {
          setCurrentAppointmentId(ptApt._id);
          setSelectedPatient(ptApt.patient);
        } else {
          setCurrentAppointmentId(null);
        }

      })
      .catch(err => {
        console.error("Appointment fetch error:", err);
      });

  }, [patientId]);

  /* ================= SAVE VITALS ================= */

  const handleVitalsSubmit = async (payload) => {
    try {

      if (!currentAppointmentId) {
        toast.error("Missing appointment context");
        return;
      }

      const systolic = Number(payload.blood_pressure_systolic);
      const diastolic = Number(payload.blood_pressure_diastolic);
      const heartRate = Number(payload.heart_rate);

      if (!systolic || systolic < 50) {
        toast.error("Invalid systolic blood pressure");
        return;
      }

      if (!diastolic || diastolic < 30) {
        toast.error("Invalid diastolic blood pressure");
        return;
      }

      if (!heartRate) {
        toast.error("Heart rate is required");
        return;
      }

      const finalPayload = {
        appointmentId: currentAppointmentId,
        patientId,
        blood_pressure_systolic: systolic,
        blood_pressure_diastolic: diastolic,
        heart_rate: heartRate,
        temperature: payload.temperature ? Number(payload.temperature) : undefined,
        oxygen_saturation: payload.oxygen_saturation ? Number(payload.oxygen_saturation) : undefined,
        weight: payload.weight ? Number(payload.weight) : undefined,
        height: payload.height ? Number(payload.height) : undefined,
        symptoms: payload.symptoms || ""
      };

      if (vitals?._id) {
        await updateVitals(vitals._id, finalPayload);
      } else {
        await addVitals(finalPayload);
      }

      toast.success("Vitals saved successfully");
      setIsVitalsOpen(false);

      await loadPatientData();

      const aiRes = await predictRisk({ patientId });
      toast.success(aiRes.data?.prediction?.summary || "AI Risk Updated");

      await loadPatientData();

    } catch (err) {
      console.error("Vitals Save Error:", err);
      toast.error(err.response?.data?.message || "Failed to save vitals");
    }
  };

  /* ================= ADD PRESCRIPTION ================= */

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        appointmentId: currentAppointmentId,
        patientId,
        medicineName: prescriptionData.medication_name,
        dosage: prescriptionData.dosage,
        frequency: prescriptionData.frequency,
        duration: prescriptionData.duration,
        notes: prescriptionData.notes
      };

      await addPrescription(payload);

      toast.success("Prescription added!");
      setIsPrescriptionOpen(false);
      setPrescriptionData({});
      loadPatientData();

    } catch (err) {
      toast.error("Failed to add prescription");
    }
  };

  /* ================= ADD LAB REPORT ================= */

  const handleLabSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        appointmentId: currentAppointmentId,
        patientId,
        reportName: labData.test_name,
        reportType: labData.test_type,
        fileUpload: labData.results,
        notes: labData.notes
      };

      await addLabReport(payload);

      toast.success("Lab report added");

      setIsLabOpen(false);
      setLabData(initialLabState); // 🔥 SAFE RESET

      await loadPatientData();

    } catch (err) {
      console.error(err);
      toast.error("Failed to add lab report");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6">

      {selectedPatient && (
        <PatientCard patient={selectedPatient} isSelected />
      )}

      <VitalsPanel
        vitals={vitals}
        onAddVitals={() => setIsVitalsOpen(true)}
        onEditVitals={() => setIsVitalsOpen(true)}
      />

      <AIDiagnosticPanel diagnostics={aiSummary} />

      <div className="flex gap-4 my-4">
        <button
          onClick={() => setIsPrescriptionOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          + New Prescription
        </button>

        <button
          onClick={() => setIsLabOpen(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          + Upload Lab Report
        </button>
      </div>

      {isPrescriptionOpen && (
        <PrescriptionForm
          formData={prescriptionData}
          setFormData={setPrescriptionData}
          onSubmit={handlePrescriptionSubmit}
          onCancel={() => setIsPrescriptionOpen(false)}
        />
      )}

      {isLabOpen && (
        <LabReportForm
          formData={labData}
          setFormData={setLabData}
          onSubmit={handleLabSubmit}
          onCancel={() => setIsLabOpen(false)}
          isEditing={false}
        />
      )}

      <PatientMedicalTimeline
        vitals={vitals}
        prescriptions={prescriptions}
        labs={labs}
        aiSummaries={aiSummary}
      />

      <VitalsModal
        isOpen={isVitalsOpen}
        onClose={() => setIsVitalsOpen(false)}
        initialData={vitals}
        onSubmit={handleVitalsSubmit}
        appointmentId={currentAppointmentId}
        patientId={patientId}
      />

    </div>
  );
}