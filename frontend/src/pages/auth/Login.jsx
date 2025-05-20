import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const user = await login(email, password)
      console.log(user)
      // Redirect based on user role
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');

      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        setErrors({ credentials: 'Invalid email or password' });
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full p-8 shadow-md animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded">
            {errors.general}
          </div>
        )}
        
        {errors.credentials && (
          <div className="bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded">
            {errors.credentials}
          </div>
        )}
        
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />
        
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
        </div>
        
        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isLoading}
          icon={!isLoading && <LogIn size={18} />}
        >
          Sign In
        </Button>
      </form>
      
      <div className="mt-6 text-center">
         <a href="/forgotPassword" className="text-black hover:underline font-medium text-sm">
          Forgot password?
        </a>
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary-955 hover:text-primary-955">
            Register here
          </Link>
        </p>
      </div>
    </Card>
  );
};

export default Login;