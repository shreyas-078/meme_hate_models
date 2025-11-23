import React from "react";
import { ThemeProvider } from "./ThemeContext";
import { ToastProvider } from "./ToastContext";
import { SidebarProvider } from "./SidebarContext";

export const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <ToastProvider>{children}</ToastProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
};
