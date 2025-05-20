import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu, X, LogOut, User, Home, CalendarCheck,
  Car, CreditCard, Users, Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-30 inset-y-0 left-0 w-64 transform bg-gray-900 text-white shadow-lg transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700">
            <div className="flex items-center">
              <Car size={24} className="text-primary-400" />
              <span className="ml-2 text-xl font-bold">Admin Panel</span>
            </div>
            <button
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          {/* Sidebar content */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {[
              { to: '/admin/dashboard', label: 'Dashboard', icon: <Home size={20} className="mr-3" /> },
              { to: '/admin/users', label: 'Users', icon: <Users size={20} className="mr-3" /> },
              { to: '/admin/bookings', label: 'Bookings', icon: <CalendarCheck size={20} className="mr-3" /> },
              { to: '/admin/parking-slots', label: 'Parking Slots', icon: <Car size={20} className="mr-3" /> },
              { to: '/admin/payment-plans', label: 'Payment Plans', icon: <CreditCard size={20} className="mr-3" /> },
              { to: '/admin/logstable', label: 'Logs Show', icon: <CreditCard size={20} className="mr-3" /> },
            ].map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                {icon}
                {label}
              </NavLink>
            ))}

            <div className="px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4">
              Reports
            </div>

            {[
              { to: '/admin/users/export', label: 'Export Users' },
              { to: '/admin/bookings/export', label: 'Export Bookings' },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <Download size={20} className="mr-3" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="px-4 py-4 border-t border-gray-700">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center">
                <span className="font-medium text-sm">{user?.name?.[0].toUpperCase()}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">Administrator</p>
              </div>
            </div>
            <Button
              variant="secondary"
              fullWidth
              className="mt-4 border-gray-700 text-gray-300 hover:bg-gray-800"
              icon={<LogOut size={16} />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden ">
        {/* Header */}
        <header className="bg-white shadow-sm z-10 flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <button className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} className="text-gray-600" />
              </button>
              <div className="ml-4 flex items-center md:ml-6">
                <div className="hidden md:block font-medium">Admin Control Panel</div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 flex-shrink-0">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <p className="text-sm text-gray-500 text-center">
              &copy; {new Date().getFullYear()} ParkEase Admin Panel. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
