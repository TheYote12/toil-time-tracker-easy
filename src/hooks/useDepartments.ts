
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Department {
  id: string;
  name: string;
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function fetchDepartments() {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order('name');

      if (error) {
        throw error;
      }

      if (data) {
        const deptList: Department[] = data.map(dept => ({
          id: dept.id,
          name: dept.name
        }));
        
        setDepartments(deptList);
      }
    } catch (error: any) {
      console.error("Error in fetchDepartments:", error);
      setError(error.message);
      toast({
        title: "Error fetching departments",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDepartments();
  }, []);

  return { departments, fetchDepartments, isLoading, error };
}
