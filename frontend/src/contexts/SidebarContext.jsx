import React, { createContext, useContext, useState } from "react";

const SidebarContext = createContext({
  isCollapsed: false,
  toggleSidebar: () => {},
  setSidebarCollapsed: () => {},
});

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    return stored === "true";
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebar-collapsed", newValue);
      return newValue;
    });
  };

  const setSidebarCollapsed = (collapsed) => {
    setIsCollapsed(collapsed);
    localStorage.setItem("sidebar-collapsed", collapsed);
  };

  const value = {
    isCollapsed,
    toggleSidebar,
    setSidebarCollapsed,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};
