import { useState, useEffect } from 'react';
import { planService, type Plan } from '../services/planService';

/**
 * Hook to access plans configuration from Supabase/localStorage
 */
export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();

    // Listen for plan updates
    const handlePlansUpdated = () => {
      loadPlans();
    };

    window.addEventListener('plansUpdated', handlePlansUpdated);

    return () => {
      window.removeEventListener('plansUpdated', handlePlansUpdated);
    };
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    const loadedPlans = await planService.getPlans();
    setPlans(loadedPlans);
    setLoading(false);
  };

  const savePlans = async (updatedPlans: Plan[]) => {
    const success = await planService.savePlans(updatedPlans);
    if (success) {
      setPlans(updatedPlans);
    }
    return success;
  };

  const getPlanByCode = (code: 'free' | 'practitioner' | 'advanced') => {
    return plans.find(p => p.code === code);
  };

  return {
    plans,
    loading,
    savePlans,
    getPlanByCode,
    reloadPlans: loadPlans,
  };
}
