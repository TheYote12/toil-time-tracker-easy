
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Users } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { minToHM } from "@/pages/RequestTOIL";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ManagerAnalyticsPanel() {
  const { user } = useAuth();
  const { teamMembers, isLoading: isLoadingMembers, error: membersError } = useTeamMembers();
  const [teamSubmissions, setTeamSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeamSubmissions() {
      if (!user || !teamMembers.length) return;

      try {
        setIsLoadingSubmissions(true);
        const teamIds = teamMembers.map(m => m.id);

        // Fetch team submissions
        const { data: teamSubs, error: teamSubsError } = await supabase
          .from('toil_submissions')
          .select('*')
          .in('user_id', teamIds);

        if (teamSubsError) {
          console.error("Error fetching team submissions:", teamSubsError);
          setSubmissionsError(teamSubsError.message);
        } else {
          setTeamSubmissions(teamSubs || []);
          setSubmissionsError(null);
        }
      } catch (error: any) {
        console.error("Unexpected error:", error);
        setSubmissionsError(error.message);
      } finally {
        setIsLoadingSubmissions(false);
      }
    }

    fetchTeamSubmissions();
  }, [user, teamMembers]);

  // Requests by status for pie chart
  const statusPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of teamSubmissions) {
      counts[s.status] = (counts[s.status] || 0) + 1;
    }
    return Object.entries(counts).map(([status, value]) => ({ name: status, value }));
  }, [teamSubmissions]);

  // Bar: Earn vs Used per team member
  const barData = useMemo(() => {
    return teamMembers.map(member => {
      const memberSubs = teamSubmissions.filter(s => s.user_id === member.id && s.status === 'Approved');
      const earned = memberSubs.filter(s => s.type === 'earn').reduce((sum, s) => sum + s.amount, 0);
      const used = memberSubs.filter(s => s.type === 'use').reduce((sum, s) => sum + s.amount, 0);
      return {
        name: member.name,
        Earned: earned,
        Used: used,
      };
    });
  }, [teamMembers, teamSubmissions]);

  const pieColors = ["#a5b4fc", "#f472b6", "#34d399", "#facc15", "#f87171", "#818cf8", "#c084fc"];
  
  const isLoading = isLoadingMembers || isLoadingSubmissions;
  const error = membersError || submissionsError;

  if (error) {
    return (
      <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded mb-4">
        <h3 className="font-medium">Error loading analytics</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-100 border border-gray-200 p-4 rounded mb-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Team TOIL Status</CardTitle>
          <CardDescription>Overview of team TOIL requests by status.</CardDescription>
        </CardHeader>
        <CardContent>
          {statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  isAnimationActive={false}
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-4">No team submissions yet.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Earned vs Used TOIL</CardTitle>
          <CardDescription>Comparison of earned vs used TOIL per team member.</CardDescription>
        </CardHeader>
        <CardContent>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Earned" fill="#82ca9d" />
                <Bar dataKey="Used" fill="#c62a6b" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-4">No team members or submissions yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
