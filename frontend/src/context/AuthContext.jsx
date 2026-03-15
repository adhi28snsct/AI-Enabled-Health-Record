import { createContext, useContext, useEffect, useState } from "react";
import { setAuthToken } from "@/api/api";

const AuthContext = createContext(null);

/* ================= DASHBOARD ROUTES ================= */

const getDashboardPathByRole = (role) => {
  switch (role) {
    case "patient":
      return "/patient";
    case "doctor":
      return "/doctor/dashboard";
    case "hospital_admin":
      return "/hospital/dashboard";
    case "platform_admin":
      return "/platform/dashboard";
    default:
      return "/login";
  }
};

/* ================= PROVIDER ================= */

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------- Restore session ---------- */
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedUserId = localStorage.getItem("userId");
    const storedHospitalId = localStorage.getItem("hospitalId");

    if (storedToken && storedRole) {
      setToken(storedToken);
      setUser({
        id: storedUserId || null,
        role: storedRole,                // ✅ FIX
        hospitalId: storedHospitalId || null,
      });

      setAuthToken(storedToken);
    }

    setLoading(false);
  }, []);

  /* ---------- LOGIN ---------- */
  const login = (data) => {

  const userId = data.id || data._id || data.user?._id;

  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("hospitalId", data.hospitalId || "");
  localStorage.setItem("userId", userId || "");

  setToken(data.token);

  setUser({
    id: userId || null,
    role: data.role,
    hospitalId: data.hospitalId || null,
  });

  setAuthToken(data.token);
};

  /* ---------- LOGOUT ---------- */
  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: user?.role,               // optional helper
        loading,
        isAuthenticated: !!token,
        login,
        logout,
        getDashboardPath: () =>
          getDashboardPathByRole(user?.role),
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};