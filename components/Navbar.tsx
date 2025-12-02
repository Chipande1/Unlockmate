
import React, { useState } from 'react';
import { LockOpen, Menu, X, Shield, Home, FileText, HelpCircle, CreditCard, Info } from 'lucide-react';
import { ViewState } from '../types';

interface NavbarProps {
  onViewChange: (view: ViewState) => void;
  currentView: ViewState;
}

export const Navbar: React.FC<NavbarProps> = ({ onViewChange, currentView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNav = (view: ViewState) => {
    onViewChange(view);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => handleNav('home')}
          >
            <div className="bg-indigo-600 p-2 rounded-lg">
              <LockOpen className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">UnlockMate</span>
          </div>
          
          {/* Desktop/Mobile Menu Button */}
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <span className="font-medium hidden sm:block">Menu</span>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-fade-in-up">
                <button onClick={() => handleNav('home')} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 text-slate-700">
                  <Home className="h-4 w-4 text-slate-400" /> Home
                </button>
                <button onClick={() => handleNav('requests')} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 text-slate-700">
                  <FileText className="h-4 w-4 text-slate-400" /> My Documents
                </button>
                <button onClick={() => handleNav('pricing')} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 text-slate-700">
                  <CreditCard className="h-4 w-4 text-slate-400" /> Pricing
                </button>
                <button onClick={() => handleNav('how-it-works')} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 text-slate-700">
                  <Info className="h-4 w-4 text-slate-400" /> How it Works
                </button>
                <button onClick={() => handleNav('faq')} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 text-slate-700">
                  <HelpCircle className="h-4 w-4 text-slate-400" /> FAQ
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button onClick={() => handleNav('admin')} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 text-indigo-600 font-medium">
                  <Shield className="h-4 w-4" /> Admin Access
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
