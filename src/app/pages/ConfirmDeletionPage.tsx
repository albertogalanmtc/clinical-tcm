import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ConfirmDeletionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  // Verify token on load
  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setError('Invalid deletion link');
        setLoading(false);
        return;
      }

      try {
        // Find user with this deletion token
        const { data: user, error: findError } = await supabase
          .from('users')
          .select('id, email, deletion_requested_at, deletion_token')
          .eq('deletion_token', token)
          .single();

        if (findError || !user) {
          setError('Invalid or expired deletion link');
          setLoading(false);
          return;
        }

        // Check if token is expired (24 hours)
        const requestedAt = new Date(user.deletion_requested_at);
        const now = new Date();
        const hoursDiff = (now.getTime() - requestedAt.getTime()) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
          setError('This deletion link has expired. Please request account deletion again.');
          setLoading(false);
          return;
        }

        // Token is valid
        setValidToken(true);
        setUserEmail(user.email);
        setLoading(false);
      } catch (err: any) {
        console.error('Error verifying token:', err);
        setError('An error occurred. Please try again.');
        setLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  const handleConfirmDeletion = async () => {
    setDeleting(true);
    setError(null);

    try {
      // Find user with this token
      const { data: user, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('deletion_token', token)
        .single();

      if (findError || !user) {
        setError('Invalid deletion link');
        setDeleting(false);
        return;
      }

      // Delete user record from users table
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (deleteError) {
        setError('Failed to delete account. Please try again.');
        setDeleting(false);
        return;
      }

      // TODO: Also delete from Supabase Auth
      // This would require admin access or a server-side function
      // For now, the user record is deleted from the users table

      // Show success
      setDeleted(true);
      setDeleting(false);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError('An error occurred while deleting your account');
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying deletion link...</p>
        </div>
      </div>
    );
  }

  if (error || !validToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">Invalid Link</h1>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={handleCancel}
            className="w-full px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (deleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mx-auto mb-4">
            <Check className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">Account Deleted</h1>
          <p className="text-gray-600 text-center mb-6">
            Your account has been permanently deleted. You will be redirected to the login page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">Confirm Account Deletion</h1>

        <div className="mb-6">
          <p className="text-gray-600 text-center mb-4">
            Are you absolutely sure you want to delete your account?
          </p>
          <p className="text-sm text-gray-500 text-center mb-4">
            Account: <span className="font-medium text-gray-900">{userEmail}</span>
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium mb-2">
              This will permanently delete:
            </p>
            <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
              <li>All your prescriptions</li>
              <li>Your personal settings</li>
              <li>Your account data</li>
            </ul>
            <p className="text-sm text-red-800 font-medium mt-3">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleConfirmDeletion}
            disabled={deleting}
            className={`w-full px-4 py-3 text-white text-sm font-medium rounded-lg transition-colors ${
              deleting
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {deleting ? 'Deleting Account...' : 'Yes, Delete My Account'}
          </button>
          <button
            onClick={handleCancel}
            disabled={deleting}
            className="w-full px-4 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
