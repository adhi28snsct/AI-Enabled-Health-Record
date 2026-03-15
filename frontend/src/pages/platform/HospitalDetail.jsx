import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../../api/api";
import HospitalDetailView from "@/components/Platform-Admin/HospitalDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ================= API HELPERS ================= */

const getHospitalAnalytics = (id) =>
  api.get(`/platform/hospitals/${id}/analytics`);

const getHospitalLogs = (id) =>
  api.get(`/platform/hospitals/${id}/logs`);

const updateHospitalStatus = (id, isActive) =>
  api.patch(`/platform/hospitals/${id}/status`, { isActive });

export default function HospitalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  /* ================= FETCH ALL DATA ================= */

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [analyticsRes, logsRes] = await Promise.all([
        getHospitalAnalytics(id),
        getHospitalLogs(id),
      ]);

      setData(analyticsRes.data);
      setLogs(logsRes.data);

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load hospital details"
      );

      if (err.response?.status === 404) {
        navigate("/platform/hospitals");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= TOGGLE STATUS ================= */

  const handleToggleStatus = async () => {
    if (!data?.hospitalInfo) return;

    try {
      setStatusLoading(true);

      const newStatus = !data.hospitalInfo.isActive;

      await updateHospitalStatus(id, newStatus);

      toast.success(
        `Hospital ${newStatus ? "reactivated" : "suspended"}`
      );

      // Optimistic UI update
      setData((prev) => ({
        ...prev,
        hospitalInfo: {
          ...prev.hospitalInfo,
          isActive: newStatus,
        },
      }));

      // Refresh logs to show action immediately
      const logsRes = await getHospitalLogs(id);
      setLogs(logsRes.data);

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Status update failed"
      );
    } finally {
      setStatusLoading(false);
    }
  };

  /* ================= LOADING STATE ================= */

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  /* ================= ERROR STATE ================= */

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold">Hospital not found</h3>
        <Button
          className="mt-4"
          onClick={() => navigate("/platform/hospitals")}
        >
          Back to List
        </Button>
      </div>
    );
  }

  /* ================= RENDER VIEW ================= */

  return (
    <HospitalDetailView
      data={data}
      logs={logs}              // ✅ NEW
      onRefresh={fetchAll}     // refresh both analytics + logs
      onToggleStatus={handleToggleStatus}
      statusLoading={statusLoading}
      navigate={navigate}
    />
  );
}