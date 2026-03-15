import { useEffect, useState } from "react"
import { getHospitalAppointments } from "../../api/hospitalAdmin"

export default function HospitalAppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await getHospitalAppointments()

      // 🔥 Handle different possible response shapes safely
      const data = res?.data || res

      if (Array.isArray(data)) {
        setAppointments(data)
      } else if (Array.isArray(data?.appointments)) {
        setAppointments(data.appointments)
      } else {
        setAppointments([])
      }

    } catch (err) {
      console.error("Failed to load appointments", err)
      setError("Failed to load appointments")
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Hospital Appointments
      </h1>

      {loading && (
        <p className="text-muted-foreground">Loading appointments…</p>
      )}

      {!loading && error && (
        <p className="text-red-500">{error}</p>
      )}

      {!loading && !error && appointments.length === 0 && (
        <p className="text-muted-foreground">No appointments found</p>
      )}

      {!loading && !error && appointments.length > 0 && (
        <div className="rounded-lg border overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-left">Doctor</th>
                <th className="p-3 text-left">Specialization</th>
                <th className="p-3 text-left">Requested At</th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((a) => (
                <tr key={a._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    {a?.patient?.name || "—"}
                  </td>

                  <td className="p-3">
                    {a?.doctor?.name || "—"}
                  </td>

                  <td className="p-3">
                    {a?.doctor?.specialization || "—"}
                  </td>

                  <td className="p-3">
                    {a?.requested_at
                      ? new Date(a.requested_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}