import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Fetch user bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/bookings', {
          params: { limit: 5 }
        });
        setBookings(response.data.bookings);
        
        // Calculate stats
        const bookingCounts = {
          total: response.data.totalCount,
          pending: 0,
          approved: 0,
          completed: 0,
          cancelled: 0
        };
        
        response.data.bookings.forEach(booking => {
          const status = booking.status.toLowerCase();
          if (bookingCounts[status] !== undefined) {
            bookingCounts[status]++;
          }
        });
        
        setStats(bookingCounts);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle size={20} className="text-success-500" />;
      case 'PENDING':
        return <Clock size={20} className="text-warning-500" />;
      case 'CANCELLED':
      case 'REJECTED':
        return <AlertTriangle size={20} className="text-error-500" />;
      default:
        return <Calendar size={20} className="text-gray-500" />;
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
        <p className="mt-1 text-gray-600">Manage your parking spaces and bookings</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-primary-50 border border-primary-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              <Calendar size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-primary-600">Total Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-warning-50 border border-warning-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-warning-100 text-warning-600">
              <Clock size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-warning-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-success-50 border border-success-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-success-100 text-success-600">
              <CheckCircle size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-success-600">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gray-50 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100 text-gray-600">
              <Car size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed/Cancelled</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completed + stats.cancelled}</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Recent Bookings */}
      <Card title="Recent Bookings" className="mb-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car size={16} className="mr-2 text-gray-500" />
                        <span className="font-medium">{booking.parkingSlot.slotNumber}</span>
                        <span className="ml-1 text-xs text-gray-500">({booking.parkingSlot.type})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDate(booking.startTime)}</div>
                      <div>to</div>
                      <div>{formatDate(booking.endTime)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(booking.status)}
                        <StatusBadge status={booking.status} className="ml-2" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {booking.isPaid ? (
                        <span className="text-success-600 font-medium">Paid</span>
                      ) : (
                        <span className="text-gray-500">Unpaid</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Car size={48} className="mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No bookings yet</h3>
            <p className="mt-1 text-gray-500">Get started by booking a parking space.</p>
            <div className="mt-6">
              <Button to="/bookings/new" variant="primary">
                Book a Slot
              </Button>
            </div>
          </div>
        )}
        
        {bookings.length > 0 && (
          <div className="mt-4 text-right">
            <Button to="/bookings" variant="secondary">
              View All Bookings
            </Button>
          </div>
        )}
      </Card>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary-50 hover:bg-primary-100 transition-colors duration-200 cursor-pointer">
          <Link to="/bookings/new" className="block">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-full bg-primary-100 text-primary-600">
                <Car size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Book a Parking Slot</h3>
                <p className="text-sm text-gray-600">Reserve a spot for your vehicle</p>
              </div>
            </div>
          </Link>
        </Card>
        
        <Card className="bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
          <Link to="/bookings" className="block">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-full bg-gray-200 text-gray-600">
                <Calendar size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">View My Bookings</h3>
                <p className="text-sm text-gray-600">Manage your current reservations</p>
              </div>
            </div>
          </Link>
        </Card>
        
        <Card className="bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
          <Link to="/profile" className="block">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-full bg-gray-200 text-gray-600">
                <Car size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">My Profile</h3>
                <p className="text-sm text-gray-600">View and update your information</p>
              </div>
            </div>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;