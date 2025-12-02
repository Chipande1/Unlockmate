import React, { useState } from 'react';
import { Lock, ArrowLeft, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (password: string) => boolean;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded check - in production this would verify against a backend
    if (onLogin(password)) {
      setError('');
    } else {
      setError('Invalid access credentials');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 animate-fade-in-up">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Portal</h2>
          <p className="text-slate-500 mt-2">Restricted access for staff only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Access Code
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono"
              placeholder="••••••••"
              autoFocus
            />
            <p className="text-xs text-slate-400 mt-2 text-right">Hint: admin123</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
          >
            Authenticate
          </button>
        </form>

        <button
          onClick={onCancel}
          className="w-full mt-6 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 py-2 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to App
        </button>
      </div>
    </div>
  );
};