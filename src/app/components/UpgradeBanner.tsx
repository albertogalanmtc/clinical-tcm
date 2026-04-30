import { ArrowUpCircle, Lock } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface UpgradeBannerProps {
  feature: string;
  description: string;
  requiredPlan: 'pro' | 'clinic';
}

/**
 * UpgradeBanner - Shows upgrade message when a feature is locked
 * Used in places where we want to show locked features to encourage upgrades
 */
export function UpgradeBanner({ feature, description, requiredPlan }: UpgradeBannerProps) {
  const { planType } = useUser();

  const planNames = {
    pro: 'Pro Plan',
    clinic: 'Clinic Plan'
  };

  const planColors = {
    pro: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      badge: 'bg-blue-600'
    },
    clinic: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      badge: 'bg-purple-600'
    }
  };

  const colors = planColors[requiredPlan];

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className={`${colors.badge} rounded-full p-2`}>
            <Lock className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-sm font-semibold ${colors.text}`}>
              {feature}
            </h3>
            <span className={`chip-compact ${colors.badge} text-white text-xs px-2 py-0.5 rounded-full font-medium`}>
              {planNames[requiredPlan]}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            {description}
          </p>
          <button
            className={`inline-flex items-center gap-2 px-4 py-2 ${colors.badge} text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            Upgrade to {planNames[requiredPlan]}
          </button>
        </div>
      </div>
      
      {/* Current plan indicator */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Current plan: <span className="font-medium text-gray-700">{planType?.toUpperCase() || 'FREE'}</span>
        </p>
      </div>
    </div>
  );
}
