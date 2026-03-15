import { useEffect, useState } from "react"
import {
  getHospitalDoctors,
  approveDoctor,
  deactivateDoctor,
} from "../../api/hospitalAdmin"

import AddDoctorForm from "../../components/hospitalAdmin/InviteDoctorForm"
import DoctorTable from "../../components/hospitalAdmin/DoctorTable"

export default function HospitalDoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  const loadDoctors = async () => {
    try {
      setLoading(true)
      const res = await getHospitalDoctors()
      setDoctors(res.data)
    } catch (err) {
      console.error("Failed to load doctors", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDoctors()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Hospital Doctors
      </h1>

      <AddDoctorForm onAdded={loadDoctors} />

      {loading ? (
        <p className="text-gray-500">
          Loading doctors…
        </p>
      ) : (
        <DoctorTable
          doctors={doctors}
          onApprove={async (id) => {
            await approveDoctor(id)
            loadDoctors()
          }}
          onDeactivate={async (id) => {
            await deactivateDoctor(id)
            loadDoctors()
          }}
        />
      )}
    </div>
  )
}