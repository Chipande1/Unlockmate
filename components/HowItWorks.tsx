import React from 'react';
import { Link, Sparkles, CreditCard, Download } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <div id="how-it-works" className="w-full py-12 border-t border-slate-200 mt-12 mb-8 animate-fade-in-up">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-slate-900">How UnlockMate Works</h2>
        <p className="mt-2 text-slate-600">Get your study materials in 4 simple steps</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
        {/* Connecting line for desktop */}
        <div className="hidden md:block absolute top-6 left-[12%] right-[12%] h-0.5 bg-slate-100 -z-10" />

        {[
          {
            icon: Link,
            title: "1. Paste Link",
            desc: "Copy the document URL from CourseHero, Studocu, or Scribd."
          },
          {
            icon: Sparkles,
            title: "2. AI Analysis",
            desc: "Our Gemini engine analyzes the file to confirm availability."
          },
          {
            icon: CreditCard,
            title: "3. Unlock",
            desc: "Choose Single Unlock ($1.50) or Lifetime Access ($15.00)."
          },
          {
            icon: Download,
            title: "4. Download",
            desc: "Instantly receive your unlocked PDF document."
          }
        ].map((step, idx) => (
          <div key={idx} className="flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-white border-2 border-slate-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:border-indigo-500 group-hover:scale-110 transition-all duration-300 z-10">
              <step.icon className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
            <p className="text-sm text-slate-500 px-4">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};