import { Link, useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { label: 'Dashboard', path: '/' },
    { label: 'Login', path: '/login' },
    { label: 'Register', path: '/register' },
  ];

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
        <Heart className="w-6 h-6" />
        HealthConnect
      </Link>

      {/* Navigation Links */}
      <div className="flex gap-6 text-gray-700 font-medium">
        {navLinks.map(({ label, path }) => (
          <Link
            key={label}
            to={path}
            className={`hover:text-blue-600 transition ${
              location.pathname === path ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;