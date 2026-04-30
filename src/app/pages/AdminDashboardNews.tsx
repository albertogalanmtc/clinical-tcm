import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Trash2, Edit2, Newspaper, ChevronLeft, BarChart3, Loader2, X } from 'lucide-react';
import { newsService, type NewsArticle } from '@/app/services/newsService';
import { NewsModal } from '@/app/components/admin/NewsModal';
import { NewsDetailModal } from '@/app/components/admin/NewsDetailModal';
import { ContentAnalyticsModal } from '@/app/components/admin/ContentAnalyticsModal';
import { toast } from 'sonner';

export default function AdminDashboardNews() {
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsContent, setAnalyticsContent] = useState<{ id: string; title: string } | null>(null);

  const loadNews = async () => {
    setLoading(true);
    const data = await newsService.getAllNews();
    setNewsItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
  }, []);

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    const success = await newsService.deleteNews(itemToDelete.id);
    if (success) {
      toast.success('News deleted successfully');
      loadNews();
    } else {
      toast.error('Failed to delete news');
    }

    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleStatusToggle = async (newsItem: NewsArticle) => {
    const newStatus = newsItem.status === 'active' ? 'inactive' : 'active';
    const updated = await newsService.updateNews(newsItem.id, { status: newStatus });

    if (updated) {
      toast.success(`News ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      loadNews();
    } else {
      toast.error('Failed to update news');
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
          <h1 className="text-3xl font-bold text-gray-900">News</h1>
        </div>
        <p className="text-gray-600">Publish news articles and updates for users</p>
      </div>

      {/* Action Buttons */}
      <div className="mb-8 flex items-center justify-end">
        <button
          onClick={() => {
            setEditingNews(null);
            setIsNewsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add News
        </button>
      </div>

      {/* News Grid */}
      {newsItems.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Newspaper className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No News Yet</h3>
          <p className="text-gray-600 mb-4">Create your first news article to get started</p>
          <button
            onClick={() => {
              setEditingNews(null);
              setIsNewsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add News
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsItems.map((news) => (
            <div
              key={news.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <div
                onClick={() => {
                  setSelectedNews(news);
                  setIsDetailModalOpen(true);
                }}
                className="p-4 flex flex-col flex-1 cursor-pointer"
              >
                <div className="flex items-start gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
                    {news.title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusToggle(news);
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 transition-colors ${
                      news.status === 'active'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {news.status}
                  </button>
                </div>
                {news.summary && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {news.summary}
                  </p>
                )}
                <div className="text-xs text-gray-500 mb-3">
                  {news.published_at && new Date(news.published_at).toLocaleDateString()}
                  {news.author && ` • ${news.author}`}
                </div>
              </div>
              <div className="p-4 pt-0 space-y-2">
                {/* Analytics Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAnalyticsContent({ id: news.id, title: news.title });
                    setAnalyticsOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  View Analytics
                </button>
                {/* Edit/Delete Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingNews(news);
                      setIsNewsModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete({ id: news.id, title: news.title });
                      setDeleteConfirmOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <NewsModal
        isOpen={isNewsModalOpen}
        onClose={() => {
          setIsNewsModalOpen(false);
          setEditingNews(null);
        }}
        news={editingNews}
        onSave={loadNews}
      />

      {/* Detail Modal */}
      {selectedNews && (
        <NewsDetailModal
          news={selectedNews}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedNews(null);
          }}
          onEdit={() => {
            setEditingNews(selectedNews);
            setIsDetailModalOpen(false);
            setIsNewsModalOpen(true);
          }}
          onDelete={() => {
            setItemToDelete({ id: selectedNews.id, title: selectedNews.title });
            setIsDetailModalOpen(false);
            setDeleteConfirmOpen(true);
          }}
        />
      )}

      {/* Analytics Modal */}
      {analyticsContent && (
        <ContentAnalyticsModal
          isOpen={analyticsOpen}
          onClose={() => {
            setAnalyticsOpen(false);
            setAnalyticsContent(null);
          }}
          contentType="news"
          contentId={analyticsContent.id}
          contentTitle={analyticsContent.title}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-[100]">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar eliminación
            </Dialog.Title>
            <Dialog.Description className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar "{itemToDelete?.title}"? Esta acción no se puede deshacer.
            </Dialog.Description>
            <div className="flex gap-3 justify-end">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
