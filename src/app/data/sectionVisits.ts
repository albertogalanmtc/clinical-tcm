// Section Visit Tracking for notification badges

const VISITS_KEY = 'section_last_visits';

export type SectionType = 'news' | 'promos' | 'community' | 'courses' | 'research';

interface SectionVisits {
  [key: string]: string; // section name -> ISO timestamp
}

function getVisits(): SectionVisits {
  try {
    const stored = localStorage.getItem(VISITS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading section visits:', error);
  }
  return {};
}

function saveVisits(visits: SectionVisits): void {
  try {
    localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
    window.dispatchEvent(new CustomEvent('section-visits-updated'));
  } catch (error) {
    console.error('Error saving section visits:', error);
  }
}

// Mark a section as visited (called when user enters the section)
export function markSectionAsVisited(section: SectionType): void {
  const visits = getVisits();
  visits[section] = new Date().toISOString();
  saveVisits(visits);
}

// Get the last visit timestamp for a section
export function getLastVisit(section: SectionType): Date | null {
  const visits = getVisits();
  const timestamp = visits[section];
  return timestamp ? new Date(timestamp) : null;
}

// Count new items in a section since last visit
export function getNewItemsCount(section: SectionType, items: Array<{ createdAt?: string; publishedAt?: string }>): number {
  const lastVisit = getLastVisit(section);

  // If never visited, all items are new
  if (!lastVisit) {
    return items.length;
  }

  // Count items created after last visit
  return items.filter(item => {
    const itemDate = item.createdAt || item.publishedAt;
    if (!itemDate) return false;
    return new Date(itemDate) > lastVisit;
  }).length;
}
