import { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { planService } from '../services/planService';

export function PlanBadge() {
  const { planType } = useUser();
  const [planName, setPlanName] = useState<string>('');
  const [badgeIconSvg, setBadgeIconSvg] = useState<string | undefined>();

  const normalizedPlanType =
    planType === 'pro' ? 'practitioner' : planType === 'clinic' ? 'advanced' : planType || 'free';

  useEffect(() => {
    let cancelled = false;

    const loadPlan = async () => {
      const plan = await planService.getPlanByCode(normalizedPlanType as 'free' | 'practitioner' | 'advanced');
      if (!cancelled) {
        setPlanName(plan?.name || normalizedPlanType.charAt(0).toUpperCase() + normalizedPlanType.slice(1));
        setBadgeIconSvg(plan?.badgeIconSvg);
      }
    };

    loadPlan();

    return () => {
      cancelled = true;
    };
  }, [normalizedPlanType]);

  // Color configurations by plan code
  const colorConfig = {
    free: {
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
    },
    practitioner: {
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-300',
    },
    advanced: {
      bgColor: 'bg-teal-100',
      textColor: 'text-teal-700',
      borderColor: 'border-teal-300',
    },
  };

  const config = colorConfig[normalizedPlanType as keyof typeof colorConfig] || colorConfig.free;

  if (!planType) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {badgeIconSvg && (
        <div
          className="w-3.5 h-3.5"
          dangerouslySetInnerHTML={{ __html: badgeIconSvg }}
        />
      )}
      <span className="text-xs font-semibold uppercase tracking-wide">{planName || normalizedPlanType}</span>
    </div>
  );
}
