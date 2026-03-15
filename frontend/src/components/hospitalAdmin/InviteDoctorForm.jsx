import { useState } from "react";
import { addDoctor } from "../../api/hospitalAdmin";

export default function InviteDoctorForm({ onInvited }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoctor(email);
      setEmail("");
      onInvited();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add doctor");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        className="border p-2 rounded w-64"
        placeholder="Doctor email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button
        disabled={loading}
        className="bg-blue-600 text-white px-4 rounded"
      >
        Add Doctor
      </button>
    </form>
  );
}