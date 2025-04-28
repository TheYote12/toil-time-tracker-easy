
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
      // Use RPC function to get profiles data with proper typing
      const { data, error } = await supabase
        .rpc('get_all_profiles') as { data: User[] | null; error: Error | null };

      if (error) {
        throw error;
      }
      
      if (data) {
        setUsers(data);
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
