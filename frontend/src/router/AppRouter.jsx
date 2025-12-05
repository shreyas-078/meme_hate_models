import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import { ROUTES } from "../constants/routes";
import { SkeletonCard } from "../components/Skeleton";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("../pages/Dashboard"));
const DatasetAnalysis = lazy(() => import("../pages/DatasetAnalysis"));
const TryModel = lazy(() => import("../pages/TryModel"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-6 w-full max-w-4xl px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard delay={0.1} />
      </div>
      <SkeletonCard delay={0.2} />
    </div>
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />

          <Route
            path={ROUTES.DASHBOARD}
            element={
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            }
          />

          <Route
            path={ROUTES.DATASET_ANALYSIS}
            element={
              <Suspense fallback={<PageLoader />}>
                <DatasetAnalysis />
              </Suspense>
            }
          />

          <Route
            path={ROUTES.TRY_MODEL}
            element={
              <Suspense fallback={<PageLoader />}>
                <TryModel />
              </Suspense>
            }
          />

          {/* 404 Route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                  <p className="text-gray-400 mb-6">Page not found</p>
                  <a
                    href={ROUTES.DASHBOARD}
                    className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
