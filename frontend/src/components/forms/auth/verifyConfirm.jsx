import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Button  from '../../../components/ui/Button';
import API_ENDPOINTS from '../../../constant/api';

const VerifyConfirmForm = ({ email, onVerifySuccess }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only digits allowed
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }
    try {
      const url = API_ENDPOINTS.auth.verifyAccountConfirm();
  const response = await axios.put(
  url,
  { code: verificationCode }, 
  {
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  }
);


      if (response.status === 200) {
        toast.success('Email verified successfully');
        onVerifySuccess();
      } else {
        toast.error(response.data.message || 'Verification failed');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('An error occurred. Please try again.');
      }
    }
  };

  const resendCode = async () => {
    try {
      await axios.put(
        API_ENDPOINTS.auth.verifyAccountInitiate,
        { email },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success('Verification code resent');
    } catch {
      toast.error('Failed to resend code');
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-md mx-auto p-6 rounded space-y-6 bg-white text-black"
    >
      <h2 className="text-2xl font-semibold text-black">Verify Email</h2>
      <div className="flex justify-between space-x-2">
        {code.map((digit, idx) => (
          <input
            key={idx}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            ref={(el) => (inputsRef.current[idx] = el)}
            className="w-12 h-12 text-center text-2xl border border-black rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        ))}
      </div>
      <div className="w-full flex gap-4 justify-between items-center">
        <Button type="submit" className="w-1/2 bg-[#111827] hover:bg-[#111827]">
          Verify Email
        </Button>
        <Button type="button" className="w-1/2" variant="outline" onClick={resendCode}>
          Resend Code
        </Button>
      </div>
    </form>
  );
};

export default VerifyConfirmForm;
