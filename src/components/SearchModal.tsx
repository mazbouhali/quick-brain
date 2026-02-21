import { useEffect, useRef } from 'react';
import { type Note, calculateFreshness, getFreshnessColor } from '../db/database';
import { formatDistanceToNow } from 'date-fns';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (query: string) => void;
  results: Note[];
  isSearching: boolean;
  onSelectNote: (id: string) => void;
}

export function SearchModal({ 
  isOpen, 
  onClose, 
  query, 
  onQueryChange, 
  results, 
  isSearching,
  onSelectNote 
}: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (id: string) => {
    onSelectNote(id);
    onClose();
    onQueryChange('');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-24"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-slate-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search notes... (title, content, or tags)"
              className="flex-1 bg-transparent text-lg text-white placeholder-slate-500 outline-none"
            />
            {query && (
              <button 
                onClick={() => onQueryChange('')}
                className="text-slate-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-8 text-center text-slate-400">
              Searching...
            </div>
          ) : query && results.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No notes found for "{query}"
            </div>
          ) : query && results.length > 0 ? (
            results.map(note => {
              const freshness = calculateFreshness(note);
              const freshnessColor = getFreshnessColor(freshness);
              
              return (
                <div
                  key={note.id}
                  onClick={() => handleSelect(note.id)}
                  className="p-4 border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: freshnessColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white">
                        {note.title || 'Untitled'}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                        {note.content.slice(0, 150)}...
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-slate-500">
                          {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                        </span>
                        {note.tags.length > 0 && (
                          <span className="text-xs text-blue-400">
                            {note.tags.map(t => `#${t}`).join(' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400">
              <p>Start typing to search your notes</p>
              <p className="text-sm mt-2 text-slate-500">Search by title, content, or tags</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Press ESC to close</span>
            {query && results.length > 0 && (
              <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
