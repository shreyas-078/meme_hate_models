import React from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export const Skeleton = ({
  className,
  variant = "rectangular",
  animation = true,
}) => {
  const baseClass = "bg-gray-300 dark:bg-gray-700";
  const animationClass = animation ? "animate-pulse" : "";

  const variantClasses = {
    rectangular: "rounded-lg",
    circular: "rounded-full",
    text: "rounded h-4",
  };

  return (
    <div
      className={cn(
        baseClass,
        animationClass,
        variantClasses[variant],
        className
      )}
    />
  );
};

export const SkeletonCard = ({ delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="glass-panel rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-start gap-4 mb-4">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1">
          <Skeleton className="w-3/4 h-6 mb-2" />
          <Skeleton className="w-1/2 h-4" />
        </div>
      </div>
      <Skeleton className="w-full h-24 mb-3" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </motion.div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div
        className="grid gap-4 mb-4"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 mb-3"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-12" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const SkeletonChart = ({ height = "300px" }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10">
      <Skeleton className="w-1/3 h-6 mb-4" />
      <Skeleton className="w-full mb-2" style={{ height }} />
      <div className="flex gap-4 justify-center">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-20 h-4" />
      </div>
    </div>
  );
};

export default Skeleton;
