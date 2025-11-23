import { sleep } from "../lib/utils";
import { MODELS, MODEL_METRICS } from "../constants/models";

// Simulate API delay
const simulateDelay = (min = 300, max = 800) => {
  const delay = Math.random() * (max - min) + min;
  return sleep(delay);
};

// Mock training history data
const generateTrainingHistory = (epochs = 50) => {
  const history = [];
  let trainLoss = 2.5;
  let valLoss = 2.5;
  let trainAcc = 0.3;
  let valAcc = 0.3;

  for (let epoch = 1; epoch <= epochs; epoch++) {
    trainLoss = Math.max(0.1, trainLoss * 0.95 + (Math.random() - 0.5) * 0.05);
    valLoss = Math.max(0.1, valLoss * 0.96 + (Math.random() - 0.5) * 0.08);
    trainAcc = Math.min(0.99, trainAcc + 0.012 + (Math.random() - 0.5) * 0.01);
    valAcc = Math.min(0.96, valAcc + 0.011 + (Math.random() - 0.5) * 0.015);

    history.push({
      epoch,
      trainLoss: parseFloat(trainLoss.toFixed(4)),
      valLoss: parseFloat(valLoss.toFixed(4)),
      trainAccuracy: parseFloat(trainAcc.toFixed(4)),
      valAccuracy: parseFloat(valAcc.toFixed(4)),
      learningRate: 0.001 * Math.pow(0.95, Math.floor(epoch / 10)),
    });
  }

  return history;
};

// Fetch all models with metrics
export const fetchModels = async () => {
  await simulateDelay();

  return Object.values(MODELS).map((model) => ({
    ...model,
    metrics: MODEL_METRICS[model.id],
  }));
};

// Fetch metrics for a specific model
export const fetchModelMetrics = async (modelId) => {
  await simulateDelay();

  const model = MODELS[modelId.toUpperCase().replace(/[-]/g, "_")];
  const metrics = MODEL_METRICS[modelId];

  if (!model || !metrics) {
    throw new Error("Model not found");
  }

  return {
    model,
    metrics,
    trainingHistory: generateTrainingHistory(),
    confusionMatrix: [
      [850, 45], // True Negative, False Positive
      [38, 912], // False Negative, True Positive
    ],
    classificationReport: {
      hateful: {
        precision: 0.953,
        recall: 0.96,
        f1Score: 0.956,
        support: 950,
      },
      notHateful: {
        precision: 0.943,
        recall: 0.949,
        f1Score: 0.946,
        support: 895,
      },
    },
  };
};

// Fetch training summary
export const fetchTrainingSummary = async () => {
  await simulateDelay();

  return {
    totalEpochs: 50,
    totalTime: 14523, // seconds
    avgEpochTime: 290.46,
    bestEpoch: 47,
    bestValAccuracy: 0.9456,
    bestValLoss: 0.1234,
    hardwareUsed: {
      gpu: "NVIDIA RTX 4090",
      gpuMemory: "24GB",
      batchSize: 32,
      numWorkers: 8,
    },
    dataset: {
      trainSize: 12458,
      valSize: 2341,
      testSize: 1845,
      classes: ["hateful", "not_hateful"],
    },
  };
};

// Fetch dataset statistics
export const fetchDatasetStats = async () => {
  await simulateDelay();

  return {
    totalSamples: 16644,
    classDistribution: {
      hateful: 8234,
      notHateful: 8410,
    },
    sources: {
      twitter: 6234,
      reddit: 5412,
      facebook: 3456,
      instagram: 1542,
    },
    languages: {
      english: 14234,
      hindi: 1456,
      mixed: 954,
    },
    mediaTypes: {
      textOnly: 8234,
      imageWithText: 6412,
      imageOnly: 1998,
    },
    ocrStats: {
      avgWordsPerImage: 12.4,
      maxWords: 87,
      minWords: 0,
      imagesWithText: 8410,
      topWords: [
        { word: "hate", count: 1234 },
        { word: "people", count: 987 },
        { word: "community", count: 876 },
        { word: "violence", count: 765 },
        { word: "offensive", count: 654 },
        { word: "group", count: 543 },
        { word: "religion", count: 456 },
        { word: "culture", count: 389 },
        { word: "discrimination", count: 321 },
        { word: "attack", count: 298 },
      ],
    },
    temporalDistribution: generateTemporalData(),
  };
};

const generateTemporalData = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months
    .map((month, index) => ({
      month,
      hateful: Math.floor(Math.random() * 400 + 600),
      notHateful: Math.floor(Math.random() * 400 + 650),
      total: 0, // Will be calculated
    }))
    .map((item) => ({
      ...item,
      total: item.hateful + item.notHateful,
    }));
};

// Predict image
export const predictImage = async (modelId, imageFile, imageBase64) => {
  await simulateDelay(1000, 2000); // Longer delay for prediction

  // Simulate OCR extraction
  const mockOCRTexts = [
    "When you realize it's Monday tomorrow",
    "POV: You forgot to save your work",
    "Me pretending to understand what's happening",
    "That moment when you check your bank account",
    "When someone asks if you're okay",
  ];

  const ocrText = mockOCRTexts[Math.floor(Math.random() * mockOCRTexts.length)];

  // Simulate prediction
  const isHateful = Math.random() > 0.7;
  const confidence = isHateful
    ? Math.random() * 0.25 + 0.7 // 0.70 - 0.95 for hateful
    : Math.random() * 0.25 + 0.7; // 0.70 - 0.95 for not hateful

  return {
    modelId,
    prediction: isHateful ? "hateful" : "not_hateful",
    confidence: parseFloat(confidence.toFixed(4)),
    ocrText,
    processingTime: Math.random() * 1000 + 500, // ms
    timestamp: new Date().toISOString(),
    details: {
      hatefulScore: isHateful ? confidence : 1 - confidence,
      notHatefulScore: isHateful ? 1 - confidence : confidence,
      topFeatures: [
        { feature: "Text Content", importance: 0.45 },
        { feature: "Visual Context", importance: 0.32 },
        { feature: "Multimodal Fusion", importance: 0.23 },
      ],
    },
    explainability: {
      textHighlights: generateTextHighlights(ocrText, isHateful),
      visualAttention: generateMockHeatmap(),
    },
  };
};

const generateTextHighlights = (text, isHateful) => {
  const words = text.split(" ");
  return words.map((word, index) => ({
    word,
    importance:
      isHateful && Math.random() > 0.7
        ? Math.random() * 0.5 + 0.5
        : Math.random() * 0.3,
  }));
};

const generateMockHeatmap = () => {
  // Generate 10x10 heatmap values
  const heatmap = [];
  for (let i = 0; i < 10; i++) {
    const row = [];
    for (let j = 0; j < 10; j++) {
      row.push(Math.random());
    }
    heatmap.push(row);
  }
  return heatmap;
};

// Fetch inference history
export const fetchInferenceHistory = async (limit = 20) => {
  await simulateDelay();

  const history = [];
  for (let i = 0; i < limit; i++) {
    const isHateful = Math.random() > 0.5;
    const confidence = Math.random() * 0.3 + 0.7;

    history.push({
      id: `inf-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      modelId: Object.keys(MODEL_METRICS)[Math.floor(Math.random() * 5)],
      prediction: isHateful ? "hateful" : "not_hateful",
      confidence: parseFloat(confidence.toFixed(4)),
      processingTime: Math.random() * 1000 + 500,
      imageUrl: `https://picsum.photos/seed/${i}/400/300`,
    });
  }

  return history;
};

// Fetch model comparison data
export const fetchModelComparison = async () => {
  await simulateDelay();

  return Object.entries(MODEL_METRICS).map(([id, metrics]) => ({
    modelId: id,
    modelName: MODELS[id.toUpperCase().replace(/[-]/g, "_")].name,
    ...metrics,
    inferenceTime: Math.random() * 200 + 100, // ms
    modelSize: Math.random() * 500 + 100, // MB
    parameters: Math.floor(Math.random() * 50 + 20) * 1e6, // millions
  }));
};

export default {
  fetchModels,
  fetchModelMetrics,
  fetchTrainingSummary,
  fetchDatasetStats,
  predictImage,
  fetchInferenceHistory,
  fetchModelComparison,
};
