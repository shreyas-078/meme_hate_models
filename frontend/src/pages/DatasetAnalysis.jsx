import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap,
} from "recharts";
import {
  Database,
  Image as ImageIcon,
  FileText,
  Hash,
  Filter,
  Search,
  Download,
} from "lucide-react";
import PageContainer from "../components/PageContainer";
import MetricCard from "../components/MetricCard";
import { SkeletonCard, SkeletonChart } from "../components/Skeleton";
import { useAsync } from "../hooks/useAsync";
import { fetchDatasetStats } from "../api/mockApi";
import { formatLargeNumber, formatPercentage } from "../utils/formatting";
import { CHART_COLORS } from "../constants/theme";

const DatasetAnalysis = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { data: stats, isLoading } = useAsync(fetchDatasetStats);

  const COLORS = [
    CHART_COLORS.primary,
    CHART_COLORS.secondary,
    CHART_COLORS.tertiary,
    CHART_COLORS.success,
    CHART_COLORS.warning,
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-lg border border-white/20">
          {payload.map((entry, index) => (
            <p key={index} className="text-xs text-white">
              {entry.name}:{" "}
              <span className="font-bold">{entry.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const classDistributionData = stats
    ? [
        {
          name: "Hateful",
          value: stats.classDistribution.hateful,
          fill: CHART_COLORS.error,
        },
        {
          name: "Not Hateful",
          value: stats.classDistribution.notHateful,
          fill: CHART_COLORS.success,
        },
      ]
    : [];

  const sourcesData = stats
    ? Object.entries(stats.sources).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value,
      }))
    : [];

  const mediaTypesData = stats
    ? Object.entries(stats.mediaTypes).map(([key, value]) => ({
        name: key.replace(/([A-Z])/g, " $1").trim(),
        value,
      }))
    : [];

  return (
    <PageContainer
      title="Dataset Analysis"
      subtitle="Comprehensive insights into training data distribution and characteristics"
      actions={
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Report
        </motion.button>
      }
    >
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} delay={i * 0.1} />
            ))}
          </>
        ) : (
          <>
            <MetricCard
              title="Total Samples"
              value={formatLargeNumber(stats?.totalSamples)}
              change={0.12}
              trend="up"
              icon={Database}
              color="blue"
              delay={0}
            />
            <MetricCard
              title="Images with Text"
              value={formatLargeNumber(stats?.ocrStats.imagesWithText)}
              change={0.08}
              trend="up"
              icon={ImageIcon}
              color="purple"
              delay={0.1}
            />
            <MetricCard
              title="Avg Words/Image"
              value={stats?.ocrStats.avgWordsPerImage.toFixed(1)}
              change={-0.03}
              trend="down"
              icon={FileText}
              color="green"
              delay={0.2}
            />
            <MetricCard
              title="Unique Sources"
              value={Object.keys(stats?.sources || {}).length}
              icon={Hash}
              color="orange"
              delay={0.3}
            />
          </>
        )}
      </div>

      {/* Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-lg font-bold text-white mb-4">
            Class Distribution
          </h3>
          {isLoading ? (
            <SkeletonChart height="300px" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(1)}%`
                  }
                  labelLine={false}
                >
                  {classDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {classDistributionData.map((item, index) => (
              <div key={index} className="glass-panel p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-xs text-gray-400">{item.name}</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {item.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-lg font-bold text-white mb-4">Data Sources</h3>
          {isLoading ? (
            <SkeletonChart height="300px" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourcesData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="rgba(255,255,255,0.5)"
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  fill={CHART_COLORS.primary}
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Temporal Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-panel rounded-2xl p-6 border border-white/10 mb-8"
      >
        <h3 className="text-lg font-bold text-white mb-4">
          Temporal Distribution
        </h3>
        {isLoading ? (
          <SkeletonChart height="300px" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.temporalDistribution || []}>
              <defs>
                <linearGradient id="colorHateful" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={CHART_COLORS.error}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_COLORS.error}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="colorNotHateful"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={CHART_COLORS.success}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_COLORS.success}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Line
                type="monotone"
                dataKey="hateful"
                stroke={CHART_COLORS.error}
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Hateful"
              />
              <Line
                type="monotone"
                dataKey="notHateful"
                stroke={CHART_COLORS.success}
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Not Hateful"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Media Types & OCR Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-panel rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-lg font-bold text-white mb-4">Media Types</h3>
          {isLoading ? (
            <SkeletonChart height="250px" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={mediaTypesData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {mediaTypesData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-panel rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-lg font-bold text-white mb-4">Top OCR Words</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-10 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin">
              {stats?.ocrStats.topWords.map((item, index) => (
                <motion.div
                  key={item.word}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className="flex items-center gap-3 glass-panel p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      {item.word}
                    </div>
                    <div className="text-xs text-gray-400">
                      {item.count} occurrences
                    </div>
                  </div>
                  <div className="text-sm font-bold text-primary">
                    {formatPercentage(
                      item.count / stats.ocrStats.imagesWithText
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Language Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="glass-panel rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-lg font-bold text-white mb-4">
          Language Distribution
        </h3>
        {isLoading ? (
          <SkeletonChart height="200px" />
        ) : (
          <div className="space-y-4">
            {Object.entries(stats?.languages || {}).map(
              ([language, count], index) => {
                const percentage = (count / stats.totalSamples) * 100;
                return (
                  <motion.div
                    key={language}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white font-medium capitalize">
                        {language}
                      </span>
                      <span className="text-gray-400">
                        {count.toLocaleString()} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 1 + index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                );
              }
            )}
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
};

export default DatasetAnalysis;
