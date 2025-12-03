import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../services/authService";
import backgroundImage from "../assets/home.png";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter a new password");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const resp = await resetPassword(token, password);
      toast.success(resp.message || "Password reset successful. Redirecting to login...", {
        style: { backgroundColor: "#fff", color: "#000" },
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {

      if (err?.status === 400) {
        toast.error(err.message || "Invalid or expired reset link", {
          style: { backgroundColor: "#fff", color: "#000" },
        });
      } else {
        toast.error(err.message || "Failed to reset password. Try again later.", {
          style: { backgroundColor: "#fff", color: "#000" },
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="max-w-md w-full bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-md text-center">
          <p className="mb-4">Invalid reset link.</p>
          <button onClick={() => navigate("/forgot-password")} className="text-blue-600 hover:underline">Request a new link</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="max-w-md w-full bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Set a new password</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-70"
          >
            {submitting ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <div className="text-sm text-center text-gray-700 mt-4">
          Remembered? <button className="text-blue-600 hover:underline" onClick={() => navigate("/login")}>Back to login</button>
        </div>
      </div>
    </div>
  );
}
