import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import backgroundImage from "../assets/home.png";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.role) {
      toast.error("Please select a role");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // Save token and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);

        toast.success("Login successful!", {
          style: { backgroundColor: "#fff", color: "#000" },
        });

        setTimeout(() => {
          switch (form.role) {
            case "patient":
              navigate("/patient");
              break;
            case "doctor":
              navigate("/doctor");
              break;
            case "government":
              navigate("/admin");
              break;
            case "hospital":
              navigate("/health-worker");
              break;
            default:
              toast.error("Invalid role selected");
          }
        }, 1500);
      } else {
        toast.error(data.message || "Invalid credentials", {
          style: { backgroundColor: "#fff", color: "#000" },
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Server error, please try again later", {
        style: { backgroundColor: "#fff", color: "#000" },
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <ToastContainer position="top-right" />
      <div className="max-w-md w-full bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Login to HealthConnect
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose your role</option>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="government">Government Agent</option>
            <option value="hospital">Hospital Management</option>
          </select>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
        <p className="text-sm text-center text-gray-700 mt-4">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
