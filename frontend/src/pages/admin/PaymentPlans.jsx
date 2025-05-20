import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Edit, Trash, Save, X, DollarSign, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';

const PaymentPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddMode, setIsAddMode] = useState(false);
  const [editPlanId, setEditPlanId] = useState(null);
  
  const [planForm, setPlanForm] = useState({
    name: '',
    type: 'MONTHLY',
    price: 0,
    duration: 30,
    description: ''
  });
  
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payments/plans');
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching payment plans:', error);
      toast.error('Failed to load payment plans');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPlans();
  }, []);
  
  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    setPlanForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };
  
  const handleAddPlan = async (e) => {
    e.preventDefault();
    
    if (!planForm.name) {
      toast.error('Plan name is required');
      return;
    }
    
    try {
      await api.post('/payments/plans', planForm);
      toast.success('Payment plan added successfully');
      setIsAddMode(false);
      setPlanForm({
        name: '',
        type: 'MONTHLY',
        price: 0,
        duration: 30,
        description: ''
      });
      fetchPlans();
    } catch (error) {
      console.error('Error adding payment plan:', error);
      toast.error(error.response?.data?.message || 'Failed to add payment plan');
    }
  };
  
  const startEdit = (plan) => {
    setEditPlanId(plan.id);
    setPlanForm({
      name: plan.name,
      type: plan.type,
      price: plan.price,
      duration: plan.duration,
      description: plan.description || ''
    });
  };
  
  const cancelEdit = () => {
    setEditPlanId(null);
    setPlanForm({
      name: '',
      type: 'MONTHLY',
      price: 0,
      duration: 30,
      description: ''
    });
  };
  
  const handleUpdatePlan = async (id) => {
    if (!planForm.name) {
      toast.error('Plan name is required');
      return;
    }
    
    try {
      await api.put(`/payments/plans/${id}`, planForm);
      toast.success('Payment plan updated successfully');
      setEditPlanId(null);
      setPlanForm({
        name: '',
        type: 'MONTHLY',
        price: 0,
        duration: 30,
        description: ''
      });
      fetchPlans();
    } catch (error) {
      console.error('Error updating payment plan:', error);
      toast.error(error.response?.data?.message || 'Failed to update payment plan');
    }
  };
  
  const handleDeletePlan = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment plan?')) {
      try {
        await api.delete(`/payments/plans/${id}`);
        toast.success('Payment plan deleted successfully');
        fetchPlans();
      } catch (error) {
        console.error('Error deleting payment plan:', error);
        toast.error(error.response?.data?.message || 'Failed to delete payment plan');
      }
    }
  };
  
  const formatPlanType = (type) => {
    switch (type) {
      case 'FREE': return 'Free';
      case 'MONTHLY': return 'Monthly';
      case 'YEARLY': return 'Yearly';
      default: return type;
    }
  };
  
  const columns = [
    {
      header: 'Plan Name',
      accessor: 'name',
      cell: (row) => {
        if (editPlanId === row.id) {
          return (
            <Input
              name="name"
              value={planForm.name}
              onChange={handleFormChange}
              className="w-full"
            />
          );
        }
        return <span className="font-medium">{row.name}</span>;
      },
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (row) => {
        if (editPlanId === row.id) {
          return (
            <Select
              name="type"
              value={planForm.type}
              onChange={handleFormChange}
              options={[
                { value: 'FREE', label: 'Free' },
                { value: 'MONTHLY', label: 'Monthly' },
                { value: 'YEARLY', label: 'Yearly' }
              ]}
              className="w-full"
            />
          );
        }
        return (
          <span className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${row.type === 'FREE' ? 'bg-green-100 text-green-800' : 
              row.type === 'MONTHLY' ? 'bg-blue-100 text-blue-800' : 
              'bg-purple-100 text-purple-800'}
          `}>
            {formatPlanType(row.type)}
          </span>
        );
      },
    },
    {
      header: 'Price',
      accessor: 'price',
      cell: (row) => {
        if (editPlanId === row.id) {
          return (
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">$</span>
              <Input
                name="price"
                type="number"
                value={planForm.price}
                onChange={handleFormChange}
                className="w-24"
              />
            </div>
          );
        }
        return <span className="font-medium">${row.price.toFixed(2)}</span>;
      },
    },
    {
      header: 'Duration (days)',
      accessor: 'duration',
      cell: (row) => {
        if (editPlanId === row.id) {
          return (
            <Input
              name="duration"
              type="number"
              value={planForm.duration}
              onChange={handleFormChange}
              className="w-24"
            />
          );
        }
        return <span>{row.duration} days</span>;
      },
    },
    {
      header: 'Description',
      accessor: 'description',
      cell: (row) => {
        if (editPlanId === row.id) {
          return (
            <Input
              name="description"
              value={planForm.description || ''}
              onChange={handleFormChange}
              placeholder="Optional description"
              className="w-full"
            />
          );
        }
        return <span className="text-gray-500">{row.description || '-'}</span>;
      },
    },
    {
      header: 'Actions',
      cell: (row) => {
        if (editPlanId === row.id) {
          return (
            <div className="flex space-x-2 justify-end">
              <Button
                size="sm"
                variant="success"
                className="text-xs py-1"
                onClick={() => handleUpdatePlan(row.id)}
                title="Save"
              >
                <Save size={16} />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="text-xs py-1"
                onClick={cancelEdit}
                title="Cancel"
              >
                <X size={16} />
              </Button>
            </div>
          );
        }
        return (
          <div className="flex space-x-2 justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-600 text-xs py-1"
              onClick={() => startEdit(row)}
              title="Edit"
            >
              <Edit size={16} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-error-600 text-xs py-1"
              onClick={() => handleDeletePlan(row.id)}
              title="Delete"
            >
              <Trash size={16} />
            </Button>
          </div>
        );
      },
    },
  ];
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Plan Management</h1>
          <p className="mt-1 text-gray-600">Configure pricing options for parking slots</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button 
            variant="primary"
            onClick={() => setIsAddMode(!isAddMode)}
            icon={isAddMode ? <X size={16} /> : <Plus size={16} />}
          >
            {isAddMode ? 'Cancel' : 'Add New Plan'}
          </Button>
        </div>
      </div>
      
      {/* Add New Plan Form */}
      {isAddMode && (
        <Card className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Payment Plan</h2>
          
          <form onSubmit={handleAddPlan} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Plan Name"
              name="name"
              value={planForm.name}
              onChange={handleFormChange}
              placeholder="e.g., Basic Monthly"
              icon={<DollarSign size={16} />}
              required
            />
            
            <Select
              label="Plan Type"
              name="type"
              value={planForm.type}
              onChange={handleFormChange}
              options={[
                { value: 'FREE', label: 'Free' },
                { value: 'MONTHLY', label: 'Monthly' },
                { value: 'YEARLY', label: 'Yearly' }
              ]}
              required
            />
            
            <div className="flex space-x-4">
              <Input
                label="Price ($)"
                name="price"
                type="number"
                value={planForm.price}
                onChange={handleFormChange}
                icon={<DollarSign size={16} />}
                required
              />
              
              <Input
                label="Duration (days)"
                name="duration"
                type="number"
                value={planForm.duration}
                onChange={handleFormChange}
                icon={<Clock size={16} />}
                required
              />
            </div>
            
            <Input
              label="Description (optional)"
              name="description"
              value={planForm.description}
              onChange={handleFormChange}
              placeholder="Brief description of the plan"
            />
            
            <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAddMode(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={<Plus size={16} />}
              >
                Add Plan
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      {/* Plans Table */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Available Payment Plans</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPlans}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payment plans found. Create your first plan to get started.
          </div>
        ) : (
          <Table
            columns={columns}
            data={plans}
            isLoading={loading}
            noDataMessage="No payment plans found."
          />
        )}
      </Card>
      
      {/* Payment Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {plans.map(plan => (
          <Card
            key={plan.id}
            className={`
              overflow-hidden relative
              ${plan.type === 'FREE' ? 'border-green-200' : 
                plan.type === 'MONTHLY' ? 'border-blue-200' : 'border-purple-200'}
            `}
          >
            {/* Plan Type Badge */}
            <div className={`
              absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white
              ${plan.type === 'FREE' ? 'bg-green-500' : 
                plan.type === 'MONTHLY' ? 'bg-blue-500' : 'bg-purple-500'}
            `}>
              {formatPlanType(plan.type)}
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            
            <div className="flex items-baseline mt-4 mb-6">
              <span className="text-3xl font-extrabold text-gray-900">${plan.price.toFixed(2)}</span>
              <span className="ml-1 text-xl text-gray-500">
                {plan.duration === 0 ? '/one-time' : plan.duration === 30 ? '/month' : plan.duration === 365 ? '/year' : `/${plan.duration} days`}
              </span>
            </div>
            
            {plan.description && (
              <p className="text-gray-600 mb-4">{plan.description}</p>
            )}
            
            <div className="mt-6 flex justify-end space-x-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-600"
                onClick={() => startEdit(plan)}
              >
                <Edit size={16} className="mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-error-600"
                onClick={() => handleDeletePlan(plan.id)}
              >
                <Trash size={16} className="mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PaymentPlans;