// Real API calls to backend
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Helper function for fetch requests
const fetchAPI = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

// Fetch all models with metrics
export const fetchModels = async () => {
  return fetchAPI("/models");
};

// Fetch detailed metrics for a specific model
export const fetchModelMetrics = async (modelName) => {
  return fetchAPI(`/models/${modelName}/metrics`);
};

// Fetch training summary for all models
export const fetchTrainingSummary = async () => {
  return fetchAPI("/training/summary");
};

// Fetch dataset statistics
export const fetchDatasetStats = async () => {
  return fetchAPI("/dataset/stats");
};

// Predict image with selected model
export const predictImage = async (file, modelName = "resnet50_bert") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", modelName);

  const response = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Prediction failed: ${response.statusText}`);
  }

  return response.json();
};

// Check if backend is reachable
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE}/`);
    return response.ok;
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
};

// Get backend status with loaded models
export const fetchBackendStatus = async () => {
  try {
    return await fetchAPI("/");
  } catch (error) {
    console.error("Failed to fetch backend status:", error);
    return { loaded_models: [], available_models: [] };
  }
};
