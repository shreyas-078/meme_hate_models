import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { cn } from "../lib/utils";

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastColors = {
  success: "from-green-500/20 to-emerald-500/20 border-green-500/50",
  error: "from-red-500/20 to-rose-500/20 border-red-500/50",
  warning: "from-yellow-500/20 to-orange-500/20 border-yellow-500/50",
  info: "from-blue-500/20 to-cyan-500/20 border-blue-500/50",
};

const Toast = ({ toast, onRemove }) => {
  const Icon = toastIcons[toast.type] || Info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        "glass-panel rounded-xl p-4 shadow-xl border min-w-[320px] max-w-[420px]",
        "bg-gradient-to-r",
        toastColors[toast.type]
      )}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn(
            "w-5 h-5 flex-shrink-0 mt-0.5",
            toast.type === "success" && "text-green-400",
            toast.type === "error" && "text-red-400",
            toast.type === "warning" && "text-yellow-400",
            toast.type === "info" && "text-blue-400"
          )}
        />
        <div className="flex-1 text-sm text-white">{toast.message}</div>
        <button
          onClick={() => onRemove(toast.id)}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
