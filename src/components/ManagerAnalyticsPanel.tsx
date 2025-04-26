
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts";
import { AlertTriangle, TrendingUp, Clock, Users } from "lucide-react";
import { minToHM } from "@/pages/RequestTOIL";
import { format, parseISO, subDays } from "date-fns";

type ToilSummary = {
  totalEarned: number;
  totalUsed: number;
  pendingApprovals: number;
  averageBalance: number;
  highestBalance: { name: string; amount: number };
  userCount: number;
};

type TimelineData = {
  date: string;
  earned: number;
  used: number;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a5b4fc', '#f472b6'];

export function ManagerAnalyticsPanel() {
  const { user, isManager } = useAuth();
  const [summary, setSummary] = useState<ToilSummary>({
    totalEarned: 0,
    totalUsed: 0,
    pendingApprovals: 0,
    averageBalance: 0,
    highestBalance: { name: "", amount: 0 },
    userCount: 0
  });
  const [teamBalances, setTeamBalances] = useState<{ name: string; balance: number }[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isManager) return;

    async function fetchAnalytics() {
      setLoading(true);
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

        if (!teamMembers?.length) {
          setLoading(false);
          return;
        }
        
        const teamIds = teamMembers.map(m => m.id);
        
        // Fetch all TOIL submissions for the team
        const { data: submissions, error: submissionsError } = await supabase
          .from('toil_submissions')
          .select('*')
          .in('user_id', teamIds);
          
        if (submissionsError) {
          console.error("Error fetching submissions:", submissionsError);
          return;
        }
        
        // Calculate balances by user
        const balancesByUser: Record<string, number> = {};
        let totalEarned = 0;
        let totalUsed = 0;
        let pendingCount = 0;
        
        teamMembers.forEach(member => {
          balancesByUser[member.id] = 0;
        });
        
        submissions?.forEach(sub => {
          if (sub.status === 'Approved') {
            if (sub.type === 'earn') {
              balancesByUser[sub.user_id] += sub.amount;
              totalEarned += sub.amount;
            } else {
              balancesByUser[sub.user_id] -= sub.amount;
              totalUsed += sub.amount;
            }
          } else if (sub.status === 'Pending') {
            pendingCount++;
          }
        });
        
        // Find highest balance and calculate average
        let highestBalance = { name: "", amount: 0 };
        let totalBalance = 0;
        
        const balances = teamMembers.map(member => {
          const balance = balancesByUser[member.id] || 0;
          totalBalance += balance;
          
          if (balance > highestBalance.amount) {
            highestBalance = { name: member.name, amount: balance };
          }
          
          return { name: member.name, balance };
        });
        
        // Calculate timeline data (last 30 days)
        const timelineMap: Record<string, { earned: number; used: number }> = {};
        const today = new Date();
        
        // Initialize timeline with zeros for the past 30 days
        for (let i = 30; i >= 0; i--) {
          const date = subDays(today, i);
          const dateStr = format(date, 'yyyy-MM-dd');
          timelineMap[dateStr] = { earned: 0, used: 0 };
        }
        
        // Add actual data
        submissions?.forEach(sub => {
          if (sub.status === 'Approved' && sub.date) {
            const dateStr = sub.date.substring(0, 10); // YYYY-MM-DD format
            if (timelineMap[dateStr]) {
              if (sub.type === 'earn') {
                timelineMap[dateStr].earned += sub.amount;
              } else {
                timelineMap[dateStr].used += sub.amount;
              }
            }
          }
        });
        
        // Convert timeline to array
        const timeline = Object.entries(timelineMap).map(([date, data]) => ({
          date,
          earned: data.earned,
          used: data.used
        }));
        
        setSummary({
          totalEarned,
          totalUsed,
          pendingApprovals: pendingCount,
          averageBalance: teamMembers.length ? totalBalance / teamMembers.length : 0,
          highestBalance,
          userCount: teamMembers.length
        });
        
        setTeamBalances(balances);
        setTimelineData(timeline);
      } catch (error) {
        console.error("Error in analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnalytics();
  }, [user, isManager]);

  const barConfig = useMemo(() => ({
    earned: {
      label: 'TOIL Earned',
      theme: {
        light: '#a5b4fc',
        dark: '#818cf8'
      }
    },
    used: {
      label: 'TOIL Used',
      theme: {
        light: '#f472b6',
        dark: '#ec4899'
      }
    }
  }), []);

  if (!isManager || loading) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Manager Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total TOIL Balance</CardTitle>
            <CardDescription>Team-wide</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{minToHM(summary.totalEarned - summary.totalUsed)}</div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <CardDescription>Requests awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{summary.pendingApprovals}</div>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Balance</CardTitle>
            <CardDescription>Per team member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{minToHM(summary.averageBalance)}</div>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Highest Balance</CardTitle>
            <CardDescription>{summary.highestBalance.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{minToHM(summary.highestBalance.amount)}</div>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Team TOIL Balances</CardTitle>
            <CardDescription>Individual balances across team members</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {teamBalances.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={teamBalances}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tickFormatter={(value) => minToHM(value)}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value) => minToHM(value as number)}
                    labelFormatter={(label) => `Employee: ${label}`}
                  />
                  <Bar dataKey="balance" fill="#8884d8">
                    {teamBalances.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.balance > 0 ? COLORS[index % COLORS.length] : '#ef4444'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No team data available
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>TOIL Activity (30 Days)</CardTitle>
            <CardDescription>Earned vs. Used hours trend</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {timelineData.length > 0 ? (
              <ChartContainer config={barConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timelineData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tickFormatter={(value) => format(parseISO(value), 'MMM d')}
                    />
                    <YAxis
                      tickFormatter={(value) => minToHM(value)}
                      width={80}
                    />
                    <Tooltip
                      formatter={(value) => minToHM(value as number)}
                      labelFormatter={(label) => format(parseISO(label as string), 'PPP')}
                    />
                    <Bar dataKey="earned" name="Earned" stackId="a" fill="var(--color-earned)" />
                    <Bar dataKey="used" name="Used" stackId="a" fill="var(--color-used)" />
                  </BarChart>
                </ResponsiveContainer>
                <ChartLegend>
                  <ChartLegendContent />
                </ChartLegend>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No activity data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
