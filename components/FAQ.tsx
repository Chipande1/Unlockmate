import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "What platforms do you support?",
    answer: "We primarily support unlocking documents from major study platforms including CourseHero, Studocu, and Scribd. Our AI automatically validates the link before you pay to ensure compatibility."
  },
  {
    question: "How much does it cost?",
    answer: "We offer two simple pricing tiers: $1.50 USD for a single document unlock, or $15.00 USD for Lifetime Access which grants you unlimited unlocks forever."
  },
  {
    question: "How long does it take to get my document?",
    answer: "Most documents are processed and available for download instantly after payment. In some complex cases, it may take a few minutes for our system to retrieve and convert the file."
  },
  {
    question: "What if the document isn't what I wanted?",
    answer: "Our AI analysis previews the document title and metadata before you pay so you know exactly what you're getting. If the downloaded file is corrupted or incorrect due to a technical error on our end, we offer a full refund."
  },
  {
    question: "Do I need an account?",
    answer: "No account is required for single unlocks—we just send the file to your email. However, if you purchase Lifetime Access, we'll help you set up a simple login to manage your unlimited downloads."
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="w-full max-w-3xl mx-auto py-16 px-4" id="faq">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-full mb-4">
          <HelpCircle className="h-6 w-6 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
        <p className="mt-2 text-slate-600">Everything you need to know about UnlockMate</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div 
            key={idx} 
            className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-all duration-200 hover:border-indigo-200 hover:shadow-sm"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-6 text-left focus:outline-none bg-white"
            >
              <span className="font-semibold text-slate-900 pr-8">{faq.question}</span>
              {openIndex === idx ? (
                <ChevronUp className="h-5 w-5 text-indigo-600 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
              )}
            </button>
            <div 
              className={`px-6 text-slate-600 bg-slate-50 overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === idx ? 'max-h-48 py-4 border-t border-slate-100 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="leading-relaxed">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};