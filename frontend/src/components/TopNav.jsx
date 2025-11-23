import {
  Search,
  Bell,
  Settings,
  User,
  Download,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TopNav() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-xl"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <div className="flex h-16 items-center justify-between px-6">
        {/* Page Title & Breadcrumb */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-white">
              Performance Dashboard
            </h1>
            <p className="text-xs text-gray-400">
              Multimodal Hate Detection System
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div
            className={`relative transition-all duration-300 ${
              searchFocused ? "ring-2 ring-blue-500/50" : "ring-1 ring-white/10"
            } rounded-lg`}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search models, metrics..."
              className="w-full text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg focus:outline-none"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg hover:bg-white/10"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          {/* Export Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg hover:bg-white/10"
            title="Export report"
          >
            <Download className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg hover:bg-white/10"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg hover:bg-white/10"
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Divider */}
          <div className="h-6 w-px bg-white/10 mx-1"></div>

          {/* User Profile */}
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-white">Admin</p>
              <p className="text-[10px] text-gray-400">System Manager</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
