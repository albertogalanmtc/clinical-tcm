import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Leaf,
  GraduationCap,
  Stethoscope,
  BookOpen,
  Zap,
  FileEdit,
  Microscope,
  FlaskConical,
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-react';
import { getPlatformSettings } from '@/app/data/platformSettings';

type UserProfile = 'student' | 'classical_practitioner' | 'integrative_clinician';
type PrimaryGoal = 'study' | 'quick_reference' | 'prescriptions' | 'research';
type ReferralSource =
  | 'instagram'
  | 'google'
  | 'colleague'
  | 'youtube'
  | 'event'
  | 'other'
  | 'prefer_not_say';

interface SurveyData {
  userProfile: UserProfile | null;
  primaryGoal: PrimaryGoal | null;
  referralSource: ReferralSource | null;
  referralOther: string;
}

const TOTAL_STEPS = 3;

const PROFILE_OPTIONS: Array<{
  value: UserProfile;
  icon: typeof GraduationCap;
  title: string;
  description: string;
}> = [
  {
    value: 'student',
    icon: GraduationCap,
    title: 'Student',
    description:
      "I'm learning Traditional Chinese Medicine and want to build a strong foundation",
  },
  {
    value: 'classical_practitioner',
    icon: Stethoscope,
    title: 'Classical Practitioner',
    description:
      'I practice TCM with a traditional approach — classical patterns, master formulas and herb synergies',
  },
  {
    value: 'integrative_clinician',
    icon: FlaskConical,
    title: 'Integrative Clinician',
    description:
      'I practice with a scientific-integrative approach — pharmacological effects, bioactive compounds and evidence-based mechanisms alongside TCM',
  },
];

const GOAL_OPTIONS: Array<{
  value: PrimaryGoal;
  icon: typeof BookOpen;
  title: string;
  description: string;
}> = [
  {
    value: 'study',
    icon: BookOpen,
    title: 'Study',
    description: 'Learn TCM fundamentals through herbs, formulas and clinical uses',
  },
  {
    value: 'quick_reference',
    icon: Zap,
    title: 'Quick reference',
    description: 'Look things up fast during consultations',
  },
  {
    value: 'prescriptions',
    icon: FileEdit,
    title: 'Build prescriptions',
    description:
      'Create prescriptions with checks for interactions, contraindications and cautions',
  },
  {
    value: 'research',
    icon: Microscope,
    title: 'Clinical depth',
    description:
      'Go deeper into pharmacology, mechanisms and advanced formulation criteria',
  },
];

const REFERRAL_OPTIONS: Array<{ value: ReferralSource; label: string }> = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'google', label: 'Google / search' },
  { value: 'colleague', label: 'Colleague recommendation' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'event', label: 'Conference or event' },
  { value: 'other', label: 'Other' },
];

export default function OnboardingSurvey() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [branding, setBranding] = useState(() => getPlatformSettings().branding);

  // Restore previous answers if the user is coming back from /select-membership
  const [data, setData] = useState<SurveyData>(() => {
    try {
      const raw = localStorage.getItem('onboardingSurvey');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          userProfile: parsed.userProfile ?? null,
          primaryGoal: parsed.primaryGoal ?? null,
          referralSource: parsed.referralSource ?? null,
          referralOther: parsed.referralOther ?? '',
        };
      }
    } catch {
      // ignore
    }
    return {
      userProfile: null,
      primaryGoal: null,
      referralSource: null,
      referralOther: '',
    };
  });

  const [currentStep, setCurrentStep] = useState(() => {
    const stepParam = parseInt(searchParams.get('step') || '', 10);
    if (stepParam >= 1 && stepParam <= TOTAL_STEPS) return stepParam;
    return 1;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setBranding(getPlatformSettings().branding);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('platformSettingsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('platformSettingsUpdated', handleStorageChange);
    };
  }, []);

  const canContinue = (() => {
    if (currentStep === 1) return data.userProfile !== null;
    if (currentStep === 2) return data.primaryGoal !== null;
    if (currentStep === 3) return data.referralSource !== null;
    return false;
  })();

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleContinue = () => {
    if (!canContinue) return;
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      // Temporary: save to localStorage only (no Supabase yet)
      localStorage.setItem('onboardingSurvey', JSON.stringify(data));
      navigate('/select-membership');
    }
  };

  const handleSkipReferral = () => {
    setData((prev) => ({ ...prev, referralSource: 'prefer_not_say' }));
    localStorage.setItem(
      'onboardingSurvey',
      JSON.stringify({ ...data, referralSource: 'prefer_not_say' }),
    );
    navigate('/select-membership');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-teal-600 rounded-2xl flex items-center justify-center">
                  <Leaf className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentStep === 1 && 'What best describes you?'}
            {currentStep === 2 && 'What will you use the app for?'}
            {currentStep === 3 && 'How did you hear about us?'}
          </h1>
          <p className="text-sm text-gray-600">
            {currentStep === 1 && 'This helps us tailor your experience'}
            {currentStep === 2 && 'You can change this later'}
            {currentStep === 3 && 'It helps us reach more practitioners'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          {/* Step 1: Profile */}
          {currentStep === 1 && (
            <div className="space-y-3">
              {PROFILE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = data.userProfile === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setData({ ...data, userProfile: opt.value })}
                    className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                      selected
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        selected ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{opt.title}</div>
                      <div className="text-sm text-gray-600 mt-0.5">{opt.description}</div>
                    </div>
                    {selected && (
                      <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2: Goal */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOAL_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = data.primaryGoal === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setData({ ...data, primaryGoal: opt.value })}
                    className={`text-left flex flex-col items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                      selected
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selected ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{opt.title}</div>
                      <div className="text-sm text-gray-600 mt-0.5">{opt.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 3: Referral */}
          {currentStep === 3 && (
            <div className="space-y-2">
              {REFERRAL_OPTIONS.map((opt) => {
                const selected = data.referralSource === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setData({ ...data, referralSource: opt.value })}
                    className={`w-full text-left flex items-center gap-3 p-3.5 rounded-lg border-2 transition-all ${
                      selected
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        selected ? 'border-teal-600 bg-teal-600' : 'border-gray-300'
                      }`}
                    >
                      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-gray-900">{opt.label}</span>
                  </button>
                );
              })}

              {data.referralSource === 'other' && (
                <input
                  type="text"
                  value={data.referralOther}
                  onChange={(e) => setData({ ...data, referralOther: e.target.value })}
                  placeholder="Tell us more..."
                  className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              )}

              <button
                type="button"
                onClick={handleSkipReferral}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 pt-2"
              >
                Prefer not to say
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 text-gray-600 hover:text-gray-900 disabled:opacity-0 disabled:cursor-default transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              className="flex items-center gap-1.5 bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
            >
              <span>{currentStep === TOTAL_STEPS ? 'Finish' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
            const step = i + 1;
            const active = step === currentStep;
            const done = step < currentStep;
            return (
              <div
                key={step}
                className={`h-2 rounded-full transition-all ${
                  active ? 'w-8 bg-teal-600' : done ? 'w-2 bg-teal-600' : 'w-2 bg-gray-300'
                }`}
              />
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Step {currentStep} of {TOTAL_STEPS}
        </p>
      </div>
    </div>
  );
}
