import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import VerifyConfirmForm from '../../components/forms/auth/verifyConfirm';
import API_ENDPOINTS from '../../constant/api';
import axios from 'axios';
import { toast } from 'sonner';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(null); // removed TypeScript type

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await register(formData);
      setEmail(formData.email); // go to verification step

      // Send verification code
      await axios.put(API_ENDPOINTS.auth.resetPasswordInitiate, {
        email: formData.email,
      });

      toast.success('Verification code sent to your email');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.message?.includes('already exists')) {
        setErrors({ email: 'Email already in use' });
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySuccess = () => {
    navigate('/auth/login');
  };

  if (email) {
    // show verify component
    return <VerifyConfirmForm email={email} onVerifySuccess={handleVerifySuccess} />;
  }

  return (
    <Card className="w-full p-8 shadow-md animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
        <p className="mt-2 text-gray-600">Register to start booking parking spaces</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded">
            {errors.general}
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          name="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        {/* <Input
          label="License Plate Number"
          type="text"
          name="plateNumber"
          placeholder="Enter your plate number"
          value={formData.plateNumber}
          onChange={handleChange}
          error={errors.plateNumber}
          required
        /> */}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isLoading}
          icon={!isLoading && <UserPlus size={18} />}
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-primary-955 hover:text-primary-955">
            Sign in
          </Link>
        </p>
      </div>
    </Card>
  );
};

export default Register;
