// src/components/hospitalAdmin/DoctorTable.jsx

export default function DoctorTable({
  doctors,
  onApprove,
  onDeactivate,
}) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Actions</th>
          </tr>
        </thead>

        <tbody>
          {doctors.length === 0 ? (
            <tr>
              <td
                colSpan="4"
                className="p-4 text-center text-gray-500"
              >
                No doctors found
              </td>
            </tr>
          ) : (
            doctors.map((doctor) => (
              <tr key={doctor._id} className="border-t">
                <td className="p-3 border">
                  {doctor.name || "Doctor"}
                </td>

                <td className="p-3 border">
                  {doctor.email}
                </td>

                <td className="p-3 border">
                  {doctor.status === "ACTIVE" ? (
                    <span className="text-green-600 font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-medium">
                      Pending Login
                    </span>
                  )}
                </td>

                <td className="p-3 border space-x-2">
                  {!doctor.hospitalApproved && (
                    <button
                      onClick={() => onApprove(doctor._id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    >
                      Approve
                    </button>
                  )}

                  {doctor.isActive && (
                    <button
                      onClick={() => onDeactivate(doctor._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}