import { supabase } from '@/app/lib/supabase';

export interface AdminUserIdentity {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

export async function fetchAdminUserIdentities(userIds: string[]): Promise<AdminUserIdentity[]> {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueIds.length === 0) return [];

  const { data, error } = await supabase.functions.invoke('admin-user-details', {
    body: { userIds: uniqueIds },
  });

  if (error) {
    throw error;
  }

  return (data?.profiles || []) as AdminUserIdentity[];
}
