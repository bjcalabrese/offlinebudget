import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { Photos } from "./pages/Photos";
import { Settings } from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useSettingsStore } from "./store/settingsStore";

const queryClient = new QueryClient();

const App: React.FC = () => {
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    // Initialize settings on app startup
    loadSettings();
  }, [loadSettings]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/photos" replace />} />
                <Route path="/photos" element={<Photos />} />
                <Route path="/albums" element={<Photos />} />
                <Route path="/search" element={<Photos />} />
                <Route path="/timeline" element={<Photos />} />
                <Route path="/favorites" element={<Photos />} />
                <Route path="/liked" element={<Photos />} />
                <Route path="/places" element={<Photos />} />
                <Route path="/recent" element={<Photos />} />
                <Route path="/settings" element={<Settings />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
