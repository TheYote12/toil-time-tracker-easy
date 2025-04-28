
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
      // Use our existing RPC function to get profiles data safely
      const { data, error } = await supabase
        .rpc('get_all_profiles') as { data: User[] | null; error: Error | null };

      if (error) {
        throw error;
      }
      
      // Filter the profiles to only include those where the manager_id is the current user's ID
      if (data) {
        const members = data.filter(profile => profile.manager_id === user.id);
        setTeamMembers(members);
      } else {
        setTeamMembers([]);
      }
    } catch (error: any) {
      console.error("Error in fetchTeamMembers:", error);
      setError(error.message);
      toast({
        title: "Error fetching team members",
        description: error.message,
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
