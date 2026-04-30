import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeletionEmailRequest {
  email: string
  deletionToken: string
  userName?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request body
    const { email, deletionToken, userName }: DeletionEmailRequest = await req.json()

    if (!email || !deletionToken) {
      return new Response(
        JSON.stringify({ error: 'Email and deletion token are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the app URL from environment or use default
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'
    const confirmationLink = `${appUrl}/confirm-deletion?token=${deletionToken}`

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'TCM App <noreply@yourdomain.com>', // TODO: Replace with your verified domain
        to: [email],
        subject: 'Confirm Account Deletion',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
                <h1 style="color: #dc2626; margin-top: 0;">Confirm Account Deletion</h1>
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Hi${userName ? ' ' + userName : ''},
                </p>
                <p style="font-size: 16px; margin-bottom: 20px;">
                  We received a request to delete your account (<strong>${email}</strong>).
                </p>
                <p style="font-size: 16px; margin-bottom: 20px;">
                  If you want to proceed with deleting your account, click the button below:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${confirmationLink}"
                     style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                    Confirm Account Deletion
                  </a>
                </div>
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
                  Or copy and paste this link into your browser:
                </p>
                <p style="font-size: 14px; color: #0ea5e9; word-break: break-all; margin-bottom: 20px;">
                  ${confirmationLink}
                </p>
                <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #991b1b;">
                    <strong>Warning:</strong> This link will expire in 24 hours. This action cannot be undone and will permanently delete:
                  </p>
                  <ul style="margin: 10px 0; padding-left: 20px; color: #991b1b; font-size: 14px;">
                    <li>All your prescriptions</li>
                    <li>Your personal settings</li>
                    <li>Your account data</li>
                  </ul>
                </div>
                <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                  If you didn't request this, you can safely ignore this email. Your account will remain active.
                </p>
              </div>
              <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
                <p>TCM App</p>
              </div>
            </body>
          </html>
        `,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('Resend API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await res.json()
    console.log('Email sent successfully:', data)

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending deletion email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
