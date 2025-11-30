import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscriptionService, paymentService } from '../services/subscriptionService';
import toast from 'react-hot-toast';
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    email: user?.email || '',
    phone: '',
  });

  const plan = searchParams.get('plan');
  const billingCycle = searchParams.get('billing');

  useEffect(() => {
    if (!plan || !billingCycle) {
      navigate('/pricing');
      return;
    }
    
    fetchSubscriptionData();
  }, [plan, billingCycle, navigate]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching subscription data...');
      console.log('📋 Plan from URL:', plan);
      console.log('📋 Billing cycle from URL:', billingCycle);

      const response = await subscriptionService.getPlans();
      console.log('✅ Plans received:', response);
      console.log('📦 Plans data:', response?.data);

      if (!response) {
        console.error('❌ No response from getPlans()');
        toast.error('Failed to load subscription plans - no response');
        navigate('/pricing');
        return;
      }

      if (!response.data) {
        console.error('❌ Response has no data field:', response);
        toast.error('Failed to load subscription plans - invalid response');
        navigate('/pricing');
        return;
      }

      if (!Array.isArray(response.data)) {
        console.error('❌ Response data is not an array:', typeof response.data, response.data);
        toast.error('Failed to load subscription plans - invalid data format');
        navigate('/pricing');
        return;
      }

      if (response.data.length === 0) {
        console.error('❌ No plans available');
        toast.error('No subscription plans available');
        navigate('/pricing');
        return;
      }

      console.log(`📋 Looking for plan "${plan}" in ${response.data.length} plans...`);

      const selectedPlan = response.data.find(p => {
        console.log(`🔎 Comparing: "${p?.name}" === "${plan}" ? ${p?.name === plan}`);
        return p && p.name && p.name === plan;
      });

      console.log('🎯 Selected plan:', selectedPlan);

      if (selectedPlan) {
        console.log('✅ Plan found! Setting subscription...');
        setSubscription(selectedPlan);
      } else {
        const availablePlans = response.data.map(p => p?.name || 'unknown').join(', ');
        console.error(`❌ Plan "${plan}" not found. Available plans: ${availablePlans}`);
        toast.error(`Invalid plan selected: "${plan}". Available: ${availablePlans}`);
        navigate('/pricing');
      }
    } catch (error) {
      console.error('❌ Error fetching subscription details:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      if (error.response) {
        console.error('Error response:', error.response);
      }
      toast.error(`Failed to load subscription details: ${error.message}`);
      // Don't navigate away on error - stay to see the logs
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const fillDemoCardDetails = () => {
    setPaymentDetails(prev => ({
      ...prev,
      cardNumber: '4532 1234 5678 9010',
      expiryDate: '12/25',
      cvv: '123',
      cardName: 'Demo User',
      phone: '+94 77 123 4567',
    }));
    toast.success('Demo card details filled!');
  };

  const validatePaymentDetails = () => {
    if (paymentMethod === 'credit_card') {
      if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.cardName) {
        toast.error('Please fill in all card details');
        return false;
      }
      
      // Basic card number validation
      if (paymentDetails.cardNumber.replace(/\s/g, '').length < 16) {
        toast.error('Please enter a valid card number');
        return false;
      }
      
      // Basic CVV validation
      if (paymentDetails.cvv.length < 3) {
        toast.error('Please enter a valid CVV');
        return false;
      }
    }
    
    if (!paymentDetails.email) {
      toast.error('Please enter your email address');
      return false;
    }
    
    return true;
  };

  const processPayment = async () => {
    if (!validatePaymentDetails()) {
      return;
    }

    try {
      setProcessing(true);
      
      console.log('💳 Starting payment process...');
      console.log('📋 Plan:', plan);
      console.log('📋 Billing Cycle:', billingCycle);
      console.log('💰 Amount:', subscription.pricing[billingCycle]);

      // Simulate payment processing
      // In a real application, you would integrate with a payment gateway like Stripe, PayPal, etc.
      const paymentData = {
        amount: subscription.pricing[billingCycle],
        currency: 'LKR',
        paymentMethod,
        customerEmail: paymentDetails.email,
        customerPhone: paymentDetails.phone,
        plan: plan,
        billingCycle: billingCycle,
      };

      console.log('📦 Creating subscription with:', { plan, billingCycle });

      // Create subscription first
      const subscriptionResponse = await subscriptionService.createSubscription(plan, billingCycle);
      
      console.log('✅ Subscription created:', subscriptionResponse);

      if (subscriptionResponse.success) {
        console.log('📦 Creating payment record...');
        // Create payment record
        const paymentResponse = await paymentService.createPayment(
          subscriptionResponse.subscription._id,
          paymentMethod,
          subscription.pricing[billingCycle]
        );

        console.log('✅ Payment record created:', paymentResponse);

        if (paymentResponse.success) {
          console.log('⏳ Processing payment...');
          // Simulate successful payment processing
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          console.log('✅ Completing payment...');
          // Mark payment as completed
          await paymentService.completePayment(
            paymentResponse.payment._id,
            `TXN_${Date.now()}`, // Simulated transaction ID
            { status: 'success', method: paymentMethod }
          );

          toast.success('Payment completed successfully!');
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      console.error('Error details:', error.message);
      if (error.response) {
        console.error('Server response:', error.response);
      }
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Plan</h2>
          <p className="text-gray-600 mb-4">The selected plan is not available.</p>
          <button
            onClick={() => navigate('/pricing')}
            className="btn-primary"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Subscription
          </h1>
          <p className="text-gray-600">
            You're subscribing to the {subscription.displayName} plan
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium">{subscription.displayName}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Billing Cycle</span>
                <span className="font-medium capitalize">{billingCycle}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold text-lg">
                  {formatPrice(subscription.pricing[billingCycle])}
                </span>
              </div>
              
              {billingCycle === 'yearly' && (
                <div className="flex justify-between items-center text-green-600">
                  <span>You save</span>
                  <span className="font-medium">
                    {formatPrice(subscription.pricing.monthly * 12 - subscription.pricing.yearly)}
                  </span>
                </div>
              )}
              
              <hr className="my-4" />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(subscription.pricing[billingCycle])}</span>
              </div>
            </div>

            {/* Features */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                What's included:
              </h3>
              <ul className="space-y-2">
                {Object.entries(subscription.features).map(([key, value]) => {
                  if (typeof value === 'boolean' && value) {
                    const featureNames = {
                      maxCourses: 'Course Creation',
                      maxStudents: 'Student Management',
                      customBranding: 'Custom Branding',
                      apiAccess: 'API Access',
                      whiteLabel: 'White-label Solution',
                      prioritySupport: 'Priority Support',
                      ssoIntegration: 'SSO Integration',
                      customDomain: 'Custom Domain',
                      dedicatedManager: 'Dedicated Manager',
                    };
                    return (
                      <li key={key} className="flex items-center text-sm text-gray-600">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        {featureNames[key] || key}
                      </li>
                    );
                  }
                  return null;
                })}
              </ul>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Details
            </h2>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => handlePaymentMethodChange('credit_card')}
                  className={`flex items-center p-3 border rounded-lg transition-colors ${
                    paymentMethod === 'credit_card'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <CreditCardIcon className="h-5 w-5 mr-3" />
                  <span>Credit/Debit Card</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handlePaymentMethodChange('bank_transfer')}
                  className={`flex items-center p-3 border rounded-lg transition-colors ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <BanknotesIcon className="h-5 w-5 mr-3" />
                  <span>Bank Transfer</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handlePaymentMethodChange('digital_wallet')}
                  className={`flex items-center p-3 border rounded-lg transition-colors ${
                    paymentMethod === 'digital_wallet'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <DevicePhoneMobileIcon className="h-5 w-5 mr-3" />
                  <span>Digital Wallet</span>
                </button>
              </div>
            </div>

            {/* Payment Form Fields */}
            {paymentMethod === 'credit_card' && (
              <div className="space-y-4 mb-6">
                {/* Demo Card Button */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Testing Mode</p>
                      <p className="text-xs text-yellow-600">Use demo card details for testing</p>
                    </div>
                    <button
                      type="button"
                      onClick={fillDemoCardDetails}
                      className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors"
                    >
                      Fill Demo Card
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={paymentDetails.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={paymentDetails.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={paymentDetails.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    name="cardName"
                    value={paymentDetails.cardName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={paymentDetails.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={paymentDetails.phone}
                  onChange={handleInputChange}
                  placeholder="+94 77 123 4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={processPayment}
              disabled={processing}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing Payment...
                </div>
              ) : (
                `Pay ${formatPrice(subscription.pricing[billingCycle])}`
              )}
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              By completing this payment, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
