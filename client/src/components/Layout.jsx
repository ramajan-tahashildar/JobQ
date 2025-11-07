import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, LayoutDashboard, PlusCircle, List } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from './AnimatedBackground';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <AnimatedBackground />

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 dark:bg-slate-900/70"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 via-sky-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md shadow-sky-500/30">
                  <span className="text-white font-bold text-lg tracking-tight">J</span>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xl font-semibold text-slate-900 dark:text-white">
                    JobQ
                  </span>
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                    NEXT-GEN QUEUE
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/jobs"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
              >
                <List className="w-4 h-4" />
                <span>All Jobs</span>
              </Link>
              <Link
                to="/jobs/create"
                className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400 text-white font-medium shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Job</span>
              </Link>
              <div className="flex items-center space-x-3 pl-4 border-l border-white/20">
                <span className="text-sm text-slate-500 dark:text-slate-300">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800"
              >
                <List className="w-5 h-5" />
                <span>All Jobs</span>
              </Link>
              <Link
                to="/jobs/create"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400 text-white font-medium shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Create Job</span>
              </Link>
              <div className="pt-2 border-t border-white/20">
                <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-300">{user?.name}</div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-slate-600 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.nav>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-white/5 blur-3xl" aria-hidden />
        <div className="relative">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

