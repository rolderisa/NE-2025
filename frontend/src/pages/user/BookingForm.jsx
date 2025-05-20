import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Car as CarIcon, CreditCard, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import SlotGrid from '../../components/parking/SlotGrid';
import PlanSelector from '../../components/parking/PlanSelector';

const BookingForm = () => {
  const [step, setStep] = useState(1);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [paymentPlans, setPaymentPlans] = useState([]);
  const [userCars, setUserCars] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    carId: '',
    slotId: '',
    planId: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaymentPlans = async () => {
      try {
        const response = await api.get('/payments/plans');
        setPaymentPlans(response.data);
      } catch (error) {
        console.error('Error fetching payment plans:', error);
        toast.error('Failed to load payment plans');
      }
    };

    const fetchUserCars = async () => {
      try {
        const response = await api.get('/vehicles/all'); // Updated to use new endpoint
        console.log('User cars response:', response.data);
        const cars = Array.isArray(response.data.vehicles) ? response.data.vehicles : response.data;
        setUserCars(cars);
        if (cars.length === 0) {
          toast('No cars found. Please add a car in your profile.', {
            style: { background: '#fefcbf', color: '#b45309' },
          });
        }
      } catch (error) {
        console.error('Error fetching user cars:', error);
        toast.error('Failed to load your cars');
        setUserCars([]);
      }
    };

    fetchPaymentPlans();
    fetchUserCars();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const searchAvailableSlots = async () => {
    setLoading(true);
    setErrors({});

    if (!formData.startTime || !formData.endTime) {
      setErrors({ date: 'Please select both start and end dates' });
      setLoading(false);
      return;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (start >= end) {
      setErrors({ date: 'End time must be after start time' });
      setLoading(false);
      return;
    }

    const durationHours = Math.abs(end - start) / 36e5;
    if (durationHours < 1) {
      setErrors({ date: 'Minimum booking duration is 1 hour' });
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep(2);
  };

  const proceedToSlotSelection = () => {
    if (!formData.carId) {
      toast.error('Please select your car');
      return;
    }

    fetchSlots();
  };

  const fetchSlots = async () => {
    setLoading(true);
    setErrors({});

    try {
      const response = await api.get('/parking-slots/available', {
        params: { startTime: formData.startTime, endTime: formData.endTime, carId: formData.carId },
      });

      setAvailableSlots(response.data);

      if (response.data.length === 0) {
        toast.error('No available slots for the selected time and car');
      } else {
        setStep(3);
        toast.success(`Found ${response.data.length} available slots`);
      }
    } catch (error) {
      console.error('Error searching for slots:', error);
      toast.error('Failed to search for available slots');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = (slot) => {
    setFormData((prev) => ({ ...prev, slotId: slot.id }));
  };

  const handleSelectPlan = (plan) => {
    setFormData((prev) => ({ ...prev, planId: plan.id }));
  };

  const proceedToPayment = () => {
    if (!formData.slotId) {
      toast.error('Please select a parking slot');
      return;
    }
    setStep(4);
  };

  const createBooking = async () => {
    if (!formData.planId) {
      toast.error('Please select a payment plan');
      return;
    }

    if (!formData.carId) {
      toast.error('Vehicle is required for booking');
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        startTime: formData.startTime,
        endTime: formData.endTime,
        slotId: formData.slotId,
        planId: formData.planId,
        vehicle: { connect: { id: formData.carId } },
      };

      console.log('createBooking payload:', bookingData);

      const response = await api.post('/bookings', bookingData);
      toast.success('Booking created successfully');
      navigate(`/bookings/${response.data.id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-gray-900">Select Booking Time</h2>

            {errors.date && (
              <div className="bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded">
                {errors.date}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Start Time"
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                icon={<Calendar size={16} />}
                required
              />

              <Input
                label="End Time"
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                icon={<Clock size={16} />}
                required
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={searchAvailableSlots}
                isLoading={loading}
                icon={!loading && <ArrowRight size={16} />}
              >
                Next: Choose Car
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-gray-900">Select Your Car</h2>
            {userCars.length === 0 ? (
              <p className="text-gray-600">
                You have no cars saved. Please add one in your profile first.
              </p>
            ) : (
              <div
                className="max-h-64 overflow-y-auto border rounded-md p-2"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#888 #f1f1f1' }}
              >
                {userCars.map((car) => (
                  <div
                    key={car.id}
                    onClick={() => setFormData((prev) => ({ ...prev, carId: car.id }))}
                    className={`p-3 mb-2 rounded cursor-pointer hover:bg-gray-100 ${
                      formData.carId === car.id ? 'bg-primary-50 border-primary-600' : 'border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold text-sm">{car.make} {car.model}</h3>
                    <p className="text-xs text-gray-600">Plate: {car.plateNumber}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back to Time Selection
              </Button>

              <Button
                variant="primary"
                onClick={proceedToSlotSelection}
                disabled={!formData.carId}
                icon={<ArrowRight size={16} />}
              >
                Next: Choose Slot
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-gray-900">Select a Parking Slot</h2>
              <div className="text-sm text-gray-500">{availableSlots.length} slots available</div>
            </div>

            <SlotGrid
              slots={availableSlots}
              onSelectSlot={handleSelectSlot}
              selectedSlotId={formData.slotId}
            />

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back to Car Selection
              </Button>

              <Button
                variant="primary"
                onClick={proceedToPayment}
                disabled={!formData.slotId}
                icon={<ArrowRight size={16} />}
              >
                Next: Payment Plan
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-gray-900">Select Payment Plan</h2>

            <PlanSelector
              plans={paymentPlans}
              selectedPlanId={formData.planId}
              onSelectPlan={handleSelectPlan}
            />

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(3)}>
                Back to Slot Selection
              </Button>

              <Button
                variant="primary"
                onClick={createBooking}
                isLoading={loading}
                disabled={!formData.planId || !formData.carId || !formData.slotId}
                icon={<CreditCard size={16} />}
              >
                Complete Booking
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Book a Parking Slot</h1>
        <p className="mt-1 text-gray-600">Reserve a parking space for your vehicle</p>
      </div>

      <Card className="mb-6">
        <div className="mb-8 flex items-center justify-between">
          {['Time', 'Car', 'Slot', 'Payment'].map((label, index) => {
            const icons = [<Calendar size={18} />, <CarIcon size={18} />, <CarIcon size={18} />, <CreditCard size={18} />];
            const isActive = step >= index + 1;

            return (
              <React.Fragment key={index}>
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      isActive ? 'border-primary-600 bg-primary-50' : 'border-gray-300'
                    }`}
                  >
                    {icons[index]}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">{label}</span>
                </div>

                {index !== 3 && (
                  <div
                    className={`flex-1 border-t-2 mx-3 ${
                      step > index + 1 ? 'border-primary-600' : 'border-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {renderStepContent()}
      </Card>
    </div>
  );
};

export default BookingForm;