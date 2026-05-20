import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, Mail, Lock, Eye, EyeOff, ArrowLeft, MailCheck, RefreshCw } from 'lucide-react';

type AuthView = 'login' | 'signup' | 'confirmation-pending';

export function Auth() {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { signIn, signUp, resendConfirmation, isEmailUnconfirmed } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (view === 'signup') {
        const { error, needsConfirmation } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else if (needsConfirmation) {
          setView('confirmation-pending');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            setView('confirmation-pending');
          } else {
            setError(error.message);
          }
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setError('');

    try {
      const { error } = await resendConfirmation(email);
      if (error) {
        setError(error.message);
      } else {
        setResendSuccess(true);
      }
    } catch {
      setError('Failed to resend confirmation email');
    } finally {
      setResendLoading(false);
    }
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    setError('');
    setResendSuccess(false);
  };

  if (view === 'confirmation-pending' || isEmailUnconfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl mb-4 shadow-lg shadow-orange-500/20">
                <MailCheck className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Check your email
              </h1>
              <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                We sent a confirmation link to
              </p>
              <p className="text-gray-900 font-medium text-sm mt-1">
                {email}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <p className="text-blue-700 text-sm leading-relaxed">
                Click the link in the email to verify your account. The link expires after 24 hours.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {resendSuccess && (
              <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-2.5 rounded-lg text-sm mb-4">
                Confirmation email sent! Check your inbox.
              </div>
            )}

            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mb-3"
            >
              <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
              {resendLoading ? 'Sending...' : 'Resend confirmation email'}
            </button>

            <button
              onClick={() => switchView('login')}
              className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 py-2 text-sm font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Did not receive the email? Check your spam folder.
          </p>
        </div>
      </div>
    );
  }

  const isSignup = view === 'signup';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl mb-4 shadow-lg shadow-blue-500/20">
              {isSignup ? (
                <UserPlus className="w-7 h-7 text-white" />
              ) : (
                <LogIn className="w-7 h-7 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isSignup ? 'Create account' : 'Welcome back'}
            </h1>
            <p className="text-gray-500 mt-1.5 text-sm">
              {isSignup
                ? 'Sign up with your email and password'
                : 'Sign in to access your resources'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder:text-gray-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder:text-gray-400"
                  placeholder={isSignup ? '6+ characters' : 'Enter your password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 active:from-blue-800 active:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-500/20"
            >
              {loading
                ? 'Processing...'
                : isSignup
                  ? 'Create account'
                  : 'Sign in'}
            </button>
          </form>

          {isSignup && (
            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-3">
              <p className="text-amber-700 text-xs leading-relaxed">
                A confirmation email will be sent to verify your account. You must confirm your email before signing in.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => switchView(isSignup ? 'login' : 'signup')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition"
            >
              {isSignup
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
