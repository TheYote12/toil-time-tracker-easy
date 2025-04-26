
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
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { user, isManager } = useAuth();

  useEffect(() => {
    // Check if user is a manager
    if (!isManager) {
      navigate('/dashboard');
    }

    // Fetch current setup step
    async function fetchSetupStatus() {
      const { data } = await supabase
        .from('organization_settings')
        .select('setup_step')
        .single();
      
      if (data?.setup_step) {
        setCurrentStep(data.setup_step as SetupStep);
        updateProgress(data.setup_step as SetupStep);
      }
    }

    fetchSetupStatus();
  }, [isManager, navigate]);

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
