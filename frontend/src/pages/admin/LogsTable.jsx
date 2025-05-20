import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { format } from 'date-fns';

const LogsTable = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/logs', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit,
          action: actionFilter || undefined,
          userId: userIdFilter || undefined,
          sortBy,
          sortOrder,
        },
      });
      setLogs(response.data.logs);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch logs');
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, userIdFilter, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Render details field in a styled format
  const renderDetails = (details, action) => {
    if (!details) return '-';
    try {
      const parsed = typeof details === 'string' ? JSON.parse(details) : details;

      if (action === 'UPDATE_VEHICLE' && parsed.changes) {
        return (
          <div className="text-sm">
            <p><strong>Vehicle ID:</strong> {parsed.vehicleId}</p>
            <p><strong>Changes:</strong></p>
            <ul className="list-disc pl-4">
              {parsed.changes.plateNumber && (
                <li>Plate Number: {parsed.changes.plateNumber}</li>
              )}
              {parsed.changes.type && <li>Type: {parsed.changes.type}</li>}
              {parsed.changes.size && <li>Size: {parsed.changes.size}</li>}
              {Object.keys(parsed.changes.attributes || {}).length > 0 && (
                <li>Attributes: {JSON.stringify(parsed.changes.attributes)}</li>
              )}
            </ul>
          </div>
        );
      }

      // For CREATE_VEHICLE and DELETE_VEHICLE
      return (
        <div className="text-sm">
          <p><strong>Vehicle ID:</strong> {parsed.vehicleId}</p>
          <p><strong>Plate Number:</strong> {parsed.plateNumber}</p>
        </div>
      );
    } catch (error) {
      return <span className="text-red-500">Invalid details format</span>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Activity Logs</h2>
      
      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Filter by action"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Filter by user ID"
          value={userIdFilter}
          onChange={(e) => setUserIdFilter(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th
                className="border p-2 cursor-pointer"
                onClick={() => handleSort('action')}
              >
                Action {sortBy === 'action' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="border p-2">Details</th>
              <th
                className="border p-2 cursor-pointer"
                onClick={() => handleSort('createdAt')}
              >
                Created At {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="border p-2">User</th>
              <th className="border p-2">User Email</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  No logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="border p-2">{log.action}</td>
                  <td className="border p-2">{renderDetails(log.details, log.action)}</td>
                  <td className="border p-2">
                    {format(new Date(log.createdAt), 'MM/dd/yyyy, h:mm:ss a')}
                  </td>
                  <td className="border p-2">{log.user?.name || '-'}</td>
                  <td className="border p-2">{log.user?.email || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LogsTable;