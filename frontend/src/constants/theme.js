// Theme configuration and constants
export const THEME_STORAGE_KEY = "mhsd-theme";

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

export const COLOR_PALETTE = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  purple: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7e22ce",
    800: "#6b21a8",
    900: "#581c87",
  },
  pink: {
    50: "#fdf2f8",
    100: "#fce7f3",
    200: "#fbcfe8",
    300: "#f9a8d4",
    400: "#f472b6",
    500: "#ec4899",
    600: "#db2777",
    700: "#be185d",
    800: "#9d174d",
    900: "#831843",
  },
};

export const CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  tertiary: "#ec4899",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#06b6d4",
  purple: "#a855f7",
};

export const GRADIENT_PRESETS = {
  ocean: "linear-gradient(135deg, #667eea 0%, #4facfe 100%)",
  sunset: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  forest: "linear-gradient(135deg, #0ba360 0%, #3cba92 100%)",
  fire: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  cosmic: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  mesh: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
};

export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 1000,
};

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
};

export const BORDER_RADIUS = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
  full: "9999px",
};
