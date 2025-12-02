import axios from "axios";

const API_BASE = "http://localhost:5000"; 

function getToken() {
  return localStorage.getItem("token");
}

const instance = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

instance.interceptors.request.use(
  (cfg) => {
    const token = getToken();
    if (token) {
      cfg.headers = cfg.headers || {};
      cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
  },
  (err) => Promise.reject(err)
);

export const getAppointmentById = async (id) => {
  if (!id) return null;

  const path = `/api/appointments/${id}`;
  const token = getToken();

  try {
    console.info(`[appointmentService] Token present: ${Boolean(token)} - Requesting: ${instance.defaults.baseURL}${path}`);
    const res = await instance.get(path);
    console.info(`[appointmentService] Success ${res.status}: ${res.request?.responseURL ?? path}`);
    return res.data?.data ?? res.data ?? null;
  } catch (err) {
    const status = err?.response?.status;
    const attemptedUrl = err?.request?.responseURL ?? (instance.defaults.baseURL + path);
    console.warn(`[appointmentService] Error requesting ${attemptedUrl} -> ${status ?? "no status"}`, {
      message: err?.message,
      responseDataPreview: typeof err?.response?.data === "string" ? err.response.data.slice(0, 400) : err?.response?.data,
    });
    if (status === 404) return null;
    throw err;
  }
};

export default { getAppointmentById, instance };
