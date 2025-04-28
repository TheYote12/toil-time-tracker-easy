
import { useAuth } from "@/contexts/auth";
import { NotificationSystem } from "@/components/NotificationSystem";
import { TOILPolicyGuide } from "@/components/TOILPolicyGuide";
import { ManagerAnalyticsPanel } from "@/components/ManagerAnalyticsPanel";
import { UserManagement } from "@/components/UserManagement";
import { TOILBalance } from "@/components/dashboard/TOILBalance";
import { TOILChart } from "@/components/dashboard/TOILChart";
import { ActionButtons } from "@/components/dashboard/ActionButtons";
import { NoTeamMembers } from "@/components/dashboard/NoTeamMembers";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { ErrorState } from "@/components/dashboard/ErrorState";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { useDashboardData } from "@/hooks/useDashboardData";
import { format } from "date-fns";
import { useTeamMembers } from "@/hooks/useTeamMembers";

const Dashboard = () => {
  const { user, isManager } = useAuth();
  const { teamMembers, isLoading: isLoadingTeam } = useTeamMembers();
  const {
    balance,
    recentSubmissions,
    isLoading,
    isRefreshing,
    error,
    handleRefresh
  } = useDashboardData();

  const chartLineData = recentSubmissions.map(s => ({
    name: format(new Date(s.date), "MMM d"),
    TOIL: s.amount,
  }));

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <NotificationSystem />
      <TOILPolicyGuide />
      
      {error && <ErrorState error={error} onRetry={handleRefresh} />}
      
      <div className="mb-8">
        <WelcomeHeader 
          userName={user?.user_metadata.name} 
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
        
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

      {isManager && teamMembers.length === 0 && !isLoadingTeam && (
        <NoTeamMembers />
      )}
    </div>
  );
}

export default Dashboard;
