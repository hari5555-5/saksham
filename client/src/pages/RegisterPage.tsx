import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ACCESS_OPTIONS = [
  { id: 'screenReader', label: 'Screen Reader', description: 'Optimized for screen reader software' },
  { id: 'highContrast', label: 'High Contrast', description: 'Enhanced contrast for visual clarity' },
  { id: 'textToSpeech', label: 'Text-to-Speech', description: 'Read content aloud automatically' },
  { id: 'signLanguage', label: 'Sign Language Support', description: 'Show sign language video content' },
  { id: 'reducedMotion', label: 'Reduced Motion', description: 'Minimize animations and transitions' },
  { id: 'darkMode', label: 'Dark Mode', description: 'Dark background for eye comfort' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accessPrefs, setAccessPrefs] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));
  const togglePref = (id: string) => setAccessPrefs(p => ({ ...p, [id]: !p[id] }));

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your full name.';
    if (!form.email.trim()) return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');
    setIsLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone || undefined,
        accessibilityPreferences: accessPrefs,
      });
      navigate('/');
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
      } else {
        setError(err?.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-slate-900 flex items-center justify-center p-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-2xl">S</div>
            <h1 className="text-2xl font-display font-black text-white">SAKSHAM</h1>
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
          <p className="text-slate-300 text-sm mb-6">Join SAKSHAM and make learning accessible</p>

          {error && (
            <div role="alert" aria-live="polite" className="flex items-start gap-3 p-4 bg-error-500/20 border border-error-500/30 rounded-xl mb-6 text-error-200">
              <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-slate-200 mb-1.5">Full Name <span aria-label="required">*</span></label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    id="reg-name" type="text" autoComplete="name" required
                    value={form.name} onChange={e => update('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-slate-200 mb-1.5">Email Address <span aria-label="required">*</span></label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    id="reg-email" type="email" autoComplete="email" required
                    value={form.email} onChange={e => update('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="reg-phone" className="block text-sm font-medium text-slate-200 mb-1.5">Phone Number <span className="text-slate-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    id="reg-phone" type="tel" autoComplete="tel"
                    value={form.phone} onChange={e => update('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-slate-200 mb-1.5">Password <span aria-label="required">*</span></label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    id="reg-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required
                    value={form.password} onChange={e => update('password', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="At least 8 characters"
                    aria-describedby="password-hint"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
                <p id="password-hint" className="mt-1 text-xs text-slate-400">Minimum 8 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-200 mb-1.5">Confirm Password <span aria-label="required">*</span></label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    id="reg-confirm" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" required
                    value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all ${
                      form.confirmPassword && form.password !== form.confirmPassword ? 'border-error-500/50' : 'border-white/20'
                    }`}
                    placeholder="Re-enter password"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded" aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                    {showConfirm ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <p className="mt-1 text-xs text-success-400 flex items-center gap-1"><Check size={12} aria-hidden="true" /> Passwords match</p>
                )}
              </div>

              {/* Accessibility Preferences */}
              <fieldset className="border border-white/20 rounded-xl p-4">
                <legend className="px-2 text-sm font-semibold text-slate-200">
                  Accessibility Preferences <span className="font-normal text-slate-400">(optional)</span>
                </legend>
                <p className="text-xs text-slate-400 mb-3">Select any that apply to you — these can be changed anytime</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ACCESS_OPTIONS.map(opt => (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                        accessPrefs[opt.id] ? 'bg-primary-500/20 border border-primary-400/40' : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!accessPrefs[opt.id]}
                        onChange={() => togglePref(opt.id)}
                        className="mt-0.5 rounded accent-primary-500"
                        aria-label={opt.label}
                      />
                      <div>
                        <div className="text-sm font-medium text-white">{opt.label}</div>
                        <div className="text-xs text-slate-400">{opt.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-white"
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Creating account...</>
                ) : 'Create Account'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-slate-300 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-300 hover:text-primary-200 font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
