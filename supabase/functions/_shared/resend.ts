export interface ResendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

function normalizeRecipients(to: string | string[]): string[] {
  return Array.isArray(to) ? to : [to];
}

export async function sendResendEmail(payload: ResendEmailPayload): Promise<Response> {
  const apiKey = Deno.env.get('RESEND_API_KEY');

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const from = payload.from || Deno.env.get('RESEND_FROM_EMAIL') || 'Clinical TCM <noreply@clinicaltcm.com>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: normalizeRecipients(payload.to),
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  return res;
}
