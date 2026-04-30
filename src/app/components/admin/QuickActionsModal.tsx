import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { getQuickActions, updateQuickActions, publishQuickActions, type QuickActionItem } from '@/app/data/dashboardContent';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function QuickActionsModal({ isOpen, onClose, onSave }: QuickActionsModalProps) {
  const [actions, setActions] = useState<QuickActionItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      const quickActionsData = getQuickActions();
      if (quickActionsData?.actions) {
        setActions([...quickActionsData.actions]);
      }
    }
  }, [isOpen]);

  // Emit events for modal state changes (for hiding layout footers)
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('modal-opened'));
    } else {
      window.dispatchEvent(new CustomEvent('modal-closed'));
    }
  }, [isOpen]);

  const handleToggleAction = (actionId: string) => {
    setActions(prev =>
      prev.map(action =>
        action.id === actionId ? { ...action, enabled: !action.enabled } : action
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const quickActionsData = getQuickActions();
    if (quickActionsData) {
      updateQuickActions({
        ...quickActionsData,
        actions
      });
      // Publish immediately so changes appear in dashboard
      publishQuickActions();
    }

    onSave();
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-2xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col">
          <Dialog.Description className="sr-only">
            Configure quick actions visibility
          </Dialog.Description>

          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Configure Quick Actions
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-sm text-gray-600 mb-4">
                Enable or disable quick action cards that appear on the dashboard
              </p>

              <div className="space-y-3">
                {actions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{action.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                      <p className="text-xs text-gray-400 mt-1">Route: {action.to}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleAction(action.id)}
                      className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                        action.enabled ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          action.enabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer with Actions */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg bg-white hover:bg-gray-50 transition-colors font-medium"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
