import { Users, ExternalLink } from 'lucide-react';
import { getCommunityCardPublished } from '@/app/data/dashboardContent';

interface CommunityCardProps {
  isAlone?: boolean; // True when no other content (messages/slides) is present
}

export function CommunityCard({ isAlone = false }: CommunityCardProps) {
  const communityCard = getCommunityCardPublished();

  if (!communityCard || !communityCard.enabled) {
    return null;
  }

  const CardContent = (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
          <Users className="w-6 h-6 text-purple-600" />
        </div>
        {communityCard.externalUrl && (
          <ExternalLink className="w-5 h-5 text-gray-400" />
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {communityCard.title}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {communityCard.description}
      </p>
      {communityCard.buttonText && (
        <button className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm">
          {communityCard.buttonText}
        </button>
      )}
    </>
  );

  return (
    <div className="max-w-5xl mx-auto mb-6">
      {communityCard.externalUrl ? (
        <a
          href={communityCard.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 hover:border-purple-400 hover:shadow-lg transition-all"
        >
          {CardContent}
        </a>
      ) : (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
          {CardContent}
        </div>
      )}
    </div>
  );
}
