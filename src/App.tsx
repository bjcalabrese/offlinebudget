import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Photos } from "./pages/Photos";
import { Albums } from "./pages/Albums";
import { Search } from "./pages/Search";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
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
            <Route path="/albums" element={<Albums />} />
            <Route path="/search" element={<Search />} />
            <Route path="/timeline" element={<Photos />} />
            <Route path="/favorites" element={<Photos />} />
            <Route path="/liked" element={<Photos />} />
            <Route path="/places" element={<Photos />} />
            <Route path="/recent" element={<Photos />} />
            <Route path="/settings" element={<Photos />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
