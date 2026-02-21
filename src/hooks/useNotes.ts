import { useState, useEffect, useCallback } from 'react';
import { 
  type Note, 
  createNote, 
  updateNote, 
  deleteNote, 
  getAllNotes, 
  searchNotes,
  getOldUnviewedNotes,
  getOnThisDayNotes,
  getRandomNotes,
  getNotesForReview,
  updateReviewProgress,
  getAllTags,
} from '../db/database';
import { useLiveQuery } from 'dexie-react-hooks';

export function useNotes() {
  const notes = useLiveQuery(() => getAllNotes(), []);
  const tags = useLiveQuery(() => getAllTags(), []);
  
  return {
    notes: notes || [],
    tags: tags || [],
    createNote,
    updateNote,
    deleteNote,
  };
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const found = await searchNotes(query);
      setResults(found);
      setIsSearching(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  return { query, setQuery, results, isSearching };
}

export function useResurface() {
  const [resurfaceNotes, setResurfaceNotes] = useState<Note[]>([]);
  const [shown, setShown] = useState(false);

  const fetchResurface = useCallback(async () => {
    const notes = await getOldUnviewedNotes(2);
    setResurfaceNotes(notes);
    if (notes.length > 0) {
      setShown(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    setShown(false);
  }, []);

  return { resurfaceNotes, shown, fetchResurface, dismiss };
}

export function useOnThisDay() {
  const [periods, setPeriods] = useState<{ period: string; notes: Note[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await getOnThisDayNotes();
      setPeriods(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return { periods, loading };
}

export function useSerendipity() {
  const [notes, setNotes] = useState<[Note, Note] | null>(null);
  const [loading, setLoading] = useState(false);

  const mash = useCallback(async () => {
    setLoading(true);
    const random = await getRandomNotes(2);
    if (random.length >= 2) {
      setNotes([random[0], random[1]]);
    }
    setLoading(false);
  }, []);

  const clear = useCallback(() => {
    setNotes(null);
  }, []);

  return { notes, loading, mash, clear };
}

export function useSpacedRepetition() {
  const [reviewNotes, setReviewNotes] = useState<Note[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReviewNotes = useCallback(async () => {
    setLoading(true);
    const notes = await getNotesForReview();
    setReviewNotes(notes);
    setCurrentIndex(0);
    setShowAnswer(false);
    setLoading(false);
  }, []);

  const reveal = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const rate = useCallback(async (quality: number) => {
    const currentNote = reviewNotes[currentIndex];
    if (currentNote) {
      await updateReviewProgress(currentNote.id, quality);
      
      if (currentIndex < reviewNotes.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
      } else {
        // Refresh to get any remaining notes
        await fetchReviewNotes();
      }
    }
  }, [reviewNotes, currentIndex, fetchReviewNotes]);

  const currentNote = reviewNotes[currentIndex];
  const remaining = reviewNotes.length - currentIndex;

  return {
    currentNote,
    remaining,
    showAnswer,
    loading,
    reveal,
    rate,
    fetchReviewNotes,
  };
}

export function useKeyboardShortcuts(handlers: {
  onNewNote?: () => void;
  onSave?: () => void;
  onSearch?: () => void;
  onEscape?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape key (no modifiers needed)
      if (e.key === 'Escape') {
        handlers.onEscape?.();
        return;
      }
      
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            handlers.onNewNote?.();
            break;
          case 's':
            e.preventDefault();
            handlers.onSave?.();
            break;
          case 'k':
            e.preventDefault();
            handlers.onSearch?.();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('quickbrain-theme');
    return (stored as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('quickbrain-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return { theme, toggle };
}
