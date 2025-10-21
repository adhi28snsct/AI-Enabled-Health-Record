import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import AISummary from "./models/AISummary.js";

dotenv.config(); // Load your .env file with MONGODB_URI

const MONGODB_URI = process.env.MONGODB_URI || "your-atlas-uri";

const riskLevels = ["low", "moderate", "high", "critical"];

function getRandomRisk() {
  return riskLevels[Math.floor(Math.random() * riskLevels.length)];
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

      const summary = new AISummary({
        patient: patient._id,
        diabetes_risk: getRandomRisk(),
        anemia_risk: getRandomRisk(),
        hypertension_risk: getRandomRisk(),
        cardiac_risk: getRandomRisk(),
      });

      await summary.save();
      console.log(`✅ AI summary created for ${patient.name}`);
    }

    console.log("🎉 Seeding complete");
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding AI summaries:", err.message);
    mongoose.disconnect();
  }
}

seedAISummaries();