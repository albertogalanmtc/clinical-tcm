import { useState, useRef, useEffect } from 'react';
import { GripVertical, Minimize2, Maximize2, X } from 'lucide-react';
import { getNotes, saveNotes } from '../services/notesService';

interface FloatingNotesProps {
  isVisible: boolean;
  onClose: () => void;
}

export function FloatingNotes({ isVisible, onClose }: FloatingNotesProps) {
  console.log('📝 FloatingNotes render - isVisible:', isVisible);

  const [isExpanded, setIsExpanded] = useState(true);
  const [notes, setNotes] = useState('');
  const [position, setPosition] = useState({ x: window.innerWidth - 370, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load notes from Supabase on mount
  useEffect(() => {
    const loadNotes = async () => {
      const savedNotes = await getNotes();
      setNotes(savedNotes);
    };

    loadNotes();

    const savedPosition = localStorage.getItem('tcm_notes_position');
    const savedExpanded = localStorage.getItem('tcm_notes_expanded');

    if (savedPosition && !isMobile) setPosition(JSON.parse(savedPosition));
    if (savedExpanded !== null) setIsExpanded(savedExpanded === 'true');
  }, [isMobile]);

  // Save notes to Supabase with debounce (wait 1 second after typing stops)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (notes !== undefined) {
        saveNotes(notes);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [notes]);

  // Save expanded state
  useEffect(() => {
    localStorage.setItem('tcm_notes_expanded', isExpanded.toString());
  }, [isExpanded]);

  // Save position
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('tcm_notes_position', JSON.stringify(position));
    }
  }, [position, isMobile]);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return; // Disable dragging on mobile
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMobile) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isMobile]);

  if (!isVisible) {
    console.log('📝 FloatingNotes NOT VISIBLE - returning null');
    return null;
  }

  console.log('📝 FloatingNotes IS VISIBLE - rendering panel, isMobile:', isMobile);

  // Mobile version - Full screen modal
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4">
        <div className="bg-yellow-50 rounded-t-2xl sm:rounded-2xl shadow-xl border-2 border-yellow-200 w-full sm:max-w-lg max-h-[90vh] sm:max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-yellow-200 bg-yellow-100 rounded-t-2xl flex-shrink-0">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-900">Clinical Notes</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-yellow-200 rounded transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-yellow-700" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 flex-1 overflow-hidden">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your clinical notes here..."
              className="w-full h-full p-3 bg-white text-gray-800 text-sm resize-none border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 placeholder:text-yellow-600/50"
              style={{
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Desktop version - Floating draggable
  return (
    <div
      ref={panelRef}
      className="fixed bg-yellow-50 rounded-lg shadow-xl border-2 border-yellow-200 z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isExpanded ? '320px' : '240px',
        cursor: isDragging ? 'grabbing' : 'auto',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-yellow-200 bg-yellow-100 rounded-t-lg cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-semibold text-yellow-900">Notes</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-yellow-200 rounded transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4 text-yellow-700" />
            ) : (
              <Maximize2 className="w-4 h-4 text-yellow-700" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-yellow-200 rounded transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-yellow-700" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your clinical notes here..."
            className="w-full h-64 p-2 bg-yellow-50 text-gray-800 text-sm resize-none border border-yellow-200 rounded focus:outline-none focus:ring-2 focus:ring-yellow-300 placeholder:text-yellow-600/50"
            style={{
              fontFamily: 'inherit',
            }}
          />
        </div>
      )}
    </div>
  );
}