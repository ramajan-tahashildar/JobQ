import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { jobsAPI } from '../services/api';
import {
    Clock,
    CheckCircle,
    XCircle,
    Loader,
    Filter,
    RefreshCw,
    FileText,
    Cpu,
    Search,
    SlidersHorizontal,
} from 'lucide-react';
import { format } from 'date-fns';

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    taskType: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, [filters, pagination.page]);

  const loadJobs = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.taskType && { taskType: filters.taskType }),
      };

      const response = await jobsAPI.list(params);
      let jobsData = response.data.jobs || [];

      // Client-side search filter
      if (filters.search) {
        jobsData = jobsData.filter(job =>
          job.taskName.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.jobId.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setJobs(jobsData);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'PROCESSING':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/75 to-slate-950/95 p-8 shadow-[0_30px_100px_-60px_rgba(6,182,212,0.6)]"
      >
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-cyan-200">
            <SlidersHorizontal className="h-4 w-4 text-cyan-300" />
            <span>Live telemetry</span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white">All Jobs</h1>
            <p className="mt-2 text-slate-300/90">
              Filter, inspect, and orchestrate every workload running across your JobQ cluster.
            </p>
          </div>
        </div>
        <button
          onClick={loadJobs}
          className="btn-secondary flex items-center space-x-2 px-5 py-3"
        >
          <RefreshCw className="w-5 h-5 text-cyan-200" />
          <span>Refresh</span>
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="card"
      >
        <div className="flex items-center space-x-2 mb-6">
          <Filter className="w-5 h-5 text-cyan-200" />
          <h2 className="text-lg font-semibold text-white">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-cyan-200" />
            </div>
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="input-field"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>

          {/* Task Type Filter */}
          <select
            value={filters.taskType}
            onChange={(e) => handleFilterChange('taskType', e.target.value)}
            className="input-field"
          >
            <option value="">All Types</option>
            <option value="IO">IO-Bound</option>
            <option value="CPU">CPU-Bound</option>
          </select>
        </div>
      </motion.div>

      {/* Jobs List */}
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="card"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-cyan-300" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/15 rounded-2xl">
            <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-300">No jobs found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-xs font-medium uppercase tracking-[0.28em] text-slate-400">
                      Task
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium uppercase tracking-[0.28em] text-slate-400">
                      Type
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium uppercase tracking-[0.28em] text-slate-400">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium uppercase tracking-[0.28em] text-slate-400">
                      Attempts
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium uppercase tracking-[0.28em] text-slate-400">
                      Created
                    </th>
                    <th className="text-right py-4 px-4 text-xs font-medium uppercase tracking-[0.28em] text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr
                      key={job.jobId}
                      className="border-b border-white/10 hover:bg-cyan-500/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {job.taskType === 'IO' ? (
                            <FileText className="w-5 h-5 text-cyan-300" />
                          ) : (
                            <Cpu className="w-5 h-5 text-violet-300" />
                          )}
                          <span className="font-medium text-white">{job.taskName}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{job.jobId}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-white/10 border border-white/10 text-slate-200">
                          {job.taskType}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(job.status)}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-300/80">
                        {job.attempts}/{job.maxAttempts}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-300/80">
                        {format(new Date(job.createdAt), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          to={`/jobs/${job.jobId}`}
                          className="text-cyan-200 hover:text-cyan-100 font-medium text-sm"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                <div className="text-sm text-slate-300/80">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.pages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        <div className="mt-6 text-xs uppercase tracking-[0.28em] text-slate-500">
          Updated every 5 seconds for live queue observability.
        </div>
      </motion.div>
    </div>
  );
};

export default JobsList;

