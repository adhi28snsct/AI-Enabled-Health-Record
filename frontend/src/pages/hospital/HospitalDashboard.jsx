import { useEffect, useState } from "react"
import { getHospitalStats } from "../../api/hospitalAdmin"
import KpiCard from "@/components/shared/Kpi-Cards" // ✅ correct file name
import { Users, Calendar, Heart } from "lucide-react"

export default function HospitalAdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      setLoading(true)
      const res = await getHospitalStats()

      // ✅ Axios returns { data: {...} }
      setStats(res.data)
    } catch (err) {
      console.error("Failed to load stats", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          Loading dashboard…
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">
        Hospital Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-3">

        <KpiCard
          title="Active Doctors"
          value={stats?.doctors || 0}
          icon={Users}          // ✅ pass component, not JSX
          color="text-blue-500"
        />

        <KpiCard
          title="Patients"
          value={stats?.patients || 0}
          icon={Heart}          // ✅ correct
          color="text-rose-500"
        />

        <KpiCard
          title="Appointments"
          value={stats?.appointments || 0}
          icon={Calendar}       // ✅ correct
          color="text-green-500"
        />

      </div>
    </div>
  )
}