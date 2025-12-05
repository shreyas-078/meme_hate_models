import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Clock,
  Layers,
  RefreshCw,
  Download,
  AlertCircle,
} from 'lucide-react';
import PageContainer from '../components/PageContainer';
import MetricCard from '../components/MetricCard';
import ModelCard from '../components/ModelCard';
import { useAsync } from '../hooks/useAsync';
import { fetchModels, fetchTrainingSummary, checkBackendHealth } from '../api/api';
import { CHART_COLORS } from '../constants/theme';
import { formatNumber, formatDuration } from '../utils/formatting';

export default function Dashboard() {
  const [backendConnected, setBackendConnected] = useState(false);
  const { data: modelsData, loading: modelsLoading, error: modelsError, execute: refreshModels } = useAsync(fetchModels);
  const { data: trainingData, loading: trainingLoading, error: trainingError } = useAsync(fetchTrainingSummary);

  useEffect(() => {
    // Check backend connectivity
    checkBackendHealth().then(setBackendConnected);
  }, []);

  const models = modelsData?.models || [];
  const trainingSummary = trainingData || {};

  // Find best model
  const bestModel = models.reduce((best, current) => {
    const bestF1 = best?.metrics?.f1_score || 0;
    const currentF1 = current?.metrics?.f1_score || 0;
    return currentF1 > bestF1 ? current : best;
  }, null);

  // Calculate KPIs
  const bestAccuracy = Math.max(...models.map(m => m?.metrics?.accuracy || 0));
  const totalModels = models.length;
  const avgTrainingTime = trainingSummary.total_training_time 
    ? trainingSummary.total_training_time / totalModels 
    : 0;
  const totalEpochs = models.reduce((sum, m) => sum + (m?.metrics?.total_epochs || 0), 0);

  // Prepare comparison data
  const comparisonData = models
    .filter(m => m.metrics)
    .map(model => ({
      name: model.name.replace('_', ' '),
      Accuracy: model.metrics.accuracy,
      Precision: model.metrics.precision,
      Recall: model.metrics.recall,
      'F1 Score': model.metrics.f1_score,
    }));

  // Prepare training history data (from best model)
  const trainingHistory = trainingSummary.models?.find(m => m.name === bestModel?.id)?.history || [];

  const handleRefresh = () => {
    refreshModels();
    window.location.reload();
  };

  const handleExport = () => {
    const data = JSON.stringify({ models, trainingSummary }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-data.json';
    a.click();
  };

  if (modelsLoading || trainingLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-12 h-12 animate-spin text-primary-500" />
            <p className="text-lg text-gray-400">Loading dashboard data...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!backendConnected) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 rounded-2xl max-w-md text-center"
          >
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Backend Not Connected</h2>
            <p className="text-gray-400 mb-6">
              Please start the backend server at <code className="text-primary-400">http://localhost:8000</code>
            </p>
            <div className="space-y-2 text-left text-sm text-gray-500 bg-gray-900/50 p-4 rounded-lg">
              <p>1. Open terminal in backend directory</p>
              <p>2. Run: <code className="text-primary-400">python api.py</code></p>
              <p>3. Refresh this page</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              Retry Connection
            </button>
          </motion.div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">
            Live metrics from all multimodal hate detection models
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 glass-panel hover:glass-hover rounded-lg transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 glass-panel hover:glass-hover rounded-lg transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Best Accuracy"
          value={`${bestAccuracy.toFixed(2)}%`}
          icon={Award}
          trend={2.5}
          color="blue"
          subtitle={`${bestModel?.name || 'N/A'}`}
        />
        <MetricCard
          title="Best F1 Score"
          value={`${(bestModel?.metrics?.f1_score || 0).toFixed(2)}%`}
          icon={TrendingUp}
          trend={3.2}
          color="purple"
          subtitle="Harmonic Mean"
        />
        <MetricCard
          title="Best Precision"
          value={`${Math.max(...models.map(m => m?.metrics?.precision || 0)).toFixed(2)}%`}
          icon={TrendingUp}
          trend={1.8}
          color="pink"
          subtitle="True Positive Rate"
        />
        <MetricCard
          title="Models Trained"
          value={totalModels}
          icon={Layers}
          trend={100}
          color="green"
          subtitle="Production Ready"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Model Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold">Model Performance Comparison</h3>
              <p className="text-sm text-gray-400 mt-1">All metrics across models</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                fontSize={12}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="Accuracy" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="F1 Score" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Precision" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Recall" fill={CHART_COLORS.warning} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Training Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold">Training Progress</h3>
              <p className="text-sm text-gray-400 mt-1">
                {bestModel?.name || 'Best Model'} - Epoch Evolution
              </p>
            </div>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
              Best Model
            </span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trainingHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="epoch" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="train_accuracy"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.primary, r: 4 }}
                name="Train Accuracy"
              />
              <Line
                type="monotone"
                dataKey="val_accuracy"
                stroke={CHART_COLORS.secondary}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.secondary, r: 4 }}
                name="Val Accuracy"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Loss Curves */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-6 rounded-2xl mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold">Loss Curves</h3>
            <p className="text-sm text-gray-400 mt-1">Training and validation loss over epochs</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trainingHistory}>
            <defs>
              <linearGradient id="colorTrainLoss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.error} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.error} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorValLoss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.warning} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.warning} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="epoch" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="train_loss"
              stroke={CHART_COLORS.error}
              fillOpacity={1}
              fill="url(#colorTrainLoss)"
              name="Train Loss"
            />
            <Area
              type="monotone"
              dataKey="val_loss"
              stroke={CHART_COLORS.warning}
              fillOpacity={1}
              fill="url(#colorValLoss)"
              name="Val Loss"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Model Cards Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">All Models</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {models.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <ModelCard
                name={model.name}
                description={`${model.metrics?.total_epochs || 0} epochs trained`}
                metrics={model.metrics ? {
                  Accuracy: `${model.metrics.accuracy.toFixed(2)}%`,
                  Precision: `${model.metrics.precision.toFixed(2)}%`,
                  Recall: `${model.metrics.recall.toFixed(2)}%`,
                  'F1 Score': `${model.metrics.f1_score.toFixed(2)}%`,
                } : {}}
                isSOTA={model.id === bestModel?.id}
                isActive={model.loaded}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
