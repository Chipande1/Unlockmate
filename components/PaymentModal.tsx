
import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, Loader2, CheckCircle, Mail } from 'lucide-react';
import { UnlockType } from '../types';

// ==========================================
// PAYSTACK CONFIGURATION
// ==========================================
// 1. Get your Public Key from: https://dashboard.paystack.com/#/settings/developer
const PAYSTACK_PUBLIC_KEY = 'pk_live_0f052a466b0e920d71c668af07a7a557db2fd347'; 

// 2. Set your preferred currency (NGN, GHS, ZAR, USD)
const CURRENCY = 'USD'; 
// ==========================================

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  planType: UnlockType | null;
  amount: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  planType, 
  amount 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setIsSuccess(false);
      setEmail('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePaystackPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsProcessing(true);

    const PaystackPop = (window as any).PaystackPop;

    if (!PaystackPop) {
      alert("Paystack failed to load. Please check your internet connection.");
      setIsProcessing(false);
      return;
    }

    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amount * 100, // Paystack expects amount in lowest currency unit (kobo/cents)
      currency: CURRENCY,
      metadata: {
        custom_fields: [
          {
            display_name: "Plan Type",
            variable_name: "plan_type",
            value: planType === UnlockType.LIFETIME ? "Lifetime Access" : "Single Unlock"
          }
        ]
      },
      callback: function(response: any) {
        // Payment successful
        console.log("Payment Reference:", response.reference);
        setIsProcessing(false);
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      },
      onClose: function() {
        // Payment modal closed
        setIsProcessing(false);
      }
    });

    handler.openIframe();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up relative">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <Lock className="h-4 w-4 text-indigo-600" />
            <span>Secure Checkout</span>
          </div>
          {!isProcessing && !isSuccess && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 animate-bounce">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
            <p className="text-slate-500">Unlocking your document...</p>
          </div>
        ) : (
          /* Form State */
          <div className="p-6">
            <div className="mb-6 flex justify-between items-end border-b border-slate-100 pb-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total to pay</p>
                <h2 className="text-3xl font-bold text-slate-900">${amount.toFixed(2)}</h2>
              </div>
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {planType === UnlockType.LIFETIME ? 'Lifetime Access' : 'Single Unlock'}
              </span>
            </div>

            <form onSubmit={handlePaystackPayment} className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 mb-4">
                <strong>Paystack Integration:</strong> Please provide your email to receive the receipt.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing || !email}
                className="w-full mt-4 bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay Now
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-3 w-3" />
              <span>Secured by Paystack</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
