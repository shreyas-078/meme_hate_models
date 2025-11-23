import React from "react";
import { motion } from "framer-motion";
import { useSidebar } from "../contexts/SidebarContext";
import { cn } from "../lib/utils";

const PageContainer = ({ children, title, subtitle, actions }) => {
  const { isCollapsed } = useSidebar();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "min-h-screen pt-16 transition-all duration-300",
        isCollapsed ? "pl-[80px]" : "pl-[280px]"
      )}
    >
      <div className="p-6 lg:p-8">
        {/* Page Header */}
        {(title || subtitle || actions) && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-start justify-between">
              <div>
                {title && (
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-gray-400 text-sm lg:text-base">
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center gap-2">{actions}</div>
              )}
            </div>
          </motion.div>
        )}

        {/* Page Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PageContainer;
