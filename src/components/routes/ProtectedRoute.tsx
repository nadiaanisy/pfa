import React, { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from "../../services/context/AuthContext";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { userEmail } = useAuth();

  if (!userEmail) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
