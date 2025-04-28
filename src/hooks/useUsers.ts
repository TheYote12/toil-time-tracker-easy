
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
  const { toast } = useToast();

  async function fetchUsers() {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order('name');

      if (error) {
        throw error;
      }
      
      if (profiles) {
        const userProfiles: User[] = profiles.map(profile => ({
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
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, fetchUsers };
}
