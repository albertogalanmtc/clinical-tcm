import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if this is an old edit route that no longer exists
    const path = location.pathname;
    
    // Redirect old admin content edit routes to the content page
    if (path.includes('/admin/content/herbs/') && path.includes('/edit')) {
      console.log('Redirecting from old herb edit route:', path);
      navigate('/admin/content', { replace: true });
      return;
    }
    
    if (path.includes('/admin/content/formulas/') && path.includes('/edit')) {
      console.log('Redirecting from old formula edit route:', path);
      navigate('/admin/content', { replace: true });
      return;
    }

    // Log the 404 for debugging
    console.log('404 Error - Route not found:', path);
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
        >
          Go back
        </button>
      </div>
    </div>
  );
}