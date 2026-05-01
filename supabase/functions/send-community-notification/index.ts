import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { sendResendEmail } from "../_shared/resend.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type NotificationType = 'reply_to_post' | 'new_post' | 'latest_updates'

interface NotificationRequest {
  type: NotificationType
  postId?: string
  commentId?: string
  actorId?: string
  actorName?: string
  actorEmail?: string
  postTitle?: string
  commentContent?: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function createSnippet(text: string, maxLength = 180): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}…` : normalized;
}

async function sendNotificationEmail(options: {
  to: string;
  subject: string;
  title: string;
  body: string;
  ctaUrl?: string;
  ctaLabel?: string;
}): Promise<boolean> {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 640px; margin: 0 auto; padding: 24px;">
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px;">
        <h1 style="margin: 0 0 16px; font-size: 24px; line-height: 1.3; color: #0f172a;">${escapeHtml(options.title)}</h1>
        <div style="font-size: 16px; color: #334155; margin-bottom: 24px;">${options.body}</div>
        ${options.ctaUrl && options.ctaLabel ? `
          <div style="margin: 28px 0 8px;">
            <a href="${options.ctaUrl}" style="display: inline-block; background: #0f766e; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 10px; font-weight: 600;">
              ${escapeHtml(options.ctaLabel)}
            </a>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  const res = await sendResendEmail({
    to: options.to,
    subject: options.subject,
    html,
    text: options.body,
  });

  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase environment variables' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const payload: NotificationRequest = await req.json();

    if (!payload.type) {
      return new Response(JSON.stringify({ error: 'Missing required field: type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const appUrl = Deno.env.get('APP_URL') || 'https://clinical-tcm.vercel.app';
    const fromUrl = `${appUrl}/community`;

    if (payload.type === 'reply_to_post') {
      if (!payload.postId || !payload.commentId) {
        return new Response(JSON.stringify({ error: 'Missing required fields: postId, commentId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: post, error: postError } = await admin
        .from('community_posts')
        .select('id, title, author_id')
        .eq('id', payload.postId)
        .single();

      if (postError || !post) {
        return new Response(JSON.stringify({ error: 'Post not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: comment, error: commentError } = await admin
        .from('community_comments')
        .select('id, content, author_id, author_name, parent_comment_id')
        .eq('id', payload.commentId)
        .single();

      if (commentError || !comment) {
        return new Response(JSON.stringify({ error: 'Comment not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (payload.actorId && comment.author_id === payload.actorId) {
        return new Response(JSON.stringify({ success: true, skipped: true, reason: 'self_reply' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: recipient, error: recipientError } = await admin
        .from('users')
        .select('email, first_name, last_name, email_community_replies')
        .eq('id', post.author_id)
        .single();

      if (recipientError || !recipient?.email) {
        return new Response(JSON.stringify({ success: true, skipped: true, reason: 'recipient_not_found' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!recipient.email_community_replies) {
        return new Response(JSON.stringify({ success: true, skipped: true, reason: 'preference_disabled' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const recipientName = `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() || 'there';
      const snippet = createSnippet(comment.content || '');
      const subject = `New reply on your Community post: ${post.title}`;
      const body = `
        <p style="margin: 0 0 12px;">Hi ${escapeHtml(recipientName)},</p>
        <p style="margin: 0 0 12px;"><strong>${escapeHtml(comment.author_name || payload.actorName || 'Someone')}</strong> replied to your post <strong>${escapeHtml(post.title)}</strong>.</p>
        <p style="margin: 0 0 12px; color: #475569;">"${escapeHtml(snippet)}"</p>
        <p style="margin: 0;">Open the conversation to read and respond.</p>
      `;

      const sent = await sendNotificationEmail({
        to: recipient.email,
        subject,
        title: 'You have a new reply',
        body,
        ctaUrl: `${appUrl}/community/post/${post.id}`,
        ctaLabel: 'View reply',
      });

      return new Response(JSON.stringify({ success: sent }), {
        status: sent ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const preferencesColumn =
      payload.type === 'latest_updates'
        ? 'email_latest_updates'
        : 'email_community_new_posts';

    const { data: recipients, error: recipientsError } = await admin
      .from('users')
      .select(`id, email, first_name, last_name, ${preferencesColumn}`)
      .eq(preferencesColumn, true);

    if (recipientsError) {
      return new Response(JSON.stringify({ error: recipientsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subject =
      payload.type === 'latest_updates'
        ? 'Clinical TCM - Latest updates'
        : `New Community post: ${payload.postTitle || 'Clinical TCM'}`;

    const body =
      payload.type === 'latest_updates'
        ? `
          <p style="margin: 0 0 12px;">Hi,</p>
          <p style="margin: 0 0 12px;">We have an important update to share with you.</p>
          <p style="margin: 0;">Visit the app to read the full announcement.</p>
        `
        : `
          <p style="margin: 0 0 12px;">A new post has been published in the Community.</p>
          <p style="margin: 0 0 12px;"><strong>${escapeHtml(payload.postTitle || 'New Community post')}</strong></p>
          <p style="margin: 0;">Open the Community to join the conversation.</p>
        `;

    let sentCount = 0;
    const recipientsList = (recipients || []).filter(recipient => recipient.email && recipient.id !== payload.actorId);

    for (const recipient of recipientsList) {
      const recipientName = `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() || 'there';
      const personalizedBody = body.replace('Hi,', `Hi ${escapeHtml(recipientName)},`);
      const ok = await sendNotificationEmail({
        to: recipient.email,
        subject,
        title: payload.type === 'latest_updates' ? 'Latest updates' : 'New community post',
        body: personalizedBody,
        ctaUrl: payload.type === 'latest_updates' ? appUrl : fromUrl,
        ctaLabel: payload.type === 'latest_updates' ? 'Read update' : 'View community',
      });

      if (ok) sentCount += 1;
    }

    return new Response(JSON.stringify({ success: true, sentCount }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
