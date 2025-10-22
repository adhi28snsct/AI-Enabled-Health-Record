import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import AISummary from "./models/AISummary.js";

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || "your-atlas-uri";

// Function to generate a random risk percentage between 10 and 85
function getRandomPercentage() {
    return Math.floor(Math.random() * (85 - 10 + 1) + 10);
}

async function seedAISummaries() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB Atlas");

        const patients = await User.find({ role: "patient" });

        for (const patient of patients) {
            const exists = await AISummary.findOne({ patient: patient._id });
            if (exists) {
                console.log(`🔁 AI summary already exists for ${patient.name}`);
                continue;
            }

            // --- NOW STORING NUMBERS INSTEAD OF STRINGS ---
            const summary = new AISummary({
                patient: patient._id,
                diabetes_risk: getRandomPercentage(),
                anemia_risk: getRandomPercentage(),
                hypertension_risk: getRandomPercentage(),
                cardiac_risk: getRandomPercentage(),
            });

            await summary.save();
            console.log(`✅ AI summary created for ${patient.name} with dynamic scores.`);
        }

        console.log("🎉 Seeding complete");
        mongoose.disconnect();
    } catch (err) {
        console.error("❌ Error seeding AI summaries:", err.message);
        mongoose.disconnect();
    }
}

seedAISummaries();