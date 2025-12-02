import React from 'react';
import { Check, Zap, Infinity } from 'lucide-react';
import { PricingOption, UnlockType } from '../types';

interface PricingCardsProps {
  onSelect: (type: UnlockType) => void;
}

const options: PricingOption[] = [
  {
    id: UnlockType.SINGLE,
    title: "Single Unlock",
    price: 1.50,
    description: "Perfect for that one assignment you need right now.",
    features: [
      "Instant PDF Download",
      "Full Quality Document",
      "Email Delivery Backup",
      "24/7 Support"
    ],
    recommended: false
  },
  {
    id: UnlockType.LIFETIME,
    title: "Lifetime Access",
    price: 15.00,
    description: "Unlock as many documents as you need, forever.",
    features: [
      "Unlimited Unlocks",
      "Priority Processing",
      "All Platforms Supported",
      "Premium Support",
      "No Monthly Fees"
    ],
    recommended: true
  }
];

export const PricingCards: React.FC<PricingCardsProps> = ({ onSelect }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto mt-8">
      {options.map((option) => (
        <div 
          key={option.id}
          className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer
            ${option.recommended ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-100'}`}
          onClick={() => onSelect(option.id)}
        >
          {option.recommended && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm">
              Best Value
            </div>
          )}
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${option.recommended ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                {option.id === UnlockType.LIFETIME ? <Infinity className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-slate-900">${option.price.toFixed(2)}</span>
                <span className="text-slate-500 text-sm block">USD</span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">{option.title}</h3>
            <p className="text-slate-600 mb-6">{option.description}</p>

            <ul className="space-y-3 mb-8">
              {option.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all
                ${option.recommended 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20' 
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
            >
              Choose {option.title}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};