import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiCalendar,
  FiUsers,
  FiBriefcase,
  FiKey,
  FiPhone,
  FiHome,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import backgroundImage from "../assets/home.png";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    gender: "",
    role: "",
    blood_type: "",
    phone: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    preferred_language: "en",
  });

  const [proof, setProof] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear patient-only fields if role changes
    if (name === "role" && value !== "patient") {
      setForm({
        ...form,
        role: value,
        blood_type: "",
        phone: "",
        address: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
      });
      setProof("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, proof };

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Registration successful!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          style: {
            background: "#fff",
            color: "#000",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            fontWeight: "500",
          },
        });

        setTimeout(() => navigate("/login"), 3000);
      } else {
        toast.error(`${data.message || "Registration failed"}`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          theme: "colored",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Registration failed.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
      });
    }
  };

  const inputContainerStyle = "relative";
  const inputIconStyle = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400";
  const inputStyle = "w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="max-w-md w-full bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create an Account</h2>
          <p className="text-gray-600 mt-2">Join us and start your journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className={inputContainerStyle}>
              <FiUser className={inputIconStyle} />
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className={inputContainerStyle}>
              <FiMail className={inputIconStyle} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className={inputContainerStyle}>
              <FiLock className={inputIconStyle} />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <div className={inputContainerStyle}>
                <FiCalendar className={inputIconStyle} />
                <input
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <div className={inputContainerStyle}>
                <FiUsers className={inputIconStyle} />
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Role and Proof */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>
            <div className={inputContainerStyle}>
              <FiBriefcase className={inputIconStyle} />
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className={inputStyle}
              >
                <option value="">Select Role</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="government">Government Agent</option>
                <option value="hospital">Hospital Management</option>
              </select>
            </div>
          </div>

          {form.role && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.role === "patient"
                  ? "Aadhar Card Number"
                  : form.role === "doctor"
                  ? "Doctor ID Number"
                  : form.role === "government"
                  ? "Government ID Number"
                  : "Hospital Registration Number"}
              </label>
              <div className={inputContainerStyle}>
                <FiKey className={inputIconStyle} />
                <input
                  name="proof"
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
                  required
                  placeholder="Enter your ID"
                  className={inputStyle}
                />
              </div>
            </div>
          )}

          {/* Patient-only fields */}
          {form.role === "patient" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                <input
                  name="blood_type"
                  value={form.blood_type}
                  onChange={handleChange}
                  placeholder="A+, B-, O+"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className={inputContainerStyle}>
                  <FiPhone className={inputIconStyle} />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className={inputContainerStyle}>
                  <FiHome className={inputIconStyle} />
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="123 Street, City"
                    className={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                  <input
                    name="emergency_contact_name"
                    value={form.emergency_contact_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                  <input
                    name="emergency_contact_phone"
                    value={form.emergency_contact_phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className={inputStyle}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-all"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-center text-gray-700 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Login here
          </Link>
        </p>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default Register;
