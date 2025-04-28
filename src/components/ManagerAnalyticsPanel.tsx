
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Users } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { minToHM } from "@/pages/RequestTOIL";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ManagerAnalyticsPanel() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamSubmissions, setTeamSubmissions] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTeamData() {
      if (!user) return;

      try {
        // Fetch team members
        const { data: members, error: membersError } = await supabase
          .from('profiles')
          .select('*')
          .eq('manager_id', user.id);

        if (membersError) {
          console.error("Error fetching team members:", membersError);
        } else {
          setTeamMembers(members || []);

          if (members?.length) {
            const teamIds = members.map(m => m.id);

            // Fetch team submissions
            const { data: teamSubs, error: teamSubsError } = await supabase
              .from('toil_submissions')
              .select('*')
              .in('user_id', teamIds);

            if (teamSubsError) {
              console.error("Error fetching team submissions:", teamSubsError);
            } else {
              setTeamSubmissions(teamSubs || []);
            }
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    }

    fetchTeamData();
  }, [user]);

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
