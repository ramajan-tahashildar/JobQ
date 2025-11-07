import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { jobsAPI } from '../services/api';
import {
    Activity,
    CheckCircle,
    Clock,
    XCircle,
    Loader,
    PlusCircle,
    TrendingUp,
    FileText,
    Cpu,
    Sparkles,
    Zap,
} from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    success: 0,
    failed: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [allJobs, recentResponse] = await Promise.all([
        jobsAPI.list({ limit: 1000 }),
        jobsAPI.list({ limit: 5 }),
      ]);

      const jobs = allJobs.data.jobs || [];
      const statusCounts = jobs.reduce((acc, job) => {
        acc.total++;
        acc[job.status.toLowerCase()] = (acc[job.status.toLowerCase()] || 0) + 1;
        return acc;
      }, { total: 0, pending: 0, processing: 0, success: 0, failed: 0 });

      setStats(statusCounts);
      setRecentJobs(recentResponse?.data?.jobs || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'PROCESSING':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/15 border border-amber-500/40 text-amber-200';
      case 'PROCESSING':
        return 'bg-sky-500/15 border border-sky-500/40 text-sky-200';
      case 'SUCCESS':
        return 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-200';
      case 'FAILED':
        return 'bg-rose-500/15 border border-rose-500/40 text-rose-200';
      default:
        return 'bg-slate-500/15 border border-slate-500/40 text-slate-200';
    }
  };

  const statsCards = [
    {
      label: 'Total Jobs',
      value: stats.total,
      icon: TrendingUp,
      accent: 'from-sky-500/40 via-cyan-400/30 to-emerald-400/40',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      accent: 'from-amber-500/40 via-orange-400/30 to-yellow-400/40',
    },
    {
      label: 'Processing',
      value: stats.processing,
      icon: Zap,
      accent: 'from-sky-500/50 via-blue-500/30 to-indigo-500/40',
    },
    {
      label: 'Success',
      value: stats.success,
      icon: CheckCircle,
      accent: 'from-emerald-500/50 via-teal-400/30 to-lime-400/40',
    },
    {
      label: 'Failed',
      value: stats.failed,
      icon: XCircle,
      accent: 'from-rose-500/50 via-pink-500/30 to-red-500/40',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-950/95 p-8 md:p-10 shadow-[0_40px_120px_-50px_rgba(15,118,110,0.45)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.25),rgba(8,47,73,0))]" />
        <div className="relative grid gap-8 md:grid-cols-[1.4fr,1fr] items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center space-x-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-cyan-200">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <span>Tech-forward orchestration</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-white">
              Command your distributed jobs with <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300">precision and style</span>.
            </h1>
            <p className="text-base md:text-lg text-slate-300 leading-relaxed">
              Real-time telemetry, AI-ready insights, and a vibrant dashboard experience built for engineers who love beautiful tools.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/jobs/create"
                className="btn-primary flex items-center space-x-2 px-5 py-3"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Launch new workload</span>
              </Link>
              <Link
                to="/jobs"
                className="btn-secondary flex items-center space-x-2 px-5 py-3"
              >
                <Activity className="w-5 h-5 text-cyan-300" />
                <span>Monitor queue</span>
              </Link>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
          >
            <div className="absolute -top-10 -right-5 w-32 h-32 bg-gradient-to-br from-sky-500/40 to-emerald-400/40 rounded-full blur-3xl" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm uppercase tracking-[0.25em] text-slate-400">Now Processing</span>
                <div className="flex items-center space-x-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
                  <Loader className="h-3.5 w-3.5 animate-spin text-cyan-300" />
                  <span>Realtime</span>
                </div>
              </div>
              <div className="rounded-xl border border-white/15 bg-black/20 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Total Throughput</span>
                  <span className="text-cyan-300 font-medium">{stats.total} tasks</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400"
                    style={{ width: `${Math.min(100, (stats.success / Math.max(stats.total, 1)) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                  <div className="text-lg font-semibold text-amber-200">{stats.pending}</div>
                  <div className="text-xs uppercase tracking-wide text-amber-200/70">Pending</div>
                </div>
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3">
                  <div className="text-lg font-semibold text-sky-200">{stats.processing}</div>
                  <div className="text-xs uppercase tracking-wide text-sky-200/70">Active</div>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                  <div className="text-lg font-semibold text-emerald-200">{stats.success}</div>
                  <div className="text-xs uppercase tracking-wide text-emerald-200/70">Successful</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 24 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.08 },
          },
        }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5"
      >
        {statsCards.map(({ label, value, icon: Icon, accent }) => (
          <motion.div
            key={label}
            variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
            className="card relative overflow-hidden"
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`} />
            <div className="relative flex flex-col space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-slate-300/80">{label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Jobs */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="card"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">Recent Jobs</h2>
            <p className="text-sm text-slate-300/80">Track your queue with live telemetry and quick insights.</p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center space-x-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-200"
          >
            <span>View all runs</span>
            <span aria-hidden>→</span>
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 py-16 text-center">
            <Activity className="w-12 h-12 text-slate-500 mb-4" />
            <p className="text-slate-300">No jobs yet—deploy your first workload to see live insights.</p>
            <Link
              to="/jobs/create"
              className="mt-6 inline-flex items-center space-x-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-5 py-2 text-sm font-medium text-sky-200 hover:bg-sky-500/15 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Launch your first job</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <Link
                key={job.jobId}
                to={`/jobs/${job.jobId}`}
                className="group block rounded-2xl border border-white/10 bg-white/5 p-4 transition duration-200 hover:border-cyan-400/60 hover:bg-cyan-500/5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white">
                      {job.taskType === 'IO' ? (
                        <FileText className="w-6 h-6 text-cyan-300" />
                      ) : (
                        <Cpu className="w-6 h-6 text-violet-300" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{job.taskName}</h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusStyles(job.status)}`}
                        >
                          {job.status}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-300/80">
                        <span className="flex items-center space-x-2">
                          {getStatusIcon(job.status)}
                          <span>
                            {job.attempts}/{job.maxAttempts} attempts
                          </span>
                        </span>
                        <span>{format(new Date(job.createdAt), 'MMM d, yyyy HH:mm')}</span>
                        {job.taskType === 'CPU' && (
                          <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-xs text-violet-200">
                            High compute
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 group-hover:text-cyan-200 transition">
                    <span className="text-xs uppercase tracking-[0.28em]">Inspect</span>
                    <span aria-hidden className="text-lg">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;

