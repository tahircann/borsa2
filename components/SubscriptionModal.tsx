import { useState } from 'react';
import { FiCheck, FiX, FiCreditCard } from 'react-icons/fi';
import { subscriptionPlans, SubscriptionPlan } from '../utils/subscription';

type SubscriptionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (planId: string) => void;
};

export default function SubscriptionModal({ isOpen, onClose, onSubscribe }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  
  if (!isOpen) return null;

  const handleSubscribe = () => {
    onSubscribe(selectedPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-2xl font-semibold text-gray-900">Upgrade Your Account</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={onClose}
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-6">Unlock premium features and insights by choosing a subscription plan that fits your investment needs.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {subscriptionPlans.map((plan: SubscriptionPlan) => (
              <div 
                key={plan.id} 
                className={`border rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow cursor-pointer
                  ${selectedPlan === plan.id ? 'border-primary-500 border-2' : 'border-gray-200'}
                  ${plan.popular ? 'relative' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute top-0 w-full bg-primary-100 text-primary-700 text-center text-sm py-1 font-medium">
                    Most Popular
                  </div>
                )}
                <div className={`p-6 ${plan.popular ? 'pt-8' : ''}`}>
                  <h4 className="text-xl font-semibold mb-2">{plan.name}</h4>
                  <div className="mb-2">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-gray-500 ml-1">/month</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 h-12">{plan.description}</p>
                  
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <FiCheck className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none"
              onClick={handleSubscribe}
            >
              <FiCreditCard className="mr-2 h-4 w-4" />
              Subscribe to {subscriptionPlans.find(plan => plan.id === selectedPlan)?.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
