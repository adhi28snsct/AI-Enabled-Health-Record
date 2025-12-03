import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { forgotPassword } from "../services/authService";
import backgroundImage from "../assets/home.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email", {
        style: { backgroundColor: "#fff", color: "#000" },
      });
      return;
    }

    setSending(true);

    try {
      const resp = await forgotPassword(email);

      // SUCCESS — email exists
      toast.success(
        resp?.message || "Reset link sent successfully!",
        {
          style: { backgroundColor: "#fff", color: "#000" },
        }
      );

      setEmail("");
    } catch (err) {

      // ERROR — email does NOT exist
      if (err?.status === 404) {
        toast.error("No account found with that email.", {
          style: { backgroundColor: "#fff", color: "#000" },
        });
      } else {
        toast.error(err?.message || "Something went wrong. Try again later.", {
          style: { backgroundColor: "#fff", color: "#000" },
        });
      }

    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="max-w-md w-full bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Reset your password
        </h2>

        <p className="text-sm text-gray-600 mb-4 text-center">
          Enter your email and we’ll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-70"
          >
            {sending ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="text-sm text-center text-gray-700 mt-4 space-y-2">
          <div>
            Remembered your password?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Back to login
            </Link>
          </div>
          <div>
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
