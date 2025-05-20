import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios'; // your axios instance
import toast from 'react-hot-toast';

const EditVehicleForm = () => {
  const { id } = useParams(); // id here is plate number
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [formData, setFormData] = useState({
    plateNumber: '',
    type: 'CAR',
    size: 'MEDIUM',
    attributes: {}
  });

  const fetchVehicle = async () => {
    try {
      const res = await api.get(`/vehicles/plate/${id}`);
      setVehicle(res.data);
      setFormData({
        plateNumber: res.data.plateNumber,
        type: res.data.type,
        size: res.data.size,
        attributes: res.data.attributes || {}
      });
    } catch (err) {
      toast.error('Failed to load vehicle');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVehicle();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // For attributes like color, you can extend this pattern
  const handleAttributeChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/vehicles/plate/${id}`, formData);
      toast.success('Vehicle updated successfully');
      navigate('/vehicles');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
      console.error(err);
    }
  };

  const handleCancel = () => {
    navigate('/vehicles');
  };

  if (!vehicle) {
    return <div className="text-center mt-10 text-gray-600">Loading vehicle info...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10 text-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Vehicle</h2>

      <form onSubmit={handleSubmit} className="grid gap-5">
        {/* Plate Number (readonly because it's your key) */}
        <input
          type="text"
          name="plateNumber"
          value={formData.plateNumber}
          readOnly
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed text-sm"
          placeholder="Plate Number"
          required
        />

        {/* Vehicle Type */}
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500  text-sm"
        >
          <option value="CAR">Car</option>
          <option value="MOTORCYCLE">Motorcycle</option>
          <option value="TRUCK">Truck</option>
        </select>

        {/* Vehicle Size */}
        <select
          name="size"
          value={formData.size}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="SMALL">Small</option>
          <option value="MEDIUM">Medium</option>
          <option value="LARGE">Large</option>
        </select>

        {/* Example attribute: color
        <input
          type="text"
          name="color"
          value={formData.attributes.color || ''}
          onChange={handleAttributeChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Color (optional)"
        /> */}

        <div className="flex justify-between items-center mt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
          >
            Update
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-800 underline text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVehicleForm;
