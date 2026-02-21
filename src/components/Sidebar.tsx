import { type Note, calculateFreshness, getFreshnessColor, getFreshnessLabel } from '../db/database';
import { formatDistanceToNow } from 'date-fns';

interface SidebarProps {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export function Sidebar({ notes, selectedId, onSelect, tags, selectedTag, onSelectTag }: SidebarProps) {
  const filteredNotes = selectedTag 
    ? notes.filter(note => note.tags.includes(selectedTag))
    : notes;

  return (
    <div className="w-72 border-r border-slate-700 flex flex-col bg-slate-800 h-full">
      {/* Tags filter */}
      {tags.length > 0 && (
        <div className="p-3 border-b border-slate-700">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onSelectTag(null)}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                !selectedTag 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
          <div className="p-4 text-center text-slate-500">
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
                className={`note-item p-3 border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/50 ${
                  selectedId === note.id ? 'bg-slate-700' : ''
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
                    <h3 className="font-medium text-slate-200 truncate">
                      {note.title || 'Untitled'}
                    </h3>
                    <p className="text-sm text-slate-400 truncate mt-0.5">
                      {note.content.slice(0, 60) || 'No content'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-slate-500">
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
      <div className="p-3 border-t border-slate-700 text-xs text-slate-500">
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
