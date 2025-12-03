// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import backgroundImage from "../assets/home.png";
import { setAuthToken } from "../api/api"; // Axios token helper
import { useAuth } from "../api/authContext"; // Context hook

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "",
  });

  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();

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

      if (res.ok && data.token) {
        const userData = {
          _id: data.user._id,
          name: data.user.name,
          role: data.user.role,
        };

        // Save to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", userData._id);
        localStorage.setItem("name", userData.name);
        localStorage.setItem("role", userData.role);

        // Save to context
        setUser(userData);
        setToken(data.token);

        setAuthToken(data.token);

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
        }, 3000);
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

        {/* fixed: use a div container instead of a <p> when containing block elements */}
        <div className="text-sm text-center text-gray-700 mt-4 space-y-2">
          <div>
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </div>
          <div>
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
