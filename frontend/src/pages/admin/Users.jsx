import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalCount: 0,
  });
  
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    plateNumber: '',
    role: '',
  });
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [vehicleEntries, setVehicleEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== '')
  );

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users', {
        params: {
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          ...cleanFilters,
        },
      });

      const { users, page, limit, totalPages, totalCount } = response.data;

      setUsers(users);
      setPagination({
        page: Number(page),
        limit: Number(limit),
        totalPages,
        totalCount,
      });

      if (users.length === 0 && Object.keys(cleanFilters).length > 0) {
        toast('No users match your search criteria', { icon: '🔍' });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicleEntries = async (userId) => {
    setEntriesLoading(true);
    console.log(`Fetching vehicle entries for userId: ${userId}`); // Debugging
    try {
      const response = await api.get(`/admin/users/${userId}/vehicle-entries`);
      console.log('Vehicle entries response:', response.data); // Debugging
      setVehicleEntries(response.data.vehicleEntries || []);
      if (response.data.vehicleEntries.length === 0) {
        toast('No vehicle entries found for this user', { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('Error fetching vehicle entries:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to load vehicle entries');
    } finally {
      setEntriesLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [pagination.page, filters]);

  useEffect(() => {
    if (selectedUserId) {
      fetchVehicleEntries(selectedUserId);
    } else {
      setVehicleEntries([]);
    }
  }, [selectedUserId]);

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ name: '', email: '', plateNumber: '', role: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const exportUsers = async () => {
    try {
      const response = await api.get('/admin/users/export', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      
      toast.success('Users exported successfully');
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error('Failed to export users');
    }
  };

  const registerVehicleEntry = async (plateNumber) => {
    if (!plateNumber) {
      toast.error('Plate number is required');
      return;
    }
    try {
      await api.post('/vehicle-entries', { plateNumber });
      toast.success('Vehicle entry registered');
      if (selectedUserId) fetchVehicleEntries(selectedUserId);
    } catch (error) {
      console.error('Error registering vehicle entry:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to register entry');
    }
  };

  const updateVehicleExit = async (entryId) => {
    try {
      await api.put(`/vehicle-entries/${entryId}/exit`);
      toast.success('Vehicle exit updated');
      if (selectedUserId) fetchVehicleEntries(selectedUserId);
    } catch (error) {
      console.error('Error updating vehicle exit:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to update exit');
    }
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString() : 'N/A';
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Plate Number',
      accessor: 'plateNumber',
    },
    {
      header: 'Role',
      accessor: 'role',
      cell: (row) => (
        <span className={`
          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${row.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}
        `}>
          {row.role}
        </span>
      ),
    },
    {
      header: 'Bookings',
      accessor: '_count.bookings',
    },
    {
      header: 'Joined',
      accessor: 'createdAt',
      cell: (row) => formatDate(row.createdAt),
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSelectedUserId(row.id)}
        >
          View Entries
        </Button>
      ),
    },
  ];

  const entryColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Plate Number', accessor: 'plateNumber' },
    { header: 'Parking Code', accessor: 'parkingCode' },
    { header: 'Entry Date-Time', accessor: 'entryDateTime', cell: (row) => formatDate(row.entryDateTime) },
    { header: 'Exit Date-Time', accessor: 'exitDateTime', cell: (row) => formatDate(row.exitDateTime) },
    { header: 'Charged Amount (FRW)', accessor: 'chargedAmount', cell: (row) => row.chargedAmount.toFixed(2) },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (row) => (
        !row.exitDateTime && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => updateVehicleExit(row.id)}
          >
            Mark Exit
          </Button>
        )
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-gray-600">View and search user accounts</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button 
            variant="secondary"
            onClick={exportUsers}
            icon={<Download size={16} />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <Input
              label="Search by Name"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Enter user name..."
              icon={<Search size={16} />}
            />
          </div>
          <div className="flex-1 max-w-md">
            <Input
              label="Search by Email"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
              placeholder="Enter user email..."
              icon={<Search size={16} />}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            icon={<RefreshCw size={16} />}
          >
            Clear Filters
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            icon={<Filter size={16} />}
          >
            {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>

      {/* Additional Filters */}
      {isFilterOpen && (
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Plate Number"
              name="plateNumber"
              value={filters.plateNumber}
              onChange={handleFilterChange}
              placeholder="Search by plate"
            />
            <Select
              label="Role"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Roles' },
                { value: 'USER', label: 'User' },
                { value: 'ADMIN', label: 'Admin' },
              ]}
            />
            <div className="md:col-span-3 flex justify-end space-x-2 mt-4" />
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">User List</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchUsers}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
        </div>

        <Table
          columns={columns}
          data={users}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={loading}
          noDataMessage="No users found."
        />
      </Card>

      {/* Vehicle Entries Table */}
      {selectedUserId && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Vehicle Entries</h2>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter plate number"
                onChange={(e) => setFilters(prev => ({ ...prev, plateNumber: e.target.value }))}
              />
              <Button
                variant="primary"
                onClick={() => registerVehicleEntry(filters.plateNumber)}
                icon={<Car size={16} />}
              >
                Register Entry
              </Button>
            </div>
          </div>
          <Table
            columns={entryColumns}
            data={vehicleEntries}
            isLoading={entriesLoading}
            noDataMessage="No vehicle entries found."
          />
        </Card>
      )}
    </div>
  );
};

export default Users;