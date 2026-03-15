import Prescription from "../models/Prescription.js";

export const addPrescription = async (req, res) => {
    try {
        const {
            appointmentId,
            patientId,
            medicineName,
            dosage,
            frequency,
            duration,
            notes,
        } = req.body;

        const doctorId = req.user._id;

        if (!appointmentId || !patientId || !doctorId || !medicineName || !dosage || !frequency || !duration) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newPrescription = new Prescription({
            appointment: appointmentId,
            patient: patientId,
            doctor: doctorId,
            medication_name: medicineName,
            dosage,
            frequency,
            duration,
            notes,
        });

        const savedPrescription = await newPrescription.save();
        res.status(201).json({ success: true, prescription: savedPrescription });
    } catch (error) {
        console.error("Error creating prescription:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
