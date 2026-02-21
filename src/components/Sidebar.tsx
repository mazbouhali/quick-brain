import { type Note, calculateFreshness, getFreshnessColor, getFreshnessLabel } from '../db/database';
import { formatDistanceToNow } from 'date-fns';

interface SidebarProps {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  theme: 'light' | 'dark';
}

export function Sidebar({ notes, selectedId, onSelect, tags, selectedTag, onSelectTag, theme }: SidebarProps) {
  const isDark = theme === 'dark';
  const filteredNotes = selectedTag 
    ? notes.filter(note => note.tags.includes(selectedTag))
    : notes;

  return (
    <div className={`w-72 border-r flex flex-col h-full ${isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'}`}>
      {/* Tags filter */}
      {tags.length > 0 && (
        <div className={`p-3 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onSelectTag(null)}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                !selectedTag 
                  ? 'bg-blue-600 text-white' 
                  : isDark 
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  selectedTag === tag 
                    ? 'bg-blue-600 text-white' 
                    : isDark 
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className={`p-4 text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            <p>No notes yet</p>
            <p className="text-sm mt-1">Create your first note!</p>
          </div>
        ) : (
          filteredNotes.map(note => {
            const freshness = calculateFreshness(note);
            const freshnessColor = getFreshnessColor(freshness);
            
            return (
              <div
                key={note.id}
                onClick={() => onSelect(note.id)}
                className={`note-item p-3 cursor-pointer ${
                  isDark 
                    ? `border-b border-slate-700/50 hover:bg-slate-700/50 ${selectedId === note.id ? 'bg-slate-700' : ''}`
                    : `border-b border-gray-100 hover:bg-gray-100 ${selectedId === note.id ? 'bg-gray-200' : ''}`
                }`}
              >
                <div className="flex items-start gap-2">
                  {/* Freshness indicator */}
                  <div 
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      freshness > 0.7 ? 'freshness-fresh' : ''
                    }`}
                    style={{ backgroundColor: freshnessColor }}
                    title={getFreshnessLabel(freshness)}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium truncate ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
                      {note.title || 'Untitled'}
                    </h3>
                    <p className={`text-sm truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {note.content.slice(0, 60) || 'No content'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                        {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                      </span>
                      {note.memorize && (
                        <span className="text-xs" title="In flashcard deck">🧠</span>
                      )}
                      {note.tags.length > 0 && (
                        <span className="text-xs text-blue-400">
                          #{note.tags[0]}
                          {note.tags.length > 1 && ` +${note.tags.length - 1}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats footer */}
      <div className={`p-3 border-t text-xs ${isDark ? 'border-slate-700 text-slate-500' : 'border-gray-200 text-gray-400'}`}>
        <div className="flex justify-between">
          <span>{filteredNotes.length} notes</span>
          <span>
            {notes.filter(n => calculateFreshness(n) < 0.3).length} forgotten
          </span>
        </div>
      </div>
    </div>
  );
}
