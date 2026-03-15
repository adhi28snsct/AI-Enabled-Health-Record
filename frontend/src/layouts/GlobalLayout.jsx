import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/NavBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/sidebar/AppSidebar";

const GlobalLayout = () => {
  const location = useLocation();

  const hideSidebarRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  const hideSidebar = hideSidebarRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <SidebarProvider>
      {/* w-full ensures the container spans the entire viewport width */}
      <div className="min-h-screen flex w-full bg-gray-50 overflow-x-hidden">
        {!hideSidebar && <AppSidebar />}

        {/* flex-1 grows to fill the remaining width. min-w-0 prevents chart overflow. */}
        <div className="flex-1 flex flex-col min-w-0">
          <ToastContainer position="top-right" autoClose={3000} />

          <Navbar />

          {/* main is now set to w-full to utilize all available space */}
          <main className="flex-1 p-4 md:p-8 w-full">
            <Outlet />
          </main>

          <footer className="text-center text-sm text-gray-500 py-6 border-t bg-white w-full">
            © {new Date().getFullYear()} HealthConnect • Built with ❤️ by SNS Techies
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default GlobalLayout;