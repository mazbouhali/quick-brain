import { type Note } from '../db/database';
import { format } from 'date-fns';

interface OnThisDayProps {
  periods: { period: string; notes: Note[] }[];
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (id: string) => void;
}

export function OnThisDay({ periods, isOpen, onClose, onSelectNote }: OnThisDayProps) {
  if (!isOpen) return null;

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
        className="w-full max-w-lg bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 text-center border-b border-slate-700/50">
          <div className="text-4xl mb-2">📅</div>
          <h2 className="text-xl font-bold text-white">On This Day</h2>
          <p className="text-sm text-slate-400 mt-1">
            {format(new Date(), 'MMMM d')} - Notes from the past
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {periods.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4 opacity-50">🌱</div>
              <p className="text-slate-400">No notes from this day in the past</p>
              <p className="text-sm text-slate-500 mt-2">
                Keep writing! Future you will thank you.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {periods.map(({ period, notes }) => (
                <div key={period}>
                  <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    {period}
                  </h3>
                  <div className="space-y-2">
                    {notes.map(note => (
                      <div
                        key={note.id}
                        onClick={() => handleSelect(note.id)}
                        className="p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                      >
                        <h4 className="font-medium text-white">
                          {note.title || 'Untitled'}
                        </h4>
                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                          {note.content.slice(0, 100)}...
                        </p>
                        {note.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {note.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs px-1.5 py-0.5 bg-blue-600/30 text-blue-300 rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
