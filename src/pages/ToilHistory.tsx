
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Search } from "lucide-react";
import { minToHM } from "./RequestTOIL";
import { format } from "date-fns";

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
  created_at: string;
};

type Profile = {
  id: string;
  name: string;
};

const ToilHistory = () => {
  const { user, isManager } = useAuth();
  const [query, setQuery] = useState("");
  const [submissions, setSubmissions] = useState<ToilSubmission[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  
  useEffect(() => {
    async function fetchSubmissions() {
      if (!user) return;
      
      try {
        let query = supabase
          .from('toil_submissions')
          .select('*');
          
        if (!isManager) {
          // If not manager, only fetch own submissions
          query = query.eq('user_id', user.id);
        }
        
        const { data, error } = await query.order('date', { ascending: false });
        
        if (error) {
          console.error("Error fetching TOIL submissions:", error);
        } else {
          setSubmissions(data as ToilSubmission[]);
          
          // If manager, fetch all profiles for display names
          if (isManager && data?.length) {
            const userIds = [...new Set(data.map(s => s.user_id))];
            fetchUserProfiles(userIds);
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    }
    
    async function fetchUserProfiles(userIds: string[]) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);
          
        if (error) {
          console.error("Error fetching user profiles:", error);
        } else {
          const profileMap = (data as Profile[]).reduce((acc, profile) => {
            acc[profile.id] = profile.name;
            return acc;
          }, {} as Record<string, string>);
          
          setProfiles(profileMap);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    }
    
    fetchSubmissions();
  }, [user, isManager]);
  
  // Filter submissions based on search query
  const filtered = submissions.filter(s => 
    s.project?.toLowerCase().includes(query.toLowerCase()) || 
    s.date?.includes(query)
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-3">TOIL History</h2>
      <div className="flex items-center mb-2 gap-2">
        <Search className="w-5 h-5" aria-hidden="true" />
        <input
          type="search"
          className="border px-2 py-1 rounded w-64"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by project or date"
          aria-label="Search history"
        />
      </div>
      <div className="bg-white p-4 rounded shadow">
        {filtered.length === 0 ? (
          <div className="text-gray-600">No submissions found.</div>
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
                      {isManager && (
                        <span className="text-xs text-gray-400 ml-2">({profiles[s.user_id] || "Unknown"})</span>
                      )}
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
                  <div className={`text-sm ${
                    s.status === 'Approved' ? 'text-green-600' :
                    s.status === 'Rejected' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {s.status}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ToilHistory;
