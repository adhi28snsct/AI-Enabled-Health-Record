import { useEffect, useState } from "react"
import { getHospitalPatients } from "../../api/hospitalAdmin"

export default function HospitalPatientsPage() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  const loadPatients = async () => {
    try {
      setLoading(true)
      const res = await getHospitalPatients()

      // ✅ IMPORTANT FIX
      setPatients(res.data || [])
    } catch (err) {
      console.error("Failed to load patients", err)
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Hospital Patients
      </h1>

      {loading ? (
        <p className="text-muted-foreground">Loading patients…</p>
      ) : patients.length === 0 ? (
        <p className="text-muted-foreground">No patients found</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Phone</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.phone || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}