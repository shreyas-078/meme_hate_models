import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../lib/utils";
import { formatNumber, formatPercentage } from "../utils/formatting";

const MetricCard = ({
  title,
  value,
  change,
  changeType = "percentage",
  icon: Icon,
  trend,
  color = "blue",
  delay = 0,
  sparklineData = [],
}) => {
  const getTrendIcon = () => {
    if (trend === "up") return TrendingUp;
    if (trend === "down") return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-green-400";
    if (trend === "down") return "text-red-400";
    return "text-gray-400";
  };

  const TrendIcon = getTrendIcon();

  const colorClasses = {
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/50",
    purple: "from-purple-500/20 to-pink-500/20 border-purple-500/50",
    green: "from-green-500/20 to-emerald-500/20 border-green-500/50",
    orange: "from-orange-500/20 to-yellow-500/20 border-orange-500/50",
    pink: "from-pink-500/20 to-rose-500/20 border-pink-500/50",
  };

  const iconColorClasses = {
    blue: "text-blue-400",
    purple: "text-purple-400",
    green: "text-green-400",
    orange: "text-orange-400",
    pink: "text-pink-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "glass-panel rounded-2xl p-6 border bg-gradient-to-br hover:shadow-glow transition-all",
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">
            {typeof value === "number" ? formatNumber(value, 4) : value}
          </h3>
        </div>
        {Icon && (
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              "glass-panel",
              iconColorClasses[color]
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Change Indicator */}
      {change !== undefined && (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
              getTrendColor(),
              "bg-white/5"
            )}
          >
            <TrendIcon className="w-3 h-3" />
            <span>
              {changeType === "percentage"
                ? formatPercentage(Math.abs(change) / 100)
                : formatNumber(Math.abs(change))}
            </span>
          </div>
          <span className="text-xs text-gray-500">vs last period</span>
        </div>
      )}

      {/* Sparkline */}
      {sparklineData.length > 0 && (
        <div className="mt-4 h-8">
          <svg width="100%" height="100%" className="overflow-visible">
            <motion.path
              d={generateSparklinePath(sparklineData)}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={iconColorClasses[color]}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: delay + 0.3 }}
            />
          </svg>
        </div>
      )}
    </motion.div>
  );
};

// Helper function to generate sparkline path
const generateSparklinePath = (data) => {
  if (data.length === 0) return "";

  const width = 100;
  const height = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  return `M ${points.join(" L ")}`;
};

export default MetricCard;
