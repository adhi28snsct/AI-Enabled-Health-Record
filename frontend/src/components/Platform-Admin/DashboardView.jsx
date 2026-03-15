import {
  Building2,
  Activity,
  Users,
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  Download,
  Calendar,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import KpiCard from "@/components/shared/Kpi-Cards"
import ReportGenerator from "@/components/ReportGenrator"

export default function DashboardView({
  analytics,
  dateRange,
  setDateRange,
  reportType,
  setReportType,
  onExport,        // ✅ connected to backend
  exporting,       // ✅ loading state
}) {
  const { totals } = analytics || {}

  /* ================= SAFE VALUES ================= */

  const totalHospitals = totals?.totalHospitals || 0
  const activeHospitals = totals?.activeHospitals || 0
  const suspendedHospitals =
    totals?.suspendedHospitals ??
    totalHospitals - activeHospitals

  /* ================= KPI CONFIG ================= */

  const kpiConfig = [
    {
      title: "Total Hospitals",
      value: totalHospitals,
      icon: Building2,
      description: "All registered hospitals",
    },
    {
      title: "Active Hospitals",
      value: activeHospitals,
      icon: Activity,
      color: "text-green-600",
    },
    {
      title: "Suspended Hospitals",
      value: suspendedHospitals,
      icon: AlertTriangle,
      color: "text-destructive",
    },
    {
      title: "Total Doctors",
      value: totals?.totalDoctors || 0,
      icon: UserCheck,
      description: "Platform-wide medical staff",
    },
    {
      title: "Total Patients",
      value: totals?.totalPatients || 0,
      icon: Users,
      description: "All registered patients",
    },
    {
      title: "High Risk Cases",
      value: totals?.highRiskPatients || 0,
      icon: ShieldAlert,
      color: "text-orange-500",
    },
  ]

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 pt-6">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Platform Governance Dashboard
          </h2>
          <p className="text-muted-foreground">
            System-wide monitoring and administrative control
          </p>
        </div>

        <div className="flex items-center gap-2">

          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="all">All Time</option>
            <option value="last-6-months">Last 6 Months</option>
          </select>

          {/* Export Button */}
          <Button size="sm" onClick={onExport} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Exporting..." : "Export Snapshot"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* ================= KPI GRID ================= */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpiConfig.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* ================= SYSTEM STATUS ================= */}
      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle>System Health Overview</CardTitle>
          <CardDescription>
            Administrative summary of platform activity
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Active hospitals are operational and accepting patients.</p>
          <p>• Suspended hospitals have restricted access automatically.</p>
          <p>• Risk alerts are aggregated from all connected hospitals.</p>
        </CardContent>
      </Card>

      {/* ================= REPORT SECTION ================= */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-6">
          <ReportGenerator
            reportType={reportType}
            setReportType={setReportType}
            dateRange={dateRange}
            setDateRange={setDateRange}
            onExport={onExport}
          />
        </CardContent>
      </Card>

    </div>
  )
}