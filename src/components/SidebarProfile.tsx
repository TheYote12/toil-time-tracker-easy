
import { useAuth } from "@/contexts/auth";
import { User as UserIcon, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function SidebarProfile() {
  const { user, isManager, signOut, refreshUserRole } = useAuth();
  const [balance, setBalance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateBalance = async () => {
    if (!user) return;

    setIsLoadingBalance(true);
    setError(null);
    
    try {
      console.log('Calculating balance for user:', user.id);
      
      // Use the RPC function to get already approved submissions
      const { data, error } = await supabase
        .rpc('get_toil_balance', { user_id_param: user.id });

      if (error) {
        console.error('Error calculating TOIL balance:', error);
        setError(error.message);
        return;
      }

      console.log('Calculated TOIL balance from RPC:', data);
      setBalance(data || 0);
      setError(null);
    } catch (error: any) {
      console.error('Error calculating TOIL balance:', error);
      setError(error.message);
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
    } catch (error: any) {
      console.error('Error refreshing profile:', error);
      setError(error.message);
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
        <Avatar className="h-10 w-10 bg-purple-100">
          <AvatarFallback className="text-purple-500">{user.user_metadata.name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <div className="font-semibold text-gray-800">{user.user_metadata.name || user.email}</div>
          <div className="text-xs text-gray-500 capitalize">{isManager ? 'Manager' : 'Employee'}</div>
          {error ? (
            <div className="text-xs text-red-500">Error loading TOIL</div>
          ) : isLoadingBalance ? (
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
