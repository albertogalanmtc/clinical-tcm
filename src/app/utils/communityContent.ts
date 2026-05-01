const HTML_TAG_PATTERN = /<\s*\/?\s*[a-z][\s\S]*>/i;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function hasHtmlMarkup(value: string): boolean {
  return HTML_TAG_PATTERN.test(value);
}

function cleanSpacing(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function formatInlineMarkdown(value: string): string {
  const escaped = escapeHtml(value.replace(/\u00a0/g, ' '));

  return escaped
    .replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
}

function renderHtmlNodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent || '').replace(/\u00a0/g, ' ');
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();
  const children = Array.from(element.childNodes).map(renderHtmlNodeToMarkdown).join('');

  switch (tag) {
    case 'br':
      return '\n';
    case 'strong':
    case 'b':
      return `**${children}**`;
    case 'em':
    case 'i':
      return `*${children}*`;
    case 'u':
      return `<u>${children}</u>`;
    case 'p':
    case 'div':
    case 'section':
    case 'article':
    case 'blockquote':
      return children.trim() ? `${children}\n` : '\n';
    case 'li':
      return children.trim() ? `- ${children}\n` : '\n';
    case 'ul':
    case 'ol':
      return `${children}\n`;
    default:
      return children;
  }
}

function renderHtmlNodeToSafeHtml(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return formatInlineMarkdown((node.textContent || '').replace(/\n/g, ' '));
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();
  const children = Array.from(element.childNodes).map(renderHtmlNodeToSafeHtml).join('');

  switch (tag) {
    case 'br':
      return '<br />';
    case 'strong':
    case 'b':
      return `<strong>${children}</strong>`;
    case 'em':
    case 'i':
      return `<em>${children}</em>`;
    case 'u':
      return `<u>${children}</u>`;
    case 'a': {
      const href = element.getAttribute('href') || '#';
      return `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">${children}</a>`;
    }
    case 'p':
    case 'div':
    case 'section':
    case 'article':
    case 'blockquote': {
      const cleanChildren = children.trim();
      return cleanChildren ? `<p>${cleanChildren}</p>` : '';
    }
    case 'li': {
      const cleanChildren = children.trim();
      return cleanChildren ? `<li>${cleanChildren}</li>` : '';
    }
    case 'ul':
    case 'ol': {
      const cleanChildren = children.trim();
      return cleanChildren ? `<${tag}>${cleanChildren}</${tag}>` : '';
    }
    default:
      return children;
  }
}

export function htmlToCommunityText(htmlContent: string): string {
  const trimmed = htmlContent.trim();

  if (!trimmed) {
    return '';
  }

  if (!hasHtmlMarkup(trimmed)) {
    return cleanSpacing(trimmed);
  }

  if (typeof DOMParser === 'undefined') {
    return cleanSpacing(
      trimmed
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|li|section|article|blockquote)>/gi, '\n')
        .replace(/<[^>]+>/g, '')
    );
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(`<div>${trimmed}</div>`, 'text/html');
  const root = document.body.firstElementChild || document.body;
  const markdown = Array.from(root.childNodes).map(renderHtmlNodeToMarkdown).join('');

  return cleanSpacing(markdown);
}

export function communityTextToHtml(content: string): string {
  const trimmed = content.trim();

  if (!trimmed) {
    return '';
  }

  if (hasHtmlMarkup(trimmed)) {
    if (typeof DOMParser === 'undefined') {
      return cleanSpacing(
        trimmed
          .replace(/<br\s*\/?>/gi, '<br />')
          .replace(/<\/(p|div|li|section|article|blockquote)>/gi, '<br />')
          .replace(/<[^>]+>/g, '')
      );
    }

    const parser = new DOMParser();
    const document = parser.parseFromString(`<div>${trimmed}</div>`, 'text/html');
    const root = document.body.firstElementChild || document.body;
    const safeHtml = Array.from(root.childNodes).map(renderHtmlNodeToSafeHtml).join('');
    return cleanSpacing(safeHtml);
  }

  return cleanSpacing(trimmed)
    .replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([\s\S]*?)\*/g, '<em>$1</em>')
    .replace(/<u>([\s\S]*?)<\/u>/g, '<u>$1</u>')
    .replace(/\n/g, '<br />');
}
