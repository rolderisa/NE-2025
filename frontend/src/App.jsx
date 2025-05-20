import React,{ useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoadingScreen from './components/ui/LoadingScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import LogsTable from './pages/admin/LogsTable';

// Public pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));


// User pages
const UserDashboard = lazy(() => import('./pages/user/Dashboard'));
const BookingForm = lazy(() => import('./pages/user/BookingForm'));
const UserBookings = lazy(() => import('./pages/user/Bookings'));
const BookingDetails = lazy(() => import('./pages/user/BookingDetails'));
const UserProfile = lazy(() => import('./pages/user/Profile'));
const Vehicles = lazy(() => import('./pages/user/vehicles'));
const AddVehicleForm = lazy(() => import('./pages/user/AddVehicleForm')); 
const EditVehicleForm = lazy(() => import('./pages/user/EditVehicleForm'));
const VehicleDetails = lazy(() => import('./pages/user/VehicleDetails'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminParkingSlots = lazy(() => import('./pages/admin/ParkingSlots'));
const AdminPaymentPlans = lazy(() => import('./pages/admin/PaymentPlans'));

function App() {
  const { loading, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/resetPassword" element={<ResetPassword />} />
          
        </Route>

        {/* User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/bookings" element={<UserBookings />} />
            <Route path="/bookings/new" element={<BookingForm />} />
            <Route path="/bookings/:id" element={<BookingDetails />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/vehicles/:id" element={<VehicleDetails />} />
            <Route path="/vehicles/add" element={<AddVehicleForm />} />
            <Route path="/vehicles/edit/:id" element={<EditVehicleForm />} />

          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            {/* <Route path="/admin/bookings" element={<AdminBookings />} /> */}
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/parking-slots" element={<AdminParkingSlots />} />
            <Route path="/admin/payment-plans" element={<AdminPaymentPlans />} />
            <Route path="/admin/logstable" element={<LogsTable />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;