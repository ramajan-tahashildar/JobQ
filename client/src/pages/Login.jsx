import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Loader, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl w-full space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-500/40 bg-cyan-500/10 shadow-[0_15px_60px_-30px_rgba(56,189,248,0.65)]"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-500/30 via-cyan-400/10 to-emerald-400/20 blur-md" />
              <span className="relative text-2xl font-semibold tracking-tight text-white">JobQ</span>
            </motion.div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <h2 className="text-3xl font-semibold text-white">
              Welcome back, architect.
            </h2>
            <p className="text-sm text-slate-300">
              Reconnect with your distributed workflow and orchestrate the next batch of jobs.
            </p>
          </div>
        </div>

        <div className="card animate-slide-up px-8 py-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-200">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-cyan-200" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-cyan-200" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign in</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-slate-300">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-cyan-200 hover:text-cyan-100">
                Sign up
              </Link>
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs uppercase tracking-[0.32em] text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <span>Encryption-first infrastructure</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

