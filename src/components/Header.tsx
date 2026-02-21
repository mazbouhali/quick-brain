interface HeaderProps {
  onNewNote: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenOnThisDay: () => void;
  onOpenSerendipity: () => void;
  onOpenQuiz: () => void;
  hasNotesForReview: boolean;
  hasOnThisDayNotes: boolean;
}

export function Header({
  onNewNote,
  onOpenSearch,
  onOpenSettings,
  onOpenOnThisDay,
  onOpenSerendipity,
  onOpenQuiz,
  hasNotesForReview,
  hasOnThisDayNotes,
}: HeaderProps) {
  return (
    <header className="h-14 border-b border-slate-700 bg-slate-800 flex items-center justify-between px-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🧠</span>
        <h1 className="text-lg font-bold text-white">Quick Brain</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* On This Day - only show if there are notes */}
        {hasOnThisDayNotes && (
          <button
            onClick={onOpenOnThisDay}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors group relative"
            title="On This Day"
          >
            <span className="text-xl">📅</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
          </button>
        )}

        {/* Serendipity */}
        <button
          onClick={onOpenSerendipity}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="Serendipity Mode"
        >
          <span className="text-xl">🎲</span>
        </button>

        {/* Quiz Mode */}
        <button
          onClick={onOpenQuiz}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors relative"
          title="Quiz Mode"
        >
          <span className="text-xl">🧠</span>
          {hasNotesForReview && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          )}
        </button>

        {/* Search */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          title="Search (Cmd+K)"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-sm text-slate-400 hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline px-1.5 py-0.5 text-xs bg-slate-600 rounded text-slate-400">⌘K</kbd>
        </button>

        {/* New Note */}
        <button
          onClick={onNewNote}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          title="New Note (Cmd+N)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm hidden sm:inline">New</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="Settings"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
