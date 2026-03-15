import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import HospitalsView from "@/components/Platform-Admin/HospitalsTable"

export default function HospitalsPage() {
  const navigate = useNavigate()

  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  // Pagination & Filters
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [districtFilter, setDistrictFilter] = useState("")
  const [totalPages, setTotalPages] = useState(1)

  const [form, setForm] = useState({
    hospitalName: "",
    district: "",
    managerEmail: "",
  })

  /* ================= FETCH ================= */

  async function fetchHospitals() {
    try {
      setLoading(true)

      const token = localStorage.getItem("token")

      const params = new URLSearchParams({
        page,
        limit,
      })

      if (search) params.append("search", search)
      if (statusFilter) params.append("status", statusFilter)
      if (districtFilter) params.append("district", districtFilter)

      const res = await fetch(
        `http://localhost:5000/api/platform/hospitals?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch hospitals")
      }

      // ✅ FIXED RESPONSE STRUCTURE
      setHospitals(data.data || [])
      setTotalPages(data.meta?.totalPages || 1)

    } catch (err) {
      console.error("Fetch Hospitals Error:", err)
      toast.error(err.message || "Failed to load hospitals")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHospitals()
  }, [page, search, statusFilter, districtFilter])

  /* ================= CREATE ================= */

  async function handleCreateHospital(formData) {
    setSubmitting(true)

    try {
      const token = localStorage.getItem("token")

      const res = await fetch(
        "http://localhost:5000/api/platform/hospitals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.hospitalName,
            district: formData.district,
            managerEmail: formData.managerEmail,
          }),
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success("Hospital created successfully")

      setOpen(false)
      setForm({
        hospitalName: "",
        district: "",
        managerEmail: "",
      })

      fetchHospitals()
    } catch (err) {
      toast.error(err.message || "Creation failed")
    } finally {
      setSubmitting(false)
    }
  }

  /* ================= STATUS ================= */

  async function toggleHospitalStatus(hospital) {
    const action = hospital.isActive ? "suspend" : "reactivate"

    const confirmAction = window.confirm(
      `Are you sure you want to ${action} this hospital?`
    )
    if (!confirmAction) return

    try {
      setUpdatingId(hospital._id)

      const token = localStorage.getItem("token")

      const res = await fetch(
        `http://localhost:5000/api/platform/hospitals/${hospital._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: !hospital.isActive,
          }),
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success(data.message)

      // Optimistic update
      setHospitals((prev) =>
        prev.map((h) =>
          h._id === hospital._id
            ? { ...h, isActive: !hospital.isActive }
            : h
        )
      )
    } catch (err) {
      toast.error(err.message || "Status update failed")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <HospitalsView
      hospitals={hospitals}
      loading={loading}
      open={open}
      setOpen={setOpen}
      form={form}
      setForm={setForm}
      submitting={submitting}
      updatingId={updatingId}
      onCreate={handleCreateHospital}
      onToggleStatus={toggleHospitalStatus}
      navigate={navigate}
      search={search}
      setSearch={setSearch}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      districtFilter={districtFilter}
      setDistrictFilter={setDistrictFilter}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
    />
  )
}