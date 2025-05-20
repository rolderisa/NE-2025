import React from "react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const dashboardUrl = isAdmin ? "/admin/dashboard" : "/dashboard";

  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://parkenterpriseconstruction.com/site/wp-content/uploads/2020/07/image4.jpg')",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Hero content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
          <span className="block">Modern Parking</span>
          <span className="block text-primary-200">
            Management Opportunities
          </span>
        </h1>
        <p className="mt-6 text-xl text-white max-w-2xl mx-auto">
          Manage and optimize parking spaces with our smart parking management
          system
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          {isAuthenticated ? (
            <Button
              to={dashboardUrl}
              variant="secondary"
              size="lg"
              className="bg-white text-primary-700 hover:bg-gray-100 px-8 py-3"
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button
                to="/auth/login"
                variant="secondary"
                size="lg"
                className="px-8 py-3"
              >
                Login
              </Button>
              <Button
                to="/register"
                variant="secondary"
                size="lg"
                className="bg-white text-black hover:bg-gray-100 px-8 py-3"
              >
                Register Now
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
