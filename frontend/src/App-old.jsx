import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import {
  BarChart3,
  FileSearch,
  Upload,
  Activity,
  Sparkles,
  TrendingUp,
  Database,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Dashboard from "./pages/Dashboard";
import IndianDatasetAnalysis from "./pages/IndianDatasetAnalysis";
import Prediction from "./pages/Prediction";
import AnimatedBackground from "./components/ui/animated-background";
import TopNav from "./components/TopNav";

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

function AppLayout() {
  const location = useLocation();

  const navItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: <BarChart3 className="w-5 h-5" />,
      description: "View metrics & performance",
      badge: "5 Models",
    },
    {
      path: "/analysis",
      label: "Dataset Analysis",
      icon: <Database className="w-5 h-5" />,
      description: "Explore dataset insights",
      badge: "New",
    },
    {
      path: "/predict",
      label: "Try Model",
      icon: <Sparkles className="w-5 h-5" />,
      description: "Test hate detection",
      badge: null,
    },
  ];

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative">
      <AnimatedBackground />

      {/* Enhanced Sidebar */}
      <aside
        className="w-72 border-r border-white/10 backdrop-blur-xl flex flex-col relative z-10"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Hateful Meme
              </h1>
              <p className="text-xs text-gray-400 font-medium">
                Detection System
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-6">
          <nav className="space-y-2 px-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
              Main Menu
            </p>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                  )}
                  <div
                    className={`${
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-blue-400"
                    } transition-colors`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <Badge
                          className={`text-[10px] px-1.5 py-0 h-5 ${
                            isActive
                              ? "bg-white/20 text-white border-white/30"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] opacity-80 mt-0.5 truncate">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Quick Stats Section */}
          <div className="mt-8 px-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
              Quick Stats
            </p>
            <div className="space-y-2 px-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Best Accuracy</span>
                <span className="font-bold text-green-400">94.2%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Total Epochs</span>
                <span className="font-bold text-blue-400">150</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Dataset Size</span>
                <span className="font-bold text-purple-400">10K+</span>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Status Badge */}
        <div className="p-4 border-t border-white/10">
          <Badge className="w-full justify-center py-2.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-400 border-green-500/30 hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300">
            <span className="relative flex h-2.5 w-2.5 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <TrendingUp className="w-4 h-4 mr-2" />
            All Systems Operational
          </Badge>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-auto bg-transparent">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analysis" element={<IndianDatasetAnalysis />} />
            <Route path="/predict" element={<Prediction />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
