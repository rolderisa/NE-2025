import React from 'react';
import { useNavigate } from 'react-router-dom';
import InitiateResetForm from '../../components/forms/auth/initiatReset'; // adjust the path as needed

const ForgotPassword = () => {
  const navigate = useNavigate();

  const handleInitiateSuccess = (email) => {
    navigate('/resetPassword', { state: { email } });
  };

  return (
    <div className="w-full">
      <InitiateResetForm onInitiateSuccess={handleInitiateSuccess} />
    </div>
  );
};

export default ForgotPassword;
