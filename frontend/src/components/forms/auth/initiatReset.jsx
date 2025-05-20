import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'sonner';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import API_ENDPOINTS from '../../../constant/api';

const InitiateResetForm = ({ onInitiateSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.put(
        API_ENDPOINTS.auth.resetPasswordInitiate,
        { email: data.email },
        {
          headers: {
            'Content-Type': 'application/json',
            // ❌ Authorization header removed assuming public route
          },
        }
      );

      if (response.status === 200) {
        toast.success('Reset password email sent successfully');
        onInitiateSuccess(data.email);
      } else {
        toast.error(response.data.message || 'Failed to send reset password email');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('An error occurred. Please try again.');
      }

      // 🔍 Dev console logging
      if (process.env.NODE_ENV === 'development') {
        console.error('Reset Error:', error);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md mx-auto p-6 rounded space-y-6 bg-white text-black shadow-md"
    >
      <h2 className="text-2xl font-semibold text-black">Reset Password</h2>

      <div>
        <label htmlFor="email" className="block mb-1 font-medium text-black">
          Email
        </label>
        <Input
          id="email"
          type="email"
          disabled={isSubmitting}
          {...register('email', { required: 'Email is required' })}
          className="border border-black focus:ring-red-500"
        />
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#111827] hover:bg-[#111827] focus:ring-[#111827]"
      >
        {isSubmitting ? 'Sending...' : 'Send Reset Email'}
      </Button>
    </form>
  );
};

export default InitiateResetForm;
