import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const VitalsModal = ({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  appointmentId,
  patientId
}) => {

  const [formData, setFormData] = useState({
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    spo2: "",
    weight: "",
    height: "",
    notes: "",
  });

  /* ================= LOAD DATA ================= */

  useEffect(() => {

    if (initialData) {

      setFormData({
        bloodPressure:
          initialData.blood_pressure_systolic &&
          initialData.blood_pressure_diastolic
            ? `${initialData.blood_pressure_systolic}/${initialData.blood_pressure_diastolic}`
            : "",

        heartRate: initialData.heart_rate || "",
        temperature: initialData.temperature || "",
        spo2: initialData.oxygen_saturation || "",
        weight: initialData.weight || "",
        height: initialData.height || "",
        notes: initialData.symptoms || "",
      });

    } else {

      setFormData({
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        spo2: "",
        weight: "",
        height: "",
        notes: "",
      });

    }

  }, [initialData, isOpen]);

  /* ================= HANDLE INPUT ================= */

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

  };

  /* ================= SUBMIT ================= */

  const handleSubmit = (e) => {

    e.preventDefault();

    if (!appointmentId || !patientId) {
      alert("Missing appointment context.");
      return;
    }

    /* Validate BP */

    if (!formData.bloodPressure.includes("/")) {
      alert("Blood pressure must be in format 120/80");
      return;
    }

    const [sys, dia] = formData.bloodPressure.split("/");

    const systolic = Number(sys);
    const diastolic = Number(dia);

    if (systolic < 50 || diastolic < 30) {
      alert("Invalid blood pressure values");
      return;
    }

    /* Validate heart rate */

    if (!formData.heartRate) {
      alert("Heart rate is required");
      return;
    }

    const payload = {

      appointmentId,
      patientId,

      blood_pressure_systolic: systolic,
      blood_pressure_diastolic: diastolic,

      heart_rate: Number(formData.heartRate),

      temperature: formData.temperature
        ? Number(formData.temperature)
        : undefined,

      oxygen_saturation: formData.spo2
        ? Number(formData.spo2)
        : undefined,

      weight: formData.weight
        ? Number(formData.weight)
        : undefined,

      height: formData.height
        ? Number(formData.height)
        : undefined,

      symptoms: formData.notes || ""

    };

    console.log("Submitting vitals:", payload);

    onSubmit(payload);

  };

  if (!isOpen) return null;

  /* ================= UI ================= */

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">

      <div className="bg-white rounded-lg w-full max-w-lg mx-4">

        {/* HEADER */}

        <div className="flex justify-between items-center p-4 border-b">

          <h2 className="text-xl font-semibold">
            {initialData ? "Edit Vitals" : "Add Patient Vitals"}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X className="w-6 h-6" />
          </button>

        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit} className="p-4 space-y-4">

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium mb-1">
                Blood Pressure (120/80)
              </label>

              <input
                type="text"
                name="bloodPressure"
                placeholder="120/80"
                value={formData.bloodPressure}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Heart Rate
              </label>

              <input
                type="number"
                name="heartRate"
                placeholder="76"
                value={formData.heartRate}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Temperature
              </label>

              <input
                type="number"
                name="temperature"
                step="0.1"
                value={formData.temperature}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                SpO2
              </label>

              <input
                type="number"
                name="spo2"
                value={formData.spo2}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Weight
              </label>

              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Height
              </label>

              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Symptoms
            </label>

            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="flex justify-end pt-4 border-t">

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Save Vitals
            </button>

          </div>

        </form>

      </div>

    </div>

  );

};

export default VitalsModal;