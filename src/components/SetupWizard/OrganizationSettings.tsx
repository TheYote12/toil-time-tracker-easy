
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function OrganizationSettings({ onComplete }: { onComplete: () => void }) {
  const [settings, setSettings] = useState({
    max_toil_hours: 35,
    toil_expiry_days: 90,
    requires_manager_approval: true
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('organization_settings')
          .select('max_toil_hours, toil_expiry_days, requires_manager_approval')
          .eq('name', 'Scene3D')
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setSettings({
            max_toil_hours: data.max_toil_hours || 35,
            toil_expiry_days: data.toil_expiry_days || 90,
            requires_manager_approval: data.requires_manager_approval !== false // default to true
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: "Error",
          description: "Failed to load organization settings",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('organization_settings')
        .update(settings)
        .eq('name', 'Scene3D');

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Organization settings updated successfully"
      });
      
      onComplete();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update organization settings",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="py-4 text-center">Loading settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="max_toil_hours">Maximum TOIL Hours</Label>
          <Input
            id="max_toil_hours"
            type="number"
            value={settings.max_toil_hours}
            onChange={(e) => setSettings(s => ({ ...s, max_toil_hours: parseInt(e.target.value) }))}
            min="1"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="toil_expiry_days">TOIL Expiry (Days)</Label>
          <Input
            id="toil_expiry_days"
            type="number"
            value={settings.toil_expiry_days}
            onChange={(e) => setSettings(s => ({ ...s, toil_expiry_days: parseInt(e.target.value) }))}
            min="1"
            required
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Switch
            id="requires_approval"
            checked={settings.requires_manager_approval}
            onCheckedChange={(checked) => setSettings(s => ({ ...s, requires_manager_approval: checked }))}
          />
          <Label htmlFor="requires_approval">Require Manager Approval</Label>
        </div>
      </div>
      
      <Button type="submit">Save Settings</Button>
    </form>
  );
}
