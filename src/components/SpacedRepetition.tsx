import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { type Note } from '../db/database';
import { formatDistanceToNow } from 'date-fns';

interface SpacedRepetitionProps {
  isOpen: boolean;
  onClose: () => void;
  currentNote: Note | undefined;
  remaining: number;
  showAnswer: boolean;
  loading: boolean;
  onReveal: () => void;
  onRate: (quality: number) => void;
  onFetch: () => void;
}

export function SpacedRepetition({
  isOpen,
  onClose,
  currentNote,
  remaining,
  showAnswer,
  loading,
  onReveal,
  onRate,
  onFetch,
}: SpacedRepetitionProps) {
  useEffect(() => {
    if (isOpen) {
      onFetch();
    }
  }, [isOpen, onFetch]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🧠</div>
              <div>
                <h2 className="text-xl font-bold text-white">Quiz Mode</h2>
                <p className="text-sm text-slate-400">
                  Test your memory with spaced repetition
                </p>
              </div>
            </div>
            {remaining > 0 && (
              <div className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm">
                {remaining} card{remaining !== 1 ? 's' : ''} left
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-5xl animate-pulse">🧠</div>
              <p className="text-slate-400 mt-4">Loading flashcards...</p>
            </div>
          ) : !currentNote ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
              <p className="text-slate-400 text-center max-w-md">
                No notes due for review right now. Mark notes as "Memorize" to add them to your flashcard deck.
              </p>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Card front (title) */}
              <div className="mb-4">
                <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                  <span>Created {formatDistanceToNow(currentNote.createdAt, { addSuffix: true })}</span>
                  {currentNote.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-blue-400">
                        {currentNote.tags.map(t => `#${t}`).join(' ')}
                      </span>
                    </>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {currentNote.title || 'Untitled'}
                </h3>
              </div>

              {/* Card back (content) */}
              <div className="flex-1 overflow-y-auto">
                {showAnswer ? (
                  <div className="p-4 bg-slate-700/30 rounded-xl markdown-content text-slate-200 animate-in fade-in duration-300">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {currentNote.content || '*No content*'}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div 
                    className="h-full min-h-48 flex items-center justify-center bg-slate-700/30 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-colors"
                    onClick={onReveal}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">🤔</div>
                      <p className="text-slate-400">
                        Try to recall the content...
                      </p>
                      <p className="text-sm text-slate-500 mt-2">
                        Click to reveal answer
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rating buttons */}
        {currentNote && showAnswer && (
          <div className="p-4 border-t border-slate-700/50 bg-slate-800/50">
            <p className="text-center text-sm text-slate-400 mb-3">
              How well did you remember this?
            </p>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => onRate(1)}
                className="p-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
              >
                <div className="text-lg">😵</div>
                <div className="text-xs mt-1">Forgot</div>
              </button>
              <button
                onClick={() => onRate(3)}
                className="p-3 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 rounded-lg transition-colors"
              >
                <div className="text-lg">😅</div>
                <div className="text-xs mt-1">Hard</div>
              </button>
              <button
                onClick={() => onRate(4)}
                className="p-3 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition-colors"
              >
                <div className="text-lg">🙂</div>
                <div className="text-xs mt-1">Good</div>
              </button>
              <button
                onClick={() => onRate(5)}
                className="p-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
              >
                <div className="text-lg">🤩</div>
                <div className="text-xs mt-1">Easy</div>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            Exit Quiz
          </button>
          {currentNote && !showAnswer && (
            <button
              onClick={onReveal}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Show Answer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
