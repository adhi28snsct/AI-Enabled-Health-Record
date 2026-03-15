import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(path + "/");

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 text-blue-600 font-bold text-xl"
      >
        <Heart className="w-6 h-6" />
        HealthConnect
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-6 text-gray-700 font-medium">
        {/* Logged in */}
        {user ? (
          <>
            <span className="text-sm text-gray-500">
              {user.role.replace("_", " ").toUpperCase()}
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className={`hover:text-blue-600 ${
                isActive("/login") ? "text-blue-600 font-semibold" : ""
              }`}
            >
              Login
            </Link>

            <Link
              to="/register"
              className={`hover:text-blue-600 ${
                isActive("/register") ? "text-blue-600 font-semibold" : ""
              }`}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;