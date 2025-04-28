
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import LogExtraHours from "./pages/LogExtraHours";
import RequestTOIL from "./pages/RequestTOIL";
import Approvals from "./pages/Approvals";
import ToilHistory from "./pages/ToilHistory";
import Departments from "./pages/Departments";
import Auth from "./pages/Auth";
import { AppSidebar } from "./components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "./contexts/auth";
import { NotificationSystem } from "./components/NotificationSystem";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Create the QueryClient outside of any component
const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <>
      <NotificationSystem />
      {children}
    </>
  );
};

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        {/* Show trigger for mobile only, with improved visibility */}
        <div className="md:hidden fixed top-4 left-4 z-50 bg-white rounded-lg shadow-lg p-2">
          <SidebarTrigger className="text-purple-600 hover:text-purple-700" />
        </div>
        <main className="flex-1 pt-16 md:pt-0" tabIndex={-1} aria-label="Main content">{children}</main>
      </div>
    </SidebarProvider>
  </ProtectedRoute>
);

// Separate component for organization initialization
const OrganizationInitializer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    async function initializeOrganizationSettings() {
      try {
        // Check if we already have organization settings
        const { data, error } = await supabase
          .from('organization_settings')
          .select('id')
          .eq('name', 'Scene3D')
          .maybeSingle();
        
        if (error) {
          throw error;
        }
        
        // If no settings exist yet, create default ones
        if (!data) {
          console.log('Creating default organization settings');
          const { error: insertError } = await supabase
            .from('organization_settings')
            .insert({
              name: 'Scene3D',
              setup_completed: true,
              max_toil_hours: 35,
              toil_expiry_days: 90,
              requires_manager_approval: true
            });
            
          if (insertError) {
            throw insertError;
          }
          
          // Create a default department if none exists
          const { count, error: countError } = await supabase
            .from('departments')
            .select('*', { count: 'exact', head: true });
            
          if (countError) {
            throw countError;
          }
          
          if (count === 0) {
            const { error: deptError } = await supabase
              .from('departments')
              .insert({ name: 'General' });
              
            if (deptError) {
              throw deptError;
            }
          }
        }
      } catch (error) {
        console.error('Error initializing settings:', error);
      }
    }
    
    initializeOrganizationSettings();
  }, []);

  return <>{children}</>;
};

// Main App component
function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OrganizationInitializer>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/"
                  element={
                    <AppLayout>
                      <Index />
                    </AppLayout>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  }
                />
                <Route
                  path="/log-extra-hours"
                  element={
                    <AppLayout>
                      <LogExtraHours />
                    </AppLayout>
                  }
                />
                <Route
                  path="/request-toil"
                  element={
                    <AppLayout>
                      <RequestTOIL />
                    </AppLayout>
                  }
                />
                <Route
                  path="/approvals"
                  element={
                    <AppLayout>
                      <Approvals />
                    </AppLayout>
                  }
                />
                <Route
                  path="/toil-history"
                  element={
                    <AppLayout>
                      <ToilHistory />
                    </AppLayout>
                  }
                />
                <Route
                  path="/departments"
                  element={
                    <AppLayout>
                      <Departments />
                    </AppLayout>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </OrganizationInitializer>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
