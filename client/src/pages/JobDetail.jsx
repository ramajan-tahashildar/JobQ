import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { jobsAPI } from '../services/api';
import {
    Clock,
    CheckCircle,
    XCircle,
    Loader,
    ArrowLeft,
    RefreshCw,
    FileText,
    Cpu,
    Calendar,
    Hash,
    Activity,
} from 'lucide-react';
import { format } from 'date-fns';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadJob();
    const interval = setInterval(loadJob, 2000); // Refresh every 2 seconds for active jobs
    return () => clearInterval(interval);
  }, [id]);

  const loadJob = async () => {
    try {
      const response = await jobsAPI.getById(id);
      setJob(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-6 h-6 text-amber-300" />;
      case 'PROCESSING':
        return <Loader className="w-6 h-6 text-cyan-300 animate-spin" />;
      case 'SUCCESS':
        return <CheckCircle className="w-6 h-6 text-emerald-300" />;
      case 'FAILED':
        return <XCircle className="w-6 h-6 text-rose-300" />;
      default:
        return <Activity className="w-6 h-6 text-slate-300" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/10 border border-amber-500/40 text-amber-200';
      case 'PROCESSING':
        return 'bg-sky-500/10 border border-sky-500/40 text-sky-200';
      case 'SUCCESS':
        return 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-200';
      case 'FAILED':
        return 'bg-rose-500/10 border border-rose-500/40 text-rose-200';
      default:
        return 'bg-slate-500/10 border border-slate-500/40 text-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-cyan-300" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-12 h-12 text-rose-300 mx-auto mb-4" />
        <p className="text-slate-300">{error || 'Job not found'}</p>
        <Link to="/jobs" className="mt-4 inline-block text-cyan-200 hover:text-cyan-100">
          ← Back to Jobs
        </Link>
      </div>
    );
  }

  const isActive = job.status === 'PENDING' || job.status === 'PROCESSING';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/jobs"
          className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Jobs</span>
        </Link>
        <button
          onClick={loadJob}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="w-5 h-5 text-cyan-200" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card relative overflow-hidden border border-white/15"
      >
        <div className={`absolute inset-0 ${job.status === 'SUCCESS' ? 'bg-emerald-500/10' : job.status === 'FAILED' ? 'bg-rose-500/10' : 'bg-sky-500/10'} blur-2xl`} aria-hidden />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              {getStatusIcon(job.status)}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-white">{job.taskName}</h1>
              <p className="text-sm text-slate-300/80 mt-2">Job ID: {job.jobId}</p>
            </div>
          </div>
          <div className={`inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-[0.28em] ${getStatusColor(job.status)}`}>
            {job.status}
          </div>
        </div>
      </motion.div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {job.taskType === 'IO' ? (
                <FileText className="w-5 h-5 text-cyan-300" />
              ) : (
                <Cpu className="w-5 h-5 text-violet-300" />
              )}
              <div>
                <div className="text-sm text-slate-300/80">Task Type</div>
                <div className="font-medium text-white">{job.taskType}-Bound</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Hash className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-sm text-slate-300/80">Attempts</div>
                <div className="font-medium text-white">
                  {job.attempts} / {job.maxAttempts}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-sm text-slate-300/80">Created</div>
                <div className="font-medium text-white">
                  {format(new Date(job.createdAt), 'MMM d, yyyy HH:mm:ss')}
                </div>
              </div>
            </div>
            {job.updatedAt !== job.createdAt && (
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-sm text-slate-300/80">Last Updated</div>
                  <div className="font-medium text-white">
                    {format(new Date(job.updatedAt), 'MMM d, yyyy HH:mm:ss')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payload */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Payload</h2>
          <pre className="bg-slate-950/80 border border-white/10 p-4 rounded-xl overflow-x-auto text-sm text-slate-100">
            {JSON.stringify(job.payload, null, 2)}
          </pre>
        </div>
      </div>

      {/* Result or Error */}
      {job.status === 'SUCCESS' && job.result && (
        <div className="card border border-emerald-500/40">
          <h2 className="text-lg font-semibold text-emerald-200 mb-4 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Result</span>
          </h2>
          <pre className="bg-slate-950/80 border border-white/10 p-4 rounded-xl overflow-x-auto text-sm text-slate-100">
            {JSON.stringify(job.result, null, 2)}
          </pre>
        </div>
      )}

      {job.status === 'FAILED' && job.error && (
        <div className="card border border-rose-500/40">
          <h2 className="text-lg font-semibold text-rose-200 mb-4 flex items-center space-x-2">
            <XCircle className="w-5 h-5" />
            <span>Error</span>
          </h2>
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-200">
            <div className="font-medium mb-2">
              {job.error.message || 'Unknown error'}
            </div>
            {job.error.code && (
              <div className="text-sm text-rose-200/80">
                Code: {job.error.code}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auto-refresh indicator */}
      {isActive && (
        <div className="text-center text-sm text-slate-400">
          <Loader className="w-4 h-4 inline-block animate-spin mr-2 text-cyan-300" />
          Auto-refreshing every 2 seconds...
        </div>
      )}
    </div>
  );
};

export default JobDetail;

