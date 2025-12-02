
import React, { useState, useRef } from 'react';
import { Check, X, Upload, DollarSign, Clock, FileText, Search, LogOut, FileUp, AlertCircle, Eye, Mail, MessageCircle, ExternalLink, Ban, Loader2 } from 'lucide-react';
import { UnlockRequest, RequestStatus, UnlockType } from '../types';
import { api } from '../services/api';

interface AdminDashboardProps {
  requests: UnlockRequest[];
  onUpdateRequest: (updatedRequest: UnlockRequest) => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ requests, onUpdateRequest, onLogout }) => {
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for fulfillment modal
  const [fulfillingRequestId, setFulfillingRequestId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [externalLink, setExternalLink] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = {
    totalRevenue: requests.reduce((acc, req) => {
      // Revenue only counts for READY status (paid)
      if (req.status === RequestStatus.READY) {
        return acc + (req.unlockType === UnlockType.LIFETIME ? 15.00 : 1.50);
      }
      return acc;
    }, 0),
    pendingAction: requests.filter(r => r.status === RequestStatus.REQUESTED).length, 
    awaitingPayment: requests.filter(r => r.status === RequestStatus.PAYMENT_REQUIRED).length,
    completedOrders: requests.filter(r => r.status === RequestStatus.READY).length,
  };

  const handleOpenFulfill = (reqId: string) => {
    setFulfillingRequestId(reqId);
    setUploadedFile(null);
    setExternalLink('');
  };

  const handleCloseFulfill = () => {
    setFulfillingRequestId(null);
    setUploadedFile(null);
    setExternalLink('');
    setIsSubmitting(false);
  };

  const handleSubmitFulfillment = async () => {
    if (!fulfillingRequestId) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      }
      if (externalLink) {
        formData.append('externalLink', externalLink);
      }

      // Call API (Local Storage)
      const updatedReq = await api.fulfillRequest(fulfillingRequestId, formData);
      
      onUpdateRequest(updatedReq); // Trigger refresh in parent
      
      // Trigger Email Client Manually since we have no backend
      if (updatedReq.email) {
        const subject = encodeURIComponent(`Document Ready: ${updatedReq.metadata?.title || 'UnlockMate Request'}`);
        const body = encodeURIComponent(`Hello,\n\nYour document "${updatedReq.metadata?.title || 'requested file'}" has been unlocked and is ready for download.\n\nPlease return to UnlockMate to complete your payment and access the file.\n\nThank you!`);
        window.location.href = `mailto:${updatedReq.email}?subject=${subject}&body=${body}`;
      } else {
        alert("Document saved. No email provided for this client.");
      }

      handleCloseFulfill();
    } catch (error) {
      console.error(error);
      alert("Failed to save document details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (req: UnlockRequest) => {
    if (confirm('Are you sure you want to cancel this order? This will mark it as unavailable for the user.')) {
      try {
        await api.cancelRequest(req.id);
        // Optimistic update or refresh
        onUpdateRequest({ ...req, status: RequestStatus.FAILED });
      } catch (error) {
        alert("Failed to cancel order");
      }
    }
  };

  const handleMessage = (req: UnlockRequest) => {
    if (!req.email) return;
    const subject = encodeURIComponent(`Update regarding your UnlockMate Request #${req.id.slice(0, 6)}`);
    const body = encodeURIComponent(`Hello,\n\nRegarding your document request for: ${req.metadata?.title || req.url}\n\n`);
    window.location.href = `mailto:${req.email}?subject=${subject}&body=${body}`;
  };

  const filteredRequests = requests.filter(req => {
    const matchesFilter = filter === 'ALL' || req.status === filter;
    const matchesSearch = (req.metadata?.title || req.url).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="animate-fade-in-up relative">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500">Manage orders and fulfill document unlocks</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">To Review</p>
              <p className="text-xl font-bold text-slate-900">{stats.pendingAction}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Unpaid</p>
              <p className="text-xl font-bold text-slate-900">{stats.awaitingPayment}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Revenue</p>
              <p className="text-xl font-bold text-slate-900">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
          {onLogout && (
            <button 
              onClick={onLogout}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-slate-600 hover:text-red-600 hover:border-red-200 transition-colors"
              title="Logout"
            >
              <LogOut className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by title or URL..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Requests</option>
            <option value={RequestStatus.REQUESTED}>New Requests (Action Needed)</option>
            <option value={RequestStatus.PAYMENT_REQUIRED}>Awaiting Payment</option>
            <option value={RequestStatus.READY}>Completed</option>
            <option value={RequestStatus.FAILED}>Cancelled/Failed</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <th className="px-6 py-4">Request Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No requests found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded text-slate-500">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="max-w-xs">
                          <div className="font-medium text-slate-900 truncate" title={req.metadata?.title}>
                            {req.metadata?.title || 'Unknown Title'}
                          </div>
                          
                          {/* Clickable Link */}
                          <a 
                            href={req.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium truncate mb-1"
                            title="Open Link"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Open Document Link
                          </a>

                          {req.email && (
                            <div className="flex items-center gap-1 text-xs text-slate-500 group cursor-pointer" onClick={() => handleMessage(req)}>
                              <Mail className="h-3 w-3" />
                              <span className="group-hover:text-indigo-600 transition-colors">{req.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${req.status === RequestStatus.READY ? 'bg-green-100 text-green-800' : 
                          req.status === RequestStatus.PAYMENT_REQUIRED ? 'bg-blue-100 text-blue-800' : 
                          req.status === RequestStatus.REQUESTED ? 'bg-indigo-100 text-indigo-800' :
                          req.status === RequestStatus.FAILED ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                        {req.status === RequestStatus.REQUESTED ? 'NEW REQUEST' : req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {req.email && req.status !== RequestStatus.FAILED && (
                          <button
                            onClick={() => handleMessage(req)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Message Customer"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                        )}

                        {req.status === RequestStatus.REQUESTED && (
                          <button 
                            onClick={() => handleOpenFulfill(req.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
                            title="Upload Document"
                          >
                            <Upload className="h-4 w-4" />
                            Upload
                          </button>
                        )}
                        
                        {req.status !== RequestStatus.FAILED && (
                          <button 
                            onClick={() => handleCancel(req)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel Order"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fulfillment Modal */}
      {fulfillingRequestId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up">
            <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <FileUp className="h-5 w-5" />
                Upload Document
              </h3>
              <button 
                onClick={handleCloseFulfill}
                disabled={isSubmitting}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
               <p className="text-sm text-slate-500">
                  Upload the unlocked document. <br/>
                  <span className="font-semibold text-indigo-600">Action:</span> This will save the details and open your email client to notify the user.
               </p>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700 mb-1 block">Option 1: Upload File</span>
                  <div 
                    onClick={() => !isSubmitting && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                      ${uploadedFile ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50'}
                      ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx"
                      disabled={isSubmitting}
                    />
                    {uploadedFile ? (
                      <div className="flex flex-col items-center text-green-700">
                        <FileText className="h-8 w-8 mb-2" />
                        <span className="font-semibold text-sm">{uploadedFile.name}</span>
                        <span className="text-xs opacity-75">Click to change</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-slate-500">
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="font-medium text-sm">Click to select PDF</span>
                      </div>
                    )}
                  </div>
                </label>

                <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-bold">OR</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700 mb-1 block">Option 2: External Link</span>
                  <input 
                    type="url"
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    disabled={!!uploadedFile || isSubmitting}
                  />
                </label>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleCloseFulfill}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitFulfillment}
                  disabled={(!uploadedFile && !externalLink) || isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 transition-all whitespace-nowrap flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save & Notify'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
