
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function NotificationSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!user) return;
    
    // Set up real-time listener for TOIL submission updates
    const channel = supabase
      .channel('toil-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'toil_submissions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const { new: newData } = payload;
          
          if (newData.status === 'Approved') {
            toast({
              title: "TOIL Request Approved",
              description: `Your request for ${newData.type === 'earn' ? 'extra hours' : 'TOIL use'} has been approved.`,
              duration: 5000,
            });
          } else if (newData.status === 'Rejected') {
            toast({
              title: "TOIL Request Rejected",
              description: `Your request for ${newData.type === 'earn' ? 'extra hours' : 'TOIL use'} has been rejected.`,
              variant: "destructive",
              duration: 5000,
            });
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);
  
  return null; // This component doesn't render anything
}
