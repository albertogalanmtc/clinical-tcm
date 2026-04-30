/**
 * Normalizes a string for search comparison by:
 * - Converting to lowercase
 * - Removing accents and diacritics
 *
 * @param str - The string to normalize
 * @returns The normalized string
 */
export function normalizeForSearch(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
