import LabReport from "../models/LabReport.js";

export const addLabReport = async (req, res) => {
    try {
        const {
            appointmentId,
            patientId,
            reportName,
            reportType,
            fileUpload,
            notes,
        } = req.body;

        const doctorId = req.user._id;

        if (!appointmentId || !patientId || !doctorId || !reportName || !reportType || !fileUpload) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newLabReport = new LabReport({
            appointment: appointmentId,
            patient: patientId,
            doctor: doctorId,
            test_name: reportName,
            test_type: reportType,
            results: fileUpload,
            notes: notes || "",
        });

        const savedLabReport = await newLabReport.save();
        res.status(201).json({ success: true, labReport: savedLabReport });
    } catch (error) {
        console.error("Error creating lab report:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
