import { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import { dashboardMessagesService, type DashboardMessage } from '@/app/services/dashboardMessagesService';
import { getDismissedMessages, dismissMessage } from '@/app/services/messageDismissalsService';

export function DashboardMessages() {
  const [messages, setMessages] = useState<DashboardMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedMessagesSet, setDismissedMessagesSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMessages();
    loadDismissedMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    const data = await dashboardMessagesService.getActiveMessages();
    setMessages(data);
    setLoading(false);
  };

  const loadDismissedMessages = async () => {
    const dismissed = await getDismissedMessages();
    setDismissedMessagesSet(dismissed);
  };

  const handleDismiss = async (messageId: string) => {
    console.log('📨 DashboardMessages - Dismissing message:', messageId);

    // Optimistically update UI
    const newDismissed = new Set(dismissedMessagesSet);
    newDismissed.add(messageId);
    setDismissedMessagesSet(newDismissed);

    // Save to Supabase (and localStorage as fallback)
    const success = await dismissMessage(messageId);

    if (success) {
      console.log('✅ DashboardMessages - Message dismissed successfully');
    } else {
      console.log('⚠️ DashboardMessages - Message dismissed (localStorage fallback)');
    }
  };

  const getMessageColor = (highlighted: boolean) => {
    return highlighted ? 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200' : 'bg-white border-gray-200';
  };

  if (loading) {
    return null;
  }

  const visibleMessages = messages.filter(
    (message) => !dismissedMessagesSet.has(message.id)
  );

  if (visibleMessages.length === 0) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto mb-6">
      <div className="space-y-4">
        {visibleMessages.map((message) => (
          <div
            key={message.id}
            className={`rounded-lg border p-8 relative ${getMessageColor(message.highlighted)}`}
          >
            {message.closeable && (
              <button
                onClick={() => handleDismiss(message.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close message"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <div className="text-center">
              <h3 className="font-semibold mb-3 text-gray-900 text-3xl">
                {message.title}
              </h3>
              <p className="text-xl text-gray-700">
                {message.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
