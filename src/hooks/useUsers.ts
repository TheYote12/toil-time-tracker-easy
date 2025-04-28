
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface User {
  id: string;
  name: string;
  role: string;
  department_id: string | null;
  manager_id: string | null;
  created_at?: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function fetchUsers() {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use RPC function to get profiles data instead of direct query
      // This avoids the infinite recursion in RLS policies
      const { data, error } = await supabase
        .rpc('get_all_profiles');

      if (error) {
        throw error;
      }
      
      if (data) {
        const userProfiles: User[] = data.map((profile: any) => ({
          id: profile.id,
          name: profile.name,
          role: profile.role,
          department_id: profile.department_id,
          manager_id: profile.manager_id,
          created_at: profile.created_at
        }));
        
        setUsers(userProfiles);
      }
    } catch (error: any) {
      console.error("Error in fetchUsers:", error);
      setError(error.message);
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, fetchUsers, isLoading, error };
}
