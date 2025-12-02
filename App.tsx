
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RequestList } from './components/RequestList';
import { HowItWorks } from './components/HowItWorks';
import { FAQ } from './components/FAQ';
import { PricingCards } from './components/PricingCards';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { PaymentModal } from './components/PaymentModal';
import { AnalysisModal } from './components/AnalysisModal';
import { analyzeUrl } from './services/geminiService';
import { api } from './services/api';
import { UnlockRequest, RequestStatus, UnlockType, ViewState } from './types';
import { ArrowRight, Search, Sparkles, Loader2, ShieldCheck, Check, AlertCircle, Lock } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [requests, setRequests] = useState<UnlockRequest[]>([]);
  
  // Auth state
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Modal states
  const [analysisResult, setAnalysisResult] = useState<UnlockRequest | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const [paymentRequest, setPaymentRequest] = useState<UnlockRequest | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Load data
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await api.fetchRequests();
      setRequests(data);
    } catch (error) {
      console.error("Failed to load requests", error);
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError('');

    let processedUrl = url.trim();
    if (!processedUrl) {
      setUrlError('Please enter a URL');
      return;
    }

    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl;
    }

    if (!isValidUrl(processedUrl)) {
      setUrlError('Please enter a valid URL (e.g., https://coursehero.com/...)');
      return;
    }

    setIsAnalyzing(true);
    try {
      // 1. Analyze metadata
      const metadata = await analyzeUrl(processedUrl);
      
      // 2. Prepare temporary request object for preview
      const tempRequest: UnlockRequest = {
        id: 'temp',
        url: processedUrl,
        status: RequestStatus.IDLE,
        metadata: metadata,
        createdAt: Date.now()
      };

      setAnalysisResult(tempRequest);
      setShowAnalysisModal(true);
    } catch (error) {
      console.error(error);
      setUrlError('Failed to analyze URL. Please check the link and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!analysisResult || !userEmail) return;

    try {
      const newReq = await api.createRequest({
        url: analysisResult.url,
        metadata: analysisResult.metadata,
        email: userEmail
      });
      
      setRequests(prev => [newReq, ...prev]);
      setShowAnalysisModal(false);
      setAnalysisResult(null);
      setUserEmail('');
      setUrl('');
      setCurrentView('requests');
    } catch (error) {
      alert("Failed to create request");
    }
  };

  const handleAdminLogin = (password: string) => {
    if (password === 'admin123') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const handleUnlockClick = (req: UnlockRequest) => {
    setPaymentRequest(req);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    if (!paymentRequest) return;
    
    // Default to single unlock if not specified
    const type = UnlockType.SINGLE; 
    
    try {
      const updated = await api.confirmPayment(paymentRequest.id, type);
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
      setShowPaymentModal(false);
      setPaymentRequest(null);
    } catch (error) {
      console.error("Payment confirmation failed", error);
    }
  };

  // Views
  const renderContent = () => {
    if (currentView === 'admin') {
      if (!isAdmin) {
        return <AdminLogin onLogin={handleAdminLogin} onCancel={() => setCurrentView('home')} />;
      }
      return (
        <AdminDashboard 
          requests={requests} 
          onUpdateRequest={(updated) => setRequests(prev => prev.map(r => r.id === updated.id ? updated : r))}
          onLogout={() => { setIsAdmin(false); setCurrentView('home'); }}
        />
      );
    }

    switch (currentView) {
      case 'requests':
        return (
          <div className="animate-fade-in-up">
            <div className="text-center py-10 bg-indigo-600 rounded-2xl mb-8 text-white mx-4 mt-4 shadow-lg shadow-indigo-600/20">
               <h1 className="text-3xl font-bold mb-2">Your Documents</h1>
               <p className="opacity-90">Track status and download unlocked files</p>
            </div>
            <RequestList requests={requests} onUnlock={handleUnlockClick} />
            {requests.length === 0 && (
               <div className="text-center py-12 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200 mx-4 max-w-4xl lg:mx-auto">
                 <p className="mb-4">You haven't requested any documents yet.</p>
                 <button onClick={() => setCurrentView('home')} className="text-indigo-600 font-bold hover:underline">
                   Unlock your first document
                 </button>
               </div>
            )}
          </div>
        );
      case 'pricing':
        return (
           <div className="py-12 px-4 animate-fade-in-up">
             <div className="text-center mb-10">
               <h1 className="text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h1>
               <p className="text-slate-600 max-w-2xl mx-auto">Pay per document or get lifetime access. No hidden fees.</p>
             </div>
             <PricingCards onSelect={(type) => {
               setCurrentView('home');
               setTimeout(() => document.getElementById('url-input')?.focus(), 100);
             }} />
           </div>
        );
      case 'how-it-works':
        return <HowItWorks />;
      case 'faq':
        return <FAQ />;
      case 'home':
      default:
        return (
          <div className="animate-fade-in-up">
            {/* Hero Section */}
            <div className="py-16 sm:py-24 px-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-medium text-sm mb-8 animate-bounce-slow border border-indigo-100">
                <Sparkles className="h-4 w-4" />
                <span>AI-Powered Document Unlocking</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
                Unlock Course Materials <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  in Seconds
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Access study documents from CourseHero, Studocu, and Scribd instantly. 
                Pay only when your document is ready.
              </p>

              <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto relative mb-6">
                <div className="relative group">
                  <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${urlError ? 'from-red-500 to-red-500 opacity-50' : ''}`}></div>
                  <div className="relative flex items-center bg-white rounded-xl p-2 shadow-xl border border-slate-200">
                    <Search className="h-6 w-6 text-slate-400 ml-3" />
                    <input
                      id="url-input"
                      type="text"
                      placeholder="Paste your document URL here..."
                      className="flex-1 px-4 py-3 text-lg outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        if (urlError) setUrlError('');
                      }}
                    />
                    <button 
                      type="submit"
                      disabled={isAnalyzing || !url}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Unlock <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {urlError && (
                  <div className="absolute top-full left-0 mt-2 flex items-center gap-1 text-red-500 text-sm font-medium animate-fade-in-up">
                    <AlertCircle className="h-4 w-4" />
                    {urlError}
                  </div>
                )}
              </form>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 mt-8">
                <div className="flex items-center gap-1.5">
                   <ShieldCheck className="h-5 w-5 text-green-500" />
                   <span className="font-medium">Secure Payment</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <Check className="h-5 w-5 text-green-500" />
                   <span className="font-medium">Verified Unlocks</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <Lock className="h-5 w-5 text-green-500" />
                   <span className="font-medium">Pay Only When Ready</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg text-slate-900">UnlockMate</span>
              </div>
              <p className="text-slate-500 text-sm">
                Empowering students with affordable access to study materials.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Service</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><button onClick={() => setCurrentView('home')} className="hover:text-indigo-600 transition-colors">Home</button></li>
                <li><button onClick={() => setCurrentView('requests')} className="hover:text-indigo-600 transition-colors">My Requests</button></li>
                <li><button onClick={() => setCurrentView('pricing')} className="hover:text-indigo-600 transition-colors">Pricing</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><button onClick={() => setCurrentView('how-it-works')} className="hover:text-indigo-600 transition-colors">How it Works</button></li>
                <li><button onClick={() => setCurrentView('faq')} className="hover:text-indigo-600 transition-colors">FAQ</button></li>
                <li><button onClick={() => setCurrentView('admin')} className="hover:text-indigo-600 transition-colors">Admin</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} UnlockMate. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnalysisModal 
        isOpen={showAnalysisModal}
        request={analysisResult}
        email={userEmail}
        onEmailChange={setUserEmail}
        onSubmit={handleSubmitRequest}
        onCancel={() => {
          setShowAnalysisModal(false);
          setAnalysisResult(null);
          setUserEmail('');
        }}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentRequest(null);
        }}
        onSuccess={handlePaymentSuccess}
        planType={UnlockType.SINGLE} // Default for individual unlock
        amount={1.50} // Default price
      />
    </div>
  );
}

export default App;
