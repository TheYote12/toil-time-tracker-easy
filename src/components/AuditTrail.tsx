
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { Clock, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuditEntry = {
  id: string;
  submission_id: string;
  user_id: string;
  action: string;
  old_status: string;
  new_status: string;
  timestamp: string;
  user_name: string;
};

export function AuditTrail({ submissionId }: { submissionId?: string }) {
  const { user, isManager } = useAuth();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // In a real implementation, we would fetch from an audit_logs table
    // This is a mock implementation for demonstration purposes
    async function fetchAuditTrail() {
      setLoading(true);
      
      try {
        // Simulating an audit trail based on TOIL submissions
        const query = supabase
          .from('toil_submissions')
          .select('*, profiles:user_id(name)')
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (submissionId) {
          query.eq('id', submissionId);
        }
        
        if (filter === "approved") {
          query.eq('status', 'Approved');
        } else if (filter === "rejected") {
          query.eq('status', 'Rejected');
        } else if (filter === "pending") {
          query.eq('status', 'Pending');
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching audit trail:", error);
          return;
        }
        
        // Transform submissions into audit entries
        const auditEntries: AuditEntry[] = data?.map(submission => ({
          id: `${submission.id}-${submission.status}`,
          submission_id: submission.id,
          user_id: submission.user_id,
          action: submission.status === 'Pending' 
            ? 'Submission Created' 
            : `Request ${submission.status}`,
          old_status: 'Pending',
          new_status: submission.status,
          timestamp: submission.created_at,
          user_name: submission.profiles?.name || 'Unknown User'
        })) || [];
        
        setEntries(auditEntries.filter(entry => 
          entry.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.action.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      } catch (error) {
        console.error("Error in audit trail:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (isManager || submissionId) {
      fetchAuditTrail();
    }
  }, [user, isManager, submissionId, filter, searchTerm]);

  if ((!isManager && !submissionId) || (entries.length === 0 && !loading)) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded">
        <p className="text-gray-500">No audit trail information available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Audit Trail</h3>
        
        <div className="flex gap-2">
          <div className="relative">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-[200px] pl-8"
            />
            <Filter className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          
          <Select
            value={filter}
            onValueChange={setFilter}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-sm text-left">
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Status Change</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {format(parseISO(entry.timestamp), 'MMM d, yyyy HH:mm')}
                    </div>
                  </td>
                  <td className="px-4 py-3">{entry.user_name}</td>
                  <td className="px-4 py-3">{entry.action}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100">
                        {entry.old_status}
                      </span>
                      <span>→</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        entry.new_status === 'Approved' 
                          ? 'bg-green-100 text-green-800' 
                          : entry.new_status === 'Rejected' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entry.new_status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
