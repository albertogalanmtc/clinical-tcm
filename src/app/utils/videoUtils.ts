// Video URL utilities for YouTube and Vimeo

export function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  // YouTube patterns
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0&rel=0`;
  }

  // Vimeo patterns
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:video\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
}

export function isValidVideoUrl(url: string): boolean {
  return getEmbedUrl(url) !== null;
}

export function getVideoProvider(url: string): 'youtube' | 'vimeo' | null {
  if (!url) return null;

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }

  if (url.includes('vimeo.com')) {
    return 'vimeo';
  }

  return null;
}
