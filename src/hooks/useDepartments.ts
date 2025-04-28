
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Department {
  id: string;
  name: string;
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const { toast } = useToast();

  async function fetchDepartments() {
    try {
      const { data: departments, error } = await supabase
        .from("departments")
        .select("*");

      if (error) {
        console.error("Error fetching departments:", error);
        toast({
          title: "Error fetching departments",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setDepartments(departments || []);
      }
    } catch (error: any) {
      console.error("Error in fetchDepartments:", error);
      toast({
        title: "Error fetching departments",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    fetchDepartments();
  }, []);

  return { departments, fetchDepartments };
}
