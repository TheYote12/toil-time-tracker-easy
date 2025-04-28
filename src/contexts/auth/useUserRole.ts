
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "./types";

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      console.log('Fetching user role for:', userId);
      
      const { data, error } = await supabase
        .rpc('get_user_role', { user_id: userId });

      if (error) {
        console.error('Error fetching user role:', error);
        throw error;
      }

      if (data) {
        console.log('Received role data:', data);
        const role = data as UserRole;
        setUserRole(role);
        setIsManager(role === 'manager' || role === 'admin');
        setIsAdmin(role === 'admin');
      } else {
        console.log('No role data found');
        setUserRole(null);
        setIsManager(false);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      toast({
        title: "Error fetching user role",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    userRole,
    isManager,
    isAdmin,
    fetchUserRole,
    setUserRole,
    setIsManager,
    setIsAdmin,
  };
}
