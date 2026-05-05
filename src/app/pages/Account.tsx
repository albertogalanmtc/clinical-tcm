import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Loader2, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useLanguage } from '../contexts/LanguageContext';

export default function Account() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Get user email from localStorage
  const getUserEmail = () => {
    try {
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        return profile.email || '';
      }
    } catch (error) {
      console.error('Error getting user email:', error);
    }
    return '';
  };

  const userEmail = getUserEmail();
  const deleteConfirmationText = isSpanish ? 'ELIMINAR' : 'DELETE';
  const ui = {
    backToAccount: isSpanish ? 'Volver a la cuenta' : 'Back to Account',
    pageTitle: isSpanish ? 'Ajustes de cuenta' : 'Account Settings',
    pageDescription: isSpanish ? 'Gestiona la configuración y los datos de tu cuenta' : 'Manage your account settings and data',
    dangerZone: isSpanish ? 'Zona de peligro' : 'Danger Zone',
    deleteAccount: isSpanish ? 'Eliminar cuenta' : 'Delete account',
    deleteAccountDescription: isSpanish ? 'Elimina de forma permanente tu cuenta y todos los datos asociados.' : 'Permanently delete your account and all associated data.',
    deleteMyAccount: isSpanish ? 'Eliminar mi cuenta' : 'Delete my account',
    deleteYourAccount: isSpanish ? '¿Eliminar tu cuenta?' : 'Delete your account?',
    confirmDeletionDescription: isSpanish ? 'Confirma la eliminación de tu cuenta escribiendo tu correo y ELIMINAR' : 'Confirm account deletion by entering your email and typing DELETE',
    accountDeleted: isSpanish ? 'Cuenta eliminada' : 'Account deleted',
    accountDeletedMessage: isSpanish ? 'Tu cuenta ha sido eliminada permanentemente. Redirigiendo...' : 'Your account has been permanently deleted. Redirecting...',
    permanentAction: isSpanish ? 'Esta acción es permanente y no se puede deshacer' : 'This action is permanent and cannot be undone',
    allDataDeleted: isSpanish ? 'Todos tus datos, prescripciones y contenido personalizado se eliminarán de forma permanente' : 'All your data, prescriptions, and custom content will be permanently deleted',
    loseAccess: isSpanish ? 'Perderás el acceso a tu cuenta inmediatamente' : 'You will lose access to your account immediately',
    cannotRecover: isSpanish ? 'No se puede revertir ni recuperar' : 'This cannot be reversed or recovered',
    confirmEmailAddress: isSpanish ? 'Confirma tu dirección de correo electrónico' : 'Confirm your email address',
    typeEmailToConfirm: isSpanish ? 'Escribe' : 'Type',
    toConfirm: isSpanish ? 'para confirmar' : 'to confirm',
    confirmTextLabel: isSpanish ? 'Escribe ELIMINAR para confirmar' : 'Type DELETE to confirm',
    understandPermanent: isSpanish ? 'Entiendo que esta acción es' : 'I understand that this action is',
    permanentAndIrreversible: isSpanish ? 'permanente e irreversible' : 'permanent and irreversible',
    cancel: isSpanish ? 'Cancelar' : 'Cancel',
    deleteForever: isSpanish ? 'Eliminar mi cuenta definitivamente' : 'Delete my account permanently',
    deletingAccount: isSpanish ? 'Eliminando cuenta...' : 'Deleting account...',
    somethingWentWrong: isSpanish ? 'Algo salió mal. Inténtalo de nuevo.' : 'Something went wrong. Please try again.',
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setConfirmEmail('');
    setConfirmText('');
    setIsChecked(false);
    setError('');
    setIsSuccess(false);
  };

  const handleCloseModal = () => {
    if (isDeleting) return; // Prevent closing while deleting
    setIsModalOpen(false);
    setConfirmEmail('');
    setConfirmText('');
    setIsChecked(false);
    setError('');
    setIsSuccess(false);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate random success/error (80% success rate)
    const success = Math.random() > 0.2;

    if (success) {
      setIsSuccess(true);
      setIsDeleting(false);
      // Simulate redirect after 2 seconds
      setTimeout(() => {
        handleCloseModal();
        // In real implementation: navigate('/login')
      }, 2000);
    } else {
      setError(ui.somethingWentWrong);
      setIsDeleting(false);
    }
  };

  const isDeleteEnabled =
    confirmText === deleteConfirmationText &&
    confirmEmail.toLowerCase() === userEmail.toLowerCase() &&
    isChecked &&
    !isDeleting &&
    !isSuccess;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/account-hub"
          className="h-10 w-10 sm:w-11 sm:h-11 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
          title={ui.backToAccount}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{ui.pageTitle}</h1>
        <p className="text-gray-600">{ui.pageDescription}</p>
      </div>

      {/* Danger zone */}
      <div className="max-w-2xl">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-gray-900">{ui.dangerZone}</h2>
          </div>
          <div className="px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">{ui.deleteAccount}</h3>
                <p className="text-sm text-gray-600">{ui.deleteAccountDescription}</p>
              </div>
              <button
                onClick={handleOpenModal}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-sm whitespace-nowrap"
              >
                {ui.deleteMyAccount}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deletion Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl max-w-md w-full z-50 mx-4 max-h-[90vh] overflow-y-auto">
            <Dialog.Description className="sr-only">
              {ui.confirmDeletionDescription}
            </Dialog.Description>

            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {ui.deleteYourAccount}
              </Dialog.Title>
              {!isDeleting && !isSuccess && (
                <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </Dialog.Close>
              )}
            </div>

            {/* Modal body */}
            <div className="px-6 py-4">
              {/* Success state */}
              {isSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{ui.accountDeleted}</h3>
                  <p className="text-sm text-gray-600">
                    {ui.accountDeletedMessage}
                  </p>
                </div>
              ) : (
                <>
                  {/* Warning banner */}
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-red-900 mb-2">
                          {ui.permanentAction}
                        </h4>
                        <ul className="space-y-1.5 text-sm text-red-800">
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold mt-0.5">•</span>
                            <span>{ui.allDataDeleted}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold mt-0.5">•</span>
                            <span>{ui.loseAccess}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold mt-0.5">•</span>
                            <span>{ui.cannotRecover}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Error banner */}
                  {error && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800 font-medium">{error}</p>
                    </div>
                  )}

                  {/* Email confirmation */}
                  {userEmail && (
                    <div className="mb-4">
                      <label htmlFor="email-confirm" className="block text-sm font-semibold text-gray-900 mb-2">
                        {ui.confirmEmailAddress}
                      </label>
                      <p className="text-sm text-gray-600 mb-2">
                        {ui.typeEmailToConfirm} <span className="font-semibold text-gray-900">{userEmail}</span> {ui.toConfirm}
                      </p>
                      <input
                        id="email-confirm"
                        type="email"
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                        placeholder={userEmail}
                        disabled={isDeleting}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  )}

                  {/* Confirmation text input */}
                  <div className="mb-4">
                    <label htmlFor="delete-confirm" className="block text-sm font-semibold text-gray-900 mb-2">
                      {ui.confirmTextLabel}
                    </label>
                    <input
                      id="delete-confirm"
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                      placeholder={deleteConfirmationText}
                      disabled={isDeleting}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 uppercase"
                    />
                  </div>

                  {/* Confirmation checkbox */}
                  <div className="mb-6">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => setIsChecked(e.target.checked)}
                        disabled={isDeleting}
                        className="mt-0.5 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 disabled:opacity-50 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 select-none">
                        {ui.understandPermanent} <span className="font-semibold text-gray-900">{ui.permanentAndIrreversible}</span>
                      </span>
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Modal footer */}
            {!isSuccess && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end rounded-b-xl sticky bottom-0">
                <Dialog.Close asChild>
                  <button
                    disabled={isDeleting}
                    className="px-4 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ui.cancel}
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleDeleteAccount}
                  disabled={!isDeleteEnabled}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {ui.deletingAccount}
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      {ui.deleteForever}
                    </>
                  )}
                </button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
