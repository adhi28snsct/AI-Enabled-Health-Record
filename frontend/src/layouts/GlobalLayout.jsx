import { Outlet } from "react-router-dom";
import Navbar from "../components/NavBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GlobalLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Toast Notifications */}
      <ToastContainer position="top-right" />

      {/* Navigation */}
      <Navbar />

      {/* Page Content */}
      <main className="p-4">
        <Outlet />
      </main>

      {/* Optional Footer */}
      <footer className="text-center text-sm text-gray-500 py-4">
        © {new Date().getFullYear()} HealthConnect • Built with ❤️ by SNS Techies
      </footer>
    </div>
  );
};

export default GlobalLayout;