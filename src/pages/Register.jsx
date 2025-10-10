import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiLock,
  FiCalendar,
  FiUsers,
  FiBriefcase,
  FiKey,
} from 'react-icons/fi';
import backgroundImage from '../assets/home.png';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    dob: '',
    gender: '',
    role: '',
  });

  const [proof, setProof] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === 'role') {
      setProof('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, proof };
    console.log('Registering user:', payload);
    // TODO: Send payload to backend
    // navigate('/login');
  };

  const inputContainerStyle = 'relative';
  const inputIconStyle = 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400';
  const inputStyle =
    'w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="max-w-md w-full bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create an Account</h2>
          <p className="text-gray-600 mt-2">Join us and start your journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className={inputContainerStyle}>
              <FiUser className={inputIconStyle} />
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className={inputStyle}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className={inputContainerStyle}>
              <FiMail className={inputIconStyle} />
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className={inputStyle}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className={inputContainerStyle}>
              <FiLock className={inputIconStyle} />
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className={inputStyle}
              />
            </div>
          </div>

          {/* DOB & Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <div className={inputContainerStyle}>
                <FiCalendar className={inputIconStyle} />
                <input
                  id="dob"
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                />
              </div>
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <div className={inputContainerStyle}>
                <FiUsers className={inputIconStyle} />
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Your Role
            </label>
            <div className={inputContainerStyle}>
              <FiBriefcase className={inputIconStyle} />
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className={inputStyle}
              >
                <option value="">Select Role</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="government">Government Agent</option>
                <option value="hospital">Hospital Management</option>
              </select>
            </div>
          </div>

          {/* Proof Field Based on Role */}
          {form.role && (
            <div>
              <label htmlFor="proof" className="block text-sm font-medium text-gray-700 mb-1">
                {form.role === 'patient'
                  ? 'Aadhar Card Number'
                  : form.role === 'doctor'
                  ? 'Doctor ID Number'
                  : form.role === 'government'
                  ? 'Government ID Number'
                  : 'Hospital Registration Number'}
              </label>
              <div className={inputContainerStyle}>
                <FiKey className={inputIconStyle} />
                <input
                  id="proof"
                  type="text"
                  name="proof"
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
                  required
                  placeholder="Enter your ID"
                  className={inputStyle}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-center text-gray-700 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;