import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Download,
  Share2,
  Eye,
  Brain,
  Zap,
} from "lucide-react";
import PageContainer from "../components/PageContainer";
import UploadDropzone from "../components/UploadDropzone";
import Modal from "../components/Modal";
import { useToast } from "../contexts/ToastContext";
import { predictImage } from "../api/mockApi";
import { fetchModels, fetchBackendStatus } from "../api/api";
import { MODELS } from "../constants/models";
import { formatPercentage, formatNumber } from "../utils/formatting";
import { downloadFile } from "../lib/utils";
import {
  getConfidenceColor,
  getConfidenceLevel,
  PREDICTION_LABELS,
} from "../constants/models";

const TryModel = () => {
  const { addToast } = useToast();
  const [selectedModel, setSelectedModel] = useState("clip_finetuned");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExplainability, setShowExplainability] = useState(false);
  const [realModels, setRealModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState({ loaded_models: [] });

  // Fetch real model data from backend
  useEffect(() => {
    const loadModels = async () => {
      try {
        const [modelsData, statusData] = await Promise.all([
          fetchModels(),
          fetchBackendStatus(),
        ]);
        if (modelsData?.models) {
          setRealModels(modelsData.models);
        }
        if (statusData) {
          setBackendStatus(statusData);
        }
      } catch (error) {
        console.error("Failed to load models:", error);
      } finally {
        setModelsLoading(false);
      }
    };
    loadModels();
  }, []);

  // Merge real model data with constants
  const getModelData = (modelId) => {
    const constantModel = Object.values(MODELS).find((m) => m.id === modelId);
    const realModel = realModels.find((m) => m.id === modelId);
    const isLoaded = backendStatus.loaded_models?.includes(modelId);

    if (realModel?.metrics) {
      return {
        ...constantModel,
        accuracy: realModel.metrics.accuracy / 100, // Backend returns percentage
        metrics: realModel.metrics,
        loaded: isLoaded,
      };
    }
    return { ...constantModel, loaded: isLoaded };
  };

  const handleFileSelect = (file, preview) => {
    setUploadedImage(file);
    setImagePreview(preview);
    setPrediction(null);
  };

  const handlePredict = async () => {
    if (!uploadedImage) {
      addToast("Please upload an image first", "warning");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await predictImage(
        selectedModel,
        uploadedImage,
        imagePreview
      );
      setPrediction(result);
      addToast("Prediction completed successfully", "success");
    } catch (error) {
      addToast("Prediction failed. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadResults = () => {
    if (!prediction) return;

    const data = JSON.stringify(prediction, null, 2);
    downloadFile(data, `prediction-${Date.now()}.json`, "application/json");
    addToast("Results downloaded successfully", "success");
  };

  const handleReset = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setPrediction(null);
  };

  const predictionLabel = prediction
    ? PREDICTION_LABELS[prediction.prediction.toUpperCase().replace(/_/g, "_")]
    : null;

  const confidenceLevel = prediction
    ? getConfidenceLevel(prediction.confidence)
    : null;

  return (
    <PageContainer
      title="Try Model"
      subtitle="Upload an image and get instant hate speech detection results"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload & Model Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Model Selection */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-white">Select Model</h3>
            </div>

            <div className="space-y-2">
              {modelsLoading ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Loading models...
                </div>
              ) : (
                Object.values(MODELS).map((constantModel) => {
                  const model = getModelData(constantModel.id);
                  return (
                    <motion.button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedModel === model.id
                          ? "bg-primary/20 border-primary"
                          : "glass-panel border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{model.icon}</div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-white mb-1">
                            {model.name}
                          </div>
                          <div className="text-xs text-gray-400 mb-2">
                            {model.description}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-primary font-medium">
                              Accuracy: {formatPercentage(model.accuracy)}
                            </div>
                            {model.loaded ? (
                              <span className="text-xs text-green-400 flex items-center gap-1">
                                <span>●</span> Loaded
                              </span>
                            ) : model.metrics ? (
                              <span className="text-xs text-blue-400 flex items-center gap-1">
                                <span>●</span> Metrics Only
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">
                                ○ Offline
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-white">Upload Image</h3>
            </div>

            <UploadDropzone onFileSelect={handleFileSelect} />

            {uploadedImage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-3"
              >
                <motion.button
                  onClick={handlePredict}
                  disabled={isProcessing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze Image
                    </>
                  )}
                </motion.button>

                {prediction && (
                  <motion.button
                    onClick={handleReset}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-2 rounded-xl glass-panel border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-all"
                  >
                    Reset & Try Another
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Right Column - Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Image Preview & Results */}
          <AnimatePresence mode="wait">
            {!imagePreview ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel rounded-2xl p-12 border border-white/10 border-dashed"
              >
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
                    <Eye className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    No Image Selected
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Upload an image to begin analysis
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel rounded-2xl overflow-hidden border border-white/10"
              >
                <div className="relative aspect-video bg-black/20">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  {prediction && (
                    <div className="absolute top-4 right-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className={`px-4 py-2 rounded-xl glass-panel border-2 ${
                          predictionLabel.value === "hateful"
                            ? "border-red-500 bg-red-500/20"
                            : "border-green-500 bg-green-500/20"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {predictionLabel.icon}
                          </span>
                          <div>
                            <div className="text-sm font-bold text-white">
                              {predictionLabel.label}
                            </div>
                            <div className="text-xs text-white/80">
                              {formatPercentage(prediction.confidence)}{" "}
                              confident
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OCR Results */}
          {prediction && prediction.ocrText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-bold text-white">
                  Extracted Text (OCR)
                </h3>
              </div>
              <div className="glass-panel p-4 rounded-xl">
                <p className="text-white text-sm leading-relaxed">
                  {prediction.explainability.textHighlights.map(
                    (item, index) => {
                      const intensity = item.importance;
                      const bgColor =
                        intensity > 0.5
                          ? `rgba(239, 68, 68, ${intensity * 0.5})`
                          : "transparent";

                      return (
                        <span
                          key={index}
                          style={{ backgroundColor: bgColor }}
                          className="px-1 rounded transition-all"
                        >
                          {item.word}{" "}
                        </span>
                      );
                    }
                  )}
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                * Highlighted words indicate importance in prediction
              </p>
            </motion.div>
          )}

          {/* Prediction Details */}
          {prediction && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  Prediction Details
                </h3>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => setShowExplainability(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 rounded-lg glass-panel border border-white/10 text-white text-xs font-medium hover:bg-white/5 transition-all flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Explainability
                  </motion.button>
                  <motion.button
                    onClick={handleDownloadResults}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 rounded-lg glass-panel border border-white/10 text-white text-xs font-medium hover:bg-white/5 transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </motion.button>
                </div>
              </div>

              {/* Confidence Bars */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium text-white">
                        Hateful Content
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {formatPercentage(prediction.details.hatefulScore)}
                    </span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${prediction.details.hatefulScore * 100}%`,
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-white">
                        Not Hateful
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {formatPercentage(prediction.details.notHatefulScore)}
                    </span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${prediction.details.notHatefulScore * 100}%`,
                      }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                </div>
              </div>

              {/* Feature Importance */}
              <div className="glass-panel p-4 rounded-xl">
                <h4 className="text-sm font-bold text-white mb-3">
                  Feature Importance
                </h4>
                <div className="space-y-3">
                  {prediction.details.topFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex-1">
                        <div className="text-xs text-gray-400 mb-1">
                          {feature.feature}
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${feature.importance * 100}%` }}
                            transition={{
                              duration: 1,
                              delay: 0.5 + index * 0.1,
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-xs font-bold text-white">
                        {formatPercentage(feature.importance)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="glass-panel p-3 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">
                    Processing Time
                  </div>
                  <div className="text-sm font-bold text-white">
                    {prediction.processingTime.toFixed(0)}ms
                  </div>
                </div>
                <div className="glass-panel p-3 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">
                    Confidence Level
                  </div>
                  <div
                    className={`text-sm font-bold capitalize`}
                    style={{ color: getConfidenceColor(prediction.confidence) }}
                  >
                    {confidenceLevel}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Explainability Modal */}
      <Modal
        isOpen={showExplainability}
        onClose={() => setShowExplainability(false)}
        title="Model Explainability"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-bold text-white mb-3">
              Visual Attention Heatmap
            </h4>
            <div className="glass-panel p-4 rounded-xl">
              <p className="text-sm text-gray-400 text-center py-8">
                Heatmap visualization showing which parts of the image
                influenced the prediction most.
                <br />
                <span className="text-xs">(Coming in future update)</span>
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3">
              Model Decision Path
            </h4>
            <div className="glass-panel p-4 rounded-xl">
              <div className="space-y-3">
                {prediction?.details.topFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">
                        {feature.feature}
                      </div>
                      <div className="text-xs text-gray-400">
                        Contributed {formatPercentage(feature.importance)} to
                        the final decision
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default TryModel;
