# Account Deletion Flow

## Overview

The account deletion process uses a two-step confirmation flow to prevent accidental deletions:

1. User requests deletion from Settings page
2. Confirmation email sent with unique link
3. User clicks link to confirm deletion
4. Account is permanently deleted

## Database Setup

Run the migration in `supabase-migrations/add-deletion-fields.sql`:

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deletion_token TEXT;

CREATE INDEX IF NOT EXISTS idx_users_deletion_token ON users(deletion_token);
```

## Flow Details

### Step 1: Request Deletion (Settings Page)

**File:** `/src/app/pages/SettingsPage.tsx`

**For Email/Password Users:**
- Enter password to verify identity
- Type "DELETE" to confirm
- Click "Request Deletion"

**For Google OAuth Users:**
- Type "DELETE" to confirm (no password needed)
- Click "Request Deletion"

**What Happens:**
- Generates unique deletion token (`crypto.randomUUID()`)
- Updates user record:
  ```typescript
  {
    deletion_requested_at: new Date().toISOString(),
    deletion_token: "abc123-unique-token-xyz"
  }
  ```
- Logs confirmation link to console (for development)
- Shows success message to user

### Step 2: Email Confirmation (Not Yet Implemented)

**TODO:** Implement email sending using:
- Resend API
- SendGrid
- Supabase Email Auth

**Email Template:**
```
Subject: Confirm Account Deletion

Hi [Name],

We received a request to delete your account ([email]).

If you want to proceed with deleting your account, click the link below:
[Confirmation Link]

This link will expire in 24 hours.

If you didn't request this, you can safely ignore this email.
```

### Step 3: Confirmation Page

**File:** `/src/app/pages/ConfirmDeletionPage.tsx`
**Route:** `/confirm-deletion?token=xxx`

**What It Does:**
1. Reads token from URL query parameter
2. Verifies token exists in database
3. Checks token hasn't expired (24 hour limit)
4. Shows final confirmation screen
5. On confirm:
   - Deletes user record from `users` table
   - (TODO: Delete from Supabase Auth)
   - Redirects to login page

## Security Features

1. **Password Verification:** Email/password users must re-enter password
2. **Unique Token:** One-time use token prevents replay attacks
3. **Expiration:** Links expire after 24 hours
4. **Two-Step Confirmation:** User must confirm twice (Settings + Email link)
5. **Email Verification:** Ensures account owner has access to registered email

## Development Testing

Since emails aren't implemented yet, check the console logs for the confirmation link:

```
================================================================================
ACCOUNT DELETION REQUESTED
================================================================================
User ID: abc123...
Email: user@example.com
Confirmation Link: http://localhost:5173/confirm-deletion?token=xxx
================================================================================
```

Copy the link and open it in your browser to test the confirmation flow.

## Future Enhancements

### Email Implementation

Add email service integration:

```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@yourapp.com',
  to: email,
  subject: 'Confirm Account Deletion',
  html: `<p>Click to confirm: <a href="${confirmationLink}">Delete Account</a></p>`
});
```

### Cleanup Job

Schedule a cron job to clean up expired deletion requests:

```sql
-- Run daily
SELECT cleanup_expired_deletion_requests();
```

### Supabase Auth Deletion

Add admin function to delete from auth.users:

```typescript
// Server-side only (requires service role key)
const { error } = await supabase.auth.admin.deleteUser(userId);
```

## Files Modified

- `src/app/pages/SettingsPage.tsx` - Request deletion UI
- `src/app/pages/ConfirmDeletionPage.tsx` - Confirmation page (NEW)
- `src/app/App.tsx` - Added `/confirm-deletion` route
- `supabase-migrations/add-deletion-fields.sql` - Database migration (NEW)
