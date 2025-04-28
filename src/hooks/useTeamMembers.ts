
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { User } from "./useUsers";

export function useTeamMembers() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTeamMembers = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching team members for user:', user.id);
      
      // The get_all_profiles RPC function should use security definer internally
      // to avoid recursion issues with RLS policies
      const { data, error } = await supabase
        .rpc('get_all_profiles') as { data: User[] | null; error: Error | null };

      if (error) {
        console.error('Error in get_all_profiles RPC:', error);
        throw error;
      }
      
      if (data) {
        console.log('Received profiles:', data);
        // Filter profiles to only include those where the current user is the manager
        const members = data.filter(profile => profile.manager_id === user.id);
        console.log('Filtered team members:', members);
        setTeamMembers(members);
      } else {
        console.log('No profiles data received');
        setTeamMembers([]);
      }
    } catch (error: any) {
      console.error("Error in fetchTeamMembers:", error);
      setError(error.message);
      toast({
        title: "Error fetching team members",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchTeamMembers();
    }
  }, [user, fetchTeamMembers]);

  return { teamMembers, fetchTeamMembers, isLoading, error };
}
