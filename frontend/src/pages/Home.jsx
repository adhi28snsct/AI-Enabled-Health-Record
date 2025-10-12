import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import backgroundImage from '../assets/home.png'; 

const Home = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat px-6 py-12"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="max-w-5xl mx-auto text-center mb-16 bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-lg">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-green-500 rounded-2xl mb-4 shadow-lg">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-gray-800 mb-4 tracking-tight">
          HealthConnect Platform
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          A comprehensive healthcare management system built by student innovators from SNS College of Technology, Coimbatore. Our mission is to bridge the healthcare gap in rural India using AI and cloud technology.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link to="/login" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Login
          </Link>
          <Link to="/register" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Register
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-16 bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Story: Bridging the Gap in Rural Healthcare</h2>
        <p className="text-gray-700 mb-4">
          Our journey began with a simple question: Why should access to quality healthcare depend on where you live? In many parts of rural India, medical histories are scattered across paper files, leading to lost records, repeated tests, and critical delays in treatment.
        </p>
        <p className="text-gray-700 mb-4">
          We are a team of passionate engineering students from SNS College of Technology in Coimbatore, and we believed technology could be the answer.
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li><strong>Unified Health Record:</strong> Secure digital records accessible by authorized providers.</li>
          <li><strong>AI-Powered Insights:</strong> Predictive diagnostics for Diabetes, Anemia, and Tuberculosis.</li>
          <li><strong>Offline & Multilingual:</strong> Designed for low-connectivity and diverse linguistic regions.</li>
        </ul>
        <p className="text-gray-700">
          We are committed to leveraging our skills in AI and ML to create a tangible impact, ensuring every individual has the foundation for a healthier future.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-gray-100 bg-black/40 py-4 rounded">
        Demo Platform • All data shown is mock data for demonstration purposes
      </div>
    </div>
  );
};

export default Home;