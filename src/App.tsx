import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import LogExtraHours from "./pages/LogExtraHours";
import RequestTOIL from "./pages/RequestTOIL";
import Approvals from "./pages/Approvals";
import ToilHistory from "./pages/ToilHistory";
import { AppSidebar } from "./components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FakeAuthProvider } from "./contexts/FakeAuthContext";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
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
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <FakeAuthProvider>
        <BrowserRouter>
          <Routes>
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
      </FakeAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
