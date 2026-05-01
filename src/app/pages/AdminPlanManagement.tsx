import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Check,
  Plus,
  X,
  Info,
  Eye,
  Tag,
  RotateCcw,
  Edit2,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Palette,
  Trash2
} from 'lucide-react';
import { planService, Plan } from '../services/planService';
import { updatePlan as updateSupabasePlan } from '../services/plansService';
import type { PlanType, PlanFeatures, HerbDetailPermissions, FormulaDetailPermissions } from '../data/usersManager';

export default function AdminPlanManagement() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editingPlanDisplay, setEditingPlanDisplay] = useState<Plan | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basicInfo: true,
    stripeIntegration: false,
    launchOffer: false,
    libraryAccess: false,
    dashboardContent: false,
    herbDetailPermissions: false,
    formulaDetailPermissions: false,
    searchFiltering: false,
    prescriptionBuilder: false,
    usageLimits: false,
    safetyEngine: false,
    analytics: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Load plans from service on mount
  useEffect(() => {
    let cancelled = false;

    const loadPlans = async () => {
      const loadedPlans = await planService.getPlans();
      if (!cancelled) {
        setPlans(loadedPlans);
      }
    };

    loadPlans();

    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate average savings for yearly billing badge
  const avgYearlySavings = useMemo(() => {
    const paidPlans = plans.filter(p => p.monthlyPrice && p.yearlyPrice && p.code !== 'free');
    if (paidPlans.length === 0) return 0;
    const avgSavings = paidPlans.reduce((sum, p) => {
      const savings = ((p.monthlyPrice! * 12 - p.yearlyPrice!) / (p.monthlyPrice! * 12)) * 100;
      return sum + savings;
    }, 0) / paidPlans.length;
    return Math.round(avgSavings);
  }, [plans]);

  const handleEdit = (plan: Plan) => {
    // Ensure herbDetailPermissions has default structure if missing
    const defaultHerbPermissions = {
      properties: true,
      clinicalUse: {
        actions: true,
        indications: true,
        duiYao: true,
        clinicalApplications: true,
      },
      safety: {
        contraindications: true,
        cautions: true,
        drugInteractions: true,
        herbInteractions: true,
        allergens: true,
        antagonisms: true,
        incompatibilities: true,
      },
      research: {
        pharmacologicalEffects: true,
        biologicalMechanisms: true,
        bioactiveCompounds: true,
        clinicalStudies: true,
      },
      foundIn: true,
      referencesNotes: {
        references: true,
        notes: true,
      },
    };

    // Ensure formulaDetailPermissions has default structure if missing
    const defaultFormulaPermissions = {
      composition: true,
      clinicalUse: {
        tcmActions: true,
        clinicalManifestations: true,
        clinicalApplications: true,
      },
      modifications: true,
      safety: {
        contraindications: true,
        cautions: true,
        drugInteractions: true,
        herbInteractions: true,
        allergens: true,
        toxicology: true,
      },
      research: {
        pharmacologicalEffects: true,
        biologicalMechanisms: true,
        bioactiveCompounds: true,
        clinicalStudies: true,
      },
      referencesNotes: {
        references: true,
        notes: true,
      },
    };

    setEditingPlan({
      ...plan,
      herbDetailPermissions: plan.herbDetailPermissions || defaultHerbPermissions,
      formulaDetailPermissions: plan.formulaDetailPermissions || defaultFormulaPermissions
    });

    // Reset accordion sections when opening edit modal
    setOpenSections({
      basicInfo: true,
      stripeIntegration: false,
      launchOffer: false,
      libraryAccess: false,
      herbDetailPermissions: false,
      formulaDetailPermissions: false,
      searchFiltering: false,
      prescriptionBuilder: false,
      usageLimits: false,
      analytics: false,
    });
  };

  const handleSave = async () => {
    if (!editingPlan) return;

    // If marking this plan as popular, unmark all others
    const updatedPlans = plans.map(p => {
      if (p.id === editingPlan.id) {
        return {
          ...editingPlan,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      } else if (editingPlan.isPopular) {
        // Unmark other plans as popular
        return { ...p, isPopular: false };
      }
      return p;
    });

    // Save to localStorage via service (for backward compatibility)
    planService.savePlans(updatedPlans);
    setPlans(updatedPlans);

    // Convert Plan to PlanFeatures format for Supabase
    const planFeatures: PlanFeatures = {
      herbLibraryAccess: editingPlan.features.herbLibraryAccess as 'none' | 'sample' | 'full',
      formulaLibraryAccess: editingPlan.features.formulaLibraryAccess as 'none' | 'sample' | 'full',
      builder: editingPlan.features.builder,
      prescriptionLibrary: editingPlan.features.prescriptionLibrary,
      statistics: editingPlan.features.statistics,
      herbPropertyFilters: editingPlan.features.herbPropertyFilters,
      formulaPropertyFilters: editingPlan.features.formulaPropertyFilters,
      clinicalUseFilters: editingPlan.features.clinicalUseFilters,
      generalConditions: editingPlan.features.generalConditions,
      medications: editingPlan.features.medications,
      allergies: editingPlan.features.allergies,
      tcmRiskPatterns: editingPlan.features.tcmRiskPatterns,
      pharmacologicalEffectsFilter: editingPlan.features.pharmacologicalEffectsFilter,
      biologicalMechanismsFilter: editingPlan.features.biologicalMechanismsFilter,
      bioactiveCompoundsFilter: editingPlan.features.bioactiveCompoundsFilter || false,
      customContent: editingPlan.features.customContent,
      safetyEngineMode: editingPlan.safetyEngineMode,
      monthlyFormulas: editingPlan.limits.monthlyFormulas,
      // Detail permissions
      herbDetailPermissions: editingPlan.herbDetailPermissions || {
        properties: true,
        clinicalUse: { actions: true, indications: true, duiYao: true, clinicalApplications: true },
        safety: { contraindications: true, cautions: true, drugInteractions: true, herbInteractions: true, allergens: true, antagonisms: true, incompatibilities: true },
        research: { pharmacologicalEffects: true, biologicalMechanisms: true, bioactiveCompounds: true, clinicalStudies: true },
        foundIn: true,
        referencesNotes: { references: true, notes: true },
      },
      formulaDetailPermissions: editingPlan.formulaDetailPermissions || {
        composition: true,
        clinicalUse: { tcmActions: true, clinicalManifestations: true, clinicalApplications: true },
        modifications: true,
        safety: { contraindications: true, cautions: true, drugInteractions: true, herbInteractions: true, allergens: true, toxicology: true },
        research: { pharmacologicalEffects: true, biologicalMechanisms: true, bioactiveCompounds: true, clinicalStudies: true },
        referencesNotes: { references: true, notes: true },
      },
    };

    // Save to Supabase (centralized storage) - includes features AND prices
    const planType = editingPlan.code as PlanType;
    const success = await updateSupabasePlan(planType, {
      name: editingPlan.name,
      description: editingPlan.description,
      features: planFeatures,
      monthly_price: editingPlan.monthlyPrice ?? null,
      yearly_price: editingPlan.yearlyPrice ?? null,
      is_active: true,
      display_order: plans.findIndex(p => p.id === editingPlan.id) + 1,
    });

    if (success) {
      console.log(`✅ Plan ${planType} saved to Supabase successfully (features + prices)`);
    } else {
      console.error(`❌ Failed to save plan ${planType} to Supabase`);
    }

    setEditingPlan(null);
  };

  const handleResetToDefaults = async () => {
    if (confirm('Are you sure you want to reset all plans to default settings? This cannot be undone.')) {
      await planService.resetToDefaults();
      setPlans(await planService.getPlans());
    }
  };

  const handleCancel = () => {
    setEditingPlan(null);
  };

  const handleEditDisplay = (plan: Plan) => {
    // Initialize membershipDisplay if it doesn't exist
    setEditingPlanDisplay({
      ...plan,
      membershipDisplay: plan.membershipDisplay || {
        customFeatures: undefined
      }
    });
  };

  const handleCancelDisplay = () => {
    setEditingPlanDisplay(null);
  };

  const handleSaveDisplay = () => {
    if (!editingPlanDisplay) return;
    const updatedPlans = plans.map(p =>
      p.id === editingPlanDisplay.id ? editingPlanDisplay : p
    );
    planService.savePlans(updatedPlans);
    setPlans(updatedPlans);
    setEditingPlanDisplay(null);
  };

  const handleUpdateFeature = (feature: string, value: any) => {
    if (!editingPlan) return;
    
    // Handle nested features object
    if (feature in editingPlan.features) {
      setEditingPlan({
        ...editingPlan,
        features: {
          ...editingPlan.features,
          [feature]: value,
        },
      });
    } 
    // Handle limits object
    else if (feature === 'monthlyFormulas') {
      setEditingPlan({
        ...editingPlan,
        limits: {
          ...editingPlan.limits,
          monthlyFormulas: value,
        },
      });
    }
    // Handle herb detail permissions
    else if (feature.startsWith('herbDetailPermissions.')) {
      const path = feature.split('.');
      const section = path[1];
      const subsection = path[2];

      if (subsection) {
        // Update subsection (e.g., herbDetailPermissions.clinicalUse.actions)
        setEditingPlan({
          ...editingPlan,
          herbDetailPermissions: {
            ...editingPlan.herbDetailPermissions!,
            [section]: {
              ...(editingPlan.herbDetailPermissions as any)[section],
              [subsection]: value,
            },
          },
        });
      } else {
        // Update section (e.g., herbDetailPermissions.properties)
        setEditingPlan({
          ...editingPlan,
          herbDetailPermissions: {
            ...editingPlan.herbDetailPermissions!,
            [section]: value,
          },
        });
      }
    }
    // Handle formula detail permissions
    else if (feature.startsWith('formulaDetailPermissions.')) {
      const path = feature.split('.');
      const section = path[1];
      const subsection = path[2];

      if (subsection) {
        // Update subsection (e.g., formulaDetailPermissions.clinicalUse.tcmActions)
        setEditingPlan({
          ...editingPlan,
          formulaDetailPermissions: {
            ...editingPlan.formulaDetailPermissions!,
            [section]: {
              ...(editingPlan.formulaDetailPermissions as any)[section],
              [subsection]: value,
            },
          },
        });
      } else {
        // Update section (e.g., formulaDetailPermissions.composition)
        setEditingPlan({
          ...editingPlan,
          formulaDetailPermissions: {
            ...editingPlan.formulaDetailPermissions!,
            [section]: value,
          },
        });
      }
    }
    // Handle offer fields
    else if (feature.startsWith('offer.')) {
      const offerField = feature.split('.')[1];
      setEditingPlan({
        ...editingPlan,
        offer: {
          ...editingPlan.offer!,
          [offerField]: value,
        },
      });
    }
    // Handle top-level fields
    else {
      setEditingPlan({
        ...editingPlan,
        [feature]: value,
      });
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Plan Management</h1>
        <p className="hidden sm:block text-gray-600">Configure features, limits, and Stripe integration</p>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="mb-2">Configure pricing, Stripe integration, feature access, and usage limits for each plan.</p>
            <p className="text-xs text-blue-700">💡 Set both monthly and yearly prices to enable billing period toggle for users.</p>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">User View Preview</h2>
          </div>

          {/* Billing Period Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                Yearly
                {avgYearlySavings > 0 && (
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-semibold rounded">
                    Save {avgYearlySavings}%
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {plans.filter(p => p.status === 'active').map((plan) => {
            const isPopular = plan.isPopular;

            return (
              <div
                key={plan.id}
                className={`relative w-full md:w-80 bg-white rounded-2xl shadow-xl border-2 transition-all p-6 text-left ${
                  isPopular ? 'border-teal-600 shadow-teal-100' : 'border-gray-100'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-teal-600 to-teal-500 text-white text-xs font-semibold rounded-full shadow-lg">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Plan Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 mt-2">
                  {plan.name}
                </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.code === 'free' ? (
                      <div className="text-3xl font-bold text-gray-900">Free</div>
                    ) : billingPeriod === 'monthly' ? (
                      <div>
                        {plan.offer?.enabled ? (
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold text-gray-900">
                                ${plan.offer.discountedPrice}
                              </span>
                              <span className="text-lg text-gray-400 line-through">
                                ${plan.offer.originalPrice}
                              </span>
                              <span className="text-sm text-gray-600">/month</span>
                            </div>
                            {plan.offer.label && (
                              <div className="mt-1">
                                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                                  {plan.offer.label}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-900">
                              ${plan.monthlyPrice ?? '--'}
                            </span>
                            <span className="text-sm text-gray-600">/month</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        {plan.offer?.yearlyEnabled ? (
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold text-gray-900">
                                ${plan.offer.yearlyDiscountedPrice}
                              </span>
                              <span className="text-lg text-gray-400 line-through">
                                ${plan.offer.yearlyOriginalPrice}
                              </span>
                              <span className="text-sm text-gray-600">/year</span>
                            </div>
                            {(plan.offer.yearlyLabel || plan.offer.label) && (
                              <div className="mt-1">
                                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                                  {plan.offer.yearlyLabel || plan.offer.label}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold text-gray-900">
                                ${plan.yearlyPrice ?? '--'}
                              </span>
                              <span className="text-sm text-gray-600">/year</span>
                            </div>
                            {plan.monthlyPrice && plan.yearlyPrice && (
                              <div className="mt-1 text-sm text-teal-600 font-medium">
                                Save ${(plan.monthlyPrice * 12) - plan.yearlyPrice}/year
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features list - Matches SelectMembership exactly */}
                  <div className="mb-6">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Key Features
                    </div>
                    <ul className="space-y-2">
                      {/* Show custom features if defined, otherwise show default features */}
                      {plan.membershipDisplay?.customFeatures && plan.membershipDisplay.customFeatures.length > 0 ? (
                        // Custom Features
                        plan.membershipDisplay.customFeatures.map((feature, index) => (
                          feature.trim() && (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          )
                        ))
                      ) : (
                        // Default Features - Show ALL enabled features
                        <>
                          {/* Library Access */}
                          {plan.features.herbLibraryAccess !== 'none' && (
                            <li className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                              <span>
                                {plan.features.herbLibraryAccess === 'full' ? 'Full' : 'Sample'} Herb Library
                              </span>
                            </li>
                          )}
                          {plan.features.formulaLibraryAccess !== 'none' && (
                            <li className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                              <span>
                                {plan.features.formulaLibraryAccess === 'full' ? 'Full' : 'Sample'} Formula Library
                              </span>
                            </li>
                          )}

                          {/* Builder & Library */}
                          {plan.features.builder && (
                            <li className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                              <span>Prescription Builder</span>
                            </li>
                          )}
                          {plan.features.prescriptionLibrary && (
                            <li className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                              <span>Save & manage prescriptions</span>
                            </li>
                          )}

                          {/* Monthly Limit */}
                          <li className="flex items-start gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                            <span>
                              {plan.limits.monthlyFormulas === null
                                ? 'Unlimited'
                                : `Up to ${plan.limits.monthlyFormulas}`} prescriptions/month
                            </span>
                          </li>

                          {/* Property Filters */}
                          {plan.features.herbPropertyFilters && (
                            <li className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                              <span>Herb property filters</span>
                            </li>
                          )}
                          {plan.features.formulaPropertyFilters && (
                            <li className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                              <span>Formula property filters</span>
                            </li>
                          )}
                          {plan.features.clinicalUseFilters && (
                            <li className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                              <span>Clinical use filters</span>
                            </li>
                          )}

                          {/* Advanced Filters */}
                          {(plan.features.pharmacologicalEffectsFilter ||
                            plan.features.biologicalMechanismsFilter ||
                            plan.features.bioactiveCompoundsFilter) && (
                            <li className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                              <span>Advanced search filters</span>
                            </li>
                          )}

                          {/* Safety Profile */}
                          {(plan.features.generalConditions ||
                            plan.features.medications ||
                            plan.features.allergies ||
                            plan.features.tcmRiskPatterns) && (
                            <li className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                              <span>Safety profiles</span>
                            </li>
                          )}

                          {/* Analytics */}
                          {plan.features.statistics && (
                            <li className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                              <span>Usage analytics</span>
                            </li>
                          )}

                          {/* Custom Content */}
                          {plan.features.customContent && (
                            <li className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                              <span>Add custom herbs & formulas</span>
                            </li>
                          )}
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Edit Display Button */}
                  <button
                    onClick={() => handleEditDisplay(plan)}
                    className="w-full px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Palette className="w-4 h-4" />
                    Edit Display
                  </button>
              </div>
            );
          })}
        </div>

        {/* Hidden plans notice */}
        {plans.some(p => p.status === 'hidden') && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600">
              <span className="font-medium">Hidden plans:</span>{' '}
              {plans.filter(p => p.status === 'hidden').map(p => p.name).join(', ')} 
              {' '}(not shown to users)
            </p>
          </div>
        )}
      </div>

      {/* Plans Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h2>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1.5fr_2fr_1.5fr_1fr] gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-700 uppercase tracking-wider">
              <div>Plan</div>
              <div>Status</div>
              <div>Monthly Limit</div>
              <div>Adv. Filters</div>
              <div>Safety Engine</div>
              <div>Pricing</div>
              <div>Last Updated</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Plan Rows */}
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1.5fr_2fr_1.5fr_1fr] gap-4 px-6 py-4 border-b border-gray-200 items-center hover:bg-gray-50"
              >
              <div>
                <p className="font-medium text-gray-900">{plan.name}</p>
                <p className="text-xs text-gray-500">{plan.description}</p>
              </div>
              
              <div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  plan.status === 'active' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  {plan.status}
                </span>
              </div>

              <div className="text-sm text-gray-900">
                {plan.limits.monthlyFormulas === null ? 'Unlimited' : plan.limits.monthlyFormulas}
              </div>

              <div className="text-sm text-gray-900">
                {(plan.features.pharmacologicalEffectsFilter || plan.features.biologicalMechanismsFilter || plan.features.bioactiveCompoundsFilter) ? 'Yes' : 'No'}
              </div>

              <div className="text-sm text-gray-900 capitalize">
                {plan.safetyEngineMode}
              </div>

              <div className="text-xs text-gray-700">
                {plan.monthlyPrice !== undefined || plan.yearlyPrice !== undefined ? (
                  <>
                    {plan.monthlyPrice !== undefined && <div>${plan.monthlyPrice}/mo</div>}
                    {plan.yearlyPrice !== undefined && <div className="text-gray-500">${plan.yearlyPrice}/yr</div>}
                  </>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>

              <div className="text-xs text-gray-500">
                {plan.lastUpdated}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleEdit(plan)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingPlan && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100]" onClick={handleCancel}>
          <div className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white sm:rounded-lg max-w-3xl w-full max-h-[90vh] sm:max-h-[85vh] z-[110] rounded-t-2xl sm:rounded-b-lg shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0 rounded-t-2xl sm:rounded-t-lg">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Edit Plan: {editingPlan.name}</h2>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
              {/* Basic Info */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('basicInfo')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openSections.basicInfo ? 'rotate-180' : ''}`} />
                </button>
                {openSections.basicInfo && (
                <div className="px-4 pb-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      value={editingPlan.name}
                      onChange={(e) => handleUpdateFeature('name', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={editingPlan.status}
                      onChange={(e) => handleUpdateFeature('status', e.target.value)}
                      className="w-full bg-white px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="hidden">Hidden</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Use the "Display" button to configure description, pricing, badges, and features shown to users
                    </p>
                  </div>
                </div>
                )}
              </div>

              {/* Stripe Integration */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('stripeIntegration')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-600" />
                    <h3 className="text-base font-semibold text-gray-900">Stripe Integration & Pricing</h3>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openSections.stripeIntegration ? 'rotate-180' : ''}`} />
                </button>
                {openSections.stripeIntegration && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Monthly Billing */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Monthly Billing</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monthly Price ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={editingPlan.monthlyPrice ?? 0}
                          onChange={(e) => handleUpdateFeature('monthlyPrice', parseFloat(e.target.value) || 0)}
                          placeholder="9"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stripe Monthly Price ID
                        </label>
                        <input
                          type="text"
                          value={editingPlan.stripePriceIdMonthly || ''}
                          onChange={(e) => handleUpdateFeature('stripePriceIdMonthly', e.target.value)}
                          placeholder="price_monthly_xxx"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Yearly Billing */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Yearly Billing</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Yearly Price ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={editingPlan.yearlyPrice ?? 0}
                          onChange={(e) => handleUpdateFeature('yearlyPrice', parseFloat(e.target.value) || 0)}
                          placeholder="90"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stripe Yearly Price ID
                        </label>
                        <input
                          type="text"
                          value={editingPlan.stripePriceIdYearly || ''}
                          onChange={(e) => handleUpdateFeature('stripePriceIdYearly', e.target.value)}
                          placeholder="price_yearly_xxx"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    {editingPlan.monthlyPrice && editingPlan.yearlyPrice && (
                      <p className="text-xs text-teal-600 mt-2">
                        💡 Yearly saves ${(editingPlan.monthlyPrice * 12) - editingPlan.yearlyPrice}/year ({Math.round(((editingPlan.monthlyPrice * 12 - editingPlan.yearlyPrice) / (editingPlan.monthlyPrice * 12)) * 100)}% discount)
                      </p>
                    )}
                  </div>

                  {/* Deprecated field */}
                  <div className="pt-3 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stripe Price ID (Deprecated)
                    </label>
                    <input
                      type="text"
                      value={editingPlan.stripePriceId}
                      onChange={(e) => handleUpdateFeature('stripePriceId', e.target.value)}
                      placeholder="price_1234567890"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ⚠️ Legacy field. Use Monthly/Yearly Price IDs above instead.
                    </p>
                  </div>

                  <p className="text-xs text-gray-500 pt-3 border-t border-gray-200">
                    Get Stripe Price IDs from your Stripe Dashboard → Products → Pricing
                  </p>
                </div>
                )}
              </div>

              {/* Dashboard Content */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('dashboardContent')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-base font-semibold text-gray-900">Dashboard Content</h3>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openSections.dashboardContent ? 'rotate-180' : ''}`} />
                </button>
                {openSections.dashboardContent && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <p className="text-sm text-gray-700">News</p>
                    <button
                      onClick={() => handleUpdateFeature('dashboardNews', !editingPlan.features.dashboardNews)}
                      className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                        editingPlan.features.dashboardNews ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          editingPlan.features.dashboardNews ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <p className="text-sm text-gray-700">Community</p>
                    <button
                      onClick={() => handleUpdateFeature('dashboardCommunity', !editingPlan.features.dashboardCommunity)}
                      className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                        editingPlan.features.dashboardCommunity ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          editingPlan.features.dashboardCommunity ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                )}
              </div>

              {/* Library Access */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('libraryAccess')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-base font-semibold text-gray-900">Library Access</h3>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openSections.libraryAccess ? 'rotate-180' : ''}`} />
                </button>
                {openSections.libraryAccess && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Herb Library Access */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Herb Library Access
                    </label>
                    <select
                      value={editingPlan.features.herbLibraryAccess}
                      onChange={(e) => handleUpdateFeature('herbLibraryAccess', e.target.value as 'none' | 'sample' | 'full')}
                      className="w-full bg-white px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="none">None</option>
                      <option value="sample">Sample (limited dataset)</option>
                      <option value="full">Full</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Sample provides limited access, Full grants complete access
                    </p>
                  </div>

                  {/* Formula Library Access */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Formula Library Access
                    </label>
                    <select
                      value={editingPlan.features.formulaLibraryAccess}
                      onChange={(e) => handleUpdateFeature('formulaLibraryAccess', e.target.value as 'none' | 'sample' | 'full')}
                      className="w-full bg-white px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="none">None</option>
                      <option value="sample">Sample (limited dataset)</option>
                      <option value="full">Full</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Sample provides limited access, Full grants complete access
                    </p>
                  </div>

                  {/* Custom Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Custom Herbs & Formulas
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateFeature('customContent', !editingPlan.features.customContent)}
                        className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                          editingPlan.features.customContent ? 'bg-teal-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                            editingPlan.features.customContent ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-sm text-gray-700">
                        {editingPlan.features.customContent ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Allow users to create and save personal herbs and formulas
                    </p>
                  </div>
                </div>
                )}
              </div>

              {/* Herb Detail Permissions */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('herbDetailPermissions')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Herb Detail Permissions</h3>
                    
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ml-2 ${openSections.herbDetailPermissions ? 'rotate-180' : ''}`} />
                </button>
                {openSections.herbDetailPermissions && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Properties */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Properties</p>
                      
                    </div>
                    <button
                      onClick={() => handleUpdateFeature('herbDetailPermissions.properties', !editingPlan.herbDetailPermissions?.properties)}
                      className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                        editingPlan.herbDetailPermissions?.properties ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          editingPlan.herbDetailPermissions?.properties ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Clinical Use */}
                  <p className="text-sm font-semibold text-gray-900 mb-3">Clinical Use</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="space-y-3 ml-3">
                      <div className="flex items-center justify-between py-1">
                        <p className="text-sm text-gray-700">Actions</p>
                        <button
                          onClick={() => handleUpdateFeature('herbDetailPermissions.clinicalUse.actions', !editingPlan.herbDetailPermissions?.clinicalUse.actions)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.herbDetailPermissions?.clinicalUse.actions ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.herbDetailPermissions?.clinicalUse.actions ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <p className="text-sm text-gray-700">Indications</p>
                        <button
                          onClick={() => handleUpdateFeature('herbDetailPermissions.clinicalUse.indications', !editingPlan.herbDetailPermissions?.clinicalUse.indications)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.herbDetailPermissions?.clinicalUse.indications ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.herbDetailPermissions?.clinicalUse.indications ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <p className="text-sm text-gray-700">Dui Yao (Herb Pairs)</p>
                        <button
                          onClick={() => handleUpdateFeature('herbDetailPermissions.clinicalUse.duiYao', !editingPlan.herbDetailPermissions?.clinicalUse.duiYao)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.herbDetailPermissions?.clinicalUse.duiYao ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.herbDetailPermissions?.clinicalUse.duiYao ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <p className="text-sm text-gray-700">Clinical Applications</p>
                        <button
                          onClick={() => handleUpdateFeature('herbDetailPermissions.clinicalUse.clinicalApplications', !editingPlan.herbDetailPermissions?.clinicalUse.clinicalApplications)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.herbDetailPermissions?.clinicalUse.clinicalApplications ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.herbDetailPermissions?.clinicalUse.clinicalApplications ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Safety & Alerts */}
                  <p className="text-sm font-semibold text-gray-900 mb-3 mt-4">Safety & Alerts</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="space-y-3 ml-3">
                      <div className="flex items-center justify-between py-1">
                        <p className="text-sm text-gray-700">Contraindications</p>
                        <button
                          onClick={() => handleUpdateFeature('herbDetailPermissions.safety.contraindications', !editingPlan.herbDetailPermissions?.safety.contraindications)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.herbDetailPermissions?.safety.contraindications ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.herbDetailPermissions?.safety.contraindications ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <p className="text-sm text-gray-700">Cautions</p>
                        <button
                          onClick={() => handleUpdateFeature('herbDetailPermissions.safety.cautions', !editingPlan.herbDetailPermissions?.safety.cautions)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.herbDetailPermissions?.safety.cautions ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.herbDetailPermissions?.safety.cautions ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <p className="text-sm text-gray-700">Drug Interactions</p>
                        <button
                          onClick={() => handleUpdateFeature('herbDetailPermissions.safety.drugInteractions', !editingPlan.herbDetailPermissions?.safety.drugInteractions)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.herbDetailPermissions?.safety.drugInteractions ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.herbDetailPermissions?.safety.drugInteractions ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <p className="text-sm text-gray-700">Herb Interactions</p>
                        <button
                          onClick={() => handleUpdateFeature('herbDetailPermissions.safety.herbInteractions', !editingPlan.herbDetailPermissions?.safety.herbInteractions)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.herbDetailPermissions?.safety.herbInteractions ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.herbDetailPermissions?.safety.herbInteractions ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <p className="text-sm text-gray-700">Allergens</p>
                        <button
                          onClick={() => handleUpdateFeature('herbDetailPermissions.safety.allergens', !editingPlan.herbDetailPermissions?.safety.allergens)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.herbDetailPermissions?.safety.allergens ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.herbDetailPermissions?.safety.allergens ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <p className="text-sm text-gray-700">Antagonisms</p>
                        <button
                          onClick={() => handleUpdateFeature('herbDetailPermissions.safety.antagonisms', !editingPlan.herbDetailPermissions?.safety.antagonisms)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.herbDetailPermissions?.safety.antagonisms ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.herbDetailPermissions?.safety.antagonisms ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <p className="text-sm text-gray-700">Incompatibilities</p>
                        <button
                          onClick={() => handleUpdateFeature('herbDetailPermissions.safety.incompatibilities', !editingPlan.herbDetailPermissions?.safety.incompatibilities)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.herbDetailPermissions?.safety.incompatibilities ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.herbDetailPermissions?.safety.incompatibilities ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Research */}
                  <p className="text-sm font-semibold text-gray-900 mb-3 mt-4">Research</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="space-y-3 ml-3">
                      <div className="flex items-center justify-between py-1">
                        <p className="text-sm text-gray-700">Pharmacological Effects</p>
                        <button
                          onClick={() => handleUpdateFeature('herbDetailPermissions.research.pharmacologicalEffects', !editingPlan.herbDetailPermissions?.research.pharmacologicalEffects)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.herbDetailPermissions?.research.pharmacologicalEffects ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.herbDetailPermissions?.research.pharmacologicalEffects ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <p className="text-sm text-gray-700">Biological Mechanisms</p>
                        <button
                          onClick={() => handleUpdateFeature('herbDetailPermissions.research.biologicalMechanisms', !editingPlan.herbDetailPermissions?.research.biologicalMechanisms)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.herbDetailPermissions?.research.biologicalMechanisms ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.herbDetailPermissions?.research.biologicalMechanisms ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <p className="text-sm text-gray-700">Bioactive Compounds</p>
                        <button
                          onClick={() => handleUpdateFeature('herbDetailPermissions.research.bioactiveCompounds', !editingPlan.herbDetailPermissions?.research.bioactiveCompounds)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.herbDetailPermissions?.research.bioactiveCompounds ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.herbDetailPermissions?.research.bioactiveCompounds ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <p className="text-sm text-gray-700">Clinical Studies</p>
                        <button
                          onClick={() => handleUpdateFeature('herbDetailPermissions.research.clinicalStudies', !editingPlan.herbDetailPermissions?.research.clinicalStudies)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.herbDetailPermissions?.research.clinicalStudies ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.herbDetailPermissions?.research.clinicalStudies ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Found In */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Found In</p>
                      
                    </div>
                    <button
                      onClick={() => handleUpdateFeature('herbDetailPermissions.foundIn', !editingPlan.herbDetailPermissions?.foundIn)}
                      className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                        editingPlan.herbDetailPermissions?.foundIn ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          editingPlan.herbDetailPermissions?.foundIn ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* References & Notes */}
                  <p className="text-sm font-semibold text-gray-900 mb-3 mt-4">References & Notes</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="space-y-3 ml-3">
                      <div className="flex items-center justify-between py-1">
                        <p className="text-sm text-gray-700">References</p>
                        <button
                          onClick={() => {
                            const currentRefs = editingPlan.herbDetailPermissions?.referencesNotes;
                            const newValue = typeof currentRefs === 'object' 
                              ? { ...currentRefs, references: !currentRefs.references }
                              : { references: true, notes: false };
                            handleUpdateFeature('herbDetailPermissions.referencesNotes', newValue);
                          }}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            typeof editingPlan.herbDetailPermissions?.referencesNotes === 'object' && editingPlan.herbDetailPermissions.referencesNotes.references
                              ? 'bg-teal-600' 
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              typeof editingPlan.herbDetailPermissions?.referencesNotes === 'object' && editingPlan.herbDetailPermissions.referencesNotes.references
                                ? 'translate-x-6' 
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <p className="text-sm text-gray-700">Notes</p>
                        <button
                          onClick={() => {
                            const currentRefs = editingPlan.herbDetailPermissions?.referencesNotes;
                            const newValue = typeof currentRefs === 'object'
                              ? { ...currentRefs, notes: !currentRefs.notes }
                              : { references: false, notes: true };
                            handleUpdateFeature('herbDetailPermissions.referencesNotes', newValue);
                          }}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            typeof editingPlan.herbDetailPermissions?.referencesNotes === 'object' && editingPlan.herbDetailPermissions.referencesNotes.notes
                              ? 'bg-teal-600'
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              typeof editingPlan.herbDetailPermissions?.referencesNotes === 'object' && editingPlan.herbDetailPermissions.referencesNotes.notes
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </div>

              {/* Formula Detail Permissions */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('formulaDetailPermissions')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Formula Detail Permissions</h3>
                    
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ml-2 ${openSections.formulaDetailPermissions ? 'rotate-180' : ''}`} />
                </button>
                {openSections.formulaDetailPermissions && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Composition */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Composition</p>

                    </div>
                    <button
                      onClick={() => handleUpdateFeature('formulaDetailPermissions.composition', !editingPlan.formulaDetailPermissions?.composition)}
                      className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                        editingPlan.formulaDetailPermissions?.composition ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          editingPlan.formulaDetailPermissions?.composition ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Clinical Use */}
                  <p className="text-sm font-semibold text-gray-900 mb-3">Clinical Use</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3 ml-3">
                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-gray-700">TCM Actions</p>
                        <button
                          onClick={() => handleUpdateFeature('formulaDetailPermissions.clinicalUse.tcmActions', !editingPlan.formulaDetailPermissions?.clinicalUse.tcmActions)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.formulaDetailPermissions?.clinicalUse.tcmActions ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.formulaDetailPermissions?.clinicalUse.tcmActions ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-gray-700">Clinical Manifestations</p>
                        <button
                          onClick={() => handleUpdateFeature('formulaDetailPermissions.clinicalUse.clinicalManifestations', !editingPlan.formulaDetailPermissions?.clinicalUse.clinicalManifestations)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.formulaDetailPermissions?.clinicalUse.clinicalManifestations ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.formulaDetailPermissions?.clinicalUse.clinicalManifestations ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-gray-700">Clinical Applications</p>
                        <button
                          onClick={() => handleUpdateFeature('formulaDetailPermissions.clinicalUse.clinicalApplications', !editingPlan.formulaDetailPermissions?.clinicalUse.clinicalApplications)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.formulaDetailPermissions?.clinicalUse.clinicalApplications ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.formulaDetailPermissions?.clinicalUse.clinicalApplications ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Modifications */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Modifications</p>

                    </div>
                    <button
                      onClick={() => handleUpdateFeature('formulaDetailPermissions.modifications', !editingPlan.formulaDetailPermissions?.modifications)}
                      className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                        editingPlan.formulaDetailPermissions?.modifications ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          editingPlan.formulaDetailPermissions?.modifications ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Safety & Alerts */}
                  <p className="text-sm font-semibold text-gray-900 mb-3 mt-4">Safety & Alerts</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3 ml-3">
                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-gray-700">Contraindications</p>
                        <button
                          onClick={() => handleUpdateFeature('formulaDetailPermissions.safety.contraindications', !editingPlan.formulaDetailPermissions?.safety.contraindications)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.formulaDetailPermissions?.safety.contraindications ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.formulaDetailPermissions?.safety.contraindications ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-gray-700">Cautions</p>
                        <button
                          onClick={() => handleUpdateFeature('formulaDetailPermissions.safety.cautions', !editingPlan.formulaDetailPermissions?.safety.cautions)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.formulaDetailPermissions?.safety.cautions ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.formulaDetailPermissions?.safety.cautions ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-gray-700">Drug Interactions</p>
                        <button
                          onClick={() => handleUpdateFeature('formulaDetailPermissions.safety.drugInteractions', !editingPlan.formulaDetailPermissions?.safety.drugInteractions)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.formulaDetailPermissions?.safety.drugInteractions ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.formulaDetailPermissions?.safety.drugInteractions ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-gray-700">Herb Interactions</p>
                        <button
                          onClick={() => handleUpdateFeature('formulaDetailPermissions.safety.herbInteractions', !editingPlan.formulaDetailPermissions?.safety.herbInteractions)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.formulaDetailPermissions?.safety.herbInteractions ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.formulaDetailPermissions?.safety.herbInteractions ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-gray-700">Allergens</p>
                        <button
                          onClick={() => handleUpdateFeature('formulaDetailPermissions.safety.allergens', !editingPlan.formulaDetailPermissions?.safety.allergens)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.formulaDetailPermissions?.safety.allergens ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.formulaDetailPermissions?.safety.allergens ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-gray-700">Toxicology</p>
                        <button
                          onClick={() => handleUpdateFeature('formulaDetailPermissions.safety.toxicology', !editingPlan.formulaDetailPermissions?.safety.toxicology)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.formulaDetailPermissions?.safety.toxicology ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.formulaDetailPermissions?.safety.toxicology ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Research */}
                  <p className="text-sm font-semibold text-gray-900 mb-3 mt-4">Research</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3 ml-3">
                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-gray-700">Pharmacological Effects</p>
                        <button
                          onClick={() => handleUpdateFeature('formulaDetailPermissions.research.pharmacologicalEffects', !editingPlan.formulaDetailPermissions?.research.pharmacologicalEffects)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.formulaDetailPermissions?.research.pharmacologicalEffects ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.formulaDetailPermissions?.research.pharmacologicalEffects ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-gray-700">Biological Mechanisms</p>
                        <button
                          onClick={() => handleUpdateFeature('formulaDetailPermissions.research.biologicalMechanisms', !editingPlan.formulaDetailPermissions?.research.biologicalMechanisms)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.formulaDetailPermissions?.research.biologicalMechanisms ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.formulaDetailPermissions?.research.biologicalMechanisms ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-gray-700">Clinical Studies</p>
                        <button
                          onClick={() => handleUpdateFeature('formulaDetailPermissions.research.clinicalStudies', !editingPlan.formulaDetailPermissions?.research.clinicalStudies)}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            editingPlan.formulaDetailPermissions?.research.clinicalStudies ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              editingPlan.formulaDetailPermissions?.research.clinicalStudies ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* References & Notes */}
                  <p className="text-sm font-semibold text-gray-900 mb-3 mt-4">References & Notes</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3 ml-3">
                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-gray-700">References</p>
                        <button
                          onClick={() => {
                            const currentRefs = editingPlan.formulaDetailPermissions?.referencesNotes;
                            const newValue = typeof currentRefs === 'object'
                              ? { ...currentRefs, references: !currentRefs.references }
                              : { references: true, notes: false };
                            handleUpdateFeature('formulaDetailPermissions.referencesNotes', newValue);
                          }}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            typeof editingPlan.formulaDetailPermissions?.referencesNotes === 'object' && editingPlan.formulaDetailPermissions.referencesNotes.references
                              ? 'bg-teal-600'
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              typeof editingPlan.formulaDetailPermissions?.referencesNotes === 'object' && editingPlan.formulaDetailPermissions.referencesNotes.references
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-gray-700">Notes</p>
                        <button
                          onClick={() => {
                            const currentRefs = editingPlan.formulaDetailPermissions?.referencesNotes;
                            const newValue = typeof currentRefs === 'object'
                              ? { ...currentRefs, notes: !currentRefs.notes }
                              : { references: false, notes: true };
                            handleUpdateFeature('formulaDetailPermissions.referencesNotes', newValue);
                          }}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            typeof editingPlan.formulaDetailPermissions?.referencesNotes === 'object' && editingPlan.formulaDetailPermissions.referencesNotes.notes
                              ? 'bg-teal-600'
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              typeof editingPlan.formulaDetailPermissions?.referencesNotes === 'object' && editingPlan.formulaDetailPermissions.referencesNotes.notes
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </div>

              {/* Search & Filtering */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('searchFiltering')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-base font-semibold text-gray-900">Search & Filtering</h3>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openSections.searchFiltering ? 'rotate-180' : ''}`} />
                </button>
                {openSections.searchFiltering && (
                <div className="px-4 pb-4 space-y-3">
                  {/* Herb Property Filters */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Herb Property Filters</p>

                    </div>
                    <button
                      onClick={() => handleUpdateFeature('herbPropertyFilters', !editingPlan.features.herbPropertyFilters)}
                      className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                        editingPlan.features.herbPropertyFilters ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          editingPlan.features.herbPropertyFilters ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Formula Property Filters */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Formula Property Filters</p>

                    </div>
                    <button
                      onClick={() => handleUpdateFeature('formulaPropertyFilters', !editingPlan.features.formulaPropertyFilters)}
                      className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                        editingPlan.features.formulaPropertyFilters ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          editingPlan.features.formulaPropertyFilters ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Clinical Use Filters */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Clinical Use Filters</p>

                    </div>
                    <button
                      onClick={() => handleUpdateFeature('clinicalUseFilters', !editingPlan.features.clinicalUseFilters)}
                      className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                        editingPlan.features.clinicalUseFilters ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          editingPlan.features.clinicalUseFilters ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Patient Safety Profiles */}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-3">Safety Profiles</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3 ml-3">
                        {/* General Conditions */}
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">General Conditions</p>

                          </div>
                          <button
                            onClick={() => handleUpdateFeature('generalConditions', !editingPlan.features.generalConditions)}
                            className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                              editingPlan.features.generalConditions ? 'bg-teal-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                                editingPlan.features.generalConditions ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Medications */}
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Medications</p>

                          </div>
                          <button
                            onClick={() => handleUpdateFeature('medications', !editingPlan.features.medications)}
                            className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                              editingPlan.features.medications ? 'bg-teal-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                                editingPlan.features.medications ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Allergies */}
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Allergies</p>

                          </div>
                          <button
                            onClick={() => handleUpdateFeature('allergies', !editingPlan.features.allergies)}
                            className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                              editingPlan.features.allergies ? 'bg-teal-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                                editingPlan.features.allergies ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* TCM Risk Patterns */}
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">TCM Risk Patterns</p>

                          </div>
                          <button
                            onClick={() => handleUpdateFeature('tcmRiskPatterns', !editingPlan.features.tcmRiskPatterns)}
                            className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                              editingPlan.features.tcmRiskPatterns ? 'bg-teal-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                                editingPlan.features.tcmRiskPatterns ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Filters */}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-3">Advanced Filters</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3 ml-3">
                        {/* Pharmacological Effects Filter */}
                        <div className="flex items-center justify-between py-2">
                          <p className="text-sm text-gray-700">Pharmacological Effects</p>
                          <button
                            onClick={() => handleUpdateFeature('pharmacologicalEffectsFilter', !editingPlan.features.pharmacologicalEffectsFilter)}
                            className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                              editingPlan.features.pharmacologicalEffectsFilter ? 'bg-teal-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                                editingPlan.features.pharmacologicalEffectsFilter ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Biological Mechanisms Filter */}
                        <div className="flex items-center justify-between py-2">
                          <p className="text-sm text-gray-700">Biological Mechanisms</p>
                          <button
                            onClick={() => handleUpdateFeature('biologicalMechanismsFilter', !editingPlan.features.biologicalMechanismsFilter)}
                            className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                              editingPlan.features.biologicalMechanismsFilter ? 'bg-teal-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                                editingPlan.features.biologicalMechanismsFilter ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Bioactive Compounds Filter */}
                        <div className="flex items-center justify-between py-2">
                          <p className="text-sm text-gray-700">Bioactive Compounds</p>
                          <button
                            onClick={() => handleUpdateFeature('bioactiveCompoundsFilter', !editingPlan.features.bioactiveCompoundsFilter)}
                            className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                              editingPlan.features.bioactiveCompoundsFilter ? 'bg-teal-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                                editingPlan.features.bioactiveCompoundsFilter ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </div>

              {/* Prescription Builder */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('prescriptionBuilder')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-base font-semibold text-gray-900">Prescription Builder</h3>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openSections.prescriptionBuilder ? 'rotate-180' : ''}`} />
                </button>
                {openSections.prescriptionBuilder && (
                <div className="px-4 pb-4 space-y-3">
                  {/* Builder */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Prescription Builder</p>

                    </div>
                    <button
                      onClick={() => handleUpdateFeature('builder', !editingPlan.features.builder)}
                      className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                        editingPlan.features.builder ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          editingPlan.features.builder ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Prescription Library */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Prescription Library</p>

                    </div>
                    <button
                      onClick={() => handleUpdateFeature('prescriptionLibrary', !editingPlan.features.prescriptionLibrary)}
                      className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                        editingPlan.features.prescriptionLibrary ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          editingPlan.features.prescriptionLibrary ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                )}
              </div>

              {/* Usage Limits */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('usageLimits')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-base font-semibold text-gray-900">Usage Limits</h3>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openSections.usageLimits ? 'rotate-180' : ''}`} />
                </button>
                {openSections.usageLimits && (
                <div className="px-4 pb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Prescription Limit
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={editingPlan.limits.monthlyFormulas === null ? '' : editingPlan.limits.monthlyFormulas}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : Number(e.target.value);
                        handleUpdateFeature('monthlyFormulas', value);
                      }}
                      placeholder="Enter number or leave empty for unlimited"
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleUpdateFeature('monthlyFormulas', null)}
                      className="px-4 py-2.5 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      Unlimited
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty or click "Unlimited" for no restrictions
                  </p>
                </div>
                )}
              </div>

              {/* Safety Engine */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('safetyEngine')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-base font-semibold text-gray-900">Safety Engine</h3>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openSections.safetyEngine ? 'rotate-180' : ''}`} />
                </button>
                {openSections.safetyEngine && (
                <div className="px-4 pb-4 space-y-3">
                  <p className="text-xs text-gray-500">
                    The Safety Engine verifies prescriptions for contraindications, interactions, and patient safety concerns.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Safety Level
                    </label>
                    <select
                      value={editingPlan.safetyEngineMode || 'disabled'}
                      onChange={(e) => handleUpdateFeature('safetyEngineMode', e.target.value)}
                      className="w-full bg-white px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="disabled">Disabled - No safety checks</option>
                      <option value="basic">Basic - Common contraindications & herb interactions</option>
                      <option value="advanced">Advanced - Full safety analysis (medications, allergies, conditions)</option>
                    </select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-900">
                      <strong>Current setting: {editingPlan.safetyEngineMode || 'disabled'}</strong>
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-blue-800">
                      {editingPlan.safetyEngineMode === 'disabled' && (
                        <li>• No safety warnings displayed</li>
                      )}
                      {editingPlan.safetyEngineMode === 'basic' && (
                        <>
                          <li>• Herb contraindications</li>
                          <li>• Herb-herb interactions</li>
                          <li>• Basic safety warnings</li>
                        </>
                      )}
                      {editingPlan.safetyEngineMode === 'advanced' && (
                        <>
                          <li>• All basic checks</li>
                          <li>• Drug-herb interactions</li>
                          <li>• Patient allergy alerts</li>
                          <li>• Medical condition warnings</li>
                          <li>• TCM risk pattern analysis</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
                )}
              </div>

              {/* Analytics */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('analytics')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-base font-semibold text-gray-900">Analytics</h3>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openSections.analytics ? 'rotate-180' : ''}`} />
                </button>
                {openSections.analytics && (
                <div className="px-4 pb-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Usage Statistics</p>
                    <p className="text-xs text-gray-500">View analytics and insights</p>
                  </div>
                  <button
                    onClick={() => handleUpdateFeature('statistics', !editingPlan.features.statistics)}
                    className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                      editingPlan.features.statistics ? 'bg-teal-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        editingPlan.features.statistics ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 flex-shrink-0 sm:rounded-b-lg">
              <button
                onClick={handleCancel}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Membership Display Modal */}
      {editingPlanDisplay && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100]" onClick={handleCancelDisplay}>
          <div className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white sm:rounded-lg max-w-2xl w-full max-h-[90vh] sm:max-h-[85vh] z-[110] rounded-t-2xl sm:rounded-b-lg shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0 rounded-t-2xl sm:rounded-t-lg">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Edit Membership Display: {editingPlanDisplay.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">Configure how this plan appears to users during signup</p>
              </div>
              <button
                onClick={handleCancelDisplay}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Description
                </label>
                <input
                  type="text"
                  value={editingPlanDisplay.description}
                  onChange={(e) => setEditingPlanDisplay({ ...editingPlanDisplay, description: e.target.value })}
                  placeholder="Brief description of the plan"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This appears below the plan name on the membership selection page
                </p>
              </div>

              {/* Pricing */}
              {editingPlanDisplay.code !== 'free' && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Pricing</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Monthly Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Price ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={editingPlanDisplay.monthlyPrice ?? 0}
                        onChange={(e) => setEditingPlanDisplay({
                          ...editingPlanDisplay,
                          monthlyPrice: parseFloat(e.target.value) || 0
                        })}
                        placeholder="9"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    {/* Yearly Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Yearly Price ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={editingPlanDisplay.yearlyPrice ?? 0}
                        onChange={(e) => setEditingPlanDisplay({
                          ...editingPlanDisplay,
                          yearlyPrice: parseFloat(e.target.value) || 0
                        })}
                        placeholder="90"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Savings Calculator */}
                  {editingPlanDisplay.monthlyPrice && editingPlanDisplay.yearlyPrice && (
                    <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                      <p className="text-xs text-teal-900">
                        💡 <strong>Yearly saves ${(editingPlanDisplay.monthlyPrice * 12) - editingPlanDisplay.yearlyPrice}/year</strong> ({Math.round(((editingPlanDisplay.monthlyPrice * 12 - editingPlanDisplay.yearlyPrice) / (editingPlanDisplay.monthlyPrice * 12)) * 100)}% discount)
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Mark as Popular */}
              <div className="flex items-center justify-between py-2 border-t border-gray-200 pt-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Mark as "Most Popular"</p>
                  <p className="text-xs text-gray-500">Display a "Most Popular" badge with sparkle icon</p>
                </div>
                <button
                  onClick={() => setEditingPlanDisplay({ ...editingPlanDisplay, isPopular: !editingPlanDisplay.isPopular })}
                  className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                    editingPlanDisplay.isPopular ? 'bg-teal-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                      editingPlanDisplay.isPopular ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Badge Icon */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Badge Icon (optional)
                </label>
                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".svg,image/svg+xml"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file && file.type === 'image/svg+xml') {
                          const text = await file.text();
                          setEditingPlanDisplay({ ...editingPlanDisplay, badgeIconSvg: text });
                        }
                      }}
                    />
                    <div className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors flex items-center gap-2">
                      {editingPlanDisplay.badgeIconSvg ? (
                        <>
                          <div
                            className="w-4 h-4"
                            dangerouslySetInnerHTML={{ __html: editingPlanDisplay.badgeIconSvg }}
                          />
                          <span>Change SVG</span>
                        </>
                      ) : (
                        <span>Upload SVG</span>
                      )}
                    </div>
                  </label>
                  {editingPlanDisplay.badgeIconSvg && (
                    <button
                      type="button"
                      onClick={() => setEditingPlanDisplay({ ...editingPlanDisplay, badgeIconSvg: undefined })}
                      className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                      title="Remove icon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Launch Offer */}
              <div className="border-t border-gray-200 pt-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Launch Offer Settings</h3>
                </div>

                {/* Enable Offer Toggle */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Enable Launch Offer</p>
                    <p className="text-xs text-gray-500">Show promotional pricing</p>
                  </div>
                  <button
                    onClick={() => setEditingPlanDisplay({
                      ...editingPlanDisplay,
                      offer: {
                        ...editingPlanDisplay.offer,
                        enabled: !editingPlanDisplay.offer?.enabled,
                        originalPrice: editingPlanDisplay.offer?.originalPrice || 0,
                        discountedPrice: editingPlanDisplay.offer?.discountedPrice || 0
                      }
                    })}
                    className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                      editingPlanDisplay.offer?.enabled ? 'bg-teal-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        editingPlanDisplay.offer?.enabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {editingPlanDisplay.offer?.enabled && (
                  <>
                    {/* Offer Label */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Offer Label (Optional)
                      </label>
                      <input
                        type="text"
                        value={editingPlanDisplay.offer?.label || ''}
                        onChange={(e) => setEditingPlanDisplay({
                          ...editingPlanDisplay,
                          offer: { ...editingPlanDisplay.offer!, label: e.target.value }
                        })}
                        placeholder="e.g., Launch Offer, Limited Time"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Displayed as an amber badge below the price
                      </p>
                    </div>

                    {/* Original Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Original Price ($)
                      </label>
                      <input
                        type="number"
                        value={editingPlanDisplay.offer?.originalPrice || 0}
                        onChange={(e) => setEditingPlanDisplay({
                          ...editingPlanDisplay,
                          offer: { ...editingPlanDisplay.offer!, originalPrice: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    {/* Discounted Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discounted Price ($)
                      </label>
                      <input
                        type="number"
                        value={editingPlanDisplay.offer?.discountedPrice || 0}
                        onChange={(e) => setEditingPlanDisplay({
                          ...editingPlanDisplay,
                          offer: { ...editingPlanDisplay.offer!, discountedPrice: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    {/* Expiration Note */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiration Note (Optional)
                      </label>
                      <input
                        type="text"
                        value={editingPlanDisplay.offer?.expirationNote || ''}
                        onChange={(e) => setEditingPlanDisplay({
                          ...editingPlanDisplay,
                          offer: { ...editingPlanDisplay.offer!, expirationNote: e.target.value }
                        })}
                        placeholder="e.g., Offer expires soon"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {/* Yearly Launch Offer */}
                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Enable Yearly Launch Offer</p>
                      <p className="text-xs text-gray-500">Show a separate promotional price for the yearly billing period</p>
                    </div>
                    <button
                      onClick={() => setEditingPlanDisplay({
                        ...editingPlanDisplay,
                        offer: {
                          ...editingPlanDisplay.offer!,
                          yearlyEnabled: !editingPlanDisplay.offer?.yearlyEnabled,
                          yearlyOriginalPrice: editingPlanDisplay.offer?.yearlyOriginalPrice || editingPlanDisplay.yearlyPrice || 0,
                          yearlyDiscountedPrice: editingPlanDisplay.offer?.yearlyDiscountedPrice || editingPlanDisplay.yearlyPrice || 0,
                        }
                      })}
                      className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                        editingPlanDisplay.offer?.yearlyEnabled ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          editingPlanDisplay.offer?.yearlyEnabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {editingPlanDisplay.offer?.yearlyEnabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Yearly Offer Label (Optional)
                        </label>
                        <input
                          type="text"
                          value={editingPlanDisplay.offer?.yearlyLabel || ''}
                          onChange={(e) => setEditingPlanDisplay({
                            ...editingPlanDisplay,
                            offer: { ...editingPlanDisplay.offer!, yearlyLabel: e.target.value }
                          })}
                          placeholder="e.g., Yearly Launch Offer"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Yearly Original Price ($)
                        </label>
                        <input
                          type="number"
                          value={editingPlanDisplay.offer?.yearlyOriginalPrice || 0}
                          onChange={(e) => setEditingPlanDisplay({
                            ...editingPlanDisplay,
                            offer: { ...editingPlanDisplay.offer!, yearlyOriginalPrice: Number(e.target.value) }
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Yearly Discounted Price ($)
                        </label>
                        <input
                          type="number"
                          value={editingPlanDisplay.offer?.yearlyDiscountedPrice || 0}
                          onChange={(e) => setEditingPlanDisplay({
                            ...editingPlanDisplay,
                            offer: { ...editingPlanDisplay.offer!, yearlyDiscountedPrice: Number(e.target.value) }
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Yearly Expiration Note (Optional)
                        </label>
                        <input
                          type="text"
                          value={editingPlanDisplay.offer?.yearlyExpirationNote || ''}
                          onChange={(e) => setEditingPlanDisplay({
                            ...editingPlanDisplay,
                            offer: { ...editingPlanDisplay.offer!, yearlyExpirationNote: e.target.value }
                          })}
                          placeholder="e.g., Yearly offer ends soon"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Custom Features List */}
              <div className="border-t border-gray-200 pt-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Custom Features List</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {editingPlanDisplay.membershipDisplay?.customFeatures && editingPlanDisplay.membershipDisplay.customFeatures.length > 0
                          ? 'Using custom features - default features are hidden'
                          : 'Using default auto-generated features'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const hasCustom = editingPlanDisplay.membershipDisplay?.customFeatures && editingPlanDisplay.membershipDisplay.customFeatures.length > 0;

                        if (hasCustom) {
                          // Restore to default auto-generated
                          setEditingPlanDisplay({
                            ...editingPlanDisplay,
                            membershipDisplay: {
                              ...editingPlanDisplay.membershipDisplay,
                              customFeatures: undefined
                            }
                          });
                        } else {
                          // Generate custom features from current Edit Plan config
                          const autoFeatures: string[] = [];

                          if (editingPlanDisplay.features.herbLibraryAccess !== 'none') {
                            autoFeatures.push(`${editingPlanDisplay.features.herbLibraryAccess === 'full' ? 'Full' : 'Sample'} Herb Library`);
                          }
                          if (editingPlanDisplay.features.formulaLibraryAccess !== 'none') {
                            autoFeatures.push(`${editingPlanDisplay.features.formulaLibraryAccess === 'full' ? 'Full' : 'Sample'} Formula Library`);
                          }
                          if (editingPlanDisplay.features.builder) {
                            autoFeatures.push('Prescription Builder');
                          }
                          if (editingPlanDisplay.features.prescriptionLibrary) {
                            autoFeatures.push('Save & manage prescriptions');
                          }
                          autoFeatures.push(
                            editingPlanDisplay.limits.monthlyFormulas === null
                              ? 'Unlimited prescriptions/month'
                              : `Up to ${editingPlanDisplay.limits.monthlyFormulas} prescriptions/month`
                          );
                          if (editingPlanDisplay.features.herbPropertyFilters) {
                            autoFeatures.push('Herb property filters');
                          }
                          if (editingPlanDisplay.features.formulaPropertyFilters) {
                            autoFeatures.push('Formula property filters');
                          }
                          if (editingPlanDisplay.features.clinicalUseFilters) {
                            autoFeatures.push('Clinical use filters');
                          }
                          if (editingPlanDisplay.features.pharmacologicalEffectsFilter ||
                              editingPlanDisplay.features.biologicalMechanismsFilter ||
                              editingPlanDisplay.features.bioactiveCompoundsFilter) {
                            autoFeatures.push('Advanced search filters');
                          }
                          if (editingPlanDisplay.features.generalConditions ||
                              editingPlanDisplay.features.medications ||
                              editingPlanDisplay.features.allergies ||
                              editingPlanDisplay.features.tcmRiskPatterns) {
                            autoFeatures.push('Safety profiles');
                          }
                          if (editingPlanDisplay.features.statistics) {
                            autoFeatures.push('Usage analytics');
                          }
                          if (editingPlanDisplay.features.customContent) {
                            autoFeatures.push('Add custom herbs & formulas');
                          }

                          setEditingPlanDisplay({
                            ...editingPlanDisplay,
                            membershipDisplay: {
                              ...editingPlanDisplay.membershipDisplay,
                              customFeatures: autoFeatures
                            }
                          });
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      {editingPlanDisplay.membershipDisplay?.customFeatures && editingPlanDisplay.membershipDisplay.customFeatures.length > 0
                        ? 'Restore Default Features'
                        : 'Add Custom Features'}
                    </button>
                  </div>

                  {/* Preview of current features */}
                  {!(editingPlanDisplay.membershipDisplay?.customFeatures && editingPlanDisplay.membershipDisplay.customFeatures.length > 0) && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-700">Current Features (Auto-generated from Edit Plan config):</p>
                        <button
                          onClick={() => {
                            // Generate auto features array
                            const autoFeatures: string[] = [];

                            if (editingPlanDisplay.features.herbLibraryAccess !== 'none') {
                              autoFeatures.push(`${editingPlanDisplay.features.herbLibraryAccess === 'full' ? 'Full' : 'Sample'} Herb Library`);
                            }
                            if (editingPlanDisplay.features.formulaLibraryAccess !== 'none') {
                              autoFeatures.push(`${editingPlanDisplay.features.formulaLibraryAccess === 'full' ? 'Full' : 'Sample'} Formula Library`);
                            }
                            if (editingPlanDisplay.features.builder) {
                              autoFeatures.push('Prescription Builder');
                            }
                            if (editingPlanDisplay.features.prescriptionLibrary) {
                              autoFeatures.push('Save & manage prescriptions');
                            }
                            autoFeatures.push(
                              editingPlanDisplay.limits.monthlyFormulas === null
                                ? 'Unlimited prescriptions/month'
                                : `Up to ${editingPlanDisplay.limits.monthlyFormulas} prescriptions/month`
                            );
                            if (editingPlanDisplay.features.herbPropertyFilters) {
                              autoFeatures.push('Herb property filters');
                            }
                            if (editingPlanDisplay.features.formulaPropertyFilters) {
                              autoFeatures.push('Formula property filters');
                            }
                            if (editingPlanDisplay.features.clinicalUseFilters) {
                              autoFeatures.push('Clinical use filters');
                            }
                            if (editingPlanDisplay.features.pharmacologicalEffectsFilter ||
                                editingPlanDisplay.features.biologicalMechanismsFilter ||
                                editingPlanDisplay.features.bioactiveCompoundsFilter) {
                              autoFeatures.push('Advanced search filters');
                            }
                            if (editingPlanDisplay.features.generalConditions ||
                                editingPlanDisplay.features.medications ||
                                editingPlanDisplay.features.allergies ||
                                editingPlanDisplay.features.tcmRiskPatterns) {
                              autoFeatures.push('Safety profiles');
                            }
                            if (editingPlanDisplay.features.statistics) {
                              autoFeatures.push('Usage analytics');
                            }
                            if (editingPlanDisplay.features.customContent) {
                              autoFeatures.push('Add custom herbs & formulas');
                            }

                            setEditingPlanDisplay({
                              ...editingPlanDisplay,
                              membershipDisplay: {
                                ...editingPlanDisplay.membershipDisplay,
                                customFeatures: autoFeatures
                              }
                            });
                          }}
                          className="px-2 py-1 text-xs font-medium text-teal-700 bg-white border border-teal-200 rounded hover:bg-teal-50 transition-colors"
                        >
                          Copy All to Custom
                        </button>
                      </div>
                      <ul className="space-y-1.5">
                        {/* Library Access */}
                        {editingPlanDisplay.features.herbLibraryAccess !== 'none' && (
                          <li className="flex items-start gap-2 text-xs text-gray-600">
                            <Check className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" />
                            <span>
                              {editingPlanDisplay.features.herbLibraryAccess === 'full' ? 'Full' : 'Sample'} Herb Library
                            </span>
                          </li>
                        )}
                        {editingPlanDisplay.features.formulaLibraryAccess !== 'none' && (
                          <li className="flex items-start gap-2 text-xs text-gray-600">
                            <Check className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" />
                            <span>
                              {editingPlanDisplay.features.formulaLibraryAccess === 'full' ? 'Full' : 'Sample'} Formula Library
                            </span>
                          </li>
                        )}

                        {/* Builder & Library */}
                        {editingPlanDisplay.features.builder && (
                          <li className="flex items-start gap-2 text-xs text-gray-600">
                            <Check className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" />
                            <span>Prescription Builder</span>
                          </li>
                        )}
                        {editingPlanDisplay.features.prescriptionLibrary && (
                          <li className="flex items-start gap-2 text-xs text-gray-600">
                            <Check className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" />
                            <span>Save & manage prescriptions</span>
                          </li>
                        )}

                        {/* Monthly Limit */}
                        <li className="flex items-start gap-2 text-xs text-gray-600">
                          <Check className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span>
                            {editingPlanDisplay.limits.monthlyFormulas === null
                              ? 'Unlimited'
                              : `Up to ${editingPlanDisplay.limits.monthlyFormulas}`} prescriptions/month
                          </span>
                        </li>

                        {/* Property Filters */}
                        {editingPlanDisplay.features.herbPropertyFilters && (
                          <li className="flex items-start gap-2 text-xs text-gray-600">
                            <Check className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" />
                            <span>Herb property filters</span>
                          </li>
                        )}
                        {editingPlanDisplay.features.formulaPropertyFilters && (
                          <li className="flex items-start gap-2 text-xs text-gray-600">
                            <Check className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" />
                            <span>Formula property filters</span>
                          </li>
                        )}
                        {editingPlanDisplay.features.clinicalUseFilters && (
                          <li className="flex items-start gap-2 text-xs text-gray-600">
                            <Check className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" />
                            <span>Clinical use filters</span>
                          </li>
                        )}

                        {/* Advanced Filters */}
                        {(editingPlanDisplay.features.pharmacologicalEffectsFilter ||
                          editingPlanDisplay.features.biologicalMechanismsFilter ||
                          editingPlanDisplay.features.bioactiveCompoundsFilter) && (
                          <li className="flex items-start gap-2 text-xs text-gray-600">
                            <Check className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" />
                            <span>Advanced search filters</span>
                          </li>
                        )}

                        {/* Patient Safety Profile */}
                        {(editingPlanDisplay.features.generalConditions ||
                          editingPlanDisplay.features.medications ||
                          editingPlanDisplay.features.allergies ||
                          editingPlanDisplay.features.tcmRiskPatterns) && (
                          <li className="flex items-start gap-2 text-xs text-gray-600">
                            <Check className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" />
                            <span>Safety profiles</span>
                          </li>
                        )}

                        {/* Analytics */}
                        {editingPlanDisplay.features.statistics && (
                          <li className="flex items-start gap-2 text-xs text-gray-600">
                            <Check className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" />
                            <span>Usage analytics</span>
                          </li>
                        )}

                        {/* Custom Content */}
                        {editingPlanDisplay.features.customContent && (
                          <li className="flex items-start gap-2 text-xs text-gray-600">
                            <Check className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" />
                            <span>Add custom herbs & formulas</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {editingPlanDisplay.membershipDisplay?.customFeatures && editingPlanDisplay.membershipDisplay.customFeatures.length > 0 && (
                  <div className="space-y-2">
                    {editingPlanDisplay.membershipDisplay.customFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {/* Move Up/Down Buttons */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => {
                              if (index === 0) return;
                              const newFeatures = [...editingPlanDisplay.membershipDisplay!.customFeatures!];
                              [newFeatures[index - 1], newFeatures[index]] = [newFeatures[index], newFeatures[index - 1]];
                              setEditingPlanDisplay({
                                ...editingPlanDisplay,
                                membershipDisplay: {
                                  ...editingPlanDisplay.membershipDisplay,
                                  customFeatures: newFeatures
                                }
                              });
                            }}
                            disabled={index === 0}
                            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (index === editingPlanDisplay.membershipDisplay!.customFeatures!.length - 1) return;
                              const newFeatures = [...editingPlanDisplay.membershipDisplay!.customFeatures!];
                              [newFeatures[index], newFeatures[index + 1]] = [newFeatures[index + 1], newFeatures[index]];
                              setEditingPlanDisplay({
                                ...editingPlanDisplay,
                                membershipDisplay: {
                                  ...editingPlanDisplay.membershipDisplay,
                                  customFeatures: newFeatures
                                }
                              });
                            }}
                            disabled={index === editingPlanDisplay.membershipDisplay!.customFeatures!.length - 1}
                            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...editingPlanDisplay.membershipDisplay!.customFeatures!];
                            newFeatures[index] = e.target.value;
                            setEditingPlanDisplay({
                              ...editingPlanDisplay,
                              membershipDisplay: {
                                ...editingPlanDisplay.membershipDisplay,
                                customFeatures: newFeatures
                              }
                            });
                          }}
                          placeholder="e.g., Full Herb Library"
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => {
                            const newFeatures = editingPlanDisplay.membershipDisplay!.customFeatures!.filter((_, i) => i !== index);
                            setEditingPlanDisplay({
                              ...editingPlanDisplay,
                              membershipDisplay: {
                                ...editingPlanDisplay.membershipDisplay,
                                customFeatures: newFeatures.length > 0 ? newFeatures : undefined
                              }
                            });
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove feature"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newFeatures = [...(editingPlanDisplay.membershipDisplay!.customFeatures || []), ''];
                        setEditingPlanDisplay({
                          ...editingPlanDisplay,
                          membershipDisplay: {
                            ...editingPlanDisplay.membershipDisplay,
                            customFeatures: newFeatures
                          }
                        });
                      }}
                      className="w-full px-4 py-2.5 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Feature
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 flex-shrink-0 sm:rounded-b-lg">
              <button
                onClick={handleCancelDisplay}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDisplay}
                className="px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Save Display Settings
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reset to Defaults Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleResetToDefaults}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
      </div>
    </>
  );
}
