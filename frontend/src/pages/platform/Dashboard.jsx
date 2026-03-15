import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { toast } from "react-toastify"

import DashboardView from "@/components/platform-admin/DashboardView"

export default function Dashboard() {
  const navigate = useNavigate()

  const [dateRange, setDateRange] = useState("last-6-months")
  const [reportType, setReportType] = useState("summary")
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [exporting, setExporting] = useState(false)

  /* ================= LOAD DASHBOARD ================= */

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  async function loadAnalytics() {
    try {
      setLoading(true)
      setError(false)

      const token = localStorage.getItem("token")

      if (!token) {
        navigate("/login")
        return
      }

      const res = await fetch(
        `http://localhost:5000/api/platform/dashboard?dateRange=${dateRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (res.status === 401 || res.status === 403) {
        localStorage.clear()
        navigate("/login")
        return
      }

      const data = await res.json()
      setAnalytics(data)
    } catch (err) {
      console.error("Dashboard fetch failed", err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  /* ================= EXPORT REPORT (REAL PDF) ================= */

  async function handleExport() {
    try {
      setExporting(true)

      const token = localStorage.getItem("token")

      const res = await fetch(
        `http://localhost:5000/api/platform/report?dateRange=${dateRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!res.ok) {
        throw new Error("Failed to generate report")
      }

      // 🔥 Convert response to Blob (PDF)
      const blob = await res.blob()

      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `platform-report-${dateRange}.pdf`
      document.body.appendChild(a)
      a.click()

      a.remove()
      window.URL.revokeObjectURL(url)

      toast.success("Report downloaded successfully")
    } catch (err) {
      console.error("Export failed:", err)
      toast.error("Export failed")
    } finally {
      setExporting(false)
    }
  }

  /* ================= LOADING UI ================= */

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-60" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  /* ================= ERROR UI ================= */

  if (error || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold">
          Failed to load analytics
        </h3>
        <p className="text-muted-foreground">
          Please check your connection or try logging in again.
        </p>
        <Button className="mt-4" onClick={loadAnalytics}>
          Retry
        </Button>
      </div>
    )
  }

  /* ================= RENDER ================= */

  return (
    <DashboardView
      analytics={analytics}
      dateRange={dateRange}
      setDateRange={setDateRange}
      reportType={reportType}
      setReportType={setReportType}
      onExport={handleExport}
      exporting={exporting}
    />
  )
}