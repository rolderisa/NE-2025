import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Car, Calendar, DollarSign, 
  CheckCircle, Clock, AlertTriangle 
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSlots: 0,
    availableSlots: 0,
    activeBookings: 0,
    revenue: 0,
    recentBookings: [],
    bookingStatusCounts: {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      CANCELLED: 0,
      COMPLETED: 0,
      EXPIRED: 0
    },
    slotTypeCounts: {
      VIP: 0,
      REGULAR: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);
  
  // Prepare chart data
  const bookingStatusData = {
    labels: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed', 'Expired'],
    datasets: [
      {
        data: [
          stats.bookingStatusCounts.PENDING,
          stats.bookingStatusCounts.APPROVED,
          stats.bookingStatusCounts.REJECTED,
          stats.bookingStatusCounts.CANCELLED,
          stats.bookingStatusCounts.COMPLETED,
          stats.bookingStatusCounts.EXPIRED
        ],
        backgroundColor: [
          '#f59e0b', // warning - pending
          '#10b981', // success - approved
          '#ef4444', // error - rejected
          '#6b7280', // gray - cancelled
          '#3b82f6', // primary - completed
          '#9ca3af'  // gray-400 - expired
        ],
        borderWidth: 1
      }
    ]
  };
  
  const slotTypeData = {
    labels: ['VIP', 'Regular'],
    datasets: [
      {
        data: [stats.slotTypeCounts.VIP, stats.slotTypeCounts.REGULAR],
        backgroundColor: ['#f59e0b', '#3b82f6'],
        borderWidth: 1
      }
    ]
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-gray-600">Overview of your parking management system</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-blue-50 border border-blue-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-green-50 border border-green-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Car size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Available Slots</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.availableSlots}/{stats.totalSlots}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-amber-50 border border-amber-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <Calendar size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-amber-600">Active Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeBookings}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-indigo-50 border border-indigo-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <DollarSign size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-indigo-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.revenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Bookings */}
        <Card title="Recent Bookings" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.parkingSlot.slotNumber} ({booking.parkingSlot.type})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-right">
            <Button to="/admin/bookings" variant="secondary">
              View All Bookings
            </Button>
          </div>
        </Card>
        
        {/* Status Chart */}
        <Card title="Booking Status" className="h-full flex flex-col">
          <div className="flex-grow">
            <Pie 
              data={bookingStatusData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  }
                }
              }}
            />
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Slot Distribution */}
        <Card title="Parking Slot Distribution">
          <div className="h-64">
            <Pie 
              data={slotTypeData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  }
                }
              }}
            />
          </div>
          
          <div className="mt-4 text-right">
            <Button to="/admin/parking-slots" variant="secondary">
              Manage Slots
            </Button>
          </div>
        </Card>
        
        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="space-y-4">
            <Link to="/admin/bookings">
              <div className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center cursor-pointer">
                <Calendar size={24} className="text-primary-600 mr-3" />
                <div>
                  <h3 className="font-medium">Manage Bookings</h3>
                  <p className="text-sm text-gray-600">Approve or reject booking requests</p>
                </div>
              </div>
            </Link>
            
            <Link to="/admin/parking-slots">
              <div className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center cursor-pointer">
                <Car size={24} className="text-primary-600 mr-3" />
                <div>
                  <h3 className="font-medium">Manage Parking Slots</h3>
                  <p className="text-sm text-gray-600">Add, edit or remove parking slots</p>
                </div>
              </div>
            </Link>
            
            <Link to="/admin/users">
              <div className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center cursor-pointer">
                <Users size={24} className="text-primary-600 mr-3" />
                <div>
                  <h3 className="font-medium">Manage Users</h3>
                  <p className="text-sm text-gray-600">View and search user accounts</p>
                </div>
              </div>
            </Link>
            
            <Link to="/admin/payment-plans">
              <div className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center cursor-pointer">
                <DollarSign size={24} className="text-primary-600 mr-3" />
                <div>
                  <h3 className="font-medium">Manage Payment Plans</h3>
                  <p className="text-sm text-gray-600">Configure payment options</p>
                </div>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;