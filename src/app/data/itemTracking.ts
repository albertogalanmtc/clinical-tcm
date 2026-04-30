// Track which specific items (courses, promos, news) have been seen

const VIEWED_ITEMS_KEY = 'viewed_items';

interface ViewedItems {
  [section: string]: string[]; // section -> array of item IDs
}

function getViewedItems(): ViewedItems {
  try {
    const stored = localStorage.getItem(VIEWED_ITEMS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading viewed items:', error);
  }
  return {};
}

function saveViewedItems(items: ViewedItems): void {
  try {
    localStorage.setItem(VIEWED_ITEMS_KEY, JSON.stringify(items));
    // Trigger update event so dashboard badges update
    window.dispatchEvent(new CustomEvent('section-visits-updated'));
  } catch (error) {
    console.error('Error saving viewed items:', error);
  }
}

// Mark all current items in a section as viewed
export function markAllItemsAsViewed(section: string, itemIds: string[]): void {
  const viewedItems = getViewedItems();
  viewedItems[section] = itemIds;
  saveViewedItems(viewedItems);
}

// Check if an item has been viewed
export function isItemViewed(section: string, itemId: string): boolean {
  const viewedItems = getViewedItems();
  const sectionItems = viewedItems[section] || [];
  return sectionItems.includes(itemId);
}

// Mark a single item as viewed
export function markItemAsViewed(section: string, itemId: string): void {
  const viewedItems = getViewedItems();
  if (!viewedItems[section]) {
    viewedItems[section] = [];
  }
  if (!viewedItems[section].includes(itemId)) {
    viewedItems[section].push(itemId);
    saveViewedItems(viewedItems);
  }
}
