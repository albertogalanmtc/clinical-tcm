import { AlertCircle, ExternalLink } from 'lucide-react';
import { type WelcomeMessage } from '@/app/data/dashboardContent';

interface WelcomeMessageCardProps {
  message: WelcomeMessage;
}

export function WelcomeMessageCard({ message }: WelcomeMessageCardProps) {
  if (!message.enabled) return null;

  return (
    <div
      className={`mb-6 rounded-lg border p-4 ${
        message.highlighted
          ? 'bg-green-50 border-green-200'
          : 'bg-blue-50 border-blue-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
            message.highlighted ? 'text-green-600' : 'text-blue-600'
          }`}
        />
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold mb-1 ${
              message.highlighted ? 'text-green-900' : 'text-blue-900'
            }`}
          >
            {message.title}
          </h3>
          <p
            className={`text-sm ${
              message.highlighted ? 'text-green-800' : 'text-blue-800'
            }`}
          >
            {message.content}
          </p>
          {message.link && (
            <a
              href={message.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 mt-2 text-sm font-medium hover:underline ${
                message.highlighted ? 'text-green-700' : 'text-blue-700'
              }`}
            >
              Learn more
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
