import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { OrganizationSettings } from "@/components/SetupWizard/OrganizationSettings";
import { DepartmentSetup } from "@/components/SetupWizard/DepartmentSetup";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button"; // Added missing import

type SetupStep = 'organization' | 'departments' | 'complete';

export default function SetupWizard() {
  const [currentStep, setCurrentStep] = useState<SetupStep>('organization');
  const [progress, setProgress] = useState(33); // Start with first step
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();
  const [loading, setLoading] = useState(true);
  const [initialSetupDone, setInitialSetupDone] = useState(false);

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
        console.log("Fetching setup status...");
        // First check if there's an organization settings record at all
        const { data: orgData, error: orgError } = await supabase
          .from('organization_settings')
          .select('setup_step, setup_completed')
          .eq('name', 'Scene3D')
          .maybeSingle();
        
        if (orgError) {
          throw orgError;
        }
        
        // If no organization settings exist yet, create the initial record
        if (!orgData) {
          console.log("No organization settings found, creating initial record");
          const { error: insertError } = await supabase
            .from('organization_settings')
            .insert({
              name: 'Scene3D',
              setup_step: 'organization',
              setup_completed: false,
              max_toil_hours: 35,
              toil_expiry_days: 90,
              requires_manager_approval: true
            });
          
          if (insertError) throw insertError;
          
          setCurrentStep('organization');
          setProgress(33);
          setInitialSetupDone(true);
        } else if (orgData.setup_completed === true) {
          // If setup is already complete, redirect to dashboard
          console.log("Setup is already complete, redirecting to dashboard");
          navigate('/dashboard');
          return;
        } else if (orgData.setup_step) {
          // Otherwise use the existing step
          console.log("Found setup step:", orgData.setup_step);
          const step = orgData.setup_step as SetupStep;
          setCurrentStep(step);
          updateProgress(step);
          setInitialSetupDone(true);
        }
      } catch (error) {
        console.error('Error fetching setup status:', error);
        setIsError(true);
        setErrorMessage('Failed to fetch setup status. Please refresh the page and try again.');
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
      console.log("Updating setup step to:", nextStep);
      
      // For the final step, we'll update both setup_step and setup_completed
      const updateData = nextStep === 'complete' 
        ? { setup_step: nextStep, setup_completed: true }
        : { setup_step: nextStep };
        
      const { error } = await supabase
        .from('organization_settings')
        .update(updateData)
        .eq('name', 'Scene3D');

      if (error) throw error;

      setCurrentStep(nextStep);
      updateProgress(nextStep);

      if (nextStep === 'complete') {
        // Give the database a moment to update before redirecting
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
    } catch (error) {
      console.error('Error updating setup step:', error);
      setIsError(true);
      setErrorMessage('Failed to update setup step. Please try again.');
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

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!initialSetupDone) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-4 text-center">
          <h2 className="text-xl font-medium">Initializing setup...</h2>
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
