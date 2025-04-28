import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { OrganizationSettings } from "@/components/SetupWizard/OrganizationSettings";
import { DepartmentSetup } from "@/components/SetupWizard/DepartmentSetup";
import { Progress } from "@/components/ui/progress";

type SetupStep = 'organization' | 'departments' | 'complete';

export default function SetupWizard() {
  const [currentStep, setCurrentStep] = useState<SetupStep>('organization');
  const [progress, setProgress] = useState(33); // Start with first step
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authorized for setup
    if (user && !isManager && !isAdmin) {
      navigate('/dashboard');
      return;
    }

    // Fetch current setup step
    async function fetchSetupStatus() {
      setLoading(true);
      try {
        // First check if there's an organization settings record at all
        const { data: orgData, error: orgError } = await supabase
          .from('organization_settings')
          .select('*');
        
        // If no organization settings exist yet, create the initial record
        if (!orgData || orgData.length === 0) {
          await supabase.from('organization_settings').insert({
            name: 'Scene3D',
            setup_step: 'organization',
            setup_completed: false,
            max_toil_hours: 35,
            toil_expiry_days: 90,
            requires_manager_approval: true
          });
          setCurrentStep('organization');
          setProgress(33);
        } else if (orgData[0]?.setup_step) {
          // Otherwise use the existing step
          const step = orgData[0].setup_step as SetupStep;
          setCurrentStep(step);
          updateProgress(step);
          
          // If setup is already complete, redirect to dashboard
          if (step === 'complete' || orgData[0].setup_completed) {
            navigate('/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching setup status:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSetupStatus();
  }, [isManager, isAdmin, user, navigate]);

  const updateProgress = (step: SetupStep) => {
    const steps: Record<SetupStep, number> = {
      'organization': 33,
      'departments': 66,
      'complete': 100
    };
    setProgress(steps[step]);
  };

  const handleStepComplete = async (nextStep: SetupStep) => {
    try {
      await supabase
        .from('organization_settings')
        .update({ 
          setup_step: nextStep,
          ...(nextStep === 'complete' ? { setup_completed: true } : {})
        })
        .eq('name', 'Scene3D');

      setCurrentStep(nextStep);
      updateProgress(nextStep);

      if (nextStep === 'complete') {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error updating setup step:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-4 text-center">
          <h2 className="text-xl font-medium">Loading setup wizard...</h2>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-purple-600 h-2.5 rounded-full animate-pulse" style={{width: '100%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to TOIL Manager</h1>
          <p className="text-gray-500">Let's get your organization set up</p>
        </div>

        <Progress value={progress} className="w-full" />

        <div className="bg-white shadow-lg rounded-lg p-6">
          {currentStep === 'organization' && (
            <OrganizationSettings onComplete={() => handleStepComplete('departments')} />
          )}
          
          {currentStep === 'departments' && (
            <DepartmentSetup onComplete={() => handleStepComplete('complete')} />
          )}
        </div>
      </div>
    </div>
  );
}
