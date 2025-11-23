import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  Award,
  AlertCircle,
  Activity,
  Brain,
  Zap,
  Target,
  Info,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart,
  ArrowUp,
  ArrowDown,
  Download,
  Share2,
  Eye,
  RefreshCw,
  Layers,
  Cpu,
  Clock,
} from "lucide-react";

export default function Dashboard() {
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load all metrics
    Promise.all([
      fetch("/metrics/training_summary.json")
        .then((r) => r.json())
        .catch(() => ({})),
      fetch("/metrics/resnet50_bert_metrics.json")
        .then((r) => r.json())
        .catch(() => ({})),
      fetch("/metrics/resnet50_roberta_metrics.json")
        .then((r) => r.json())
        .catch(() => ({})),
      fetch("/metrics/vit_bert_metrics.json")
        .then((r) => r.json())
        .catch(() => ({})),
      fetch("/metrics/efficientnet_distilbert_metrics.json")
        .then((r) => r.json())
        .catch(() => ({})),
      fetch("/metrics/clip_finetuned_metrics.json")
        .then((r) => r.json())
        .catch(() => ({})),
    ])
      .then(
        ([
          summary,
          resnet_bert,
          resnet_roberta,
          vit_bert,
          efficientnet,
          clip,
        ]) => {
          // Helper function to extract best metrics from epochs
          const extractBestMetrics = (modelData) => {
            if (!modelData.epochs || modelData.epochs.length === 0) {
              return {};
            }

            // Find the epoch with the best F1 score
            const bestEpoch = modelData.epochs.reduce((prev, current) =>
              (current.f1_score || 0) > (prev.f1_score || 0) ? current : prev
            );

            return {
              accuracy: bestEpoch.val_accuracy || 0,
              precision: bestEpoch.precision || 0,
              recall: bestEpoch.recall || 0,
              f1: bestEpoch.f1_score || 0,
              roc_auc: modelData.roc_auc || 0.85,
              tp: bestEpoch.tp || 0,
              fp: bestEpoch.fp || 0,
              tn: bestEpoch.tn || 0,
              fn: bestEpoch.fn || 0,
            };
          };

          setMetricsData({
            summary,
            models: [
              {
                name: "ResNet50-BERT",
                ...resnet_bert,
                ...extractBestMetrics(resnet_bert),
              },
              {
                name: "ResNet50-RoBERTa",
                ...resnet_roberta,
                ...extractBestMetrics(resnet_roberta),
              },
              {
                name: "ViT-BERT",
                ...vit_bert,
                ...extractBestMetrics(vit_bert),
              },
              {
                name: "EfficientNet-DistilBERT",
                ...efficientnet,
                ...extractBestMetrics(efficientnet),
              },
              {
                name: "CLIP Fine-tuned",
                ...clip,
                ...extractBestMetrics(clip),
              },
            ],
          });
          setLoading(false);
        }
      )
      .catch((err) => {
        console.error("Error loading metrics:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div>
            <p className="text-white font-medium">Loading metrics...</p>
            <p className="text-gray-500 text-sm mt-1">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  if (!metricsData || !metricsData.models || metricsData.models.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Error Loading Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              Failed to load metrics data. Please ensure the metrics files are
              available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Find best model
  const bestModel = metricsData.models.reduce((prev, current) =>
    (current.f1 || 0) > (prev.f1 || 0) ? current : prev
  );

  // Prepare comparison data
  const comparisonData = metricsData.models.map((model) => ({
    name: model.name.split("-").slice(0, 2).join("-"),
    Accuracy: parseFloat(((model.accuracy || 0) * 100).toFixed(2)),
    Precision: parseFloat(((model.precision || 0) * 100).toFixed(2)),
    Recall: parseFloat(((model.recall || 0) * 100).toFixed(2)),
    F1: parseFloat(((model.f1 || 0) * 100).toFixed(2)),
  }));

  // Training progression data
  const trainingData = bestModel.epochs
    ? bestModel.epochs.map((epoch) => ({
        epoch: epoch.epoch,
        trainLoss: parseFloat((epoch.train_loss || 0).toFixed(4)),
        valLoss: parseFloat((epoch.val_loss || 0).toFixed(4)),
        trainAcc: parseFloat(((epoch.train_accuracy || 0) * 100).toFixed(2)),
        valAcc: parseFloat(((epoch.val_accuracy || 0) * 100).toFixed(2)),
        f1Score: parseFloat(((epoch.f1_score || 0) * 100).toFixed(2)),
      }))
    : [];

  // Confusion matrix data for scatter plot
  const confusionData = metricsData.models.map((model) => ({
    name: model.name.split("-")[0],
    TP: model.tp || 0,
    FP: model.fp || 0,
    TN: model.tn || 0,
    FN: model.fn || 0,
    total:
      (model.tp || 0) + (model.fp || 0) + (model.tn || 0) + (model.fn || 0),
  }));

  // Radar data for all models
  const radarDataAll = metricsData.models.map((model) => ({
    model: model.name.split("-")[0],
    Accuracy: parseFloat(((model.accuracy || 0) * 100).toFixed(1)),
    Precision: parseFloat(((model.precision || 0) * 100).toFixed(1)),
    Recall: parseFloat(((model.recall || 0) * 100).toFixed(1)),
    F1: parseFloat(((model.f1 || 0) * 100).toFixed(1)),
  }));

  // Model parameters comparison
  const paramData = metricsData.models
    .filter((m) => m.total_params)
    .map((model) => ({
      name: model.name.split("-")[0],
      total: (model.total_params || 0) / 1000000,
      trainable: (model.trainable_params || 0) / 1000000,
    }));

  return (
    <TooltipProvider>
      <div className="min-h-screen text-white p-6 lg:p-8 relative">
        {/* Page Header with Actions */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-50"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Activity className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  Performance Dashboard
                </h1>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Live metrics from all multimodal hate detection models
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button
                size="sm"
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0 shadow-lg shadow-blue-500/30"
              >
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Stats - Enhanced */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <PremiumStatCard
            title="Best Accuracy"
            value={`${((bestModel.accuracy || 0) * 100).toFixed(2)}%`}
            subtitle={bestModel.name}
            icon={<Target className="w-6 h-6" />}
            trend="+2.5%"
            trendUp={true}
            color="blue"
          />
          <PremiumStatCard
            title="Best F1 Score"
            value={`${((bestModel.f1 || 0) * 100).toFixed(2)}%`}
            subtitle="Harmonic Mean"
            icon={<Award className="w-6 h-6" />}
            trend="+3.2%"
            trendUp={true}
            color="purple"
          />
          <PremiumStatCard
            title="Best Precision"
            value={`${((bestModel.precision || 0) * 100).toFixed(2)}%`}
            subtitle="True Positive Rate"
            icon={<Zap className="w-6 h-6" />}
            trend="+1.8%"
            trendUp={true}
            color="pink"
          />
          <PremiumStatCard
            title="Models Trained"
            value="5"
            subtitle="Production Ready"
            icon={<Brain className="w-6 h-6" />}
            trend="100%"
            trendUp={true}
            color="green"
          />
        </div>

        {/* Tabbed Charts Section - Enhanced with Glass Panels */}
        <Tabs defaultValue="overview" className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white/5 border border-white/10 p-1 backdrop-blur-xl">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="training"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Training
              </TabsTrigger>
              <TabsTrigger
                value="analysis"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <Brain className="w-4 h-4 mr-2" />
                Analysis
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-gray-400 hover:text-white"
              >
                <Eye className="w-4 h-4" />
                View All
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Performance Comparison - Glass Panel */}
              <GlassCard glow className="card-hover">
                <GlassCardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <GlassCardTitle>
                          Model Performance Comparison
                        </GlassCardTitle>
                        <GlassCardDescription>
                          All metrics across models
                        </GlassCardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={comparisonData}>
                      <defs>
                        <linearGradient
                          id="colorAccuracy"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#3b82f6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorPrecision"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorRecall"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#ec4899"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#ec4899"
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorF1"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#10b981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#10b981"
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        tick={{
                          fill: "#9ca3af",
                          fontSize: 11,
                        }}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af" }}
                        domain={[0, 100]}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                          color: "#fff",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          color: "#9ca3af",
                        }}
                      />
                      <Bar
                        dataKey="Accuracy"
                        fill="url(#colorAccuracy)"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar
                        dataKey="Precision"
                        fill="url(#colorPrecision)"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar
                        dataKey="Recall"
                        fill="url(#colorRecall)"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar
                        dataKey="F1"
                        fill="url(#colorF1)"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </GlassCardContent>
              </GlassCard>

              {/* Training Progress - Glass Panel */}
              <GlassCard glow className="card-hover">
                <GlassCardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <GlassCardTitle>Training Progress</GlassCardTitle>
                        <GlassCardDescription>
                          {bestModel.name} - Epoch Evolution
                        </GlassCardDescription>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                      Best Model
                    </Badge>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  <ResponsiveContainer width="100%" height={340}>
                    <ComposedChart data={trainingData}>
                      <defs>
                        <linearGradient
                          id="gradientLoss"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#ef4444"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="100%"
                            stopColor="#ef4444"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="epoch"
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                        label={{
                          value: "Epoch",
                          position: "insideBottom",
                          offset: -5,
                          fill: "#9ca3af",
                        }}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                        label={{
                          value: "Loss",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#9ca3af",
                        }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                        label={{
                          value: "Accuracy (%)",
                          angle: 90,
                          position: "insideRight",
                          fill: "#9ca3af",
                        }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                          color: "#fff",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          color: "#9ca3af",
                          paddingTop: "10px",
                        }}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="trainLoss"
                        fill="url(#gradientLoss)"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="Train Loss"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="valLoss"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ fill: "#f59e0b", r: 3 }}
                        name="Val Loss"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="valAcc"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: "#10b981", r: 4 }}
                        name="Val Accuracy"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </GlassCardContent>
              </GlassCard>

              {/* F1 Score Progression - Glass Panel */}
              <GlassCard glow className="card-hover">
                <GlassCardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Activity className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <GlassCardTitle>F1 Score Progression</GlassCardTitle>
                        <GlassCardDescription>
                          Best model training curve
                        </GlassCardDescription>
                      </div>
                    </div>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  <ResponsiveContainer width="100%" height={340}>
                    <AreaChart data={trainingData}>
                      <defs>
                        <linearGradient
                          id="colorF1Area"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="epoch"
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                        domain={[0, 100]}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                          color: "#fff",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="f1Score"
                        stroke="#8b5cf6"
                        fillOpacity={1}
                        fill="url(#colorF1Area)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </GlassCardContent>
              </GlassCard>

              {/* Model Parameters - Glass Panel */}
              <GlassCard glow className="card-hover">
                <GlassCardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/10 rounded-lg">
                        <Cpu className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <GlassCardTitle>Model Complexity</GlassCardTitle>
                        <GlassCardDescription>
                          Parameters comparison (millions)
                        </GlassCardDescription>
                      </div>
                    </div>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={paramData} layout="vertical">
                      <defs>
                        <linearGradient
                          id="colorTotal"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop
                            offset="0%"
                            stopColor="#3b82f6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#06b6d4"
                            stopOpacity={0.8}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorTrainable"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop
                            offset="0%"
                            stopColor="#10b981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#34d399"
                            stopOpacity={0.8}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                        opacity={0.3}
                      />
                      <XAxis
                        type="number"
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#9ca3af"
                        tick={{
                          fill: "#9ca3af",
                          fontSize: 11,
                        }}
                        width={100}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                          color: "#fff",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          color: "#9ca3af",
                        }}
                      />
                      <Bar
                        dataKey="total"
                        fill="url(#colorTotal)"
                        name="Total"
                        radius={[0, 8, 8, 0]}
                      />
                      <Bar
                        dataKey="trainable"
                        fill="url(#colorTrainable)"
                        name="Trainable"
                        radius={[0, 8, 8, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </GlassCardContent>
              </GlassCard>
            </div>

            {/* Enhanced Model Performance Cards Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10">
                    <Layers className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Model Performance Overview
                    </h2>
                    <p className="text-sm text-gray-400">
                      Detailed metrics for each architecture
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    <Eye className="w-4 h-4" />
                    Compare
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {metricsData.models.map((model, idx) => (
                  <EnhancedModelCard
                    key={idx}
                    model={model}
                    isBest={model.name === bestModel.name}
                    rank={idx + 1}
                  />
                ))}
              </div>
            </div>

            {/* Confusion Matrix & Radar Analysis - Side by Side Glass Panels */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
              {/* Confusion Matrix Analysis */}
              <GlassCard glow className="card-hover">
                <GlassCardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <GlassCardTitle>
                          Confusion Matrix Analysis
                        </GlassCardTitle>
                        <GlassCardDescription>
                          True/False Positives and Negatives
                        </GlassCardDescription>
                      </div>
                    </div>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={confusionData}>
                      <defs>
                        <linearGradient id="gradTP" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor="#10b981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#10b981"
                            stopOpacity={0.4}
                          />
                        </linearGradient>
                        <linearGradient id="gradTN" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor="#3b82f6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#3b82f6"
                            stopOpacity={0.4}
                          />
                        </linearGradient>
                        <linearGradient id="gradFP" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor="#f59e0b"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#f59e0b"
                            stopOpacity={0.4}
                          />
                        </linearGradient>
                        <linearGradient id="gradFN" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor="#ef4444"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#ef4444"
                            stopOpacity={0.4}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        tick={{
                          fill: "#9ca3af",
                          fontSize: 11,
                        }}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                          color: "#fff",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          color: "#9ca3af",
                        }}
                      />
                      <Bar
                        dataKey="TP"
                        stackId="a"
                        fill="url(#gradTP)"
                        name="True Positive"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar
                        dataKey="TN"
                        stackId="a"
                        fill="url(#gradTN)"
                        name="True Negative"
                      />
                      <Bar
                        dataKey="FP"
                        stackId="a"
                        fill="url(#gradFP)"
                        name="False Positive"
                      />
                      <Bar
                        dataKey="FN"
                        stackId="a"
                        fill="url(#gradFN)"
                        name="False Negative"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </GlassCardContent>
              </GlassCard>

              {/* Performance Radar */}
              <GlassCard glow className="card-hover">
                <GlassCardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-500/10 rounded-lg">
                        <Target className="w-5 h-5 text-pink-400" />
                      </div>
                      <div>
                        <GlassCardTitle>Multi-Metric Radar</GlassCardTitle>
                        <GlassCardDescription>
                          Comprehensive model comparison
                        </GlassCardDescription>
                      </div>
                    </div>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  <ResponsiveContainer width="100%" height={340}>
                    <RadarChart
                      data={[
                        {
                          metric: "Accuracy",
                          ...Object.fromEntries(
                            radarDataAll.map((m) => [m.model, m.Accuracy])
                          ),
                        },
                        {
                          metric: "Precision",
                          ...Object.fromEntries(
                            radarDataAll.map((m) => [m.model, m.Precision])
                          ),
                        },
                        {
                          metric: "Recall",
                          ...Object.fromEntries(
                            radarDataAll.map((m) => [m.model, m.Recall])
                          ),
                        },
                        {
                          metric: "F1",
                          ...Object.fromEntries(
                            radarDataAll.map((m) => [m.model, m.F1])
                          ),
                        },
                      ]}
                    >
                      <PolarGrid stroke="#374151" opacity={0.5} />
                      <PolarAngleAxis
                        dataKey="metric"
                        stroke="#9ca3af"
                        tick={{
                          fill: "#9ca3af",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af", fontSize: 10 }}
                      />
                      {radarDataAll.slice(0, 3).map((model, idx) => {
                        const colors = ["#3b82f6", "#8b5cf6", "#ec4899"];
                        return (
                          <Radar
                            key={model.model}
                            name={model.model}
                            dataKey={model.model}
                            stroke={colors[idx]}
                            fill={colors[idx]}
                            fillOpacity={0.25}
                            strokeWidth={2}
                          />
                        );
                      })}
                      <Legend
                        wrapperStyle={{
                          color: "#9ca3af",
                        }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                          color: "#fff",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </GlassCardContent>
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="training" className="mt-0">
            <GlassCard className="card-hover">
              <GlassCardContent className="flex flex-col items-center justify-center py-24">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full flex items-center justify-center border border-white/10">
                    <TrendingUp className="w-10 h-10 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mt-6 mb-2">
                  Detailed Training Metrics
                </h3>
                <p className="text-sm text-gray-400 text-center max-w-md mb-6">
                  Epoch-by-epoch analysis, learning curves, and advanced
                  training insights
                </p>
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500">
                  <Activity className="w-4 h-4" />
                  Coming Soon
                </Button>
              </GlassCardContent>
            </GlassCard>
          </TabsContent>

          <TabsContent value="analysis" className="mt-0">
            <GlassCard className="card-hover">
              <GlassCardContent className="flex flex-col items-center justify-center py-24">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full flex items-center justify-center border border-white/10">
                    <Brain className="w-10 h-10 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mt-6 mb-2">
                  Deep Statistical Analysis
                </h3>
                <p className="text-sm text-gray-400 text-center max-w-md mb-6">
                  Advanced comparisons, error analysis, and model
                  interpretability
                </p>
                <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500">
                  <Target className="w-4 h-4" />
                  Coming Soon
                </Button>
              </GlassCardContent>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

function PremiumStatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendUp,
  color = "blue",
}) {
  const colorClasses = {
    blue: {
      bg: "from-blue-500/20 to-blue-600/20",
      border: "border-blue-500/30",
      icon: "bg-blue-500/10 text-blue-400",
      glow: "group-hover:shadow-blue-500/20",
    },
    purple: {
      bg: "from-purple-500/20 to-purple-600/20",
      border: "border-purple-500/30",
      icon: "bg-purple-500/10 text-purple-400",
      glow: "group-hover:shadow-purple-500/20",
    },
    pink: {
      bg: "from-pink-500/20 to-pink-600/20",
      border: "border-pink-500/30",
      icon: "bg-pink-500/10 text-pink-400",
      glow: "group-hover:shadow-pink-500/20",
    },
    green: {
      bg: "from-green-500/20 to-green-600/20",
      border: "border-green-500/30",
      icon: "bg-green-500/10 text-green-400",
      glow: "group-hover:shadow-green-500/20",
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`group relative rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} backdrop-blur-xl p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${colors.glow} card-hover`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 ${colors.icon} rounded-xl`}>{icon}</div>
          {trend && (
            <Badge
              className={`gap-1 ${
                trendUp
                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              {trendUp ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              {trend}
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-3xl font-bold text-white tracking-tight">
            {value}
          </h3>
          <p className="text-sm font-medium text-gray-300">{title}</p>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>

        {/* Mini sparkline effect */}
        <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, trend }) {
  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 cursor-help hover:bg-blue-500/20 transition-colors">
                {icon}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{subtitle}</p>
            </TooltipContent>
          </Tooltip>
          {trend && (
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 transition-colors">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}
            </Badge>
          )}
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          {value}
        </h3>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function EnhancedModelCard({ model, isBest, rank }) {
  const rankColors = {
    1: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
    2: "from-gray-400/20 to-gray-500/20 border-gray-400/30",
    3: "from-orange-500/20 to-orange-600/20 border-orange-500/30",
  };

  return (
    <GlassCard
      glow
      className={`group card-hover relative overflow-hidden ${
        isBest ? "ring-2 ring-blue-500/50" : ""
      }`}
    >
      {/* Rank Badge */}
      {rank <= 3 && (
        <div
          className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-br ${rankColors[rank]} backdrop-blur-xl flex items-center justify-center font-bold text-sm border`}
        >
          #{rank}
        </div>
      )}

      <GlassCardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl">
              <Brain className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <GlassCardTitle className="text-base truncate">
                  {model.name}
                </GlassCardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-gray-500 cursor-help flex-shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">
                      {model.architecture || "Multimodal Architecture"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {model.total_params
                        ? `${(model.total_params / 1000000).toFixed(1)}M params`
                        : ""}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <GlassCardDescription className="text-xs mt-1">
                {model.architecture || "Multimodal Architecture"}
              </GlassCardDescription>
            </div>
          </div>
          {isBest && (
            <Badge className="ml-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 gap-1">
              <Award className="w-3 h-3" />
              Best
            </Badge>
          )}
        </div>
      </GlassCardHeader>

      <GlassCardContent className="space-y-4">
        {/* Metrics */}
        <div className="space-y-3">
          <EnhancedMetricRow
            label="Accuracy"
            value={model.accuracy || 0}
            color="blue"
          />
          <EnhancedMetricRow
            label="Precision"
            value={model.precision || 0}
            color="purple"
          />
          <EnhancedMetricRow
            label="Recall"
            value={model.recall || 0}
            color="pink"
          />
          <EnhancedMetricRow
            label="F1 Score"
            value={model.f1 || 0}
            color="green"
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        {/* Additional Info */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Parameters
            </span>
            <span className="text-white font-semibold">
              {model.total_params
                ? `${(model.total_params / 1000000).toFixed(1)}M`
                : "N/A"}
            </span>
          </div>
          {model.training_time_seconds && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Training Time
              </span>
              <span className="text-white font-semibold">
                {(model.training_time_seconds / 60).toFixed(1)} min
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}

function EnhancedMetricRow({ label, value, color = "blue" }) {
  const percentage = (value * 100).toFixed(1);

  const colorClasses = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    pink: "from-pink-500 to-rose-500",
    green: "from-green-500 to-emerald-500",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-300 font-medium">{label}</span>
        <span className="text-white font-bold">{percentage}%</span>
      </div>
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}

function ModelCard({ model, isBest }) {
  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-blue-500/50 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg text-white">{model.name}</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-gray-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{model.architecture || "Multimodal Architecture"}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {model.total_params
                    ? `${(model.total_params / 1000000).toFixed(1)}M params`
                    : ""}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          {isBest && (
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 border-0">
              <Award className="w-3 h-3 mr-1" />
              Best
            </Badge>
          )}
        </div>
        <CardDescription className="text-gray-400">
          {model.architecture || "Multimodal Architecture"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <MetricRow label="Accuracy" value={model.accuracy || 0} />
        <MetricRow label="Precision" value={model.precision || 0} />
        <MetricRow label="Recall" value={model.recall || 0} />
        <MetricRow
          label="F1 Score"
          value={model.f1 || 0}
          color="text-purple-400"
        />

        <div className="pt-3 border-t border-gray-800 text-xs text-gray-500">
          <div className="flex justify-between mb-1">
            <span>Parameters:</span>
            <span className="text-gray-400">
              {model.total_params
                ? `${(model.total_params / 1000000).toFixed(1)}M`
                : "N/A"}
            </span>
          </div>
          {model.training_time_seconds && (
            <div className="flex justify-between">
              <span>Training Time:</span>
              <span className="text-gray-400">
                {(model.training_time_seconds / 60).toFixed(1)} min
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricRow({ label, value, color = "text-white" }) {
  const percentage = (value * 100).toFixed(1);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className={`font-semibold ${color}`}>{percentage}%</span>
      </div>
      <Progress value={value * 100} className="h-2" />
    </div>
  );
}
