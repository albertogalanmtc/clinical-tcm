import { useUser } from '../contexts/UserContext';
import { planService } from '../services/planService';

export function PlanBadge() {
  const { planType } = useUser();

  if (!planType) return null;

  // Get plan configuration from planService
  const plan = planService.getPlanByCode(planType);
  if (!plan) return null;

  // Color configurations by plan code
  const colorConfig = {
    free: {
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
    },
    pro: {
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-300',
    },
    clinic: {
      bgColor: 'bg-teal-100',
      textColor: 'text-teal-700',
      borderColor: 'border-teal-300',
    },
  };

  const config = colorConfig[planType];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {plan.badgeIconSvg && (
        <div
          className="w-3.5 h-3.5"
          dangerouslySetInnerHTML={{ __html: plan.badgeIconSvg }}
        />
      )}
      <span className="text-xs font-semibold uppercase tracking-wide">{plan.name}</span>
    </div>
  );
}