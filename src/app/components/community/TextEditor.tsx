import { useRef, useEffect } from 'react';
import { Bold, Italic, Underline } from 'lucide-react';
import { communityTextToHtml, htmlToCommunityText } from '@/app/utils/communityContent';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function TextEditor({ value, onChange, placeholder, className = '', minHeight = '120px' }: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Update editor content when value prop changes
  useEffect(() => {
    if (!editorRef.current || isUpdatingRef.current) return;

    const htmlContent = communityTextToHtml(value);

    if (editorRef.current.innerHTML !== htmlContent) {
      editorRef.current.innerHTML = htmlContent;
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;

    isUpdatingRef.current = true;

    const htmlContent = editorRef.current.innerHTML;
    const textContent = htmlToCommunityText(htmlContent);

    onChange(textContent);

    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  };

  const applyFormat = (command: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false);
      handleInput();
    }
  };

  const handleBold = () => applyFormat('bold');
  const handleItalic = () => applyFormat('italic');
  const handleUnderline = () => applyFormat('underline');

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 px-2 py-1.5 flex gap-1">
        <button
          type="button"
          onClick={handleBold}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={handleUnderline}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      {/* Editable content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className={`w-full px-4 py-3 focus:outline-none overflow-y-auto ${className}`}
        style={{ minHeight }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      <style>{`
        [contentEditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        [contentEditable] strong,
        [contentEditable] b {
          font-weight: 700 !important;
        }
        [contentEditable] em,
        [contentEditable] i {
          font-style: italic !important;
        }
        [contentEditable] u {
          text-decoration: underline !important;
        }
      `}</style>
    </div>
  );
}
