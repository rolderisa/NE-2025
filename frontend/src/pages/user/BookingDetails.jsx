import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Car, CreditCard, AlertTriangle, 
  CheckCircle, Trash2, Download, ArrowLeft, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBookingDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/bookings/${id}`);
        setBooking(response.data);
        console.log('Fetched booking:', response.data); // Debug log
      } catch (error) {
        console.error('Error fetching booking details:', error);
        toast.error('Failed to load booking details');
        navigate('/bookings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [id, navigate]);
  
  const handleCancel = async () => {
    try {
      await api.put(`/bookings/${id}`, { status: 'CANCELLED' });
      toast.success('Booking cancelled successfully');
      
      // Refresh booking data
      const response = await api.get(`/bookings/${id}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };
  
  const handlePayment = async () => {
    try {
      await api.post(`/bookings/${id}/pay`);
      toast.success('Payment completed successfully');
      
      // Refresh booking data
      const response = await api.get(`/bookings/${id}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    }
  };
  
  const downloadBookingPDF = async () => {
    try {
      const response = await api.get(`/bookings/${id}/pdf`, {
        responseType: 'blob'
      });
      
      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `booking-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up and remove the link
      link.parentNode.removeChild(link);
      
      toast.success('Booking details downloaded successfully');
    } catch (error) {
      console.error('Error downloading booking PDF:', error);
      toast.error('Failed to download booking details');
    }
  };
  
  const handleExitSlot = async () => {
    try {
      await api.put(`/bookings/${id}/exit`);
      toast.success('Successfully exited the slot');
      
      // Refresh booking data
      const response = await api.get(`/bookings/${id}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Error exiting slot:', error);
      toast.error('Failed to exit slot');
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate - startDate;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      
      if (remainingHours === 0) {
        return `${days} day${days !== 1 ? 's' : ''}`;
      } else {
        return `${days} day${days !== 1 ? 's' : ''} and ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
      }
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-success-50 border-success-200';
      case 'PENDING':
        return 'bg-warning-50 border-warning-200';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-error-50 border-error-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  
  // Adjusted canExitSlot to allow exit during APPROVED status, not just after endTime
  const canExitSlot = booking && booking.status === 'APPROVED';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!booking) {
    return (
      <div className="text-center py-12">
        <AlertTriangle size={48} className="mx-auto text-error-500" />
        <h2 className="mt-4 text-xl font-medium text-gray-900">Booking Not Found</h2>
        <p className="mt-2 text-gray-500">The booking you're looking for doesn't exist or you don't have access to it.</p>
        <Button to="/bookings" variant="primary" className="mt-6">
          View All Bookings
        </Button>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="mr-2"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate('/bookings')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
            <p className="mt-1 text-gray-600">
              Booking #{booking.id.substring(0, 8)}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-4 sm:mt-0">
          {booking.status === 'PENDING' && (
            <Button
              variant="danger"
              icon={<Trash2 size={16} />}
              onClick={handleCancel}
            >
              Cancel Booking
            </Button>
          )}
          
          {canExitSlot && (
            <Button
              variant="danger"
              icon={<LogOut size={16} />}
              onClick={handleExitSlot}
            >
              Exit Slot
            </Button>
          )}
          
          <Button
            variant="secondary"
            icon={<Download size={16} />}
            onClick={downloadBookingPDF}
          >
            Download PDF
          </Button>
        </div>
      </div>
      
      {/* Status Banner */}
      <div className={`
        mb-8 p-4 rounded-lg border ${getStatusColor(booking.status)}
      `}>
        <div className="flex items-center">
          {booking.status === 'APPROVED' ? (
            <CheckCircle size={24} className="text-success-500" />
          ) : booking.status === 'PENDING' ? (
            <Clock size={24} className="text-warning-500" />
          ) : (
            <AlertTriangle size={24} className="text-error-500" />
          )}
          
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Booking Status: <StatusBadge status={booking.status} className="ml-2" />
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {booking.status === 'PENDING' && 'Your booking is awaiting approval.'}
              {booking.status === 'APPROVED' && 'Your booking has been approved.'}
              {booking.status === 'REJECTED' && 'Your booking has been rejected.'}
              {booking.status === 'CANCELLED' && 'Your booking has been cancelled.'}
              {booking.status === 'COMPLETED' && 'Your booking has been completed.'}
              {booking.status === 'EXPIRED' && 'Your booking has expired.'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Parking Information */}
        <Card className="md:col-span-2">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Parking Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Parking Slot</p>
              <div className="flex items-center mt-1">
                <Car size={18} className="text-gray-500 mr-2" />
                <p className="text-lg font-medium">
                  {booking.parkingSlot.slotNumber} 
                  <span className="ml-2 text-sm text-gray-500">
                    ({booking.parkingSlot.type})
                  </span>
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Vehicle</p>
              <div className="flex items-center mt-1">
                <Car size={18} className="text-gray-500 mr-2" />
                <p className="text-lg font-medium">
                  {booking.vehicle?.plateNumber || 'N/A'}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="text-lg font-medium mt-1">
                {calculateDuration(booking.startTime, booking.endTime)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Start Time</p>
              <div className="flex items-center mt-1">
                <Calendar size={18} className="text-gray-500 mr-2" />
                <p className="text-base">{formatDate(booking.startTime)}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">End Time</p>
              <div className="flex items-center mt-1">
                <Calendar size={18} className="text-gray-500 mr-2" />
                <p className="text-base">{formatDate(booking.endTime)}</p>
              </div>
            </div>
          </div>
          
          <div className="divider"></div>
          
          <div>
            <p className="text-sm text-gray-500">Booking Created</p>
            <p className="text-base mt-1">{formatDate(booking.createdAt)}</p>
          </div>
        </Card>
        
        {/* Payment Information */}
        <Card>
          <h2 className="text-xl font-medium text-gray-900 mb-4">Payment Information</h2>
          
          {booking.payment ? (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Payment Plan</p>
                <p className="text-lg font-medium mt-1">{booking.payment.plan.name}</p>
                <p className="text-sm text-gray-500 mt-1">{booking.payment.plan.description}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${booking.payment.amount.toFixed(2)}
                </p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Status</p>
                <StatusBadge 
                  status={booking.payment.status} 
                  className="mt-1" 
                />
              </div>
              
              {booking.status === 'APPROVED' && !booking.isPaid && (
                <Button
                  variant="success"
                  fullWidth
                  icon={<CreditCard size={18} />}
                  onClick={handlePayment}
                >
                  Complete Payment
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <CreditCard size={36} className="mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">No payment information available</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BookingDetails;