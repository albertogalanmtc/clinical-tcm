import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function CreateUserDataViews() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const createViews = async () => {
    setLoading(true);
    setResults([]);
    const logs: string[] = [];

    try {
      // Create view for banner dismissals with user info
      const bannerViewSQL = `
        CREATE OR REPLACE VIEW banner_dismissals_with_user AS
        SELECT
          bd.id,
          bd.banner_id,
          bd.user_id,
          bd.dismissed_at,
          bd.created_at,
          u.first_name,
          u.last_name,
          u.email,
          u.country
        FROM banner_dismissals bd
        LEFT JOIN users u ON bd.user_id = u.id;
      `;

      const { error: bannerError } = await supabase.rpc('exec_sql', {
        sql: bannerViewSQL
      });

      if (bannerError) {
        logs.push('❌ Error creating banner_dismissals_with_user view');
        logs.push('Error: ' + bannerError.message);
        logs.push('');
        logs.push('⚠️ You need to run this SQL manually in Supabase SQL Editor:');
        logs.push('');
        logs.push(bannerViewSQL);
      } else {
        logs.push('✅ Created view: banner_dismissals_with_user');
      }

      // Create view for survey responses with user info
      const surveyViewSQL = `
        CREATE OR REPLACE VIEW survey_responses_with_user AS
        SELECT
          sr.id,
          sr.survey_id,
          sr.user_id,
          sr.answers,
          sr.created_at,
          u.first_name,
          u.last_name,
          u.email,
          u.country
        FROM survey_responses sr
        LEFT JOIN users u ON sr.user_id = u.id;
      `;

      const { error: surveyError } = await supabase.rpc('exec_sql', {
        sql: surveyViewSQL
      });

      if (surveyError) {
        logs.push('❌ Error creating survey_responses_with_user view');
        logs.push('Error: ' + surveyError.message);
        logs.push('');
        logs.push('⚠️ You need to run this SQL manually in Supabase SQL Editor:');
        logs.push('');
        logs.push(surveyViewSQL);
      } else {
        logs.push('✅ Created view: survey_responses_with_user');
      }

      // Create view for community posts with user info
      const communityPostsViewSQL = `
        CREATE OR REPLACE VIEW community_posts_with_user AS
        SELECT
          cp.id,
          cp.title,
          cp.content,
          cp.author_id,
          cp.author_name,
          cp.category,
          cp.tags,
          cp.upvotes,
          cp.view_count,
          cp.comment_count,
          cp.is_pinned,
          cp.status,
          cp.created_at,
          cp.updated_at,
          u.first_name,
          u.last_name,
          u.email,
          u.country
        FROM community_posts cp
        LEFT JOIN users u ON cp.author_id = u.id;
      `;

      const { error: postsError } = await supabase.rpc('exec_sql', {
        sql: communityPostsViewSQL
      });

      if (postsError) {
        logs.push('❌ Error creating community_posts_with_user view');
        logs.push('Error: ' + postsError.message);
        logs.push('');
        logs.push('⚠️ You need to run this SQL manually in Supabase SQL Editor:');
        logs.push('');
        logs.push(communityPostsViewSQL);
      } else {
        logs.push('✅ Created view: community_posts_with_user');
      }

      // Create view for community comments with user info
      const communityCommentsViewSQL = `
        CREATE OR REPLACE VIEW community_comments_with_user AS
        SELECT
          cc.id,
          cc.post_id,
          cc.author_id,
          cc.author_name,
          cc.content,
          cc.upvotes,
          cc.parent_comment_id,
          cc.status,
          cc.created_at,
          cc.updated_at,
          u.first_name,
          u.last_name,
          u.email,
          u.country
        FROM community_comments cc
        LEFT JOIN users u ON cc.author_id = u.id;
      `;

      const { error: commentsError } = await supabase.rpc('exec_sql', {
        sql: communityCommentsViewSQL
      });

      if (commentsError) {
        logs.push('❌ Error creating community_comments_with_user view');
        logs.push('Error: ' + commentsError.message);
        logs.push('');
        logs.push('⚠️ You need to run this SQL manually in Supabase SQL Editor:');
        logs.push('');
        logs.push(communityCommentsViewSQL);
      } else {
        logs.push('✅ Created view: community_comments_with_user');
      }

      setResults(logs);

      if (!bannerError && !surveyError && !postsError && !commentsError) {
        toast.success('All views created successfully!');
      } else {
        toast.error('Please run the SQL manually in Supabase');
      }
    } catch (error) {
      logs.push('❌ Unexpected error: ' + (error as Error).message);
      setResults(logs);
      toast.error('Error creating views');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create User Data Views
          </h1>

          <p className="text-gray-600 mb-6">
            This will create SQL views in Supabase that show user information (name, email, country)
            alongside banner dismissals and survey responses.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">What this does:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Creates <code className="bg-blue-100 px-1 rounded">banner_dismissals_with_user</code> view</li>
              <li>• Creates <code className="bg-blue-100 px-1 rounded">survey_responses_with_user</code> view</li>
              <li>• Creates <code className="bg-blue-100 px-1 rounded">community_posts_with_user</code> view</li>
              <li>• Creates <code className="bg-blue-100 px-1 rounded">community_comments_with_user</code> view</li>
              <li>• You can query these views in Supabase to see user details</li>
            </ul>
          </div>

          <button
            onClick={createViews}
            disabled={loading}
            className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Creating Views...' : 'Create Views'}
          </button>

          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Results:</h3>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                {results.join('\n')}
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="font-medium text-gray-900 mb-3">Manual SQL (if needed):</h3>
            <p className="text-sm text-gray-600 mb-3">
              If the automatic creation fails, copy and run these SQL commands in Supabase SQL Editor:
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Banner Dismissals View:</h4>
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
{`CREATE OR REPLACE VIEW banner_dismissals_with_user AS
SELECT
  bd.id,
  bd.banner_id,
  bd.user_id,
  bd.dismissed_at,
  bd.created_at,
  u.first_name,
  u.last_name,
  u.email,
  u.country
FROM banner_dismissals bd
LEFT JOIN users u ON bd.user_id = u.id;`}
                </pre>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Survey Responses View:</h4>
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
{`CREATE OR REPLACE VIEW survey_responses_with_user AS
SELECT
  sr.id,
  sr.survey_id,
  sr.user_id,
  sr.answers,
  sr.created_at,
  u.first_name,
  u.last_name,
  u.email,
  u.country
FROM survey_responses sr
LEFT JOIN users u ON sr.user_id = u.id;`}
                </pre>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Community Posts View:</h4>
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
{`CREATE OR REPLACE VIEW community_posts_with_user AS
SELECT
  cp.id,
  cp.title,
  cp.content,
  cp.author_id,
  cp.author_name,
  cp.category,
  cp.tags,
  cp.upvotes,
  cp.view_count,
  cp.comment_count,
  cp.is_pinned,
  cp.status,
  cp.created_at,
  cp.updated_at,
  u.first_name,
  u.last_name,
  u.email,
  u.country
FROM community_posts cp
LEFT JOIN users u ON cp.author_id = u.id;`}
                </pre>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Community Comments View:</h4>
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
{`CREATE OR REPLACE VIEW community_comments_with_user AS
SELECT
  cc.id,
  cc.post_id,
  cc.author_id,
  cc.author_name,
  cc.content,
  cc.upvotes,
  cc.parent_comment_id,
  cc.status,
  cc.created_at,
  cc.updated_at,
  u.first_name,
  u.last_name,
  u.email,
  u.country
FROM community_comments cc
LEFT JOIN users u ON cc.author_id = u.id;`}
                </pre>
              </div>
            </div>

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> After creating the views, you can find them in Supabase under
                "Table Editor" → Look for tables with a "view" icon. You can query them like regular tables.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
