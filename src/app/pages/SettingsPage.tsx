import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Globe, Bell, Trash2, AlertTriangle, Eye, EyeOff, X, Mail, Key, Check, AlertCircle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { updatePassword } from '@/services/api/authService';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
];

export default function SettingsPage() {
  const { email, firstName, lastName } = useUser();
  const navigate = useNavigate();

  // Auth provider state
  const [authProvider, setAuthProvider] = useState<string>('email');
  const isGoogleAuth = authProvider === 'google';

  // Get auth provider from Supabase
  useEffect(() => {
    async function getAuthProvider() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.app_metadata.provider) {
          setAuthProvider(user.app_metadata.provider);
        }
      } catch (error) {
        console.error('Error getting auth provider:', error);
      }
    }
    getAuthProvider();
  }, []);

  // Security settings
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Preferences
  const [language, setLanguage] = useState('en');
  const [notifyRenewal, setNotifyRenewal] = useState(true);
  const [notifyUsage, setNotifyUsage] = useState(true);
  const [notifyUpdates, setNotifyUpdates] = useState(false);

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Email change states
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailChangePassword, setEmailChangePassword] = useState('');
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);

  const handleChangePassword = async () => {
    // Validations
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    // Call the update password function
    try {
      const result = await updatePassword(email, currentPassword, newPassword);

      if (result.success) {
        // Clear fields and close
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordFields(false);
        toast.success('Password updated successfully!');
      } else {
        // Handle error - show more specific message
        if (result.error?.code === 'INVALID_PASSWORD') {
          toast.error('Current password is incorrect');
        } else {
          toast.error(result.error?.message || 'Failed to update password');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred');
    }
  };

  const handleEmailChange = async () => {
    setEmailChangeLoading(true);
    setEmailChangeError(null);
    setEmailChangeSuccess(false);

    try {
      // Verify current password first (for security)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email || '',
        password: emailChangePassword,
      });

      if (signInError) {
        setEmailChangeError('Current password is incorrect');
        setEmailChangeLoading(false);
        return;
      }

      // Update email - Supabase will send confirmation email automatically
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (updateError) {
        setEmailChangeError(updateError.message);
        setEmailChangeLoading(false);
        return;
      }

      // Success
      setEmailChangeSuccess(true);
      setEmailChangeLoading(false);

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsEmailModalOpen(false);
        setNewEmail('');
        setEmailChangePassword('');
        setEmailChangeSuccess(false);
      }, 3000);
    } catch (error: any) {
      setEmailChangeError('An error occurred. Please try again.');
      setEmailChangeLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return;
    }

    // For Google auth users, don't require password
    if (!isGoogleAuth && !deletePassword) {
      setDeleteError('Please enter your password to confirm');
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setDeleteError('No active session found');
        setDeleteLoading(false);
        return;
      }

      // For email/password users, verify password first
      if (!isGoogleAuth) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email || '',
          password: deletePassword,
        });

        if (signInError) {
          setDeleteError('Incorrect password');
          setDeleteLoading(false);
          return;
        }
      }

      // Delete user record from users table
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', session.user.id);

      if (deleteError) {
        setDeleteError('Failed to delete account. Please try again.');
        setDeleteLoading(false);
        return;
      }

      // Sign out the user
      await supabase.auth.signOut();

      // Clear all localStorage data
      localStorage.removeItem('userRole');
      localStorage.removeItem('onboardingCompleted');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userPlanType');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('builder-prescription-draft');

      // Show success message
      toast.success('Account deleted successfully');

      // Redirect to login
      navigate('/login');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setDeleteError(error.message || 'An error occurred while deleting your account');
      setDeleteLoading(false);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage security, preferences, and account settings</p>
      </div>

      <div className="space-y-6">
        {/* Security Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                <p className="text-sm text-gray-500">Manage your email, authentication, and password</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email || ''}
                    readOnly
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-600"
                  />
                </div>
                {!isGoogleAuth && (
                  <button
                    onClick={() => setIsEmailModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Key className="w-4 h-4" />
                    Change email
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Your email is used for login and important notifications
              </p>
            </div>

            {/* Authentication Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authentication method
              </label>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                <Globe className="w-4 h-4 text-gray-400" />
                {isGoogleAuth ? 'Google' : 'Email & Password'}
              </div>
            </div>

            {/* Password Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              {isGoogleAuth ? (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  <Lock className="w-4 h-4 text-gray-400" />
                  Managed by Google
                </div>
              ) : (
                <>
                  {!showPasswordFields ? (
                    <button
                      onClick={() => setShowPasswordFields(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                      Change password
                    </button>
                  ) : (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200 max-w-2xl">
                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative max-w-md">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative max-w-md">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Enter new password (min. 8 characters)"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative max-w-md">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={handleChangePassword}
                          className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
                        >
                          Update password
                        </button>
                        <button
                          onClick={() => {
                            setShowPasswordFields(false);
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
                <p className="text-sm text-gray-500">Customize your experience</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interface Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled
                className="w-full max-w-xs px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-gray-500 cursor-not-allowed"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Currently only English is available. More languages coming soon.
              </p>
            </div>

            {/* Notifications */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-gray-400" />
                <label className="text-sm font-medium text-gray-700">
                  Email Notifications
                </label>
              </div>

              <div className="space-y-3">
                {/* Subscription Renewal */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Subscription renewal</p>
                    <p className="text-xs text-gray-500">Get notified before your subscription renews</p>
                  </div>
                  <button
                    onClick={() => setNotifyRenewal(!notifyRenewal)}
                    className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                      notifyRenewal ? 'bg-teal-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        notifyRenewal ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Usage Limits */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Usage limit alerts</p>
                    <p className="text-xs text-gray-500">Get notified when approaching usage limits</p>
                  </div>
                  <button
                    onClick={() => setNotifyUsage(!notifyUsage)}
                    className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                      notifyUsage ? 'bg-teal-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        notifyUsage ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Product Updates */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Product updates</p>
                    <p className="text-xs text-gray-500">Receive news about new features and improvements</p>
                  </div>
                  <button
                    onClick={() => setNotifyUpdates(!notifyUpdates)}
                    className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                      notifyUpdates ? 'bg-teal-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        notifyUpdates ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg border-2 border-red-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
                <p className="text-sm text-red-700">Irreversible actions</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Delete account</h3>
                <p className="text-sm text-gray-600">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="ml-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                Delete account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Delete Account</h2>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                  setDeletePassword('');
                  setDeleteError(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={deleteLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Are you absolutely sure you want to delete your account? This action cannot be undone.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-medium mb-2">
                    This will permanently delete:
                  </p>
                  <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
                    <li>All your prescriptions</li>
                    <li>Your personal settings</li>
                    <li>Your account data</li>
                  </ul>
                </div>
              </div>

              {!isGoogleAuth && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Enter your password to confirm
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {deleteError && (
                <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{deleteError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                    setDeletePassword('');
                    setDeleteError(null);
                  }}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || deleteLoading || (!isGoogleAuth && !deletePassword)}
                  className={`flex-1 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${
                    deleteConfirmText === 'DELETE' && (isGoogleAuth || deletePassword) && !deleteLoading
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Email Change Modal */}
      {isEmailModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-teal-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Change Email Address</h2>
              </div>
              <button
                onClick={() => {
                  setIsEmailModalOpen(false);
                  setNewEmail('');
                  setEmailChangePassword('');
                  setEmailChangeError(null);
                  setEmailChangeSuccess(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              {emailChangeSuccess ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmation Email Sent</h3>
                  <p className="text-sm text-gray-600">
                    We've sent a confirmation email to <span className="font-medium">{newEmail}</span>.
                    Please check your inbox and click the confirmation link to complete the email change.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current email
                    </label>
                    <input
                      type="email"
                      value={email || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New email address
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current password
                    </label>
                    <input
                      type="password"
                      value={emailChangePassword}
                      onChange={(e) => setEmailChangePassword(e.target.value)}
                      placeholder="Enter your current password"
                      autoComplete="current-password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      We need your password to verify your identity
                    </p>
                  </div>

                  {emailChangeError && (
                    <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{emailChangeError}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setIsEmailModalOpen(false);
                        setNewEmail('');
                        setEmailChangePassword('');
                        setEmailChangeError(null);
                      }}
                      disabled={emailChangeLoading}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEmailChange}
                      disabled={!newEmail || !emailChangePassword || emailChangeLoading}
                      className={`flex-1 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${
                        newEmail && emailChangePassword && !emailChangeLoading
                          ? 'bg-teal-600 hover:bg-teal-700'
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {emailChangeLoading ? 'Sending...' : 'Send confirmation'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
