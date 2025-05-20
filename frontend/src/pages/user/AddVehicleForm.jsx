import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios'; // Make sure this axios instance is set up properly with baseURL etc.
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const AddVehicleForm = () => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    type: 'CAR',
    size: 'MEDIUM',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Basic validation — can be extended
  const validate = () => {
    const errs = {};
    if (!formData.plateNumber.trim()) {
      errs.plateNumber = 'Plate number is required';
    }
    // You could add regex here for plate number format if needed
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await api.post('/vehicles', formData);
      toast.success('Vehicle added successfully!');
      navigate('/vehicles'); // Assuming this is the vehicle list page
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add vehicle';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-gray-900">Add Vehicle</h2>

      <Input
        label="Plate Number"
        name="plateNumber"
        type="text"
        value={formData.plateNumber}
        onChange={handleChange}
        required
        error={errors.plateNumber}
      />

      <div>
        <label htmlFor="vehicle_type" className="block mb-1 font-medium text-gray-700">Vehicle Type</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        >
          <option value="CAR">Car</option>
          <option value="MOTORCYCLE">Motorcycle</option>
          <option value="TRUCK">Truck</option>
        </select>
      </div>

      <div>
        <label htmlFor="size" className="block mb-1 font-medium text-gray-700">Size</label>
        <select
          id="size"
          name="size"
          value={formData.size}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        >
          <option value="SMALL">Small</option>
          <option value="MEDIUM">Medium</option>
          <option value="LARGE">Large</option>
        </select>
      </div>

      <Button type="submit" variant="primary" isLoading={loading} >
        Add Vehicle
      </Button>
    </form>
  );
};

export default AddVehicleForm;
