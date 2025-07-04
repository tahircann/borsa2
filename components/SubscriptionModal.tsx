import { useState } from 'react';
import { FiCheck, FiX, FiCreditCard, FiPercent } from 'react-icons/fi';
import { useSubscription } from '../utils/subscription';

type SubscriptionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('yearly');
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'plans' | 'payment' | 'success'>('plans');
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const { subscribe, plans } = useSubscription();
  
  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const result = await subscribe(selectedPlan);
      setPaymentResult(result);
      
      if (result.success) {
        setPaymentStep('success');
      } else {
        // Stay on payment step to show error
      }
    } catch (error) {
      setPaymentResult({
        success: false,
        message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPaymentStep('plans');
    setPaymentResult(null);
    setSelectedPlan('yearly');
    onClose();
  };

  const renderPlansStep = () => (
    <>
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-2xl font-semibold text-gray-900">Premium Üyelik</h3>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-500 focus:outline-none"
          onClick={handleClose}
        >
          <FiX className="h-6 w-6" />
        </button>
      </div>
      
      <div className="p-6">
        <p className="text-gray-600 mb-6 text-center">
          Stock Ranks ve Portfolio özelliklerine erişim için premium üyelik gereklidir.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`border rounded-lg overflow-hidden shadow hover:shadow-md transition-all cursor-pointer relative
                ${selectedPlan === plan.id ? 'border-primary-500 border-2 bg-primary-50' : 'border-gray-200'}
                ${plan.popular ? 'ring-2 ring-primary-200' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-primary-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    En Popüler
                  </div>
                </div>
              )}
              
              <div className={`p-6 ${plan.popular ? 'pt-8' : ''}`}>
                <div className="text-center">
                  <h4 className="text-xl font-semibold mb-2">{plan.name}</h4>
                  
                  <div className="mb-3">
                    {plan.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">
                        ${plan.originalPrice}
                      </div>
                    )}
                    <div className="flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary-600">${plan.price}</span>
                      <span className="text-gray-500 ml-2">
                        /{plan.period === 'monthly' ? 'ay' : 'yıl'}
                      </span>
                    </div>
                    {plan.savings && (
                      <div className="flex items-center justify-center mt-1 text-green-600">
                        <FiPercent className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">${plan.savings} tasarruf</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 h-12">{plan.description}</p>
                </div>
                
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-gray-700 text-sm">
                      <FiCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <button
            type="button"
            className="flex items-center px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none font-medium"
            onClick={() => setPaymentStep('payment')}
          >
            <FiCreditCard className="mr-2 h-4 w-4" />
            Devam Et - ${plans.find(plan => plan.id === selectedPlan)?.price}
          </button>
        </div>
      </div>
    </>
  );

  const renderPaymentStep = () => (
    <>
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-2xl font-semibold text-gray-900">Ödeme</h3>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-500 focus:outline-none"
          onClick={handleClose}
        >
          <FiX className="h-6 w-6" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-2">Seçilen Plan</h4>
          <div className="flex justify-between items-center">
            <span>{plans.find(plan => plan.id === selectedPlan)?.name}</span>
            <span className="font-semibold">${plans.find(plan => plan.id === selectedPlan)?.price}</span>
          </div>
        </div>
        
        {paymentResult && !paymentResult.success && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {paymentResult.message}
          </div>
        )}
        
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Ödeme Yöntemi</h4>
          <div className="space-y-2">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" name="payment" value="shopier" defaultChecked className="mr-3" />
              <FiCreditCard className="mr-2" />
              <span>Shopier ile Güvenli Ödeme</span>
            </label>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <FiCreditCard className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="font-semibold text-blue-800">Shopier Güvenli Ödeme</h4>
          </div>
          <p className="text-blue-700 text-sm">
            Ödeme işleminiz Shopier'in güvenli altyapısı üzerinden gerçekleştirilecektir. 
            Kredi kartı, banka kartı ve diğer ödeme seçeneklerini kullanabilirsiniz.
          </p>
          <div className="mt-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-white px-2 py-1 rounded border">Visa</span>
              <span className="text-xs bg-white px-2 py-1 rounded border">Mastercard</span>
              <span className="text-xs bg-white px-2 py-1 rounded border">Troy</span>
              <span className="text-xs bg-white px-2 py-1 rounded border">3D Secure</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
            onClick={() => setPaymentStep('plans')}
            disabled={loading}
          >
            Geri
          </button>
          <button
            type="button"
            className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none disabled:bg-primary-400"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Shopier'e Yönlendiriliyor...
              </>
            ) : (
              <>
                <FiCreditCard className="mr-2 h-4 w-4" />
                Shopier ile Ödeme Yap
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );

  const renderSuccessStep = () => (
    <>
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-2xl font-semibold text-green-600">Başarılı!</h3>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-500 focus:outline-none"
          onClick={handleClose}
        >
          <FiX className="h-6 w-6" />
        </button>
      </div>
      
      <div className="p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <FiCheck className="h-6 w-6 text-green-600" />
        </div>
        
        <h4 className="text-lg font-semibold mb-2">Premium Üyeliğiniz Aktif!</h4>
        <p className="text-gray-600 mb-6">
          {paymentResult?.message}
        </p>
        
        {paymentResult?.transactionId && (
          <div className="bg-gray-50 rounded-md p-3 mb-6">
            <p className="text-sm text-gray-600">
              İşlem No: <span className="font-mono">{paymentResult.transactionId}</span>
            </p>
          </div>
        )}
        
        <button
          type="button"
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none"
          onClick={handleClose}
        >
          Devam Et
        </button>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
        {paymentStep === 'plans' && renderPlansStep()}
        {paymentStep === 'payment' && renderPaymentStep()}
        {paymentStep === 'success' && renderSuccessStep()}
      </div>
    </div>
  );
}
