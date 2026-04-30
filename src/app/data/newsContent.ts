// News Content Management

export interface NewsItem {
  id: string;
  title: string;
  summary: string; // Short summary for list
  content: string; // Full content
  date: string; // Publication date
  author?: string;
  enabled: boolean;
  order: number;
}

const NEWS_KEY = 'admin_news';
const NEWS_PUBLISHED_KEY = 'admin_news_published';

// Get all news (draft/admin view)
export function getNews(): NewsItem[] {
  try {
    const stored = localStorage.getItem(NEWS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading news:', error);
  }
  return [];
}

// Get published news (user view)
export function getNewsPublished(): NewsItem[] {
  try {
    const stored = localStorage.getItem(NEWS_PUBLISHED_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading published news:', error);
  }
  return [];
}

// Add new news
export function addNews(news: Omit<NewsItem, 'id' | 'order'>): void {
  const newsItems = getNews();
  const newNews: NewsItem = {
    ...news,
    id: Date.now().toString(),
    order: newsItems.length
  };
  newsItems.push(newNews);
  localStorage.setItem(NEWS_KEY, JSON.stringify(newsItems));
  window.dispatchEvent(new CustomEvent('news-updated'));
}

// Update news
export function updateNews(id: string, updates: Partial<NewsItem>): void {
  const newsItems = getNews();
  const index = newsItems.findIndex(n => n.id === id);
  if (index !== -1) {
    newsItems[index] = { ...newsItems[index], ...updates };
    localStorage.setItem(NEWS_KEY, JSON.stringify(newsItems));
    window.dispatchEvent(new CustomEvent('news-updated'));
  }
}

// Delete news
export function deleteNews(id: string): void {
  const newsItems = getNews().filter(n => n.id !== id);
  localStorage.setItem(NEWS_KEY, JSON.stringify(newsItems));
  window.dispatchEvent(new CustomEvent('news-updated'));
}

// Reorder news
export function reorderNews(newsItems: NewsItem[]): void {
  newsItems.forEach((news, index) => {
    news.order = index;
  });
  localStorage.setItem(NEWS_KEY, JSON.stringify(newsItems));
  window.dispatchEvent(new CustomEvent('news-updated'));
}

// Publish news
export function publishNews(): void {
  const draft = getNews();
  localStorage.setItem(NEWS_PUBLISHED_KEY, JSON.stringify(draft));
  window.dispatchEvent(new CustomEvent('news-updated'));
}

// Check if there are unpublished changes
export function hasUnpublishedNewsChanges(): boolean {
  const draft = getNews();
  const published = getNewsPublished();
  return JSON.stringify(draft) !== JSON.stringify(published);
}
