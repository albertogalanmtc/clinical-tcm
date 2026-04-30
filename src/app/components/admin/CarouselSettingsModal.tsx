import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { type CarouselRatio } from '@/app/data/dashboardContent';

interface CarouselSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDesktopRatio: CarouselRatio;
  currentMobileRatio: CarouselRatio;
  currentTransitionInterval: number;
  onSave: (desktopRatio: CarouselRatio, mobileRatio: CarouselRatio, transitionInterval: number) => void;
}

export function CarouselSettingsModal({
  isOpen,
  onClose,
  currentDesktopRatio,
  currentMobileRatio,
  currentTransitionInterval,
  onSave
}: CarouselSettingsModalProps) {
  const [desktopRatio, setDesktopRatio] = useState<CarouselRatio>(currentDesktopRatio);
  const [mobileRatio, setMobileRatio] = useState<CarouselRatio>(currentMobileRatio);
  const [transitionInterval, setTransitionInterval] = useState(currentTransitionInterval);

  useEffect(() => {
    if (isOpen) {
      setDesktopRatio(currentDesktopRatio);
      setMobileRatio(currentMobileRatio);
      setTransitionInterval(currentTransitionInterval);
    }
  }, [isOpen, currentDesktopRatio, currentMobileRatio, currentTransitionInterval]);

  // Emit events for modal state changes (for hiding layout footers)
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('modal-opened'));
    } else {
      window.dispatchEvent(new CustomEvent('modal-closed'));
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(desktopRatio, mobileRatio, transitionInterval);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-2xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col">
          <Dialog.Description className="sr-only">
            Configure carousel aspect ratios and transition settings
          </Dialog.Description>

          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Carousel Settings
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Desktop Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Desktop Ratio</label>
                <div className="grid grid-cols-2 gap-4">
                  {(['16:9', 'fullscreen'] as CarouselRatio[]).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setDesktopRatio(ratio)}
                      className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                        desktopRatio === ratio
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {ratio === 'fullscreen' ? (
                        <div className={`mb-2 rounded border-2 flex items-center justify-center ${
                          desktopRatio === ratio ? 'border-teal-500' : 'border-gray-300'
                        }`} style={{ width: '80px', height: '45px' }}>
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">Full</span>
                          </div>
                        </div>
                      ) : (
                        <div className={`mb-2 rounded border-2 ${
                          desktopRatio === ratio ? 'border-teal-500' : 'border-gray-300'
                        }`} style={{ width: '80px', height: '45px' }}>
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded" />
                        </div>
                      )}
                      <span className={`text-sm font-medium ${
                        desktopRatio === ratio ? 'text-teal-700' : 'text-gray-700'
                      }`}>
                        {ratio === 'fullscreen' ? 'Fullscreen' : ratio}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Mobile Ratio</label>
                <div className="grid grid-cols-2 gap-4">
                  {(['9:16', 'fullscreen'] as CarouselRatio[]).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setMobileRatio(ratio)}
                      className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                        mobileRatio === ratio
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {ratio === 'fullscreen' ? (
                        <div className={`mb-2 rounded border-2 flex items-center justify-center ${
                          mobileRatio === ratio ? 'border-teal-500' : 'border-gray-300'
                        }`} style={{ width: '50px', height: '80px' }}>
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">Full</span>
                          </div>
                        </div>
                      ) : (
                        <div className={`mb-2 rounded border-2 ${
                          mobileRatio === ratio ? 'border-teal-500' : 'border-gray-300'
                        }`} style={{ width: '50px', height: '80px' }}>
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded" />
                        </div>
                      )}
                      <span className={`text-sm font-medium ${
                        mobileRatio === ratio ? 'text-teal-700' : 'text-gray-700'
                      }`}>
                        {ratio === 'fullscreen' ? 'Fullscreen' : ratio}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transition Interval */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Slide Transition Time</label>
                <div className="grid grid-cols-4 gap-3">
                  {[3, 5, 7, 10].map((seconds) => (
                    <button
                      key={seconds}
                      type="button"
                      onClick={() => setTransitionInterval(seconds)}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                        transitionInterval === seconds
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`text-2xl font-bold ${
                        transitionInterval === seconds ? 'text-teal-700' : 'text-gray-700'
                      }`}>
                        {seconds}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">seconds</span>
                    </button>
                  ))}
                </div>
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
                  Save Settings
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
