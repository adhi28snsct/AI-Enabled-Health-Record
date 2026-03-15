import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import User from "../models/User.js"

dotenv.config()

async function run() {
  await mongoose.connect(process.env.MONGO_URI)

  const email = "adhithyaarul28@gmail.com"
  const password = "adhi28@2004"

  const exists = await User.findOne({ email })
  if (exists) {
    console.log("Admin already exists")
    process.exit()
  }

  const hash = await bcrypt.hash(password, 10)

  await User.create({
    email,
    password: hash,
    role: "platform_admin"
  })

  console.log("✅ Platform Admin Created")
  console.log("Email:", email)
  console.log("Password:", password)

  process.exit()
}

run()
