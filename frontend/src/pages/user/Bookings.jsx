import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Car, Filter, Search, Download, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalCount: 0
  });
  
  const [filters, setFilters] = useState({
    status: '',
  });
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
 const fetchBookings = async () => {
  setLoading(true);

  // Clean out empty filters
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== '')
  );

  try {
    const response = await api.get('/bookings', {
      params: {
        page: pagination.page?.toString() || '1',
        limit: pagination.limit?.toString() || '10',
        ...cleanFilters
      }
    });

    const { bookings, page, limit, totalPages, totalCount } = response.data;

    setBookings(bookings);
    setPagination({
      page: Number(page),
      limit: Number(limit),
      totalPages,
      totalCount
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    toast.error('Failed to load bookings');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchBookings();
  }, [pagination.page, filters]);
  
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const clearFilters = () => {
    setFilters({ status: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const downloadBookingPDF = async (id) => {
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
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  const columns = [
    {
      header: 'Parking Slot',
      accessor: 'parkingSlot',
      cell: (row) => (
        <div className="flex items-center">
          <Car size={16} className="mr-2 text-gray-500" />
          <span className="font-medium">{row.parkingSlot.slotNumber}</span>
          <span className="ml-1 text-xs text-gray-500">
            ({row.parkingSlot.type})
          </span>
        </div>
      ),
    },
    {
      header: 'Start Time',
      accessor: 'startTime',
      cell: (row) => formatDate(row.startTime),
    },
    {
      header: 'End Time',
      accessor: 'endTime',
      cell: (row) => formatDate(row.endTime),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Payment',
      accessor: 'isPaid',
      cell: (row) => {
        if (row.isPaid) {
          return <span className="text-success-600 font-medium">Paid</span>;
        }
        if (row.status === 'APPROVED') {
          return (
            <Button
              size="sm"
              variant="success"
              className="text-xs py-1"
              onClick={() => handlePayment(row.id)}
            >
              Pay Now
            </Button>
          );
        }
        return <span className="text-gray-500">Unpaid</span>;
      },
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2 justify-end">
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-600"
            onClick={() => downloadBookingPDF(row.id)}
            title="Download PDF"
          >
            <Download size={16} />
          </Button>
          <Link to={`/bookings/${row.id}`}>
            <Button
              size="sm"
              variant="ghost"
              className="text-primary-600"
              title="View Details"
            >
              <Eye size={16} />
            </Button>
          </Link>
          {row.status === 'PENDING' && (
            <Button
              size="sm"
              variant="ghost"
              className="text-error-600"
              onClick={() => handleCancel(row.id)}
              title="Cancel Booking"
            >
              <X size={16} />
            </Button>
          )}
        </div>
      ),
    },
  ];
  
  const handleCancel = async (id) => {
    try {
      await api.put(`/bookings/${id}`, { status: 'CANCELLED' });
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };
  
  const handlePayment = async (id) => {
    try {
      await api.post(`/bookings/${id}/pay`);
      toast.success('Payment completed successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-1 text-gray-600">Manage your parking reservations</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            to="/bookings/new" 
            variant="primary"
            icon={<Car size={16} />}
          >
            New Booking
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Filters</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            icon={<Filter size={16} />}
          >
            {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
        
        {isFilterOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Booking Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'REJECTED', label: 'Rejected' },
                { value: 'CANCELLED', label: 'Cancelled' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'EXPIRED', label: 'Expired' }
              ]}
            />
            
            <div className="md:col-span-3 flex justify-end space-x-2 mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => fetchBookings()}
                icon={<Search size={16} />}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {/* Bookings Table */}
      <Card className="mb-6">
        <Table
          columns={columns}
          data={bookings}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={loading}
          noDataMessage="No bookings found. Create a new booking to get started."
        />
      </Card>
    </div>
  );
};

export default Bookings;