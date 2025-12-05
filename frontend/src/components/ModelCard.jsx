import React from "react";
import { motion } from "framer-motion";
import { Brain, ChevronRight, TrendingUp } from "lucide-react";
import { cn } from "../lib/utils";
import { formatPercentage } from "../utils/formatting";

const ModelCard = ({
  name,
  description,
  metrics = {},
  isSOTA = false,
  isActive = false,
  onClick,
  delay = 0,
}) => {
  const getAccuracyColor = (accuracy) => {
    const numAccuracy = parseFloat(accuracy) || 0;
    if (numAccuracy >= 93) return "text-green-400";
    if (numAccuracy >= 90) return "text-blue-400";
    if (numAccuracy >= 85) return "text-yellow-400";
    return "text-orange-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onClick}
      className={cn(
        "glass-panel rounded-2xl p-6 border cursor-pointer transition-all",
        "hover:shadow-glow group",
        isSOTA && "ring-2 ring-primary shadow-glow"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-gray-400">{description}</p>
              {isActive && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                  Active
                </span>
              )}
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="glass-panel p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">{key}</div>
            <div
              className={cn(
                "text-lg font-bold",
                key === "Accuracy" ? getAccuracyColor(value) : "text-blue-400"
              )}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Status Badge */}
      {isSOTA && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.3 }}
          className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30"
        >
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-xs font-medium text-green-400">Best Model</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ModelCard;
