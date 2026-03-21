import React, { useState } from 'react';
import { Lock, AlertCircle, Beaker, KeyRound, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const LoginPage = ({ onLoginSuccess }) => {
  const [isResetMode, setIsResetMode] = useState(false);
  const [password, setPassword] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { password });
      if (res.data.success) {
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid company password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset', { 
        masterKey, 
        newPassword 
      });
      if (res.data.success) {
        setSuccess('Password reset successfully. You can now log in.');
        setTimeout(() => {
          setIsResetMode(false);
          setPassword('');
          setMasterKey('');
          setNewPassword('');
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full mb-4">
            {isResetMode ? (
              <KeyRound className="text-indigo-600 dark:text-indigo-400" size={32} />
            ) : (
              <Beaker className="text-indigo-600 dark:text-indigo-400" size={32} />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isResetMode ? 'Reset Password' : 'Perfume Lab Access'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-center mt-2">
            {isResetMode ? 'Enter the Master Key to set a new password' : 'Authorized Personnel Only'}
          </p>
        </div>

        {!isResetMode ? (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Company Password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              {isLoading ? 'Verifying...' : 'Enter Dashboard'}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => { setIsResetMode(true); setError(''); }}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-5">
            <div>
              <input
                type="password"
                autoFocus
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="Master Recovery Key"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Company Password"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-center font-medium">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !masterKey || !newPassword}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-colors"
            >
              {isLoading ? 'Resetting...' : 'Set New Password'}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => { setIsResetMode(false); setError(''); setSuccess(''); }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft size={16} /> Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;