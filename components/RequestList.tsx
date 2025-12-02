import React from 'react';
import { FileText, Clock, CheckCircle, Download, AlertCircle, Loader2, Lock, CreditCard } from 'lucide-react';
import { UnlockRequest, RequestStatus } from '../types';

interface RequestListProps {
  requests: UnlockRequest[];
  onUnlock?: (req: UnlockRequest) => void;
}

export const RequestList: React.FC<RequestListProps> = ({ requests, onUnlock }) => {
  if (requests.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 mb-20 px-4">
      <h2 className="text-xl font-bold text-slate-900 mb-4 px-2">Your Documents</h2>
      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 animate-fade-in-up">
            <div className="flex items-start gap-4 overflow-hidden">
              <div className={`p-3 rounded-lg flex-shrink-0
                ${req.status === RequestStatus.READY ? 'bg-green-100 text-green-600' : 
                  req.status === RequestStatus.REQUESTED ? 'bg-amber-100 text-amber-600' : 
                  req.status === RequestStatus.PAYMENT_REQUIRED ? 'bg-indigo-100 text-indigo-600' :
                  req.status === RequestStatus.FAILED ? 'bg-red-100 text-red-600' :
                  'bg-slate-100 text-slate-600'}`}>
                {req.status === RequestStatus.READY ? <FileText className="h-6 w-6" /> : 
                 req.status === RequestStatus.PAYMENT_REQUIRED ? <Lock className="h-6 w-6" /> :
                 <Clock className="h-6 w-6" />}
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-slate-900 truncate pr-4" title={req.metadata?.title || req.url}>
                  {req.metadata?.title || req.url}
                </h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 mt-1">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide border border-slate-200">
                    {req.metadata?.platform || 'Unknown'}
                  </span>
                  <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="text-xs">ID: #{req.id.slice(0,6)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-shrink-0">
              {req.status === RequestStatus.READY && (
                <a 
                  href={req.unlockedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-all shadow-md shadow-green-600/20 text-sm font-bold w-full sm:w-auto justify-center"
                  download={req.metadata?.title ? `${req.metadata.title}.pdf` : 'document.pdf'}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
              )}
              {req.status === RequestStatus.REQUESTED && (
                <div className="flex items-center gap-2 text-amber-600 text-sm font-medium bg-amber-50 px-4 py-2 rounded-lg border border-amber-100 w-full sm:w-auto justify-center">
                  <Clock className="h-4 w-4 animate-pulse" />
                  Waiting for Admin
                </div>
              )}
              {req.status === RequestStatus.PAYMENT_REQUIRED && (
                <button
                   onClick={() => onUnlock && onUnlock(req)}
                   className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 text-sm font-bold w-full sm:w-auto justify-center"
                >
                  <CreditCard className="h-4 w-4" />
                  Pay to Unlock ($1.50)
                </button>
              )}
              {req.status === RequestStatus.FAILED && (
                 <div className="flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 px-4 py-2 rounded-lg border border-red-100 w-full sm:w-auto justify-center">
                  <AlertCircle className="h-4 w-4" />
                  Unavailable
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};