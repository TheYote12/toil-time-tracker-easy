
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function DepartmentSetup({ onComplete }: { onComplete: () => void }) {
  const [departments, setDepartments] = useState<string[]>(['']);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const addDepartment = () => {
    setDepartments([...departments, '']);
  };

  const removeDepartment = (index: number) => {
    setDepartments(departments.filter((_, i) => i !== index));
  };

  const updateDepartment = (index: number, value: string) => {
    const newDepartments = [...departments];
    newDepartments[index] = value;
    setDepartments(newDepartments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validDepartments = departments.filter(d => d.trim());
    
    if (validDepartments.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one department",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    
    try {
      console.log("Saving departments:", validDepartments);
      const { error } = await supabase.from('departments')
        .insert(validDepartments.map(name => ({ name })));

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Departments have been created successfully"
      });
      
      // Wait briefly to ensure the database has updated before proceeding
      setTimeout(() => {
        onComplete();
      }, 1000); // Increased timeout for better database sync
    } catch (error) {
      console.error('Error creating departments:', error);
      toast({
        title: "Error",
        description: "Failed to create departments",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {departments.map((dept, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={dept}
              onChange={(e) => updateDepartment(index, e.target.value)}
              placeholder="Department name"
              required
            />
            {departments.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeDepartment(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={addDepartment}>
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Departments"}
        </Button>
      </div>
    </form>
  );
}
