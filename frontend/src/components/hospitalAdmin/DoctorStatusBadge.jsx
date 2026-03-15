export default function DoctorStatusBadge({ status }) {
  const map = {
    INVITED: "bg-yellow-100 text-yellow-800",
    PENDING_APPROVAL: "bg-blue-100 text-blue-800",
    ACTIVE: "bg-green-100 text-green-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${
        map[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
