import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    useLocation,
} from "react-router-dom";
import { BarChart3, FileSearch, Upload, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Dashboard from "./pages/Dashboard";
import IndianDatasetAnalysis from "./pages/IndianDatasetAnalysis";
import Prediction from "./pages/Prediction";

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
        },
        {
            path: "/analysis",
            label: "Dataset Analysis",
            icon: <FileSearch className="w-5 h-5" />,
            description: "Explore dataset insights",
        },
        {
            path: "/predict",
            label: "Try Model",
            icon: <Upload className="w-5 h-5" />,
            description: "Test hate detection",
        },
    ];

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-800 bg-black flex flex-col">
                {/* Logo/Header */}
                <div className="p-6 border-b border-gray-800">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Hateful Meme</h1>
                            <p className="text-xs text-gray-400">
                                Detection System
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 py-4">
                    <nav className="space-y-1 px-3">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                                        isActive
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-400 hover:bg-gray-900 hover:text-white"
                                    }`}
                                >
                                    <div className="mt-0.5">{item.icon}</div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">
                                            {item.label}
                                        </div>
                                        <div className="text-xs opacity-80 mt-0.5">
                                            {item.description}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </ScrollArea>

                {/* Status Badge */}
                <div className="p-4 border-t border-gray-800">
                    <Badge className="w-full justify-center bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20">
                        <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        5 Models Active
                    </Badge>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-black">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route
                        path="/analysis"
                        element={<IndianDatasetAnalysis />}
                    />
                    <Route path="/predict" element={<Prediction />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
