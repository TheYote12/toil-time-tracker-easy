
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function BackupRestore() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('backup_data');
      
      if (error) throw error;
      
      // Create and download the backup file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scene3d_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Backup created successfully"
      });
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: "Error",
        description: "Failed to create backup",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const backup_data = JSON.parse(text);
      
      const { error } = await supabase.rpc('restore_data', { backup_data });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Data restored successfully"
      });
      
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error restoring data:', error);
      toast({
        title: "Error",
        description: "Failed to restore data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button
          onClick={handleBackup}
          disabled={isLoading}
          className="w-[200px]"
        >
          <Download className="w-4 h-4 mr-2" />
          Backup Data
        </Button>
        
        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={handleRestore}
            disabled={isLoading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button
            variant="outline"
            className="w-[200px]"
            disabled={isLoading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Restore from Backup
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-gray-500">
        Note: Restoring data will replace all existing data except for manager accounts.
        Make sure to create a backup before restoring.
      </p>
    </div>
  );
}
