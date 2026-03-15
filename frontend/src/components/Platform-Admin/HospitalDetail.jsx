import {
  ArrowLeft,
  Activity,
  Users,
  UserCheck,
  AlertTriangle,
  Stethoscope,
  RefreshCcw,
  Ban,
  CheckCircle2,
} from "lucide-react"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import KpiCard from "@/components/shared/Kpi-Cards"

export default function HospitalDetailView({
  data,
  logs = [],
  onRefresh,
  onToggleStatus,
  statusLoading,
  navigate,
}) {
  const {
    hospitalInfo,
    totals,
    monthlyTrends,
    ageDistribution,
    lastActivity,
    generatedAt,
  } = data

  /* ================= ACTION STYLE MAPPER ================= */

  const getActionStyle = (action) => {
    switch (action) {
      case "CREATE_HOSPITAL":
        return { label: "Hospital Created", variant: "default" }
      case "SUSPEND_HOSPITAL":
        return { label: "Hospital Suspended", variant: "destructive" }
      case "REACTIVATE_HOSPITAL":
        return { label: "Hospital Reactivated", variant: "secondary" }
      default:
        return {
          label: action.replaceAll("_", " "),
          variant: "outline",
        }
    }
  }

  /* ================= KPI CONFIG ================= */

  const kpiConfig = [
    { title: "Total Patients", value: totals.totalPatients, icon: Users },
    { title: "Active Cases", value: totals.activePatients, icon: UserCheck },
    { title: "Staff Doctors", value: totals.totalDoctors, icon: Stethoscope },
    {
      title: "High Risk",
      value: totals.highRiskPatients,
      icon: AlertTriangle,
      color: "text-orange-500",
    },
    {
      title: "Critical Alerts",
      value: totals.criticalAlerts,
      icon: Activity,
      color: "text-destructive",
    },
  ]

  const ageData = ageDistribution.map((item) => ({
    name: item.ageGroup,
    count: item.count,
  }))

  const trendsData = monthlyTrends.map((item) => ({
    name: new Date(item.year, item.month - 1).toLocaleString("default", {
      month: "short",
    }),
    visits: item.visits,
  }))

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 pt-6 w-full">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-8 text-muted-foreground"
            onClick={() => navigate("/platform/hospitals")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>

          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold">{hospitalInfo.name}</h2>

            <Badge
              variant={hospitalInfo.isActive ? "default" : "destructive"}
            >
              {hospitalInfo.isActive ? "Active" : "Suspended"}
            </Badge>
          </div>

          <p className="text-muted-foreground">
            District: {hospitalInfo.district} • Last Activity:{" "}
            {lastActivity
              ? new Date(lastActivity).toLocaleDateString()
              : "N/A"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button
            variant={hospitalInfo.isActive ? "destructive" : "secondary"}
            onClick={onToggleStatus}
            disabled={statusLoading}
          >
            {hospitalInfo.isActive ? (
              <>
                <Ban className="mr-2 h-4 w-4" />
                Suspend Access
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Restore Access
              </>
            )}
          </Button>
        </div>
      </div>

      <Separator />

      {/* ================= KPI GRID ================= */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {kpiConfig.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Appointment Trends</CardTitle>
            <CardDescription>Monthly visit volume</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="visits"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>Patient population breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ================= ADVANCED ACTIVITY TIMELINE ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest governance actions performed on this hospital
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {logs.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No recent activity found.
            </p>
          )}

          {logs.map((log, index) => {
            const style = getActionStyle(log.action)

            return (
              <div key={log._id} className="relative pl-6">

                {/* Timeline Vertical Line */}
                {index !== logs.length - 1 && (
                  <div className="absolute left-2 top-4 h-full w-px bg-border" />
                )}

                {/* Dot */}
                <div className="absolute left-0 top-2 h-3 w-3 rounded-full bg-primary" />

                <div className="space-y-1">
                  <Badge variant={style.variant}>
                    {style.label}
                  </Badge>

                  <p className="text-sm text-muted-foreground">
                    by {log.performedBy?.name || "System"} •{" "}
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* ================= FOOTER ================= */}
      <footer className="text-center text-xs text-muted-foreground pb-10">
        Data snapshot generated at{" "}
        {new Date(generatedAt).toLocaleString()}
      </footer>
    </div>
  )
}