import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { jobsAPI } from '../services/api';
import { FileText, Cpu, Loader, Send, Wand2, Sparkle } from 'lucide-react';

const CreateJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    taskName: '',
    taskType: 'IO',
    payload: {
      reportType: 'weekly',
      data: { period: '' }
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Prepare payload based on task type
      let payload = {};
      if (formData.taskType === 'IO') {
        payload = {
          reportType: formData.payload.reportType,
          data: formData.payload.data
        };
      } else {
        payload = {
          n: parseInt(formData.payload.n) || 30
        };
      }

      const response = await jobsAPI.create({
        taskName: formData.taskName,
        taskType: formData.taskType,
        payload
      });

      navigate(`/jobs/${response.data.jobId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'taskType') {
      // Reset payload when task type changes
      setFormData(prev => ({
        ...prev,
        taskType: value,
        payload: value === 'IO' 
          ? { reportType: 'weekly', data: { period: '' } }
          : { n: 30 }
      }));
    } else if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'payload' && child === 'data') {
        // Handle nested data object
        const dataField = field.split('.').slice(2).join('.');
        setFormData(prev => ({
          ...prev,
          payload: {
            ...prev.payload,
            data: {
              ...prev.payload.data,
              [dataField]: value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/75 to-slate-950/90 p-8 shadow-[0_40px_120px_-60px_rgba(14,116,144,0.6)]"
      >
        <div className="flex flex-col space-y-5">
          <div className="inline-flex w-fit items-center space-x-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-sky-200">
            <Sparkle className="h-4 w-4 text-sky-300" />
            <span>Composable workloads</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white">
            Craft a new job with <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-300 via-cyan-200 to-emerald-300">precision control</span>.
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Define payloads, choose execution modes, and ship distributed tasks into the JobQ pipeline with a single click.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="card"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-200">
              {error}
            </div>
          )}

          {/* Task Name */}
          <div>
            <label htmlFor="taskName" className="block text-sm font-medium text-slate-200 mb-2">
              Task Name
            </label>
            <input
              id="taskName"
              type="text"
              required
              value={formData.taskName}
              onChange={(e) => handleInputChange('taskName', e.target.value)}
              className="input-field"
              placeholder="e.g., generate-weekly-report"
            />
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-3">
              Task Type
            </label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => handleInputChange('taskType', 'IO')}
                className={`p-5 rounded-2xl border transition-all ${
                  formData.taskType === 'IO'
                    ? 'border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <FileText
                  className={`w-8 h-8 mx-auto mb-3 ${
                    formData.taskType === 'IO' ? 'text-cyan-200' : 'text-slate-400'
                  }`}
                />
                <div className="text-sm font-medium text-white">IO-Bound</div>
                <div className="text-xs text-slate-300/80 mt-1">File/Report Generation</div>
              </button>

              <button
                type="button"
                onClick={() => handleInputChange('taskType', 'CPU')}
                className={`p-5 rounded-2xl border transition-all ${
                  formData.taskType === 'CPU'
                    ? 'border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/20'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <Cpu
                  className={`w-8 h-8 mx-auto mb-3 ${
                    formData.taskType === 'CPU' ? 'text-violet-200' : 'text-slate-400'
                  }`}
                />
                <div className="text-sm font-medium text-white">CPU-Bound</div>
                <div className="text-xs text-slate-300/80 mt-1">Computation (Fibonacci)</div>
              </button>
            </div>
          </div>

          {/* IO Task Payload */}
          {formData.taskType === 'IO' && (
            <div className="space-y-4 p-5 rounded-2xl border border-white/10 bg-white/5">
              <div>
                <label htmlFor="reportType" className="block text-sm font-medium text-slate-200 mb-2">
                  Report Type
                </label>
                <select
                  id="reportType"
                  value={formData.payload.reportType}
                  onChange={(e) => handleInputChange('payload.reportType', e.target.value)}
                  className="input-field"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label htmlFor="period" className="block text-sm font-medium text-slate-200 mb-2">
                  Period (optional)
                </label>
                <input
                  id="period"
                  type="text"
                  value={formData.payload.data?.period || ''}
                  onChange={(e) => handleInputChange('payload.data.period', e.target.value)}
                  className="input-field"
                  placeholder="e.g., 2024-01"
                />
              </div>
            </div>
          )}

          {/* CPU Task Payload */}
          {formData.taskType === 'CPU' && (
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
              <label htmlFor="n" className="block text-sm font-medium text-slate-200 mb-2">
                Fibonacci Number (n)
              </label>
              <input
                id="n"
                type="number"
                min="1"
                max="50"
                value={formData.payload.n || 30}
                onChange={(e) => handleInputChange('payload.n', e.target.value)}
                className="input-field"
                placeholder="30"
              />
              <p className="mt-2 text-xs text-slate-300/70">
                Higher values will take longer to compute. Recommended: 30-40
              </p>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Create Job</span>
                </>
              )}
            </button>
          </div>
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.32em] text-slate-500">
            <span className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-cyan-300" />
              <span>Automated retries enabled</span>
            </span>
            <span>Max attempts: 3</span>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateJob;

