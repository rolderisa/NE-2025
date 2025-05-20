import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, RefreshCw, 
  Check, X, Download as DownloadIcon 
} from 'lucide-react';
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
    isPaid: '',
    userId: '',
    slotId: ''
  });
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const fetchBookings = async () => {
  setLoading(true);

  // Remove empty strings from filters
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== '')
  );

  try {
    const response = await api.get('/admin/bookings', {
      params: {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...cleanFilters,
      },
    });

    const { bookings, page, limit, totalPages, totalCount } = response.data;

    setBookings(bookings); // assuming you're storing bookings in state
    setPagination(prev => ({
      ...prev,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      totalCount,
    }));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    toast.error('Failed to load bookings');
  } finally {
    setLoading(false);
  }
};

  
  useEffect(() => {
    fetchBookings();
  }, [pagination.page]);
  
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchBookings();
  };
  
  const clearFilters = () => {
    setFilters({ status: '', isPaid: '', userId: '', slotId: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchBookings();
  };
  
  const exportBookings = async () => {
    try {
      const response = await api.get('/admin/bookings/export', {
        responseType: 'blob'
      });
      
      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bookings.csv');
      document.body.appendChild(link);
      link.click();
      
      // Clean up and remove the link
      link.parentNode.removeChild(link);
      
      toast.success('Bookings exported successfully');
    } catch (error) {
      console.error('Error exporting bookings:', error);
      toast.error('Failed to export bookings');
    }
  };
  
  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/bookings/${id}/status`, { status: 'APPROVED' });
      toast.success('Booking approved successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error('Failed to approve booking');
    }
  };
  
  const handleReject = async (id) => {
    try {
      await api.put(`/admin/bookings/${id}/status`, { status: 'REJECTED' });
      toast.success('Booking rejected successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking');
    }
  };
  
  const downloadBookingPDF = async (id) => {
  try {
    const response = await api.get(`/bookings/${id}/pdf`, {
      responseType: 'blob',
    });

    // Check content-type header to confirm it's a PDF
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('application/pdf')) {
      throw new Error('Response is not a PDF file');
    }

    // Create a blob and URL for download
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `booking-${id}.pdf`);
    document.body.appendChild(link);
    link.click();

    // Clean up
    link.remove();
    window.URL.revokeObjectURL(url);

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
      header: 'User',
      accessor: 'user',
      cell: (row) => (
        <div>
          <div className="font-medium">{row.user.name}</div>
          <div className="text-xs text-gray-500">{row.user.email}</div>
        </div>
      ),
    },
    {
      header: 'Slot',
      accessor: 'parkingSlot',
      cell: (row) => (
        <div>
          <div className="font-medium">{row.parkingSlot.slotNumber}</div>
          <div className="text-xs text-gray-500">{row.parkingSlot.type}</div>
        </div>
      ),
    },
    {
      header: 'Duration',
      cell: (row) => (
        <div className="text-sm">
          <div>{formatDate(row.startTime)}</div>
          <div className="text-gray-400">to</div>
          <div>{formatDate(row.endTime)}</div>
        </div>
      ),
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
        return <span className="text-gray-500">Unpaid</span>;
      },
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2 justify-end">
          {row.status === 'PENDING' && (
            <>
              <Button
                size="sm"
                variant="success"
                className="text-xs py-1"
                onClick={() => handleApprove(row.id)}
                title="Approve"
              >
                <Check size={16} />
              </Button>
              <Button
                size="sm"
                variant="danger"
                className="text-xs py-1"
                onClick={() => handleReject(row.id)}
                title="Reject"
              >
                <X size={16} />
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="secondary"
            className="text-xs py-1"
            onClick={() => downloadBookingPDF(row.id)}
            title="Download PDF"
          >
            <DownloadIcon size={16} />
          </Button>
        </div>
      ),
    },
  ];
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="mt-1 text-gray-600">View and manage all parking bookings</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button 
            variant="secondary"
            onClick={exportBookings}
            icon={<Download size={16} />}
          >
            Export CSV
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            
            <Select
              label="Payment Status"
              name="isPaid"
              value={filters.isPaid}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All' },
                { value: 'true', label: 'Paid' },
                { value: 'false', label: 'Unpaid' }
              ]}
            />
            
            <Input
              label="User ID"
              name="userId"
              value={filters.userId}
              onChange={handleFilterChange}
              placeholder="Filter by user ID"
            />
            
            <Input
              label="Slot ID"
              name="slotId"
              value={filters.slotId}
              onChange={handleFilterChange}
              placeholder="Filter by slot ID"
            />
            
            <div className="md:col-span-4 flex justify-end space-x-2 mt-4">
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
                onClick={applyFilters}
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Booking List</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchBookings}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
        </div>
        
        <Table
          columns={columns}
          data={bookings}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={loading}
          noDataMessage="No bookings found."
        />
      </Card>
    </div>
  );
};

export default Bookings;