
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
        .select("*");

      if (error) {
        throw error;
      }
      
      if (profiles) {
        console.log("All profiles:", profiles);
        
        // Check if Alex exists and is admin, if not update him
        const alexUser = profiles.find(profile => 
          profile.name === "Alex Eason" || 
          profile.name.toLowerCase().includes("alex")
        );
        
        if (alexUser && alexUser.role !== "admin") {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ role: "admin" })
            .eq("id", alexUser.id);
            
          if (updateError) {
            console.error("Error updating Alex's role:", updateError);
            toast({
              title: "Error updating Alex's role",
              description: updateError.message,
              variant: "destructive",
            });
          } else {
            console.log("Updated Alex Eason to admin role successfully");
            toast({
              title: "Admin Role Updated",
              description: "Updated Alex Eason to admin role",
            });
          }
        }
        
        // Refresh profile data after potential update
        const { data: updatedProfiles, error: refreshError } = await supabase
          .from("profiles")
          .select("*");
          
        if (refreshError) {
          throw refreshError;
        }
        
        const userProfiles: User[] = (updatedProfiles || profiles).map(profile => ({
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
