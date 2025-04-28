
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";

export type ToilSubmission = {
  id: string;
  user_id: string;
  type: 'earn' | 'use';
  date: string;
  project: string | null;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
};

export function useDashboardData() {
  const { user, refreshUserRole } = useAuth();
  const [balance, setBalance] = useState(0);
  const [recentSubmissions, setRecentSubmissions] = useState<ToilSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching dashboard data for user:', user.id);
      
      try {
        await refreshUserRole();
        console.log('User role refreshed successfully');
      } catch (error: any) {
        console.error("Error refreshing user role:", error);
        toast({
          title: "Error refreshing role",
          description: "Some features may be limited",
          variant: "destructive",
        });
      }
      
      try {
        // Get the TOIL balance using RPC with explicit type casting
        const { data: balanceData, error: balanceError } = await supabase
          .rpc('get_toil_balance', { user_id_param: user.id }) as { data: number | null, error: any };
          
        if (balanceError) {
          console.error('Error fetching TOIL balance:', balanceError);
          throw balanceError;
        }
        
        setBalance(balanceData || 0);
        
        // Get recent submissions
        const { data: submissions, error } = await supabase
          .from('toil_submissions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(6);

        if (error) {
          console.error('Error fetching submissions:', error);
          throw error;
        }

        console.log('Fetched TOIL submissions:', submissions);
        
        setRecentSubmissions(submissions || []);
      } catch (error: any) {
        console.error("Error fetching user submissions:", error);
        setError(error.message);
        toast({
          title: "Error loading submissions",
          description: error.message || "Please try refreshing the page",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
  };

  return {
    balance,
    recentSubmissions,
    isLoading,
    isRefreshing,
    error,
    handleRefresh
  };
}
