import { useUser } from '../contexts/UserContext';
import { getCurrentUser } from '../data/communityPosts';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

export default function DebugUserInfo() {
  const userContext = useUser();
  const communityUser = getCurrentUser();
  const [supabaseSession, setSupabaseSession] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSupabaseSession(data.session);
    };
    getSession();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Debug User Info</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">UserContext (from useUser hook)</h2>
          <pre className="bg-gray-900 text-gray-100 rounded p-4 text-sm overflow-auto">
            {JSON.stringify({
              name: userContext.name,
              firstName: userContext.firstName,
              lastName: userContext.lastName,
              email: userContext.email,
              userId: userContext.userId,
              user: userContext.user,
              isAdmin: userContext.isAdmin
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Community User (from getCurrentUser)</h2>
          <pre className="bg-gray-900 text-gray-100 rounded p-4 text-sm overflow-auto">
            {JSON.stringify(communityUser, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Supabase Session</h2>
          {supabaseSession ? (
            <pre className="bg-gray-900 text-gray-100 rounded p-4 text-sm overflow-auto">
              {JSON.stringify({
                user_id: supabaseSession.user?.id,
                email: supabaseSession.user?.email,
                role: supabaseSession.user?.role,
              }, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-600">No Supabase session found</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">LocalStorage Data</h2>
          <pre className="bg-gray-900 text-gray-100 rounded p-4 text-sm overflow-auto">
            {JSON.stringify({
              supabase_user_id: sessionStorage.getItem('supabase_user_id'),
              userRole: localStorage.getItem('userRole'),
              userPlanType: localStorage.getItem('userPlanType'),
              userProfile: localStorage.getItem('userProfile'),
            }, null, 2)}
          </pre>
        </div>

        <div className={`bg-${communityUser.id.startsWith('user-demo') ? 'yellow' : 'green'}-50 border border-${communityUser.id.startsWith('user-demo') ? 'yellow' : 'green'}-200 rounded-lg p-4`}>
          <h3 className="font-semibold mb-2">Status:</h3>
          {communityUser.id.startsWith('user-demo') ? (
            <p className="text-yellow-800">
              ⚠️ User ID starts with "user-demo" - Posts and comments will NOT be saved to Supabase
            </p>
          ) : (
            <p className="text-green-800">
              ✅ User has valid Supabase ID - Posts and comments WILL be saved to Supabase
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
