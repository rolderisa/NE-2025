import React from 'react';
import { Check } from 'lucide-react';

const PlanSelector = ({ 
  plans = [], 
  selectedPlanId = null, 
  onSelectPlan 
}) => {
  if (plans.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No payment plans available.
      </div>
    );
  }
  
  // Sort plans by price
  const sortedPlans = [...plans].sort((a, b) => a.price - b.price);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sortedPlans.map((plan) => {
        const isSelected = selectedPlanId === plan.id;
        const isFree = plan.price === 0;
        const duration = plan.duration === 0 
          ? 'One-time'
          : plan.duration === 30 
            ? '1 Month' 
            : plan.duration === 365 
              ? '1 Year'
              : `${plan.duration} days`;
              
        return (
          <div
            key={plan.id}
            onClick={() => onSelectPlan(plan)}
            className={`
              relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200
              ${isSelected 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'}
            `}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 text-primary-500">
                <Check size={20} />
              </div>
            )}
            
            <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {isFree ? 'Free' : `$${plan.price.toFixed(2)}`}
            </div>
            
            <div className="mt-2 text-sm text-gray-500">
              {duration}
            </div>
            
            {plan.description && (
              <div className="mt-4 text-sm text-gray-600">
                {plan.description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PlanSelector;