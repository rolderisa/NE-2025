import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Car, AlertTriangle, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const VehicleDetails = () => {
  const { id } = useParams(); // Get plateNumber from the URL
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        console.log('Fetching vehicle with plateNumber:', id); // Debug log
        const res = await api.get(`/vehicles/plate/${id}`);
        console.log('Vehicle data:', res.data); // Debug log
        if (!res.data || Object.keys(res.data).length === 0) {
          throw new Error('No vehicle data returned');
        }
        setVehicle(res.data);
      } catch (err) {
        console.error('Error fetching vehicle:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load vehicle details');
        toast.error(err.response?.data?.message || 'Failed to load vehicle details');
      }
    };

    fetchVehicle();
  }, [id]);

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle size={48} className="mx-auto text-error-500" />
        <h2 className="mt-4 text-xl font-medium text-gray-900">Vehicle Not Found</h2>
        <p className="mt-2 text-gray-500">The vehicle you're looking for doesn't exist or you don't have access to it.</p>
        <Button to="/vehicles" variant="primary" className="mt-6">
          Back to Vehicles
        </Button>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="mr-2"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate('/vehicles')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Details</h1>
            <p className="mt-1 text-gray-600">Plate #{vehicle.plateNumber}</p>
          </div>
        </div>
      </div>

      {/* Vehicle Information */}
      <Card className="md:col-span-2">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Vehicle Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Plate Number</p>
            <div className="flex items-center mt-1">
              <Car size={18} className="text-gray-500 mr-2" />
              <p className="text-lg font-medium">{vehicle.plateNumber || 'N/A'}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Type</p>
            <div className="flex items-center mt-1">
              <Car size={18} className="text-gray-500 mr-2" />
              <p className="text-lg font-medium">{vehicle.type || 'N/A'}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Size</p>
            <p className="text-lg font-medium mt-1">{vehicle.size || 'N/A'}</p>
          </div>
        </div>

        <div className="divider"></div>

        <div>
          <p className="text-sm text-gray-500">Attributes</p>
          <ul className="list-disc ml-6 mt-1">
            {vehicle.attributes && Object.keys(vehicle.attributes).length > 0 ? (
              Object.entries(vehicle.attributes).map(([key, value]) => (
                <li key={key} className="text-base">
                  <strong>{key}:</strong> {value || 'N/A'}
                </li>
              ))
            ) : (
              <li className="text-base">No attributes available</li>
            )}
          </ul>
        </div>

        <div className="mt-6 flex space-x-2">
          <Button
            to={`/vehicles/edit/${vehicle.plateNumber}`}
            variant="primary"
          >
            Edit Vehicle
          </Button>
          <Button
            to="/vehicles"
            variant="secondary"
            onClick={() => navigate('/vehicles')}
          >
            Back to List
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default VehicleDetails;