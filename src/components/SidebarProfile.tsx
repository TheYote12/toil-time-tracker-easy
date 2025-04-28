import { useAuth } from "@/contexts/auth";
import { User as UserIcon, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function SidebarProfile() {
  const { user, isManager, signOut, refreshUserRole } = useAuth();
  const [balance, setBalance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const calculateBalance = async () => {
    if (!user) return;

    setIsLoadingBalance(true);
    try {
      // Get approved submissions for the user using RPC function to avoid RLS issues
      const { data, error } = await supabase
        .from('toil_submissions')
        .select('type, amount')
        .eq('user_id', user.id)
        .eq('status', 'Approved');

      if (error) {
        console.error('Error fetching TOIL submissions:', error);
        toast({
          title: "Error loading TOIL data",
          description: "Please try refreshing",
          variant: "destructive",
        });
        return;
      }

      // Calculate balance
      let calculatedBalance = 0;
      for (const submission of data || []) {
        if (submission.type === 'earn') {
          calculatedBalance += submission.amount;
        } else if (submission.type === 'use') {
          calculatedBalance -= submission.amount;
        }
      }

      setBalance(calculatedBalance);
    } catch (error) {
      console.error('Error calculating TOIL balance:', error);
      toast({
        title: "Error calculating balance",
        description: "Please try refreshing",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBalance(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      calculateBalance();
    }
  }, [user]);

  // Helper function to format minutes to hours and minutes
  function minToHM(minutes: number): string {
    if (minutes < 0) return "0:00";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  }
  
  const handleRefresh = async () => {
    if (!user || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshUserRole();
      await calculateBalance();
      toast({
        title: "Profile refreshed",
        description: isManager ? "Manager role confirmed" : "Employee role confirmed",
      });
    } catch (error) {
      console.error('Error refreshing profile:', error);
      toast({
        title: "Error refreshing profile",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col px-2 py-3 rounded bg-gray-100 mb-1 min-h-[56px]">
      <div className="flex items-center gap-3">
        <UserIcon className="w-8 h-8 text-purple-500" aria-hidden="true" />
        <div className="flex-grow">
          <div className="font-semibold text-gray-800">{user.user_metadata.name || user.email}</div>
          <div className="text-xs text-gray-500 capitalize">{isManager ? 'Manager' : 'Employee'}</div>
          {isLoadingBalance ? (
            <div className="text-xs text-purple-600 font-mono">Loading...</div>
          ) : (
            <div className="text-xs text-purple-600 font-mono">TOIL: {minToHM(balance)}</div>
          )}
        </div>
        <button
          onClick={handleRefresh}
          className="text-gray-500 hover:text-purple-600 p-1 rounded-full hover:bg-purple-50"
          aria-label="Refresh profile"
          disabled={isRefreshing}
          title="Refresh profile data"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>
      <button 
        onClick={signOut} 
        className="mt-2 text-xs text-gray-600 hover:text-purple-600 self-end"
      >
        Sign Out
      </button>
    </div>
  );
}
