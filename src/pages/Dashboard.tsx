
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
  const { user, isManager } = useAuth();
  const [balance, setBalance] = useState(0);
  const [recentSubmissions, setRecentSubmissions] = useState<ToilSubmission[]>([]);
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchDashboardData() {
      setIsLoading(true);

      try {
        // Fetch user's own TOIL submissions
        const { data: submissions, error } = await supabase
          .from('toil_submissions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) {
          console.error("Error fetching user submissions:", error);
        } else {
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
        }

        if (isManager) {
          const { data: members, error: membersError } = await supabase
            .from('profiles')
            .select('*')
            .eq('manager_id', user.id);

          if (membersError) {
            console.error("Error fetching team members:", membersError);
          } else {
            setTeamMembers(members || []);
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, isManager]);

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
        <h2 className="text-2xl font-bold mb-2">Welcome{user?.user_metadata.name ? `, ${user.user_metadata.name}` : ''}</h2>
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
