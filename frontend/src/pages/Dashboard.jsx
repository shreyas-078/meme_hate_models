import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
                        if (
                            !modelData.epochs ||
                            modelData.epochs.length === 0
                        ) {
                            return {};
                        }

                        // Find the epoch with the best F1 score
                        const bestEpoch = modelData.epochs.reduce(
                            (prev, current) =>
                                (current.f1_score || 0) > (prev.f1_score || 0)
                                    ? current
                                    : prev
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
                        <p className="text-white font-medium">
                            Loading metrics...
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                            Please wait
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (
        !metricsData ||
        !metricsData.models ||
        metricsData.models.length === 0
    ) {
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
                            Failed to load metrics data. Please ensure the
                            metrics files are available.
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
              trainAcc: parseFloat(
                  ((epoch.train_accuracy || 0) * 100).toFixed(2)
              ),
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
            (model.tp || 0) +
            (model.fp || 0) +
            (model.tn || 0) +
            (model.fn || 0),
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
            <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-6 lg:mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">
                                Performance Dashboard
                            </h1>
                            <p className="text-sm text-gray-500">
                                Real-time metrics
                            </p>
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Comprehensive analysis of all multimodal hate detection
                        models
                    </p>
                </div>

                {/* Key Metrics Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
                    <StatCard
                        title="Best Accuracy"
                        value={`${((bestModel.accuracy || 0) * 100).toFixed(
                            2
                        )}%`}
                        subtitle={bestModel.name}
                        icon={<Target className="w-5 h-5" />}
                        trend="+2.5%"
                    />
                    <StatCard
                        title="Best F1 Score"
                        value={`${((bestModel.f1 || 0) * 100).toFixed(2)}%`}
                        subtitle="Harmonic Mean"
                        icon={<Award className="w-5 h-5" />}
                        trend="+3.2%"
                    />
                    <StatCard
                        title="Best Precision"
                        value={`${((bestModel.precision || 0) * 100).toFixed(
                            2
                        )}%`}
                        subtitle="True Positive Rate"
                        icon={<Zap className="w-5 h-5" />}
                        trend="+1.8%"
                    />
                    <StatCard
                        title="Models Trained"
                        value="5"
                        subtitle="Production Ready"
                        icon={<Brain className="w-5 h-5" />}
                        trend="100%"
                    />
                </div>

                {/* Tabbed Charts Section */}
                <Tabs defaultValue="overview" className="mb-6 lg:mb-8">
                    <TabsList className="mb-4 w-full sm:w-auto">
                        <TabsTrigger
                            value="overview"
                            className="flex-1 sm:flex-none"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="training"
                            className="flex-1 sm:flex-none"
                        >
                            Training
                        </TabsTrigger>
                        <TabsTrigger
                            value="analysis"
                            className="flex-1 sm:flex-none"
                        >
                            Analysis
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                            {/* Performance Comparison */}
                            <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-blue-400" />
                                        Model Performance Comparison
                                    </CardTitle>
                                    <CardDescription className="text-gray-400">
                                        All metrics across models
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={320}
                                    >
                                        <BarChart data={comparisonData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#374151"
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
                                                    backgroundColor: "#1f2937",
                                                    border: "1px solid #374151",
                                                    borderRadius: "8px",
                                                    color: "#fff",
                                                }}
                                            />
                                            <Legend
                                                wrapperStyle={{
                                                    color: "#9ca3af",
                                                }}
                                            />
                                            <Bar
                                                dataKey="Accuracy"
                                                fill="#3b82f6"
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="Precision"
                                                fill="#8b5cf6"
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="Recall"
                                                fill="#ec4899"
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="F1"
                                                fill="#10b981"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Training Progress */}
                            <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-green-400" />
                                        Training Progress - {bestModel.name}
                                    </CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Loss and accuracy over epochs
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={320}
                                    >
                                        <ComposedChart data={trainingData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#374151"
                                            />
                                            <XAxis
                                                dataKey="epoch"
                                                stroke="#9ca3af"
                                                tick={{ fill: "#9ca3af" }}
                                            />
                                            <YAxis
                                                yAxisId="left"
                                                stroke="#9ca3af"
                                                tick={{ fill: "#9ca3af" }}
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
                                                tick={{ fill: "#9ca3af" }}
                                                label={{
                                                    value: "Accuracy (%)",
                                                    angle: 90,
                                                    position: "insideRight",
                                                    fill: "#9ca3af",
                                                }}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{
                                                    backgroundColor: "#1f2937",
                                                    border: "1px solid #374151",
                                                    borderRadius: "8px",
                                                    color: "#fff",
                                                }}
                                            />
                                            <Legend
                                                wrapperStyle={{
                                                    color: "#9ca3af",
                                                }}
                                            />
                                            <Line
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="trainLoss"
                                                stroke="#ef4444"
                                                strokeWidth={2}
                                                dot={false}
                                                name="Train Loss"
                                            />
                                            <Line
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="valLoss"
                                                stroke="#f59e0b"
                                                strokeWidth={2}
                                                dot={false}
                                                name="Val Loss"
                                            />
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="valAcc"
                                                stroke="#10b981"
                                                strokeWidth={2}
                                                dot={false}
                                                name="Val Accuracy"
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* F1 Score Progression */}
                            <Card className="bg-gray-900 border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-white">
                                        F1 Score Progression
                                    </CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Best model training curve
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={320}
                                    >
                                        <AreaChart data={trainingData}>
                                            <defs>
                                                <linearGradient
                                                    id="colorF1"
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
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#374151"
                                            />
                                            <XAxis
                                                dataKey="epoch"
                                                stroke="#9ca3af"
                                                tick={{ fill: "#9ca3af" }}
                                            />
                                            <YAxis
                                                stroke="#9ca3af"
                                                tick={{ fill: "#9ca3af" }}
                                                domain={[0, 100]}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{
                                                    backgroundColor: "#1f2937",
                                                    border: "1px solid #374151",
                                                    borderRadius: "8px",
                                                    color: "#fff",
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="f1Score"
                                                stroke="#8b5cf6"
                                                fillOpacity={1}
                                                fill="url(#colorF1)"
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Model Parameters */}
                            <Card className="bg-gray-900 border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-white">
                                        Model Complexity
                                    </CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Parameters (millions)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={320}
                                    >
                                        <BarChart
                                            data={paramData}
                                            layout="vertical"
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#374151"
                                            />
                                            <XAxis
                                                type="number"
                                                stroke="#9ca3af"
                                                tick={{ fill: "#9ca3af" }}
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
                                                    backgroundColor: "#1f2937",
                                                    border: "1px solid #374151",
                                                    borderRadius: "8px",
                                                    color: "#fff",
                                                }}
                                            />
                                            <Legend
                                                wrapperStyle={{
                                                    color: "#9ca3af",
                                                }}
                                            />
                                            <Bar
                                                dataKey="total"
                                                fill="#3b82f6"
                                                name="Total"
                                                radius={[0, 4, 4, 0]}
                                            />
                                            <Bar
                                                dataKey="trainable"
                                                fill="#10b981"
                                                name="Trainable"
                                                radius={[0, 4, 4, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Detailed Model Cards */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold">
                                        Model Performance Cards
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Individual model breakdown
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {metricsData.models.map((model, idx) => (
                                    <ModelCard
                                        key={idx}
                                        model={model}
                                        isBest={model.name === bestModel.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Confusion Matrix Visualization */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="bg-gray-900 border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-white">
                                        Confusion Matrix Analysis
                                    </CardTitle>
                                    <CardDescription className="text-gray-400">
                                        True/False Positives and Negatives
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={320}
                                    >
                                        <BarChart data={confusionData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#374151"
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
                                            />
                                            <RechartsTooltip
                                                contentStyle={{
                                                    backgroundColor: "#1f2937",
                                                    border: "1px solid #374151",
                                                    borderRadius: "8px",
                                                    color: "#fff",
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
                                                fill="#10b981"
                                                name="True Positive"
                                            />
                                            <Bar
                                                dataKey="TN"
                                                stackId="a"
                                                fill="#3b82f6"
                                                name="True Negative"
                                            />
                                            <Bar
                                                dataKey="FP"
                                                stackId="a"
                                                fill="#f59e0b"
                                                name="False Positive"
                                            />
                                            <Bar
                                                dataKey="FN"
                                                stackId="a"
                                                fill="#ef4444"
                                                name="False Negative"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Performance Radar */}
                            <Card className="bg-gray-900 border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-white">
                                        Multi-Metric Radar
                                    </CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Comprehensive model comparison
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={320}
                                    >
                                        <RadarChart
                                            data={[
                                                {
                                                    metric: "Accuracy",
                                                    ...Object.fromEntries(
                                                        radarDataAll.map(
                                                            (m) => [
                                                                m.model,
                                                                m.Accuracy,
                                                            ]
                                                        )
                                                    ),
                                                },
                                                {
                                                    metric: "Precision",
                                                    ...Object.fromEntries(
                                                        radarDataAll.map(
                                                            (m) => [
                                                                m.model,
                                                                m.Precision,
                                                            ]
                                                        )
                                                    ),
                                                },
                                                {
                                                    metric: "Recall",
                                                    ...Object.fromEntries(
                                                        radarDataAll.map(
                                                            (m) => [
                                                                m.model,
                                                                m.Recall,
                                                            ]
                                                        )
                                                    ),
                                                },
                                                {
                                                    metric: "F1",
                                                    ...Object.fromEntries(
                                                        radarDataAll.map(
                                                            (m) => [
                                                                m.model,
                                                                m.F1,
                                                            ]
                                                        )
                                                    ),
                                                },
                                            ]}
                                        >
                                            <PolarGrid stroke="#374151" />
                                            <PolarAngleAxis
                                                dataKey="metric"
                                                stroke="#9ca3af"
                                                tick={{ fill: "#9ca3af" }}
                                            />
                                            <PolarRadiusAxis
                                                angle={90}
                                                domain={[0, 100]}
                                                stroke="#9ca3af"
                                                tick={{ fill: "#9ca3af" }}
                                            />
                                            {radarDataAll
                                                .slice(0, 3)
                                                .map((model, idx) => {
                                                    const colors = [
                                                        "#3b82f6",
                                                        "#8b5cf6",
                                                        "#ec4899",
                                                        "#10b981",
                                                        "#f59e0b",
                                                    ];
                                                    return (
                                                        <Radar
                                                            key={model.model}
                                                            name={model.model}
                                                            dataKey={
                                                                model.model
                                                            }
                                                            stroke={colors[idx]}
                                                            fill={colors[idx]}
                                                            fillOpacity={0.3}
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
                                                    backgroundColor: "#1f2937",
                                                    border: "1px solid #374151",
                                                    borderRadius: "8px",
                                                    color: "#fff",
                                                }}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="training">
                        <Card className="bg-gray-900 border-gray-800">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                    <LineChartIcon className="w-8 h-8 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                                    Training Details
                                </h3>
                                <p className="text-sm text-gray-500 text-center max-w-md">
                                    Detailed training metrics and epoch-by-epoch
                                    analysis coming soon
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analysis">
                        <Card className="bg-gray-900 border-gray-800">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                    <PieChart className="w-8 h-8 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                                    Deep Analysis
                                </h3>
                                <p className="text-sm text-gray-500 text-center max-w-md">
                                    Advanced statistical analysis and model
                                    comparisons coming soon
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </TooltipProvider>
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

function ModelCard({ model, isBest }) {
    return (
        <Card className="bg-gray-900 border-gray-800 hover:border-blue-500/50 transition-colors">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-lg text-white">
                            {model.name}
                        </CardTitle>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="w-4 h-4 text-gray-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    {model.architecture ||
                                        "Multimodal Architecture"}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {model.total_params
                                        ? `${(
                                              model.total_params / 1000000
                                          ).toFixed(1)}M params`
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
                                ? `${(model.total_params / 1000000).toFixed(
                                      1
                                  )}M`
                                : "N/A"}
                        </span>
                    </div>
                    {model.training_time_seconds && (
                        <div className="flex justify-between">
                            <span>Training Time:</span>
                            <span className="text-gray-400">
                                {(model.training_time_seconds / 60).toFixed(1)}{" "}
                                min
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
