import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu, X, LogOut, User, Home, CalendarCheck, Plus, Car
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
            <div className="flex items-center">
              <Car size={24} className="text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ParkLot</span>
            </div>
            <button
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Sidebar nav links */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `menu-item ${isActive ? 'menu-item-active' : 'menu-item-inactive'}`
              }
            >
              <Home size={20} className="mr-3" />
              Dashboard
            </NavLink>
            <NavLink
              to="/vehicles"
              className={({ isActive }) =>
                `menu-item ${isActive ? 'menu-item-active' : 'menu-item-inactive'}`
              }
            >
              <Car size={20} className="mr-3" />
              Vehicles
            </NavLink>
            <NavLink
              to="/bookings"
              className={({ isActive }) =>
                `menu-item ${isActive ? 'menu-item-active' : 'menu-item-inactive'}`
              }
            >
              <CalendarCheck size={20} className="mr-3" />
              My Bookings
            </NavLink>
            <NavLink
              to="/bookings/new"
              className={({ isActive }) =>
                `menu-item ${isActive ? 'menu-item-active' : 'menu-item-inactive'}`
              }
            >
              <Plus size={20} className="mr-3" />
              New Booking
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `menu-item ${isActive ? 'menu-item-active' : 'menu-item-inactive'}`
              }
            >
              <User size={20} className="mr-3" />
              My Profile
            </NavLink>
          </nav>

          {/* Sidebar footer */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                <span className="font-medium text-sm">
                  {user?.name?.[0].toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              fullWidth
              className="mt-4"
              icon={<LogOut size={16} />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <button
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={24} className="text-gray-600" />
              </button>
              
            </div>
          </div>
        </header>

        {/* Page outlet (renders current route's content) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <p className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} ParkEase. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;