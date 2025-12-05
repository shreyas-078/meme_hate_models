// Model configurations and metadata
export const MODELS = {
  RESNET50_BERT: {
    id: "resnet50_bert",
    name: "ResNet50 + BERT",
    description:
      "Image feature extraction with ResNet50 and text processing with BERT",
    accuracy: 0.8945,
    icon: "🔍",
    color: "#3b82f6",
    tags: ["CNN", "Transformer", "Multimodal"],
  },
  RESNET50_ROBERTA: {
    id: "resnet50_roberta",
    name: "ResNet50 + RoBERTa",
    description:
      "Enhanced text understanding with RoBERTa for better hate speech detection",
    accuracy: 0.9123,
    icon: "🎯",
    color: "#8b5cf6",
    tags: ["CNN", "RoBERTa", "Enhanced"],
  },
  VIT_BERT: {
    id: "vit_bert",
    name: "ViT + BERT",
    description:
      "Vision Transformer with BERT for advanced multimodal analysis",
    accuracy: 0.9287,
    icon: "✨",
    color: "#ec4899",
    tags: ["Transformer", "Vision", "SOTA"],
  },
  EFFICIENTNET_DISTILBERT: {
    id: "efficientnet_distilbert",
    name: "EfficientNet + DistilBERT",
    description: "Lightweight and efficient model for fast inference",
    accuracy: 0.8876,
    icon: "⚡",
    color: "#10b981",
    tags: ["Efficient", "Fast", "Lightweight"],
  },
  CLIP_FINETUNED: {
    id: "clip_finetuned",
    name: "CLIP Fine-tuned",
    description: "Pre-trained CLIP model fine-tuned on hate speech dataset",
    accuracy: 0.9456,
    icon: "🚀",
    color: "#f59e0b",
    tags: ["CLIP", "Fine-tuned", "SOTA"],
  },
};

export const MODEL_METRICS = {
  resnet50_bert: {
    accuracy: 0.8945,
    precision: 0.8821,
    recall: 0.9023,
    f1Score: 0.8921,
    auc: 0.9234,
  },
  resnet50_roberta: {
    accuracy: 0.9123,
    precision: 0.9045,
    recall: 0.9178,
    f1Score: 0.9111,
    auc: 0.9456,
  },
  vit_bert: {
    accuracy: 0.9287,
    precision: 0.9234,
    recall: 0.9312,
    f1Score: 0.9273,
    auc: 0.9612,
  },
  efficientnet_distilbert: {
    accuracy: 0.8876,
    precision: 0.8756,
    recall: 0.8934,
    f1Score: 0.8844,
    auc: 0.9123,
  },
  clip_finetuned: {
    accuracy: 0.9456,
    precision: 0.9423,
    recall: 0.9489,
    f1Score: 0.9456,
    auc: 0.9734,
  },
};

export const PREDICTION_LABELS = {
  HATEFUL: {
    value: "hateful",
    label: "Hateful",
    color: "#ef4444",
    icon: "⚠️",
    description: "Contains hate speech or offensive content",
  },
  NOT_HATEFUL: {
    value: "not_hateful",
    label: "Not Hateful",
    color: "#10b981",
    icon: "✅",
    description: "Does not contain hate speech",
  },
};

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.85,
  MEDIUM: 0.65,
  LOW: 0.45,
};

export const getConfidenceLevel = (confidence) => {
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return "high";
  if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return "medium";
  if (confidence >= CONFIDENCE_THRESHOLDS.LOW) return "low";
  return "very-low";
};

export const getConfidenceColor = (confidence) => {
  const level = getConfidenceLevel(confidence);
  const colors = {
    high: "#10b981",
    medium: "#3b82f6",
    low: "#f59e0b",
    "very-low": "#ef4444",
  };
  return colors[level];
};
