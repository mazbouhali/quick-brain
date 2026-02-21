import { type Note, calculateFreshness, getFreshnessColor, getFreshnessLabel } from '../db/database';
import { formatDistanceToNow } from 'date-fns';

interface ResurfaceWidgetProps {
  notes: Note[];
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (id: string) => void;
}

export function ResurfaceWidget({ notes, isOpen, onClose, onSelectNote }: ResurfaceWidgetProps) {
  if (!isOpen || notes.length === 0) return null;

  const handleSelect = (id: string) => {
    onSelectNote(id);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 text-center border-b border-slate-700/50">
          <div className="text-4xl mb-2">🔮</div>
          <h2 className="text-xl font-bold text-white">Remember These?</h2>
          <p className="text-sm text-slate-400 mt-1">
            Notes you haven't seen in a while
          </p>
        </div>

        {/* Notes */}
        <div className="p-4 space-y-3">
          {notes.map(note => {
            const freshness = calculateFreshness(note);
            const freshnessColor = getFreshnessColor(freshness);
            
            return (
              <div
                key={note.id}
                onClick={() => handleSelect(note.id)}
                className="p-4 bg-slate-700/50 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: freshnessColor }}
                    title={getFreshnessLabel(freshness)}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {note.title || 'Untitled'}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {note.content.slice(0, 120)}...
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-500">
                        Created {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                      </span>
                      <span className="text-xs text-orange-400">
                        Last seen {formatDistanceToNow(note.lastViewedAt, { addSuffix: true })}
                      </span>
                    </div>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-blue-600/30 text-blue-300 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            Resurfacing forgotten knowledge ✨
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
