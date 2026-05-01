import { useState, useEffect } from 'react';
import { Search, FileText, Calendar, User, Loader2 } from 'lucide-react';
import { newsService, type NewsArticle } from '@/app/services/newsService';
import { markSectionAsVisited } from '@/app/data/sectionVisits';
import { isItemViewed, markItemAsViewed } from '@/app/data/itemTracking';
import { NewsDetailModal } from '@/app/components/NewsDetailModal';

export default function News() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Mark section as visited
    markSectionAsVisited('news');

    const loadNews = async () => {
      setLoading(true);
      const data = await newsService.getActiveNews();
      setNews(data);
      if (data.length > 0 && !selectedNews) {
        const firstItem = data[0];
        setSelectedNews(firstItem);
        markItemAsViewed('news', firstItem.id);
      }
      setLoading(false);
    };

    loadNews();
  }, []);

  const handleSelectNews = (newsItem: NewsArticle) => {
    setSelectedNews(newsItem);
    markItemAsViewed('news', newsItem.id);
  };

  const isNewsNew = (newsItem: NewsArticle): boolean => {
    return !isItemViewed('news', newsItem.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const filteredNews = news.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      (item.author && item.author.toLowerCase().includes(query))
    );
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden sm:overflow-auto p-4 lg:p-6 pb-[86px] sm:pb-4 lg:pb-6 gap-4">
        {/* Two Column Layout */}
        <div className="max-w-7xl mx-auto w-full flex gap-4 lg:gap-6 flex-1 min-h-0 items-start">
          {/* Left Column: News List */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 sticky top-4 max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search news..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* News List */}
              <div className="flex-1 overflow-y-auto">
                {filteredNews.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No news found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredNews.map((item) => {
                      const isNew = isNewsNew(item);
                      return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectNews(item)}
                        className={`w-full text-left p-4 transition-colors ${
                          selectedNews?.id === item.id
                            ? 'bg-teal-50 hover:bg-teal-50'
                            : isNew
                            ? 'bg-teal-50/30 hover:bg-gray-50'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <h3 className={`text-sm font-medium leading-tight mb-2 ${
                          selectedNews?.id === item.id ? 'text-teal-900' : 'text-gray-900'
                        }`}>
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.summary}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(item.published_at).toLocaleDateString()}</span>
                          {item.author && (
                            <>
                              <span>•</span>
                              <User className="w-3 h-3" />
                              <span>{item.author}</span>
                            </>
                          )}
                        </div>
                      </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Right Column: News Details */}
          <main className="hidden lg:block flex-1 min-w-0 flex flex-col self-stretch h-[calc(100vh-6rem)] max-h-[calc(100vh-6rem)]">
            {selectedNews ? (
              <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-full min-h-0 overflow-hidden">
                {/* News Header */}
                <div className="flex-shrink-0 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {selectedNews.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedNews.published_at).toLocaleDateString()}</span>
                    </div>
                    {selectedNews.author && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{selectedNews.author}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-gray-700 italic mb-4">
                    {selectedNews.summary}
                  </p>
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 overflow-y-auto border-t border-gray-200 px-6 py-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedNews.content}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center h-full flex flex-col items-center justify-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No News Selected</h3>
                <p className="text-gray-600">Select a news item from the list to view details</p>
              </div>
            )}
          </main>
        </div>

        {/* Mobile View: Show news list */}
        <div className="lg:hidden flex flex-col gap-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news..."
              className="w-full h-10 pl-10 pr-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* News list container */}
          <div className="bg-white rounded-lg border border-gray-200 max-h-[calc(100vh-12rem)] overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {filteredNews.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No news found</p>
                </div>
              ) : (
                filteredNews.map((item) => {
                  const isNew = isNewsNew(item);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedNews(item);
                        setIsModalOpen(true);
                        markItemAsViewed('news', item.id);
                      }}
                      className={`w-full text-left p-4 transition-colors ${
                        isNew ? 'bg-teal-50/30 hover:bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <h3 className="text-sm font-medium leading-tight mb-2 text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.summary}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.published_at).toLocaleDateString()}</span>
                        {item.author && (
                          <>
                            <span>•</span>
                            <User className="w-3 h-3" />
                            <span>{item.author}</span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Mobile Modal */}
        {selectedNews && (
          <NewsDetailModal
            news={selectedNews}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedNews(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
