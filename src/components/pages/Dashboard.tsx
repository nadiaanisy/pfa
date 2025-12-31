import React from'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/context/AuthContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">👋 Hello, Welcome to Your Dashboard!</h1>
        <p className="text-gray-600 mb-6">
          This is your personal finance app. Start managing your finances now.
        </p>

        <button
          onClick={handleLogout}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
