"use client";

import React, { useState, useEffect } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock, ArrowLeft } from 'lucide-react';

interface CheckoutFormProps {
  clientSecret: string;
  cartItems: any[];
  coupon: any;
  sessionId: string | null;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  clientSecret, 
  cartItems, 
  coupon, 
  sessionId 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState< 'success' | 'failed' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
        setIsLoading(false)
      return;
    }

    setIsLoading(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?sessionId=${sessionId}`,
      },
    });

    if (result.error) {
      setStatus("failed")
      setMessage(result.error.message || 'An error occurred');
    }else{
        setStatus("success")
    }

    setIsLoading(false);
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.salePrice * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = coupon?.discountAmount || 0;
    return subtotal - discountAmount;
  };

  const paymentElementOptions = {
    layout: 'tabs' as const,
    defaultValues: {
      billingDetails: {
        name: '',
        email: '',
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#18181b] to-[#0f0f0f] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 bg-[#ff8800]/10 rounded-xl border border-[#ff8800]/20">
              <CreditCard className="w-6 h-6 text-[#ff8800]" />
            </div>
            <h1 className="text-3xl font-bold text-white">Secure Checkout</h1>
          </div>
          <p className="text-gray-400">Complete your purchase securely</p>
        </div>

        {/* Checkout Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl p-6 border border-[#232326] shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
            
            {/* Cart Items */}
            <div className="space-y-3 mb-4">
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-[#18181b] rounded-xl">
                  <div className="w-12 h-12 bg-[#232326] rounded-lg overflow-hidden">
                    {item.images && item.images[0] && (
                      <img 
                        src={item.images[0].url} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm truncate">{item.title}</h3>
                    <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#ff8800] font-semibold text-sm">
                      ₦{(item.salePrice * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 border-t border-[#232326] pt-4">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>₦{calculateSubtotal().toLocaleString()}</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-green-400">
                  <span>Discount ({coupon.code})</span>
                  <span>-₦{coupon.discountAmount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-lg border-t border-[#232326] pt-2">
                <span>Total</span>
                <span className="text-[#ff8800]">₦{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl p-6 border border-[#232326] shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 p-3 bg-green-900/10 border border-green-500/20 rounded-xl">
                <Lock className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400 font-medium">
                  Your payment information is secure and encrypted
                </span>
              </div>

              {/* Payment Element */}
              <div className="space-y-4">
                <label className="block text-white font-medium text-lg">
                  Payment Information
                </label>
                <div className="bg-[#18181b] border border-[#232326] rounded-xl p-4 focus-within:border-[#ff8800] transition-colors duration-200">
                  <PaymentElement 
                    options={paymentElementOptions}
                    className="payment-element"
                  />
                </div>
              </div>

              {/* Error Message */}
              {message && (
                <div className={`p-4 rounded-xl border ${
                  message.includes('succeeded') 
                    ? 'bg-green-900/10 border-green-500/20 text-green-400'
                    : 'bg-red-900/10 border-red-500/20 text-red-400'
                }`}>
                  <p className="text-sm font-medium">{message}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !stripe || !elements}
                className="w-full bg-gradient-to-r from-[#ff8800] to-[#ff6600] hover:from-[#ff6600] hover:to-[#ff4400] text-[#18181b] font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Lock className="w-5 h-5" />
                    <span>Pay ₦{calculateTotal().toLocaleString()}</span>
                  </div>
                )}
              </Button>

              {/* Payment Security Info */}
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-500">
                  Powered by Stripe • Your card details are never stored on our servers
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span>🔒 SSL Encrypted</span>
                  <span>•</span>
                  <span>💳 PCI Compliant</span>
                  <span>•</span>
                  <span>🛡️ Fraud Protected</span>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@unimart.com" className="text-[#ff8800] hover:underline">
              support@unimart.com
            </a>
          </p>
        </div>
      </div>

      <style jsx global>{`
        .payment-element {
          --p-colorPrimary: #ff8800;
          --p-colorBackground: #18181b;
          --p-colorText: #ffffff;
          --p-colorDanger: #ef4444;
          --p-fontFamily: 'Inter', system-ui, sans-serif;
          --p-borderRadius: 8px;
          --p-borderColor: #232326;
        }
      `}</style>
    </div>
  );
};

export default CheckoutForm;
