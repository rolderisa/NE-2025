import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Car } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side with background image and overlay */}
      <div
        className="hidden lg:block lg:w-1/2 relative overflow-hidden"
        style={{
          backgroundImage: "url('https://parkenterpriseconstruction.com/site/wp-content/uploads/2020/07/image4.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black bg-opacity-40 z-0"></div>

        {/* Branding message */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 text-center px-10">
          <Car className="h-12 w-12 mb-4" />
          <h1 className="text-3xl font-bold">Smart Parking, Smarter Life</h1>
          <p className="mt-2 text-lg">
            Reserve your spot before someone else grabs it.
          </p>
        </div>
      </div>

      {/* Right side with form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
