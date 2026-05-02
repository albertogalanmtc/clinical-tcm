import { Users, CreditCard, Beaker, AlertTriangle, Database, BarChart3, ChevronRight, Layout, Settings, DollarSign, Filter, Type, FileText, UserPlus, X, ClipboardList, MessageSquare } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAllHerbs, isCustomHerb } from '../data/herbsManager';
import { getAllFormulas, isCustomFormula } from '../data/formulasManager';
import { getPrescriptionsSync, type Prescription } from '../data/prescriptions';
import { getPlatformSettings } from '../data/platformSettings';
import * as Dialog from '@radix-ui/react-dialog';
import { PrescriptionView } from '../components/PrescriptionView';
import { fetchRecentAdminActivity, type AdminActivityItem as RecentAdminActivityItem } from '../services/adminActivityService';
import { fetchAllAdminUsers } from '../services/adminUsersService';

interface ActivityItem {
  event: string;
  detail: string;
  user?: string;
  time: string;
  type: 'prescription' | 'herb' | 'formula' | 'user' | 'message' | 'survey' | 'response' | 'banner' | 'post';
  clickable?: boolean;
  data?: any;
}

function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return new Date(then).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AdminDashboard() {
  const [herbCount, setHerbCount] = useState(0);
  const [formulaCount, setFormulaCount] = useState(0);
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [designSettings, setDesignSettings] = useState(getPlatformSettings().designSettings);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  // Load design settings and listen for updates
  useEffect(() => {
    const updateDesignSettings = () => {
      setDesignSettings(getPlatformSettings().designSettings);
    };

    window.addEventListener('platformSettingsUpdated', updateDesignSettings);
    window.addEventListener('storage', updateDesignSettings);

    return () => {
      window.removeEventListener('platformSettingsUpdated', updateDesignSettings);
      window.removeEventListener('storage', updateDesignSettings);
    };
  }, []);

  // Load real data
  useEffect(() => {
    let cancelled = false;

    const updateCounts = async () => {
      const allUsers = await fetchAllAdminUsers();

      if (cancelled) {
        return;
      }

      setHerbCount(getAllHerbs().length);
      setFormulaCount(getAllFormulas().length);
      setPrescriptionCount(getPrescriptionsSync().length);
      setUserCount(allUsers.length);
    };

    void updateCounts();

    // Listen for updates
    window.addEventListener('prescriptions-updated', updateCounts);
    window.addEventListener('storage', updateCounts);

    return () => {
      cancelled = true;
      window.removeEventListener('prescriptions-updated', updateCounts);
      window.removeEventListener('storage', updateCounts);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadRecentActivity = async () => {
      const activityItems: RecentAdminActivityItem[] = await fetchRecentAdminActivity(10);

      if (cancelled) {
        return;
      }

      setRecentActivity(
        activityItems.map(activity => ({
          event: activity.event,
          detail: activity.detail,
          user: activity.user,
          time: formatRelativeTime(activity.time),
          type: activity.type,
          clickable: activity.clickable,
          data: activity.data
        }))
      );
    };

    loadRecentActivity();

    const refreshRecentActivity = () => {
      loadRecentActivity();
    };

    window.addEventListener('community-posts-updated', refreshRecentActivity);
    window.addEventListener('banners-updated', refreshRecentActivity);
    window.addEventListener('dashboard-content-updated', refreshRecentActivity);
    window.addEventListener('prescriptions-updated', refreshRecentActivity);
    window.addEventListener('storage', refreshRecentActivity);

    return () => {
      cancelled = true;
      window.removeEventListener('community-posts-updated', refreshRecentActivity);
      window.removeEventListener('banners-updated', refreshRecentActivity);
      window.removeEventListener('dashboard-content-updated', refreshRecentActivity);
      window.removeEventListener('prescriptions-updated', refreshRecentActivity);
      window.removeEventListener('storage', refreshRecentActivity);
    };
  }, []);

  // Dynamic KPI data
  const HerbIcon = (LucideIcons as any)[designSettings.navigationIcons.herbs] || LucideIcons.Leaf;
  const FormulaIcon = (LucideIcons as any)[designSettings.navigationIcons.formulas] || LucideIcons.Pill;
  const PrescriptionIcon = (LucideIcons as any)[designSettings.navigationIcons.prescriptions] || LucideIcons.FileText;

  const kpiData = [
    { 
      label: 'Total users', 
      value: userCount === null ? '—' : userCount.toString(), 
      icon: Users, 
      color: 'bg-blue-50 text-blue-600' 
    },
    { 
      label: 'Herbs in library', 
      value: herbCount.toString(), 
      icon: HerbIcon, 
      color: 'bg-green-50 text-green-600' 
    },
    { 
      label: 'Formulas in library',
      value: formulaCount.toString(), 
      icon: FormulaIcon, 
      color: 'bg-teal-50 text-teal-600' 
    },
    { 
      label: 'Prescriptions',
      value: prescriptionCount.toString(), 
      icon: PrescriptionIcon, 
      color: 'bg-purple-50 text-purple-600' 
    },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiData.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex sm:block items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${kpi.color} flex items-center justify-center flex-shrink-0 mb-0 sm:mb-3`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 sm:flex-initial">
                <div className="text-2xl font-semibold text-gray-900 leading-tight mb-0 sm:mb-1">{kpi.value}</div>
                <div className="text-sm text-gray-500">
                  {kpi.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent activity</h2>
        </div>
        {recentActivity.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity, index) => {
              const handleClick = () => {
                if (activity.clickable && activity.type === 'prescription' && activity.data) {
                  setSelectedPrescription(activity.data);
                  setShowPrescriptionModal(true);
                }
              };

              return (
                <div
                  key={index}
                  onClick={handleClick}
                  className={`grid grid-cols-[2fr_2fr_1.5fr_1fr] gap-4 items-baseline px-6 py-4 transition-colors ${
                    activity.clickable
                      ? 'hover:bg-teal-50 cursor-pointer'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    {activity.type === 'prescription' && <FileText className="w-4 h-4 text-teal-600" />}
                    {activity.type === 'user' && <UserPlus className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'herb' && <LucideIcons.Leaf className="w-4 h-4 text-green-600" />}
                    {activity.type === 'formula' && <LucideIcons.Pill className="w-4 h-4 text-purple-600" />}
                    {activity.type === 'message' && <MessageSquare className="w-4 h-4 text-teal-600" />}
                    {activity.type === 'survey' && <ClipboardList className="w-4 h-4 text-indigo-600" />}
                    {activity.type === 'response' && <BarChart3 className="w-4 h-4 text-amber-600" />}
                    {activity.type === 'banner' && <Layout className="w-4 h-4 text-orange-600" />}
                    {activity.type === 'post' && <MessageSquare className="w-4 h-4 text-pink-600" />}
                    {activity.event}
                  </div>
                  <div className="text-sm text-gray-500 truncate">{activity.detail}</div>
                  <div className="text-sm text-gray-600 truncate">{activity.user || '—'}</div>
                  <div className="text-xs text-gray-400 text-right">{activity.time}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            No recent activity
          </div>
        )}
      </div>

      {/* Prescription Detail Modal */}
      <Dialog.Root open={showPrescriptionModal} onOpenChange={setShowPrescriptionModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-4xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col">
            <Dialog.Description className="sr-only">
              Prescription details
            </Dialog.Description>

            {/* Header */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                Prescription Details
              </Dialog.Title>
              <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedPrescription && (
                <PrescriptionView prescription={selectedPrescription} />
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
