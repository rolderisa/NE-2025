import React, { useState, useEffect } from 'react';
import { User, Key, Download, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

const Profile = () => {
  const { user, checkAuth } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    plateNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        plateNumber: user.plateNumber || ''
      }));
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!profileData.name) newErrors.name = 'Name is required';
    if (!profileData.email) newErrors.email = 'Email is required';
    if (!profileData.plateNumber) newErrors.plateNumber = 'Plate number is required';
    
    if (profileData.password && profileData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Only include password if it's provided
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        plateNumber: profileData.plateNumber
      };
      
      if (profileData.password) {
        updateData.password = profileData.password;
      }
      
      await api.put('/users/profile', updateData);
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      
      // Refresh auth user data
      await checkAuth();
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const downloadProfile = async () => {
    try {
      const response = await api.get('/users/profile/pdf', {
        responseType: 'blob'
      });
      
      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'user-profile.pdf');
      document.body.appendChild(link);
      link.click();
      
      // Clean up and remove the link
      link.parentNode.removeChild(link);
      
      toast.success('Profile downloaded successfully');
    } catch (error) {
      console.error('Error downloading profile:', error);
      toast.error('Failed to download profile');
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-gray-600">View and update your personal information</p>
        </div>
        <Button
          variant="secondary"
          icon={<Download size={16} />}
          onClick={downloadProfile}
        >
          Download Profile
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Information Card */}
        <Card className="md:col-span-2">
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-medium text-gray-900 mb-6">Personal Information</h2>
            
            <div className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                type="text"
                value={profileData.name}
                onChange={handleChange}
                icon={<User size={16} />}
                error={errors.name}
                required
              />
              
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
              
              <Input
                label="License Plate Number"
                name="plateNumber"
                type="text"
                value={profileData.plateNumber}
                onChange={handleChange}
                error={errors.plateNumber}
                required
              />
            </div>
                     
            
            <div className="mt-8">
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                icon={!loading && <Save size={16} />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
        
        {/* Account Summary Card */}
        <Card>
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto">
              <span className="text-3xl font-bold">{user?.name?.[0] || 'U'}</span>
            </div>
            
            <h2 className="mt-4 text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Account Type:</span>
                <span className="font-medium">{user?.role || 'User'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">License Plate:</span>
                <span className="font-medium">{user?.plateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since:</span>
                <span className="font-medium">
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString() 
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;