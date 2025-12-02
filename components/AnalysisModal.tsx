
import React from 'react';
import { Sparkles, Mail, Send, X } from 'lucide-react';
import { UnlockRequest } from '../types';

interface AnalysisModalProps {
  isOpen: boolean;
  request: UnlockRequest | null;
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  request,
  email,
  onEmailChange,
  onSubmit,
  onCancel
}) => {
  if (!isOpen || !request || !request.metadata) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-white text-lg font-bold flex items-center gap-2">
            <Sparkles className="text-indigo-400 h-5 w-5" />
            Document Analysis Complete
          </h2>
          <button 
            onClick={onCancel} 
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Title</label>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{request.metadata.title}</h3>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Summary</label>
                <p className="text-slate-600 leading-relaxed text-sm">{request.metadata.summary}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Platform</label>
                  <p className="font-semibold text-slate-900 text-sm bg-indigo-50 text-indigo-700 px-2 py-1 rounded inline-block">
                    {request.metadata.platform}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Subject</label>
                  <p className="font-semibold text-slate-900 text-sm">
                    {request.metadata.subject}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0 min-w-[240px]">
              
              <div className="w-full">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Email for Notification
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@email.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-auto pt-2 space-y-3">
                <button 
                  onClick={onSubmit}
                  disabled={!email}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  Request Unlock
                </button>
                <button 
                  onClick={onCancel}
                  className="w-full text-slate-500 hover:text-slate-700 font-medium text-sm py-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
              
              <p className="text-xs text-center text-slate-400 leading-tight">
                We'll check availability and notify you via email when the file is ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
