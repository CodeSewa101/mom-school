import { useAuth } from '../../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function ProtectedRoute() {
  const { currentUser, userData } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    if (currentUser && userData) {
      setIsAuthorized(userData.role === 'admin');
    } else {
      setIsAuthorized(false);
    }
  }, [currentUser, userData]);

  if (isAuthorized === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthorized ? <Outlet /> : <Navigate to="/login" replace />;
}