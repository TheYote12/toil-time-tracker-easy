
import { useAuth } from "@/contexts/AuthContext";
import { User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function SidebarProfile() {
  const { user, isManager, signOut } = useAuth();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    async function calculateBalance() {
      if (!user) return;

      try {
        // Get approved submissions for the user
        const { data: submissions, error } = await supabase
          .from('toil_submissions')
          .select('type, amount')
          .eq('user_id', user.id)
          .eq('status', 'Approved');

        if (error) {
          console.error('Error fetching TOIL submissions:', error);
          return;
        }

        // Calculate balance
        let calculatedBalance = 0;
        for (const submission of submissions || []) {
          if (submission.type === 'earn') {
            calculatedBalance += submission.amount;
          } else if (submission.type === 'use') {
            calculatedBalance -= submission.amount;
          }
        }

        setBalance(calculatedBalance);
      } catch (error) {
        console.error('Error calculating TOIL balance:', error);
      }
    }

    calculateBalance();
  }, [user]);

  // Helper function to format minutes to hours and minutes
  function minToHM(minutes: number): string {
    if (minutes < 0) return "0:00";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  }

  if (!user) return null;

  return (
    <div className="flex flex-col px-2 py-3 rounded bg-gray-100 mb-1 min-h-[56px]">
      <div className="flex items-center gap-3">
        <UserIcon className="w-8 h-8 text-purple-500" aria-hidden="true" />
        <div>
          <div className="font-semibold text-gray-800">{user.user_metadata.name || user.email}</div>
          <div className="text-xs text-gray-500 capitalize">{isManager ? 'Manager' : 'Employee'}</div>
          <div className="text-xs text-purple-600 font-mono">TOIL: {minToHM(balance)}</div>
        </div>
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
