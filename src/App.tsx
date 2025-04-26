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
import Auth from "./pages/Auth";
import { AppSidebar } from "./components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationSystem } from "./components/NotificationSystem";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import SetupWizard from "./pages/SetupWizard";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isManager } = useAuth();
  const [setupComplete, setSetupComplete] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  
  useEffect(() => {
    async function checkSetup() {
      if (user) {
        const { data } = await supabase
          .from('organization_settings')
          .select('setup_completed')
          .single();
        
        setSetupComplete(!!data?.setup_completed);
      }
      setCheckingSetup(false);
    }
    
    checkSetup();
  }, [user]);
  
  if (isLoading || checkingSetup) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If setup is not complete and user is a manager, redirect to setup
  if (!setupComplete && isManager) {
    return <Navigate to="/setup" replace />;
  }

  // If setup is not complete and user is not a manager, show waiting message
  if (!setupComplete && !isManager) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Organization Setup Required</h2>
          <p className="text-gray-600">Please wait for a manager to complete the organization setup.</p>
        </div>
      </div>
    );
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/setup" element={<SetupWizard />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
