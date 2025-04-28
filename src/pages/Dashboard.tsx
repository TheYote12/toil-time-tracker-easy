import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ManagerAnalyticsPanel } from "@/components/ManagerAnalyticsPanel";
import { TOILPolicyGuide } from "@/components/TOILPolicyGuide";
import { NotificationSystem } from "@/components/NotificationSystem";
import { UserManagement } from "@/components/UserManagement";
import { TOILBalance } from "@/components/dashboard/TOILBalance";
import { TOILChart } from "@/components/dashboard/TOILChart";
import { ActionButtons } from "@/components/dashboard/ActionButtons";
import { NoTeamMembers } from "@/components/dashboard/NoTeamMembers";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@/components/dashboard/ReloadIcon";
import { toast } from "@/hooks/use-toast";

type ToilSubmission = {
  id: string;
  user_id: string;
  type: 'earn' | 'use';
  date: string;
  project: string | null;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
};

const Dashboard = () => {
  const { user, isManager, refreshUserRole } = useAuth();
  const [balance, setBalance] = useState(0);
  const [recentSubmissions, setRecentSubmissions] = useState<ToilSubmission[]>([]);
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // First refresh the user role with proper error handling
      try {
        await refreshUserRole();
      } catch (error) {
        console.error("Error refreshing user role:", error);
        toast({
          title: "Error refreshing role",
          description: "Some features may be limited",
          variant: "destructive",
        });
      }
      
      // Fetch user's own TOIL submissions with error handling
      try {
        const { data: submissions, error } = await supabase
          .from('toil_submissions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) {
          throw error;
        }

        // Calculate balance and set recent submissions
        let calculatedBalance = 0;
        for (const sub of submissions || []) {
          if (sub.status === 'Approved') {
            if (sub.type === 'earn') calculatedBalance += sub.amount;
            else if (sub.type === 'use') calculatedBalance -= sub.amount;
          }
        }
        
        setBalance(calculatedBalance);
        setRecentSubmissions((submissions || []).slice(0, 6));
      } catch (error: any) {
        console.error("Error fetching user submissions:", error);
        toast({
          title: "Error loading submissions",
          description: error.message || "Please try refreshing the page",
          variant: "destructive",
        });
      }

      // If user is manager, fetch team members with error handling
      if (isManager) {
        try {
          const { data: members, error: membersError } = await supabase
            .from('profiles')
            .select('*')
            .eq('manager_id', user.id);

          if (membersError) {
            throw membersError;
          }
          
          setTeamMembers(members || []);
        } catch (error: any) {
          console.error("Error fetching team members:", error);
          toast({
            title: "Error loading team",
            description: error.message || "Unable to load team information",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
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

  const chartLineData = useMemo(() => {
    return recentSubmissions.map(s => ({
      name: format(new Date(s.date), "MMM d"),
      TOIL: s.amount,
    }));
  }, [recentSubmissions]);

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <NotificationSystem />
      <TOILPolicyGuide />
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">Welcome{user?.user_metadata.name ? `, ${user.user_metadata.name}` : ''}</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            {isRefreshing ? (
              <>
                <ReloadIcon className="w-4 h-4 animate-spin" /> Refreshing...
              </>
            ) : (
              <>
                <ReloadIcon className="w-4 h-4" /> Refresh Data
              </>
            )}
          </Button>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <TOILBalance balance={balance} />
        </div>

        <TOILChart chartLineData={chartLineData} />
        <ActionButtons />
      </div>

      {isManager && (
        <div className="mb-8 space-y-4">
          <ManagerAnalyticsPanel />
          <UserManagement />
        </div>
      )}

      {isManager && teamMembers.length === 0 && <NoTeamMembers />}
    </div>
  );
};

export default Dashboard;
