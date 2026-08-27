import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/biobridge/dashboard');
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Login failed. Please try again.');
      } else {
        setError(err?.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setForgotSent(true);
      setError('');
    } catch {
      setError('Could not process request. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3" aria-label="APD EQUILEARN">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-300" />
              <img
                src="./logo.png"
                alt="APD EQUILEARN Logo"
                className="relative w-24 h-24 object-contain rounded-2xl shadow-2xl bg-slate-900/90 p-1 border border-white/20"
              />
            </div>
            <div className="text-center px-4">
              <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">APD EQUILEARN</h1>
              <p className="text-cyan-300 text-xs sm:text-sm font-medium mt-1 leading-snug">Empowering Diverse Learners Through Accessible Biotechnology Education and Innovation</p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Welcome back</h2>

          {/* Error */}
          {error && (
            <div role="alert" aria-live="polite" className="flex items-start gap-3 p-4 bg-error-500/20 border border-error-500/30 rounded-xl mb-6 text-error-200">
              <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Forgot password success */}
          {forgotSent && (
            <div role="status" aria-live="polite" className="flex items-start gap-3 p-4 bg-success-500/20 border border-success-500/30 rounded-xl mb-6 text-success-200">
              <span className="text-sm">✓ Password reset link sent (if the email exists in our system).</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                    aria-describedby={error ? 'login-error' : undefined}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="Your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 rounded"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary-300 hover:text-primary-200 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                    Signing in...
                  </>
                ) : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-slate-300 text-sm">
            New to SAKSHAM?{' '}
            <Link to="/register" className="text-primary-300 hover:text-primary-200 font-semibold transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
