import { useState, useEffect } from 'react';
import { updateAuthentication } from '../data/platformSettings';

export function AuthenticationSection({ 
  authentication, 
  onRefresh, 
  onSave, 
  saved,
  onRegisterSaveHandler
}: { 
  authentication: any;
  onRefresh: () => void;
  onSave: () => void;
  saved?: boolean;
  onRegisterSaveHandler: (handler: () => void) => void;
}) {
  const [googleEnabled, setGoogleEnabled] = useState(authentication.oauthProviders.google);
  const [microsoftEnabled, setMicrosoftEnabled] = useState(authentication.oauthProviders.microsoft);
  const [appleEnabled, setAppleEnabled] = useState(authentication.oauthProviders.apple);
  const [allowEmailPassword, setAllowEmailPassword] = useState(authentication.loginOptions.allowEmailPassword);
  const [requireEmailVerification, setRequireEmailVerification] = useState(authentication.loginOptions.requireEmailVerification);
  const [enableTwoFactorAuth, setEnableTwoFactorAuth] = useState(authentication.loginOptions.enableTwoFactorAuth);
  const [allowNewUserRegistration, setAllowNewUserRegistration] = useState(authentication.registrationSettings.allowNewUserRegistration);
  const [requireAdminApproval, setRequireAdminApproval] = useState(authentication.registrationSettings.requireAdminApproval);

  // Update local state when authentication prop changes
  useEffect(() => {
    setGoogleEnabled(authentication.oauthProviders.google);
    setMicrosoftEnabled(authentication.oauthProviders.microsoft);
    setAppleEnabled(authentication.oauthProviders.apple);
    setAllowEmailPassword(authentication.loginOptions.allowEmailPassword);
    setRequireEmailVerification(authentication.loginOptions.requireEmailVerification);
    setEnableTwoFactorAuth(authentication.loginOptions.enableTwoFactorAuth);
    setAllowNewUserRegistration(authentication.registrationSettings.allowNewUserRegistration);
    setRequireAdminApproval(authentication.registrationSettings.requireAdminApproval);
  }, [authentication]);

  const handleSave = () => {
    updateAuthentication({
      oauthProviders: {
        google: googleEnabled,
        microsoft: microsoftEnabled,
        apple: appleEnabled
      },
      loginOptions: {
        allowEmailPassword,
        requireEmailVerification,
        enableTwoFactorAuth
      },
      registrationSettings: {
        allowNewUserRegistration,
        requireAdminApproval
      }
    });
    onRefresh();
    onSave();
  };

  // Register the save handler - update when any value changes
  useEffect(() => {
    onRegisterSaveHandler(handleSave);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleEnabled, microsoftEnabled, appleEnabled, allowEmailPassword, requireEmailVerification, enableTwoFactorAuth, allowNewUserRegistration, requireAdminApproval]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication Configuration</h2>
        <p className="text-sm text-gray-600 mb-6">
          Configure login methods, OAuth providers, and registration settings for your platform.
        </p>
      </div>

      {/* OAuth Providers Section */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-md font-semibold text-gray-900 mb-4">OAuth Providers</h3>
        <p className="text-sm text-gray-600 mb-4">
          Enable or disable social login providers. Users will see enabled providers on the login screen.
        </p>

        <div className="space-y-3">
          {/* Google */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Sign in with Google</h4>
                <p className="text-xs text-gray-600">Allow users to authenticate with their Google account</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={googleEnabled}
                onChange={(e) => setGoogleEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* Microsoft */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 23 23">
                <path fill="#f25022" d="M0 0h11v11H0z" />
                <path fill="#00a4ef" d="M12 0h11v11H12z" />
                <path fill="#7fba00" d="M0 12h11v11H0z" />
                <path fill="#ffb900" d="M12 12h11v11H12z" />
              </svg>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Sign in with Microsoft</h4>
                <p className="text-xs text-gray-600">Allow users to authenticate with Microsoft/Outlook accounts</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={microsoftEnabled}
                onChange={(e) => setMicrosoftEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* Apple */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#000000">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Sign in with Apple</h4>
                <p className="text-xs text-gray-600">Allow users to authenticate with their Apple ID</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={appleEnabled}
                onChange={(e) => setAppleEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Implementation Note:</strong> OAuth providers require additional configuration with Supabase, Auth0, or similar authentication service. The toggle controls visibility on the login screen only.
          </p>
        </div>
      </div>

      {/* Login Options Section */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-md font-semibold text-gray-900 mb-4">Login Options</h3>
        <p className="text-sm text-gray-600 mb-4">
          Configure authentication requirements and security features.
        </p>

        <div className="space-y-3">
          {/* Email/Password */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900 text-sm">Allow Email/Password Login</h4>
              <p className="text-xs text-gray-600">Enable traditional email and password authentication</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowEmailPassword}
                onChange={(e) => setAllowEmailPassword(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* Email Verification */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900 text-sm">Require Email Verification</h4>
              <p className="text-xs text-gray-600">Users must verify their email before accessing the platform</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={requireEmailVerification}
                onChange={(e) => setRequireEmailVerification(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* 2FA */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900 text-sm">Enable Two-Factor Authentication</h4>
              <p className="text-xs text-gray-600">Allow users to enable 2FA for enhanced security</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableTwoFactorAuth}
                onChange={(e) => setEnableTwoFactorAuth(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Registration Settings Section */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-md font-semibold text-gray-900 mb-4">Registration Settings</h3>
        <p className="text-sm text-gray-600 mb-4">
          Control how new users can register and access the platform.
        </p>

        <div className="space-y-3">
          {/* Allow Registration */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900 text-sm">Allow New User Registration</h4>
              <p className="text-xs text-gray-600">Enable the "Create account" option on the login screen</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowNewUserRegistration}
                onChange={(e) => setAllowNewUserRegistration(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* Admin Approval */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900 text-sm">Require Admin Approval</h4>
              <p className="text-xs text-gray-600">New accounts require admin approval before access</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={requireAdminApproval}
                onChange={(e) => setRequireAdminApproval(e.target.checked)}
                disabled={!allowNewUserRegistration}
                className="sr-only peer disabled:opacity-50"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600 peer-disabled:opacity-50"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}