import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Trash2, Edit2, MessageSquare, ChevronLeft, Loader2, X } from 'lucide-react';
import { dashboardMessagesService, type DashboardMessage } from '@/app/services/dashboardMessagesService';
import { DashboardMessageModal } from '@/app/components/admin/DashboardMessageModal';
import { toast } from 'sonner';

export default function AdminDashboardMessages() {
  const [messages, setMessages] = useState<DashboardMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<DashboardMessage | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);

  const loadMessages = async () => {
    setLoading(true);
    const data = await dashboardMessagesService.getAllMessages();
    setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    const success = await dashboardMessagesService.deleteMessage(itemToDelete.id);
    if (success) {
      toast.success('Message deleted successfully');
      loadMessages();
    } else {
      toast.error('Failed to delete message');
    }

    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleStatusToggle = async (message: DashboardMessage) => {
    const newStatus = message.status === 'active' ? 'inactive' : 'active';
    const updated = await dashboardMessagesService.updateMessage(message.id, { status: newStatus });

    if (updated) {
      toast.success(`Message ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      loadMessages();
    } else {
      toast.error('Failed to update message');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <>
      {/* Back Button + Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link
            to="/admin/dashboard-content"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-gray-300 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="sr-only">Back to Dashboard Content</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Messages</h1>
        </div>
        <p className="text-gray-600">Manage messages that appear on the user dashboard</p>
      </div>

      {/* Action Buttons */}
      <div className="mb-8 flex items-center justify-end">
        <button
          onClick={() => {
            setEditingMessage(null);
            setIsMessageModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Message
        </button>
      </div>

      {/* Messages Grid */}
      {messages.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Messages Yet</h3>
          <p className="text-gray-600 mb-4">Create your first dashboard message</p>
          <button
            onClick={() => {
              setEditingMessage(null);
              setIsMessageModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Message
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex-1">
                <div className="flex items-start gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                    {message.title}
                  </h3>
                  <button
                    onClick={() => handleStatusToggle(message)}
                    className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 transition-colors ${
                      message.status === 'active'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {message.status}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {message.content}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  {message.highlighted && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                      Highlighted
                    </span>
                  )}
                  {message.closeable && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                      Closeable
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingMessage(message);
                    setIsMessageModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setItemToDelete({ id: message.id, title: message.title });
                    setDeleteConfirmOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <DashboardMessageModal
        isOpen={isMessageModalOpen}
        onClose={() => {
          setIsMessageModalOpen(false);
          setEditingMessage(null);
        }}
        message={editingMessage}
        onSave={loadMessages}
      />

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-[100]">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Deletion
            </Dialog.Title>
            <Dialog.Description className="text-gray-600 mb-6">
              Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
            </Dialog.Description>
            <div className="flex gap-3 justify-end">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
