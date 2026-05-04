import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Globe, Bell, Trash2, AlertTriangle, Eye, EyeOff, X, Mail, Key, Check, AlertCircle, MessageCircle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { updatePassword } from '@/services/api/authService';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const LANGUAGE_OPTIONS = {
  en: [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
  ],
  es: [
    { code: 'en', name: 'Inglés' },
    { code: 'es', name: 'Español' },
  ],
} as const;

interface NotificationPreferences {
  subscriptionRenewal: boolean;
  latestUpdates: boolean;
  communityReplies: boolean;
  communityNewPosts: boolean;
}

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  subscriptionRenewal: true,
  latestUpdates: true,
  communityReplies: true,
  communityNewPosts: false,
};

function getNotificationPreferencesKey(email: string): string {
  return `notification_preferences:${email.toLowerCase()}`;
}

export default function SettingsPage() {
  const { email, firstName, lastName, userId } = useUser();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const isSpanish = language === 'es';
  const ui = {
    pageTitle: isSpanish ? 'Ajustes' : 'Settings',
    pageDescription: isSpanish
      ? 'Gestiona la seguridad, las preferencias y la configuración de tu cuenta'
      : 'Manage security, preferences, and account settings',
    securityTitle: isSpanish ? 'Seguridad' : 'Security',
    securityDescription: isSpanish
      ? 'Gestiona tu correo, autenticación y contraseña'
      : 'Manage your email, authentication, and password',
    emailLabel: isSpanish ? 'Correo electrónico' : 'Email address',
    changeEmail: isSpanish ? 'Cambiar correo' : 'Change email',
    emailHelp: isSpanish
      ? 'Tu correo se usa para iniciar sesión y para notificaciones importantes'
      : 'Your email is used for login and important notifications',
    authMethod: isSpanish ? 'Método de autenticación' : 'Authentication method',
    password: isSpanish ? 'Contraseña' : 'Password',
    managedByGoogle: isSpanish ? 'Gestionado por Google' : 'Managed by Google',
    changePassword: isSpanish ? 'Cambiar contraseña' : 'Change password',
    currentPassword: isSpanish ? 'Contraseña actual' : 'Current Password',
    newPassword: isSpanish ? 'Nueva contraseña' : 'New Password',
    confirmPassword: isSpanish ? 'Confirmar nueva contraseña' : 'Confirm New Password',
    updatePassword: isSpanish ? 'Actualizar contraseña' : 'Update password',
    latestUpdatesTitle: isSpanish ? 'Últimas novedades' : 'Latest updates',
    latestUpdatesDescription: isSpanish
      ? 'Mantente al día de noticias importantes, actualizaciones y anuncios'
      : 'Stay informed about important news, updates, and announcements',
    notifications: isSpanish ? 'Notificaciones' : 'Notifications',
    subscriptionRenewal: isSpanish ? 'Renovación de suscripción' : 'Subscription renewal',
    subscriptionRenewalDesc: isSpanish
      ? 'Recibe un aviso antes de que se renueve tu suscripción'
      : 'Get notified before your subscription renews',
    communityNotifications: isSpanish ? 'Notificaciones de comunidad' : 'Community notifications',
    repliesToMyPosts: isSpanish ? 'Respuestas a mis posts' : 'Replies to my posts',
    repliesToMyPostsDesc: isSpanish
      ? 'Recibe un email cuando alguien responda a un post que hayas creado'
      : 'Get an email when someone replies to a post you created',
    newCommunityPosts: isSpanish ? 'Nuevos posts de la comunidad' : 'New community posts',
    newCommunityPostsDesc: isSpanish
      ? 'Recibe emails sobre nuevos posts publicados por otros usuarios'
      : 'Get emails about new posts shared by other users',
    dangerZone: isSpanish ? 'Zona de peligro' : 'Danger Zone',
    dangerZoneSub: isSpanish ? 'Acciones irreversibles' : 'Irreversible actions',
    deleteAccount: isSpanish ? 'Eliminar cuenta' : 'Delete account',
    deleteAccountDesc: isSpanish
      ? 'Elimina de forma permanente tu cuenta y todos los datos asociados. Esta acción no se puede deshacer.'
      : 'Permanently delete your account and all associated data. This action cannot be undone.',
    deleteAccountButton: isSpanish ? 'Eliminar cuenta' : 'Delete account',
    deleteModalTitle: isSpanish ? 'Eliminar cuenta' : 'Delete Account',
    deleteModalQuestion: isSpanish
      ? '¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.'
      : 'Are you absolutely sure you want to delete your account? This action cannot be undone.',
    deleteModalWillDelete: isSpanish ? 'Esto eliminará permanentemente:' : 'This will permanently delete:',
    deleteModalListPrescriptions: isSpanish ? 'Todas tus prescripciones' : 'All your prescriptions',
    deleteModalListSettings: isSpanish ? 'Tus ajustes personales' : 'Your personal settings',
    deleteModalListData: isSpanish ? 'Los datos de tu cuenta' : 'Your account data',
    enterPasswordToConfirm: isSpanish ? 'Introduce tu contraseña para confirmar' : 'Enter your password to confirm',
    typeDeleteToConfirm: isSpanish ? 'Escribe DELETE para confirmar' : 'Type DELETE to confirm',
    passwordPlaceholder: isSpanish ? 'Introduce tu contraseña' : 'Enter your password',
    deleting: isSpanish ? 'Eliminando...' : 'Deleting...',
    deleteAccountPermanent: isSpanish ? 'Eliminar cuenta definitivamente' : 'Delete Account',
    currentEmail: isSpanish ? 'Correo actual' : 'Current email',
    newEmailAddress: isSpanish ? 'Nuevo correo electrónico' : 'New email address',
    currentPasswordLabel: isSpanish ? 'Contraseña actual' : 'Current password',
    currentPasswordHelp: isSpanish
      ? 'Necesitamos tu contraseña para verificar tu identidad'
      : 'We need your password to verify your identity',
    changeEmailTitle: isSpanish ? 'Cambiar correo electrónico' : 'Change Email Address',
    emailConfirmationSent: isSpanish ? 'Correo de confirmación enviado' : 'Confirmation Email Sent',
    emailConfirmationHelp: isSpanish
      ? 'Hemos enviado un correo de confirmación a'
      : "We've sent a confirmation email to",
    emailConfirmationHelp2: isSpanish
      ? 'Por favor revisa tu bandeja y haz clic en el enlace para completar el cambio de correo.'
      : 'Please check your inbox and click the confirmation link to complete the email change.',
    saveChanges: isSpanish ? 'Guardar cambios' : 'Save changes',
    cancel: isSpanish ? 'Cancelar' : 'Cancel',
    saving: isSpanish ? 'Guardando...' : 'Saving...',
    changeEmailButton: isSpanish ? 'Cambiar correo' : 'Change Email',
    confirmDelete: isSpanish ? 'DELETE' : 'DELETE',
    fillPasswordFields: isSpanish ? 'Rellena todos los campos de contraseña' : 'Please fill in all password fields',
    passwordsDoNotMatch: isSpanish ? 'Las contraseñas nuevas no coinciden' : 'New passwords do not match',
    passwordMinLength: isSpanish ? 'La contraseña debe tener al menos 8 caracteres' : 'Password must be at least 8 characters',
    passwordMustBeDifferent: isSpanish ? 'La nueva contraseña debe ser diferente de la actual' : 'New password must be different from current password',
    passwordUpdatedSuccessfully: isSpanish ? '¡Contraseña actualizada con éxito!' : 'Password updated successfully!',
    currentPasswordIncorrect: isSpanish ? 'La contraseña actual es incorrecta' : 'Current password is incorrect',
    failedUpdatePassword: isSpanish ? 'No se pudo actualizar la contraseña' : 'Failed to update password',
    unexpectedError: isSpanish ? 'Se ha producido un error inesperado' : 'An unexpected error occurred',
    pleaseEnterPassword: isSpanish ? 'Introduce tu contraseña para confirmar' : 'Please enter your password to confirm',
    noActiveSession: isSpanish ? 'No se encontró ninguna sesión activa' : 'No active session found',
    failedDeleteAccount: isSpanish ? 'No se pudo eliminar la cuenta. Inténtalo de nuevo.' : 'Failed to delete account. Please try again.',
    errorDeletingAccount: isSpanish ? 'Se ha producido un error al eliminar la cuenta' : 'An error occurred while deleting your account',
  };

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
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  useEffect(() => {
    if (!email) return;

    try {
      const stored = localStorage.getItem(getNotificationPreferencesKey(email));
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotificationPreferences({
          ...DEFAULT_NOTIFICATION_PREFERENCES,
          ...parsed,
        });
      } else {
        setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    }
  }, [email, userId]);

  useEffect(() => {
    if (!email) return;
    try {
      localStorage.setItem(
        getNotificationPreferencesKey(email),
        JSON.stringify(notificationPreferences)
      );
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }, [email, notificationPreferences]);

  useEffect(() => {
    let cancelled = false;

    const loadPreferences = async () => {
      if (!userId) {
        setPreferencesLoaded(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('email_subscription_renewal, email_latest_updates, email_community_replies, email_community_new_posts')
          .eq('id', userId)
          .single();

        if (!cancelled && !error && data) {
          setNotificationPreferences({
            subscriptionRenewal: data.email_subscription_renewal ?? DEFAULT_NOTIFICATION_PREFERENCES.subscriptionRenewal,
            latestUpdates: data.email_latest_updates ?? DEFAULT_NOTIFICATION_PREFERENCES.latestUpdates,
            communityReplies: data.email_community_replies ?? DEFAULT_NOTIFICATION_PREFERENCES.communityReplies,
            communityNewPosts: data.email_community_new_posts ?? DEFAULT_NOTIFICATION_PREFERENCES.communityNewPosts,
          });
        }
      } catch (error) {
        console.error('Error loading notification preferences from Supabase:', error);
      } finally {
        if (!cancelled) setPreferencesLoaded(true);
      }
    };

    loadPreferences();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!preferencesLoaded) return;
    if (!userId) return;

    const savePreferences = async () => {
      try {
        await supabase
          .from('users')
          .update({
            email_subscription_renewal: notificationPreferences.subscriptionRenewal,
            email_latest_updates: notificationPreferences.latestUpdates,
            email_community_replies: notificationPreferences.communityReplies,
            email_community_new_posts: notificationPreferences.communityNewPosts,
          })
          .eq('id', userId);
      } catch (error) {
        console.error('Error saving notification preferences to Supabase:', error);
      }
    };

    savePreferences();
  }, [preferencesLoaded, userId, notificationPreferences]);

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
      toast.error(ui.fillPasswordFields);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(ui.passwordsDoNotMatch);
      return;
    }

    if (newPassword.length < 8) {
      toast.error(ui.passwordMinLength);
      return;
    }

    if (currentPassword === newPassword) {
      toast.error(ui.passwordMustBeDifferent);
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
        toast.success(ui.passwordUpdatedSuccessfully);
      } else {
        // Handle error - show more specific message
        if (result.error?.code === 'INVALID_PASSWORD') {
          toast.error(ui.currentPasswordIncorrect);
        } else {
          toast.error(result.error?.message || ui.failedUpdatePassword);
        }
      }
    } catch (error: any) {
      toast.error(error.message || ui.unexpectedError);
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
        setEmailChangeError(ui.currentPasswordIncorrect);
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
      setEmailChangeError(ui.unexpectedError);
      setEmailChangeLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return;
    }

    // For Google auth users, don't require password
    if (!isGoogleAuth && !deletePassword) {
      setDeleteError(ui.pleaseEnterPassword);
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setDeleteError(ui.noActiveSession);
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
          setDeleteError(ui.currentPasswordIncorrect);
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
        setDeleteError(ui.failedDeleteAccount);
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
      setDeleteError(error.message || ui.errorDeletingAccount);
      setDeleteLoading(false);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{ui.pageTitle}</h1>
        <p className="text-gray-600">{ui.pageDescription}</p>
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
                <h2 className="text-lg font-semibold text-gray-900">{ui.securityTitle}</h2>
                <p className="text-sm text-gray-500">{ui.securityDescription}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {ui.emailLabel}
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
                    {ui.changeEmail}
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {ui.emailHelp}
              </p>
            </div>

            {/* Authentication Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {ui.authMethod}
              </label>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                <Globe className="w-4 h-4 text-gray-400" />
                {isGoogleAuth ? 'Google' : (isSpanish ? 'Correo y contraseña' : 'Email & Password')}
              </div>
            </div>

            {/* Password Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {ui.password}
              </label>

              {isGoogleAuth ? (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  <Lock className="w-4 h-4 text-gray-400" />
                  {ui.managedByGoogle}
                </div>
              ) : (
                <>
                  {!showPasswordFields ? (
                    <button
                      onClick={() => setShowPasswordFields(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                      {ui.changePassword}
                    </button>
                  ) : (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200 max-w-2xl">
                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {ui.currentPassword}
                        </label>
                        <div className="relative max-w-md">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder={ui.currentPassword}
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
                          {ui.newPassword}
                        </label>
                        <div className="relative max-w-md">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder={isSpanish ? 'Introduce la nueva contraseña (mín. 8 caracteres)' : 'Enter new password (min. 8 characters)'}
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
                          {ui.confirmPassword}
                        </label>
                        <div className="relative max-w-md">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder={isSpanish ? 'Confirma la nueva contraseña' : 'Confirm new password'}
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
                          {ui.updatePassword}
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
                          {ui.cancel}
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
                <h2 className="text-lg font-semibold text-gray-900">{ui.latestUpdatesTitle}</h2>
                <p className="text-sm text-gray-500">{ui.latestUpdatesDescription}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.interfaceLanguage')}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
                className="w-full max-w-xs px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-gray-900"
              >
                {LANGUAGE_OPTIONS[language].map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                {isSpanish ? 'Actualmente solo están disponibles inglés y español.' : 'Currently only English and Spanish are available.'}
              </p>
            </div>

            {/* Notifications */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <label className="text-sm font-medium text-gray-700">
                    {ui.notifications}
                  </label>
                </div>

                <div className="space-y-3">
                  {/* Subscription Renewal */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ui.subscriptionRenewal}</p>
                      <p className="text-xs text-gray-500">{ui.subscriptionRenewalDesc}</p>
                    </div>
                    <button
                      onClick={() => setNotificationPreferences(prev => ({
                        ...prev,
                        subscriptionRenewal: !prev.subscriptionRenewal
                      }))}
                      className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                        notificationPreferences.subscriptionRenewal ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          notificationPreferences.subscriptionRenewal ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Latest Updates */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ui.latestUpdatesTitle}</p>
                      <p className="text-xs text-gray-500">{ui.latestUpdatesDescription}</p>
                    </div>
                    <button
                      onClick={() => setNotificationPreferences(prev => ({
                        ...prev,
                        latestUpdates: !prev.latestUpdates
                      }))}
                      className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                        notificationPreferences.latestUpdates ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          notificationPreferences.latestUpdates ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Community Notifications */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                      <label className="text-sm font-medium text-gray-700">
                        {ui.communityNotifications}
                      </label>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{ui.repliesToMyPosts}</p>
                          <p className="text-xs text-gray-500">{ui.repliesToMyPostsDesc}</p>
                        </div>
                        <button
                          onClick={() => setNotificationPreferences(prev => ({
                            ...prev,
                            communityReplies: !prev.communityReplies
                          }))}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            notificationPreferences.communityReplies ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              notificationPreferences.communityReplies ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{ui.newCommunityPosts}</p>
                          <p className="text-xs text-gray-500">{ui.newCommunityPostsDesc}</p>
                        </div>
                        <button
                          onClick={() => setNotificationPreferences(prev => ({
                            ...prev,
                            communityNewPosts: !prev.communityNewPosts
                          }))}
                          className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                            notificationPreferences.communityNewPosts ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              notificationPreferences.communityNewPosts ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
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
                <h2 className="text-lg font-semibold text-red-900">{ui.dangerZone}</h2>
                <p className="text-sm text-red-700">{ui.dangerZoneSub}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{ui.deleteAccount}</h3>
                <p className="text-sm text-gray-600">
                  {ui.deleteAccountDesc}
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="ml-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                {ui.deleteAccountButton}
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
                <h2 className="text-lg font-semibold text-gray-900">{ui.deleteModalTitle}</h2>
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
                  {ui.deleteModalQuestion}
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-medium mb-2">
                    {ui.deleteModalWillDelete}
                  </p>
                  <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
                    <li>{ui.deleteModalListPrescriptions}</li>
                    <li>{ui.deleteModalListSettings}</li>
                    <li>{ui.deleteModalListData}</li>
                  </ul>
                </div>
              </div>

              {!isGoogleAuth && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {ui.enterPasswordToConfirm}
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder={ui.passwordPlaceholder}
                    autoComplete="current-password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {isSpanish ? 'Escribe ' : 'Type '}<span className="font-bold text-red-600">DELETE</span>{isSpanish ? ' para confirmar' : ' to confirm'}
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={ui.confirmDelete}
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
                  {ui.cancel}
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
                  {deleteLoading ? ui.deleting : ui.deleteAccountPermanent}
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
                <h2 className="text-lg font-semibold text-gray-900">{ui.changeEmailTitle}</h2>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{ui.emailConfirmationSent}</h3>
                  <p className="text-sm text-gray-600">
                    {ui.emailConfirmationHelp} <span className="font-medium">{newEmail}</span>.
                    {ui.emailConfirmationHelp2}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {ui.currentEmail}
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
                      {ui.newEmailAddress}
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder={ui.newEmailAddress}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {ui.currentPasswordLabel}
                    </label>
                    <input
                      type="password"
                      value={emailChangePassword}
                      onChange={(e) => setEmailChangePassword(e.target.value)}
                      placeholder={ui.currentPasswordLabel}
                      autoComplete="current-password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {ui.currentPasswordHelp}
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
                      {ui.cancel}
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
                      {emailChangeLoading ? ui.saving : (isSpanish ? 'Enviar confirmación' : 'Send confirmation')}
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
