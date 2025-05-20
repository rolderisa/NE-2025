import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalCount: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    );

    try {
      const response = await api.get('/bookings', {
        params: {
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          ...cleanFilters,
        },
      });

      const { bookings, page, limit, totalPages, totalCount } = response.data;

      setBookings(bookings);
      setPagination({
        page: Number(page),
        limit: Number(limit),
        totalPages,
        totalCount,
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
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ status: '' });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleApprove = async (id) => {
    try {
      await api.post('/bookings/approve', { id });
      toast.success('Booking approved and ticket sent');
      fetchBookings();
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error(error.response?.data?.message || 'Failed to approve booking');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/bookings/${id}`, { status: 'REJECTED' });
      toast.success('Booking rejected');
      fetchBookings();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error(error.response?.data?.message || 'Failed to reject booking');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const columns = [
    {
      header: 'Booking ID',
      accessor: 'id',
      cell: (row) => <span className="font-medium">{row.id.slice(0, 8)}...</span>,
    },
    {
      header: 'User Email',
      accessor: 'user.email',
      cell: (row) => <span>{row.user.email}</span>,
    },
    {
      header: 'Plate Number',
      accessor: 'vehicle.plateNumber',
    },
    {
      header: 'Parking Slot',
      accessor: 'parkingSlot.slotNumber',
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
      header: 'Amount',
      accessor: 'payment.amount',
      cell: (row) => <span>${row.payment.amount.toFixed(2)}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      cell: (row) =>
        row.status === 'PENDING' ? (
          <div className="flex space-x-2 justify-end">
            <Button
              size="sm"
              variant="success"
              onClick={() => handleApprove(row.id)}
              title="Approve"
            >
              <CheckCircle size={16} />
            </Button>
            <Button
              size="sm"
              variant="error"
              onClick={() => handleReject(row.id)}
              title="Reject"
            >
              <XCircle size={16} />
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="mt-1 text-gray-600">Approve or reject user booking requests</p>
        </div>
      </div>

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
                { value: 'EXPIRED', label: 'Expired' },
              ]}
            />
            <div className="md:col-span-3 flex justify-end space-x-2 mt-4">
              <Button variant="secondary" size="sm" onClick={clearFilters}>
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

      <Card className="mb-6">
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

export default AdminBookings;