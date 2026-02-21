import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NoteEditor } from './components/NoteEditor';
import { SearchModal } from './components/SearchModal';
import { ResurfaceWidget } from './components/ResurfaceWidget';
import { OnThisDay } from './components/OnThisDay';
import { Serendipity } from './components/Serendipity';
import { SpacedRepetition } from './components/SpacedRepetition';
import { Settings } from './components/Settings';
import { 
  useNotes, 
  useSearch, 
  useResurface, 
  useOnThisDay, 
  useSerendipity, 
  useSpacedRepetition,
  useKeyboardShortcuts,
  useTheme 
} from './hooks/useNotes';
import { type Note, db, getNote } from './db/database';
import { useLiveQuery } from 'dexie-react-hooks';

function App() {
  const { notes, tags, createNote, updateNote, deleteNote } = useNotes();
  const { query, setQuery, results, isSearching } = useSearch();
  const { resurfaceNotes, shown: showResurface, fetchResurface, dismiss: dismissResurface } = useResurface();
  const { periods } = useOnThisDay();
  const { notes: serendipityNotes, loading: serendipityLoading, mash, clear: clearSerendipity } = useSerendipity();
  const {
    currentNote: quizNote,
    remaining: quizRemaining,
    showAnswer: quizShowAnswer,
    loading: quizLoading,
    reveal: quizReveal,
    rate: quizRate,
    fetchReviewNotes,
  } = useSpacedRepetition();
  const { theme, toggle: toggleTheme } = useTheme();

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showOnThisDay, setShowOnThisDay] = useState(false);
  const [showSerendipity, setShowSerendipity] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Check for notes due for review
  const notesForReview = useLiveQuery(async () => {
    const now = new Date();
    return db.notes
      .filter(note => note.memorize && (!note.nextReviewAt || note.nextReviewAt <= now))
      .count();
  }, []);

  // Load selected note
  useEffect(() => {
    if (selectedNoteId) {
      getNote(selectedNoteId).then(note => setSelectedNote(note || null));
    } else {
      setSelectedNote(null);
    }
  }, [selectedNoteId]);

  // Show resurface widget on app open
  useEffect(() => {
    fetchResurface();
  }, [fetchResurface]);

  // Keyboard shortcuts
  const handleNewNote = useCallback(async () => {
    const note = await createNote({
      title: '',
      content: '',
      tags: [],
      memorize: false,
    });
    setSelectedNoteId(note.id);
  }, [createNote]);

  const handleSave = useCallback(() => {
    // Save is handled by the editor component
  }, []);

  const handleCloseNote = useCallback(() => {
    setSelectedNoteId(null);
    setSelectedNote(null);
  }, []);

  useKeyboardShortcuts({
    onNewNote: handleNewNote,
    onSave: handleSave,
    onSearch: () => setShowSearch(true),
    onEscape: handleCloseNote,
  });

  const handleSelectNote = useCallback((id: string) => {
    setSelectedNoteId(id);
  }, []);

  const handleUpdateNote = useCallback(async (updates: Partial<Note>) => {
    if (selectedNoteId) {
      await updateNote(selectedNoteId, updates);
      // Refresh the selected note
      const updated = await getNote(selectedNoteId);
      setSelectedNote(updated || null);
    }
  }, [selectedNoteId, updateNote]);

  const handleDeleteNote = useCallback(async () => {
    if (selectedNoteId && confirm('Are you sure you want to delete this note?')) {
      await deleteNote(selectedNoteId);
      setSelectedNoteId(null);
      setSelectedNote(null);
    }
  }, [selectedNoteId, deleteNote]);

  const handleToggleMemorize = useCallback(async () => {
    if (selectedNote) {
      await updateNote(selectedNote.id, { 
        memorize: !selectedNote.memorize,
        nextReviewAt: !selectedNote.memorize ? new Date() : undefined,
        reviewInterval: !selectedNote.memorize ? 1 : undefined,
        easeFactor: !selectedNote.memorize ? 2.5 : undefined,
      });
      const updated = await getNote(selectedNote.id);
      setSelectedNote(updated || null);
    }
  }, [selectedNote, updateNote]);

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      <Header
        onNewNote={handleNewNote}
        onOpenSearch={() => setShowSearch(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenOnThisDay={() => setShowOnThisDay(true)}
        onOpenSerendipity={() => {
          setShowSerendipity(true);
          mash();
        }}
        onOpenQuiz={() => setShowQuiz(true)}
        hasNotesForReview={(notesForReview || 0) > 0}
        hasOnThisDayNotes={periods.length > 0}
        theme={theme}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          notes={notes}
          selectedId={selectedNoteId}
          onSelect={handleSelectNote}
          tags={tags}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          theme={theme}
        />

        <NoteEditor
          note={selectedNote}
          onSave={handleUpdateNote}
          onDelete={handleDeleteNote}
          onToggleMemorize={handleToggleMemorize}
          onClose={handleCloseNote}
          theme={theme}
        />
      </div>

      {/* Modals */}
      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        query={query}
        onQueryChange={setQuery}
        results={results}
        isSearching={isSearching}
        onSelectNote={handleSelectNote}
      />

      <ResurfaceWidget
        notes={resurfaceNotes}
        isOpen={showResurface}
        onClose={dismissResurface}
        onSelectNote={handleSelectNote}
      />

      <OnThisDay
        periods={periods}
        isOpen={showOnThisDay}
        onClose={() => setShowOnThisDay(false)}
        onSelectNote={handleSelectNote}
      />

      <Serendipity
        notes={serendipityNotes}
        isOpen={showSerendipity}
        onClose={() => {
          setShowSerendipity(false);
          clearSerendipity();
        }}
        onMash={mash}
        onSelectNote={handleSelectNote}
        loading={serendipityLoading}
      />

      <SpacedRepetition
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        currentNote={quizNote}
        remaining={quizRemaining}
        showAnswer={quizShowAnswer}
        loading={quizLoading}
        onReveal={quizReveal}
        onRate={quizRate}
        onFetch={fetchReviewNotes}
      />

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
}

export default App;
