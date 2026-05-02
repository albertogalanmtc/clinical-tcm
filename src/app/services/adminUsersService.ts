import { supabase } from '@/app/lib/supabase';

export type AdminPlanType = 'free' | 'practitioner' | 'advanced' | 'pro' | 'clinic' | 'admin';

export interface AdminUserRecord {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  country: string | null;
  role: 'user' | 'admin';
  plan_type: AdminPlanType;
  subscription_status: string | null;
  billing_period: 'monthly' | 'yearly' | null;
  created_at: string;
  updated_at: string;
}

export interface TimeRangeBounds {
  start: Date | null;
  end: Date | null;
}

const USER_SELECT = 'id, email, first_name, last_name, country, role, plan_type, subscription_status, billing_period, created_at, updated_at';

const PAID_PLAN_TYPES = new Set(['pro', 'clinic', 'practitioner', 'advanced']);

export function formatPlanName(planType: string): string {
  switch (planType) {
    case 'free':
      return 'Free';
    case 'practitioner':
    case 'pro':
      return 'Practitioner';
    case 'advanced':
    case 'clinic':
      return 'Advanced';
    case 'admin':
      return 'Admin';
    default:
      return planType;
  }
}

export function getUserDisplayName(user: Pick<AdminUserRecord, 'email' | 'first_name' | 'last_name'>): string {
  const firstName = user.first_name?.trim();
  const lastName = user.last_name?.trim();

  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(' ');
  }

  const emailPrefix = user.email.split('@')[0];
  return emailPrefix
    .split(/[._-]/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || user.email;
}

export function getAccountStatus(user: AdminUserRecord): string {
  const status = (user.subscription_status || '').toLowerCase();

  if (status === 'trialing') {
    return 'Trialing';
  }

  if (status === 'past_due') {
    return 'Past due';
  }

  if (status === 'active') {
    return 'Active';
  }

  if (status === 'cancelled' || status === 'canceled' || status === 'inactive') {
    return 'Inactive';
  }

  return 'Active';
}

export function isActiveSubscription(user: AdminUserRecord): boolean {
  const status = (user.subscription_status || '').toLowerCase();

  if (status === 'active' || status === 'trialing') {
    return true;
  }

  if (!status && PAID_PLAN_TYPES.has(user.plan_type)) {
    return true;
  }

  return false;
}

export function isWithinTimeRange(dateValue: string, bounds: TimeRangeBounds): boolean {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  if (bounds.start && date < bounds.start) {
    return false;
  }

  if (bounds.end && date > bounds.end) {
    return false;
  }

  return true;
}

export function countActiveSubscriptions(users: AdminUserRecord[]): number {
  return users.filter(isActiveSubscription).length;
}

export function countNewUsers(users: AdminUserRecord[], bounds: TimeRangeBounds): number {
  return users.filter(user => isWithinTimeRange(user.created_at, bounds)).length;
}

export function getPlanBadgeClass(planType: string): string {
  switch (planType) {
    case 'free':
      return 'bg-gray-100 text-gray-600';
    case 'practitioner':
    case 'pro':
      return 'bg-teal-50 text-teal-700';
    case 'advanced':
    case 'clinic':
      return 'bg-purple-50 text-purple-700';
    case 'admin':
      return 'bg-slate-100 text-slate-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-50 text-green-700';
    case 'trialing':
      return 'bg-amber-50 text-amber-700';
    case 'past due':
      return 'bg-orange-50 text-orange-700';
    case 'inactive':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export function getTimeRangeBounds(
  preset: string,
  startDate: string | null,
  endDate: string | null
): TimeRangeBounds {
  const now = new Date();

  if (preset === 'custom' && startDate && endDate) {
    return {
      start: new Date(startDate),
      end: new Date(endDate),
    };
  }

  if (preset === 'week') {
    return {
      start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: now,
    };
  }

  if (preset === 'lastMonth') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { start, end };
  }

  if (preset === 'lastYear') {
    const start = new Date(now.getFullYear() - 1, 0, 1);
    const end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
    return { start, end };
  }

  if (preset === 'year') {
    return {
      start: new Date(now.getFullYear(), 0, 1),
      end: now,
    };
  }

  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: now,
  };
}

export async function fetchAllAdminUsers(): Promise<AdminUserRecord[]> {
  const { data, error } = await supabase
    .from('users')
    .select(USER_SELECT)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }

  return (data || []) as AdminUserRecord[];
}

export async function fetchNewUsers(bounds: TimeRangeBounds): Promise<AdminUserRecord[]> {
  let query = supabase
    .from('users')
    .select(USER_SELECT)
    .order('created_at', { ascending: false });

  if (bounds.start) {
    query = query.gte('created_at', bounds.start.toISOString());
  }

  if (bounds.end) {
    query = query.lte('created_at', bounds.end.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching new users:', error);
    return [];
  }

  return (data || []) as AdminUserRecord[];
}

export async function fetchActiveSubscriptions(): Promise<AdminUserRecord[]> {
  const { data, error } = await supabase
    .from('users')
    .select(USER_SELECT)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching active subscriptions:', error);
    return [];
  }

  return ((data || []) as AdminUserRecord[]).filter(isActiveSubscription);
}
