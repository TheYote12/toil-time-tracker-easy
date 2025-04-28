
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, AlertTriangle } from "lucide-react";
import { minToHM } from "./RequestTOIL";
import { format } from "date-fns";
import { AuditTrail } from "@/components/AuditTrail";
import { useToast } from "@/hooks/use-toast";

type ToilSubmission = {
  id: string;
  user_id: string;
  type: 'earn' | 'use';
  date: string;
  project: string | null;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  manager_note: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  name: string;
};

const Approvals = () => {
  const { user, isManager } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<ToilSubmission[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [managerNote, setManagerNote] = useState("");
  const [action, setAction] = useState<"Approved" | "Rejected" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamBalances, setTeamBalances] = useState<Record<string, number>>({});
  
  useEffect(() => {
    async function fetchPendingApprovals() {
      if (!user || !isManager) return;
      
      try {
        // Fetch team members
        const { data: teamMembers, error: teamError } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('manager_id', user.id);
          
        if (teamError) {
          console.error("Error fetching team members:", teamError);
          return;
        }
        
        if (!teamMembers?.length) return;
        
        // Create a map of user IDs to names
        const profileMap = teamMembers.reduce((acc, profile) => {
          acc[profile.id] = profile.name;
          return acc;
        }, {} as Record<string, string>);
        
        setProfiles(profileMap);
        
        // Get pending submissions from team members
        const teamIds = teamMembers.map(m => m.id);
        
        const { data: pendingSubmissions, error: pendingError } = await supabase
          .from('toil_submissions')
          .select('*')
          .in('user_id', teamIds)
          .eq('status', 'Pending')
          .order('date', { ascending: false });
          
        if (pendingError) {
          console.error("Error fetching pending submissions:", pendingError);
          return;
        }
        
        setPending(pendingSubmissions as ToilSubmission[]);
        
        // Calculate current balances for the team
        const { data: allSubmissions, error: allSubsError } = await supabase
          .from('toil_submissions')
          .select('*')
          .in('user_id', teamIds)
          .eq('status', 'Approved');
          
        if (allSubsError) {
          console.error("Error fetching all submissions:", allSubsError);
          return;
        }
        
        const balances: Record<string, number> = {};
        
        teamIds.forEach(id => {
          balances[id] = 0;
        });
        
        allSubmissions?.forEach(sub => {
          if (sub.type === 'earn') {
            balances[sub.user_id] += sub.amount;
          } else {
            balances[sub.user_id] -= sub.amount;
          }
        });
        
        setTeamBalances(balances);
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    }
    
    fetchPendingApprovals();
  }, [user, isManager]);
  
  // Filter submissions based on search query
  const filtered = pending.filter(s => 
    (s.project?.toLowerCase().includes(query.toLowerCase()) || 
    s.date?.includes(query))
  );

  const open = !!selected;
  const current = pending.find(s => s.id === selected);
  
  async function handleAction(act: "Approved" | "Rejected") {
    if (!window.confirm(`Are you sure you want to ${act.toLowerCase()} this request?`)) return;
    
    if (!user || !current) return;
    
    setIsSubmitting(true);
    setAction(act);
    
    try {
      const { error } = await supabase
        .from('toil_submissions')
        .update({
          status: act,
          manager_note: managerNote || null
        })
        .eq('id', current.id);
        
      if (error) {
        console.error(`Error ${act.toLowerCase()}ing submission:`, error);
        toast({
          title: "Update Failed",
          description: `Could not ${act.toLowerCase()} the request. Please try again.`,
          variant: "destructive"
        });
      } else {
        // Update the local state
        setPending(prev => prev.filter(p => p.id !== current.id));
        
        // Show success toast
        toast({
          title: `Request ${act}`,
          description: `The TOIL request has been ${act.toLowerCase()}.`,
          duration: 3000,
        });
        
        setTimeout(() => {
          setSelected(null);
          setManagerNote("");
          setAction(null);
        }, 1500);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  function handleDialogClose() {
    if (!isSubmitting) {
      setSelected(null);
      setManagerNote("");
      setAction(null);
    }
  }
  
  function getCurrentUserBalance(userId: string) {
    // Get current balance
    const balance = teamBalances[userId] || 0;
    
    // Calculate projected balance if this request is approved
    let projectedBalance = balance;
    if (current) {
      if (current.type === 'earn') {
        projectedBalance += current.amount;
      } else {
        projectedBalance -= current.amount;
      }
    }
    
    return { balance, projectedBalance };
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-3">Pending Approvals</h2>
      {!isManager ? (
        <div className="text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
          Only managers can view and review pending TOIL requests for their team.
        </div>
      ) : (
        <>
          <div className="flex items-center mb-2 gap-2">
            <Search className="w-5 h-5" aria-hidden="true" />
            <input
              type="search"
              className="border px-2 py-1 rounded w-64"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by project or date"
              aria-label="Search approvals"
            />
          </div>
          <div className="bg-white p-4 rounded shadow">
            {filtered.length === 0 ? (
              <div className="text-gray-600">No pending submissions right now!</div>
            ) : (
              <ul>
                {filtered.map(s => {
                  // Format date for display
                  const displayDate = s.date ? format(new Date(s.date), "PP") : s.date;
                  
                  return (
                    <li key={s.id} className="border-b last:border-0 py-3 flex items-center gap-4">
                      <div className="flex-1">
                        <div className="font-semibold">
                          {s.type === "earn" ? "Extra Hours" : "TOIL Request"}
                          <span className="text-xs text-gray-400 ml-1">({profiles[s.user_id] || "Unknown"})</span>
                        </div>
                        <div className="text-gray-700 text-sm">{displayDate} {s.project && `· ${s.project}`}</div>
                        <div className="text-gray-500 text-xs mt-1">
                          {s.type === "earn" && s.start_time && s.end_time ? (
                            <>
                              {s.start_time} to {s.end_time} &rarr; <b className="font-mono">{minToHM(s.amount)}</b> possible TOIL
                            </>
                          ) : (
                            <>Request: <b className="font-mono">{minToHM(s.amount)}</b></>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{s.notes}</div>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setSelected(s.id)}
                      >
                        Review
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </>
      )}
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Review Submission</DialogTitle></DialogHeader>
          {current && (
            <div className="space-y-4">
              <div className="mb-2">
                <div>
                  <span className="font-bold">{current.type === "earn" ? "Extra Hours" : "TOIL Request"}</span>
                  {" "}on <span>{format(new Date(current.date), "PP")}</span> {current.project && `· ${current.project}`}
                </div>
                <div className="text-gray-700 text-sm mt-1">
                  Amount: <span className="font-mono">{minToHM(current.amount)}</span>
                </div>
                {current.notes && <div className="text-xs text-gray-600 mt-1">Notes: {current.notes}</div>}
              </div>
              
              {/* Display current and projected balance */}
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-sm font-medium mb-1">Balance Information</div>
                {current && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600">
                      Current balance for {profiles[current.user_id]}:{" "}
                      <span className="font-mono font-semibold">{minToHM(getCurrentUserBalance(current.user_id).balance)}</span>
                    </div>
                    <div className="text-xs">
                      Projected balance after {current.type === "earn" ? "adding" : "using"} hours:{" "}
                      <span className="font-mono font-semibold">{minToHM(getCurrentUserBalance(current.user_id).projectedBalance)}</span>
                      
                      {/* Warning if using hours would result in negative balance */}
                      {current.type === "use" && getCurrentUserBalance(current.user_id).projectedBalance < 0 && (
                        <div className="flex items-center gap-1 text-amber-600 mt-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>This request would result in a negative TOIL balance.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium" htmlFor="manager-note">Manager Note (optional)</label>
                <textarea 
                  id="manager-note" 
                  className="border px-3 py-2 rounded w-full" 
                  rows={2} 
                  value={managerNote} 
                  onChange={e => setManagerNote(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Audit trail for this specific submission */}
              <div className="pt-3 border-t">
                <AuditTrail submissionId={current.id} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              className="bg-gray-300" 
              variant="outline" 
              onClick={handleDialogClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleAction("Approved")}
              disabled={isSubmitting}
            >
              {isSubmitting && action === "Approved" ? "Approving..." : "Approve"}
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleAction("Rejected")}
              disabled={isSubmitting}
            >
              {isSubmitting && action === "Rejected" ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
          {action && !isSubmitting && (
            <div className="mt-2 text-center text-lg font-semibold text-green-800">
              {action === "Approved" ? "Approved!" : "Rejected!"}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Approvals;
