
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ChartLine, ChartBar, ChartPie } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
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
};

type Profile = {
  id: string;
  name: string;
};

const pieColors = ["#a5b4fc", "#f472b6", "#34d399", "#facc15", "#f87171", "#818cf8", "#c084fc"];

const Dashboard = () => {
  const { user, isManager } = useAuth();
  const [balance, setBalance] = useState(0);
  const [recentSubmissions, setRecentSubmissions] = useState<ToilSubmission[]>([]);
  const [teamSubmissions, setTeamSubmissions] = useState<ToilSubmission[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
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

        // If manager, fetch team data
        if (isManager) {
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
                .in('user_id', teamIds)
                .order('date', { ascending: false });
                
              if (teamSubsError) {
                console.error("Error fetching team submissions:", teamSubsError);
              } else {
                setTeamSubmissions(teamSubs || []);
              }
            }
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

  // Create data for charts
  const chartLineData = useMemo(() => {
    return recentSubmissions.map(s => ({
      name: format(new Date(s.date), "MMM d"),
      TOIL: s.amount,
    }));
  }, [recentSubmissions]);

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
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Welcome{user?.user_metadata.name ? `, ${user.user_metadata.name}` : ''}</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-purple-100 border border-purple-200 text-purple-700 rounded-lg px-5 py-4 flex-1 flex items-center justify-between">
            <span className="font-semibold text-lg">Current TOIL Balance</span>
            <span className="text-3xl font-mono font-bold">{minToHM(balance)}</span>
          </div>
        </div>

        {/* TOIL trend chart for all users */}
        <div className="mb-4 bg-white p-3 rounded border">
          <div className="flex items-center gap-2 mb-1">
            <ChartLine className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">TOIL Earned (most recent)</span>
          </div>
          <div>
            {chartLineData.length >= 2 ? (
              <svg width={240} height={50}>
                {/* Simple trend line */}
                <polyline
                  fill="none"
                  stroke="#9b87f5"
                  strokeWidth="2"
                  points={chartLineData.map((d, i) => `${20 + i * 40},${45 - d.TOIL * 0.05}`).join(" ")}
                />
                {chartLineData.map((d, i) => (
                  <circle key={i} cx={20 + i * 40} cy={45 - d.TOIL * 0.05} r="3" fill="#9b87f5" />
                ))}
              </svg>
            ) : (
              <span className="text-xs text-gray-500">Not enough data yet. Log extra hours to track your trend!</span>
            )}
          </div>
        </div>

        <div className="flex gap-3 mb-2">
          <Link to="/log-extra-hours" className="bg-violet-600 hover:bg-violet-700 text-white rounded px-4 py-2 font-medium shadow">Log Extra Hours</Link>
          <Link to="/request-toil" className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 font-medium shadow">Request TOIL</Link>
          <Link to="/toil-history" className="bg-gray-200 hover:bg-gray-300 text-gray-900 rounded px-4 py-2 font-medium">View History</Link>
        </div>
      </div>

      {isManager && teamMembers.length > 0 && (
        <div className="mb-8 space-y-4">
          {/* Team Status Pie */}
          <div className="bg-white rounded border p-4">
            <div className="flex items-center mb-1 gap-2">
              <ChartPie className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium">Requests by Status</span>
            </div>
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="95%" height={200}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label
                  >
                    {statusPieData.map((entry, idx) => (
                      <Cell key={entry.name} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-gray-500">No team requests yet.</span>
            )}
          </div>

          {/* Team Earned/Used Bar */}
          <div className="bg-white rounded border p-4">
            <div className="flex items-center mb-1 gap-2">
              <ChartBar className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">TOIL Earned / Used by Team Member</span>
            </div>
            {barData.length > 0 ? (
              <ResponsiveContainer width="99%" height={260}>
                <BarChart data={barData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => minToHM(value as number)} />
                  <Legend />
                  <Bar dataKey="Earned" stackId="a" fill="#a78bfa" />
                  <Bar dataKey="Used" stackId="a" fill="#fbbf24" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-gray-500">No activity for direct reports.</span>
            )}
          </div>
        </div>
      )}

      {isManager && teamMembers.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
          <h3 className="font-semibold text-yellow-800 mb-2">No Team Members Assigned</h3>
          <p className="text-yellow-700 text-sm">
            You're set up as a manager, but you don't have any team members assigned to you yet.
            Ask your admin to assign team members to your account.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
