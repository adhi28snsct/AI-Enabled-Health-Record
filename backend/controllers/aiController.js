import AISummary from "../models/AISummary.js";

export const predictRisk = async (req, res) => {
  try {
    /* ================= AUTH CHECK ================= */

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can access AI health check",
      });
    }

    const patientId = req.user._id; // ✅ SECURE SOURCE

    /* ================= MOCK AI LOGIC ================= */

    const response = {
      diabetesRisk: 0.32,
      hypertensionRisk: 0.64,
      anemiaRisk: 0.18,
      cardiacRisk: 0.15,
      summary:
        "Moderate hypertension risk detected based on recent vitals.",
    };

    /* ================= SAVE TO DB ================= */

    const summaryDoc = await AISummary.findOneAndUpdate(
      { patient: patientId },
      {
        $set: {
          diabetes_risk: Math.round(response.diabetesRisk * 100),
          hypertension_risk: Math.round(response.hypertensionRisk * 100),
          anemia_risk: Math.round(response.anemiaRisk * 100),
          cardiac_risk: Math.round(response.cardiacRisk * 100),
          suggestions: [response.summary],
          updated_at: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    /* ================= RESPONSE ================= */

    return res.status(200).json({
      success: true,
      prediction: {
        diabetes_risk: summaryDoc.diabetes_risk,
        hypertension_risk: summaryDoc.hypertension_risk,
        anemia_risk: summaryDoc.anemia_risk,
        cardiac_risk: summaryDoc.cardiac_risk,
        summary: response.summary,
      },
    });

  } catch (error) {
    console.error("AI prediction error:", error);

    return res.status(500).json({
      success: false,
      message: "AI prediction failed",
    });
  }
};