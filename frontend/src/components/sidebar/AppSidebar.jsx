// src/components/sidebar/AppSidebar.jsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  Building2,
  Stethoscope,
  Users,
  ClipboardList,
  FileText,
  Calendar,
  BrainCircuit,
  LogOut,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/* ======================================================
   ROLE → MENU CONFIG
====================================================== */

const MENU_CONFIG = {
  platform_admin: [
    { label: "Dashboard", path: "/platform/dashboard", icon: LayoutDashboard },
    { label: "Hospitals", path: "/platform/hospitals", icon: Building2 },
  ],

  hospital_admin: [
    { label: "Dashboard", path: "/hospital/dashboard", icon: LayoutDashboard },
    { label: "Doctors", path: "/hospital/doctors", icon: Stethoscope },
    { label: "Patients", path: "/hospital/patients", icon: Users },
    { label: "Appointments", path: "/hospital/appointments", icon: Users }
  ],

  doctor: [
    { label: "Dashboard", path: "/doctor/dashboard", icon: LayoutDashboard },
    { label: "Appointments", path: "/doctor/appointments", icon: ClipboardList },
    { label: "Patients", path: "/doctor/patients", icon: Users },
  ],

  patient: [
    { label: "Dashboard", path: "/patient", icon: LayoutDashboard },
    { label: "Doctors", path: "/patient/doctors", icon: Stethoscope },
    { label: "Appointments", path: "/patient/appointments", icon: Calendar },
    { label: "My Records", path: "/patient/records", icon: FileText },
    { label: "AI Health Check", path: "/patient/ai-check", icon: BrainCircuit },
  ],
};

/* ======================================================
   SIDEBAR
====================================================== */

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout, loading } = useAuth();
  const role = user?.role;

  // ⛔ Prevent rendering before auth hydration
  if (loading || !role) return null;

  const menuItems = MENU_CONFIG[role] || [];

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {role.replace("_", " ").toUpperCase()}
          </SidebarGroupLabel>

          <SidebarMenu>
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive(item.path)}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenuButton onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}