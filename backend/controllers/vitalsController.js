import Vitals from "../models/Vitals.js";

/* =====================================================
   ADD VITALS
===================================================== */

export const addVitals = async (req, res) => {
  try {
    console.log("Incoming Vitals Data:", req.body);

    const {
      appointmentId,
      patientId,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      heart_rate,
      temperature,
      oxygen_saturation,
      weight,
      height,
      symptoms
    } = req.body;

    const doctorId = req.user?._id;

    /* ===== Basic Required Validation ===== */

    if (!appointmentId || !patientId || !doctorId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: appointmentId, patientId, doctorId"
      });
    }

    if (!heart_rate) {
      return res.status(400).json({
        success: false,
        message: "Heart rate is required"
      });
    }

    if (!temperature) {
      return res.status(400).json({
        success: false,
        message: "Temperature is required"
      });
    }

    /* ===== Create Vitals Document ===== */

    const newVitals = new Vitals({
      appointment: appointmentId,
      patient: patientId,
      doctor: doctorId,

      blood_pressure_systolic,
      blood_pressure_diastolic,
      heart_rate,
      temperature,
      oxygen_saturation,
      weight,
      height,
      symptoms,

      respiration_rate: 16 // Default placeholder
    });

    const savedVitals = await newVitals.save();

    res.status(201).json({
      success: true,
      vitals: savedVitals
    });

  } catch (error) {
    console.error("Error creating vitals:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =====================================================
   UPDATE VITALS
===================================================== */

export const updateVitals = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      blood_pressure_systolic,
      blood_pressure_diastolic,
      heart_rate,
      temperature,
      oxygen_saturation,
      weight,
      height,
      symptoms
    } = req.body;

    const updatedVitals = await Vitals.findByIdAndUpdate(
      id,
      {
        blood_pressure_systolic,
        blood_pressure_diastolic,
        heart_rate,
        temperature,
        oxygen_saturation,
        weight,
        height,
        symptoms
      },
      { new: true, runValidators: true }
    );

    if (!updatedVitals) {
      return res.status(404).json({
        success: false,
        message: "Vitals not found"
      });
    }

    res.status(200).json({
      success: true,
      vitals: updatedVitals
    });

  } catch (error) {
    console.error("Error updating vitals:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};