import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { type Note } from '../db/database';
import { formatDistanceToNow } from 'date-fns';

interface SerendipityProps {
  notes: [Note, Note] | null;
  isOpen: boolean;
  onClose: () => void;
  onMash: () => void;
  onSelectNote: (id: string) => void;
  loading: boolean;
}

export function Serendipity({ notes, isOpen, onClose, onMash, onSelectNote, loading }: SerendipityProps) {
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
        className="w-full max-w-4xl bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 text-center border-b border-slate-700/50">
          <div className="text-4xl mb-2">🎲</div>
          <h2 className="text-xl font-bold text-white">Serendipity Mode</h2>
          <p className="text-sm text-slate-400 mt-1">
            Two random notes, side by side. Find unexpected connections!
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-5xl animate-bounce">🎲</div>
            </div>
          ) : !notes ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-5xl mb-4">✨</div>
              <p className="text-slate-400 text-center">
                Click the button below to mash two random notes together
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {notes.map((note, idx) => (
                <div
                  key={note.id}
                  className="flex flex-col bg-slate-700/30 rounded-xl overflow-hidden"
                >
                  {/* Note header */}
                  <div 
                    className="p-4 border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/50 transition-colors"
                    onClick={() => handleSelect(note.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-lg ${idx === 0 ? 'text-pink-400' : 'text-cyan-400'}`}>
                        {idx === 0 ? '🌸' : '🌊'}
                      </span>
                      <h3 className="font-bold text-white truncate hover:text-blue-300 transition-colors">
                        {note.title || 'Untitled'}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{formatDistanceToNow(note.createdAt, { addSuffix: true })}</span>
                      {note.tags.length > 0 && (
                        <span className="text-blue-400">
                          {note.tags.map(t => `#${t}`).join(' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Note content */}
                  <div className="flex-1 p-4 overflow-y-auto markdown-content text-sm text-slate-200">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {note.content || '*No content*'}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connection prompt */}
        {notes && (
          <div className="px-6 py-3 bg-gradient-to-r from-pink-900/30 to-cyan-900/30 text-center">
            <p className="text-sm text-slate-300">
              💡 <span className="italic">What connections can you find between these notes?</span>
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            Close
          </button>
          <button
            onClick={onMash}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <span>🎲</span>
            {notes ? 'Shuffle Again' : 'Mash Notes!'}
          </button>
        </div>
      </div>
    </div>
  );
}
