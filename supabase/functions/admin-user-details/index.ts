import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LookupRequest {
  userIds: string[]
}

type UserProfile = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
}

function normalizeUserIds(userIds: unknown): string[] {
  if (!Array.isArray(userIds)) return []
  return Array.from(new Set(
    userIds
      .filter((id): id is string => typeof id === 'string')
      .map(id => id.trim())
      .filter(Boolean)
  ))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase environment variables' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    const { data: authData, error: authError } = await admin.auth.getUser(token)
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: requesterProfile, error: requesterError } = await admin
      .from('users')
      .select('id, role, is_admin')
      .eq('id', authData.user.id)
      .maybeSingle()

    if (requesterError || (!requesterProfile?.is_admin && requesterProfile?.role !== 'admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const payload = await req.json() as LookupRequest
    const userIds = normalizeUserIds(payload?.userIds)

    if (userIds.length === 0) {
      return new Response(JSON.stringify({ profiles: [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: profiles, error: profilesError } = await admin
      .from('users')
      .select('id, first_name, last_name, email')
      .in('id', userIds)

    if (profilesError) {
      return new Response(JSON.stringify({ error: profilesError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const profileMap = new Map<string, UserProfile>((profiles || []).map((profile: UserProfile) => [profile.id, profile]))
    const resolvedProfiles: UserProfile[] = []

    for (const id of userIds) {
      const existing = profileMap.get(id)
      if (existing?.email) {
        resolvedProfiles.push(existing)
        continue
      }

      const { data: authUser, error: authUserError } = await admin.auth.admin.getUserById(id)
      if (authUserError || !authUser?.user) {
        continue
      }

      resolvedProfiles.push({
        id,
        first_name: authUser.user.user_metadata?.first_name || authUser.user.user_metadata?.given_name || null,
        last_name: authUser.user.user_metadata?.last_name || authUser.user.user_metadata?.family_name || null,
        email: authUser.user.email || null,
      })
    }

    return new Response(JSON.stringify({ profiles: resolvedProfiles }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
