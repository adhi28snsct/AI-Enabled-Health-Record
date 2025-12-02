
import { useEffect, useState, useRef } from "react";
import { api } from "../api/api";

export default function usePollAppointments(patientId, intervalMs = 10000) {
  const [appointments, setAppointments] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!patientId) return;
    let mounted = true;

    const fetchApps = async () => {
      try {
        const res = await api.get("/api/appointments/patient/appointments");
        const list = res.data?.data ?? res.data ?? [];
        if (!mounted) return;
        setAppointments(list);
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    fetchApps();
    timerRef.current = setInterval(fetchApps, intervalMs);
    return () => {
      mounted = false;
      clearInterval(timerRef.current);
    };
  }, [patientId, intervalMs]);

  return [appointments, setAppointments];
}
