import mongoose from "mongoose";
import Hospital from "../../models/Hospital.js";
import User from "../../models/User.js";
import Appointment from "../../models/Appointment.js";

/* ======================================================
   GET SINGLE HOSPITAL ANALYTICS (PLATFORM ADMIN)
====================================================== */

export const getHospitalAnalytics = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Validate hospital exists
        const hospital = await Hospital.findById(id).lean();
        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        const hospitalObjectId = new mongoose.Types.ObjectId(id);

        // 2. TOTALS - User Collection
        const [totalPatients, activePatients, totalDoctors] = await Promise.all([
            User.countDocuments({ role: "patient", hospitalId: hospitalObjectId }),
            User.countDocuments({
                role: "patient",
                status: "ACTIVE",
                hospitalId: hospitalObjectId,
            }),
            User.countDocuments({ role: "doctor", hospitalId: hospitalObjectId }),
        ]);

        // 3. HIGH RISK & CRITICAL ALERTS - Appointment Collection
        const highRiskAggregation = await Appointment.aggregate([
            { $match: { hospital: hospitalObjectId } },
            {
                $group: {
                    _id: "$patient",
                    maxRiskLevel: {
                        $max: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ["$risk_snapshot.risk_level", "critical"] }, then: 4 },
                                    { case: { $eq: ["$risk_snapshot.risk_level", "high"] }, then: 3 },
                                    { case: { $eq: ["$risk_snapshot.risk_level", "moderate"] }, then: 2 },
                                    { case: { $eq: ["$risk_snapshot.risk_level", "low"] }, then: 1 }
                                ],
                                default: 0
                            }
                        }
                    }
                }
            },
            {
                $match: { maxRiskLevel: { $gte: 3 } } // high (3) or critical (4)
            },
            { $count: "count" }
        ]);
        const highRiskPatientsCount = highRiskAggregation.length > 0 ? highRiskAggregation[0].count : 0;

        const criticalAlertsCount = await Appointment.countDocuments({
            hospital: hospitalObjectId,
            "risk_snapshot.risk_level": "critical",
        });

        // 4. DISEASE COUNTS - Appointment Collection
        // For each patient, find the max severity for each disease, then count patients with high/critical severity (severity > 50 assumes high risk historically, but using the user prompt: "diabetes = high or critical" meaning we should check risk percentage IF risk_level doesn't have it explicitly.)
        // Wait, the prompt says: "find maximum severity per disease from risk_snapshot... count unique patients whose final severity for diabetes = high or critical".
        // In the schema, diabetes_risk is a Number (percentage). So > 50 is the implied "high or critical" threshold for the specific disease. Let's use > 50 for the numerical risks.
        const diseaseAggregation = await Appointment.aggregate([
            { $match: { hospital: hospitalObjectId } },
            {
                $group: {
                    _id: "$patient",
                    maxDiabetes: { $max: "$risk_snapshot.diabetes_risk" },
                    maxHypertension: { $max: "$risk_snapshot.hypertension_risk" },
                    maxAnemia: { $max: "$risk_snapshot.anemia_risk" },
                    maxCardiac: { $max: "$risk_snapshot.cardiac_risk" }
                }
            },
            {
                $facet: {
                    diabetes: [{ $match: { maxDiabetes: { $gt: 50 } } }, { $count: "count" }],
                    hypertension: [{ $match: { maxHypertension: { $gt: 50 } } }, { $count: "count" }],
                    anemia: [{ $match: { maxAnemia: { $gt: 50 } } }, { $count: "count" }],
                    cardiac: [{ $match: { maxCardiac: { $gt: 50 } } }, { $count: "count" }]
                }
            }
        ]);

        const diseaseCounts = {
            diabetes: diseaseAggregation[0].diabetes[0]?.count || 0,
            hypertension: diseaseAggregation[0].hypertension[0]?.count || 0,
            anemia: diseaseAggregation[0].anemia[0]?.count || 0,
            cardiac: diseaseAggregation[0].cardiac[0]?.count || 0,
        };

        // 5. MONTHLY TRENDS - Appointment Collection
        const monthlyTrendsAggregation = await Appointment.aggregate([
            { $match: { hospital: hospitalObjectId, requested_at: { $ne: null } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$requested_at" },
                        month: { $month: "$requested_at" }
                    },
                    visits: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    visits: 1
                }
            },
            { $sort: { year: 1, month: 1 } }
        ]);

        // 6. AGE DISTRIBUTION - User Collection
        const ageDistributionAggregation = await User.aggregate([
            { $match: { role: "patient", hospitalId: hospitalObjectId, dob: { $ne: null } } },
            {
                $project: {
                    age: {
                        $dateDiff: {
                            startDate: "$dob",
                            endDate: new Date(),
                            unit: "year"
                        }
                    }
                }
            },
            {
                $bucket: {
                    groupBy: "$age",
                    boundaries: [0, 19, 41, 61], // 0-18, 19-40, 41-60
                    default: "60+", // 61 and above
                    output: {
                        count: { $sum: 1 }
                    }
                }
            }
        ]);

        // Format age distribution mapping
        const structuredAgeDistribution = [
            { ageGroup: "0-18", count: 0 },
            { ageGroup: "19-40", count: 0 },
            { ageGroup: "41-60", count: 0 },
            { ageGroup: "60+", count: 0 }
        ];

        ageDistributionAggregation.forEach(bucket => {
            if (bucket._id === 0) structuredAgeDistribution[0].count = bucket.count;
            else if (bucket._id === 19) structuredAgeDistribution[1].count = bucket.count;
            else if (bucket._id === 41) structuredAgeDistribution[2].count = bucket.count;
            else if (bucket._id === "60+") structuredAgeDistribution[3].count = bucket.count;
        });

        // 7. LAST ACTIVITY
        const lastActivityResult = await Appointment.findOne({ hospital: hospitalObjectId })
            .sort({ requested_at: -1 })
            .select("requested_at")
            .lean();

        const lastActivity = lastActivityResult ? lastActivityResult.requested_at : null;

        // 8. COMPILE AND RETURN
        res.json({
            hospitalInfo: {
                _id: hospital._id,
                name: hospital.name,
                district: hospital.district,
                isActive: hospital.isActive,
                createdAt: hospital.createdAt
            },
            totals: {
                totalPatients,
                activePatients,
                totalDoctors,
                highRiskPatients: highRiskPatientsCount,
                criticalAlerts: criticalAlertsCount
            },
            diseaseCounts,
            monthlyTrends: monthlyTrendsAggregation,
            ageDistribution: structuredAgeDistribution,
            lastActivity,
            generatedAt: new Date()
        });

    } catch (err) {
        console.error("❌ getHospitalAnalytics:", err);
        res.status(500).json({ message: "Server error while generating analytics" });
    }
};
