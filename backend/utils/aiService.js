import mongoose from "mongoose";
import Vitals from "../models/Vitals.js";
import LabReport from "../models/LabReport.js";
import AISummary from "../models/AISummary.js";

// --- SIMULATED AI PREDICTION FUNCTION (FINAL VERSION) ---
const runTensorFlowPrediction = (latestVitals, latestLabs) => {
    
    // --- Data Inputs ---
    const hr = latestVitals?.heart_rate || 75;
    const sysBP = latestVitals?.blood_pressure_systolic || 120;
    const labResults = latestLabs?.results || {}; 
    
    // Safely access Glucose and Hemoglobin from the Lab Report (crucial for accurate scores)
    const glucoseValue = labResults?.Glucose?.value || 90;
    const hemoglobinValue = labResults?.Hemoglobin?.value || 14.0; 

    // --- CALCULATING NUMERICAL RISK SCORES ---
    const hypertensionRisk = 
        30 + (sysBP > 140 ? 40 : 0) + (hr > 90 ? 10 : 0);
        
    const diabetesRisk = 
        20 + (glucoseValue > 125 ? 55 : glucoseValue > 100 ? 30 : 0); 
    
    const cardiacRisk = 
        15 + (sysBP > 140 ? 30 : 0) + (hr > 90 ? 15 : 0);

    const anemiaRiskValue = (hemoglobinValue < 12.0) ? 75 : (hemoglobinValue < 13.5 ? 30 : 10);
    
    // --- TEXT GENERATION LOGIC ---
    let suggestions = [];
    let tests = [];

    // Rule 1: High Hypertension (Risk >= 70)
    if (hypertensionRisk >= 70) {
        suggestions.push("Prioritize follow-up for blood pressure monitoring and consultation.");
        suggestions.push("Recommend immediate low-sodium dietary and lifestyle modifications.");
        tests.push("Basic Kidney Function Test (KFT)");
    } 

    // Rule 2: High Diabetes (Risk >= 70)
    if (diabetesRisk >= 70) {
        suggestions.push("Urgent referral to a diabetes specialist/endocrinologist.");
        suggestions.push("Counsel patient on fasting and post-prandial glucose testing at home.");
        tests.push("Glycated Hemoglobin (HbA1c) for long-term control.");
    } 
    
    // Rule 3: High Anemia Risk (Risk >= 50)
    if (anemiaRiskValue >= 50) {
        suggestions.push("Investigate potential Iron/B12 deficiency causing pallor and fatigue.");
        tests.push("Ferritin Level and Vitamin B12 Panel.");
    }

    // Fallback: Ensure arrays are never empty for clean display
    if (suggestions.length === 0) {
        suggestions.push("Ensure patient follow-up and basic health education.");
    }
    if (tests.length === 0) {
        tests.push("Routine checkup complete. No critical tests recommended at this time.");
    }

    // --- Return FINAL Combined Output ---
    return {
        diabetes_risk: Math.round(Math.min(100, diabetesRisk)),
        anemia_risk: Math.round(Math.min(100, anemiaRiskValue)), 
        hypertension_risk: Math.round(Math.min(100, hypertensionRisk)),
        cardiac_risk: Math.round(Math.min(100, cardiacRisk)),
        
        // CRITICAL: Text output arrays are now included
        suggestions: suggestions,
        recommended_tests: tests,
    };
};

// --- CORE FUNCTION: Triggers AI and Updates DB (FINAL FIXES) ---
export const triggerAIHealthSummary = async (patientId) => {
    try {
        const patientObjectId = new mongoose.Types.ObjectId(patientId);

        const latestVitals = await Vitals.findOne({ patient: patientObjectId }).sort({ recorded_at: -1 }).lean(); 
        const latestLabs = await LabReport.findOne({ patient: patientObjectId }).sort({ test_date: -1 }).lean();
        
        if (!latestVitals) {
            console.log(`⚠️ AI Trigger: No vitals found for patient ${patientId}. Skipping prediction.`);
            return;
        }
        
        const riskScores = runTensorFlowPrediction(
            latestVitals, 
            latestLabs || {}
        ); 

        // 3. Save/Update the new scores AND text advice to the AISummary model
        const updatedSummary = await AISummary.findOneAndUpdate(
            { patient: patientObjectId }, 
            { $set: riskScores },
            { upsert: true, new: true }
        );
        
        console.log(`✅ AI Summary updated for patient ${patientId}`);
        return updatedSummary;

    } catch (err) {
        console.error("❌ Failed to trigger AI summary:", err.message);
    }
};