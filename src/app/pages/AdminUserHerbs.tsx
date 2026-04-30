import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Leaf } from 'lucide-react';
import { useSwipeBack } from '../hooks/useSwipeBack';

export default function AdminUserHerbs() {
  const { userId } = useParams();
  
  // Enable swipe-to-go-back gesture on mobile
  useSwipeBack();

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 pb-20 sm:pb-4">
      {/* Back Navigation */}
      <Link 
        to={`/admin/users/${userId}`} 
        className="h-10 w-10 sm:w-11 sm:h-11 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
        title="Back to user detail"
      >
        <ChevronLeft className="w-5 h-5" />
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Herbs added</h1>
        </div>
        <p className="hidden sm:block text-gray-600">View all herbs added by this user</p>
      </div>

      {/* Content - Coming soon placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Detailed herb list view - Coming soon</p>
      </div>
    </div>
  );
}