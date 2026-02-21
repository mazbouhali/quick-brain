import Dexie, { type EntityTable } from 'dexie';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastViewedAt: Date;
  viewCount: number;
  memorize: boolean;
  // For spaced repetition
  nextReviewAt?: Date;
  reviewInterval?: number; // in days
  easeFactor?: number;
}

export interface AppSettings {
  id: string;
  theme: 'light' | 'dark';
  showResurfaceOnOpen: boolean;
  resurfaceCount: number;
}

const db = new Dexie('QuickBrainDB') as Dexie & {
  notes: EntityTable<Note, 'id'>;
  settings: EntityTable<AppSettings, 'id'>;
};

db.version(1).stores({
  notes: 'id, title, *tags, createdAt, updatedAt, lastViewedAt, viewCount, memorize, nextReviewAt',
  settings: 'id'
});

export { db };

// Helper functions
export async function createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'lastViewedAt' | 'viewCount'>): Promise<Note> {
  const now = new Date();
  const newNote: Note = {
    ...note,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    lastViewedAt: now,
    viewCount: 1,
  };
  await db.notes.add(newNote);
  return newNote;
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<void> {
  await db.notes.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
}

export async function deleteNote(id: string): Promise<void> {
  await db.notes.delete(id);
}

export async function getNote(id: string): Promise<Note | undefined> {
  const note = await db.notes.get(id);
  if (note) {
    // Update view count and lastViewedAt
    await db.notes.update(id, {
      viewCount: note.viewCount + 1,
      lastViewedAt: new Date(),
    });
  }
  return note;
}

export async function getAllNotes(): Promise<Note[]> {
  return db.notes.orderBy('updatedAt').reverse().toArray();
}

export async function searchNotes(query: string): Promise<Note[]> {
  const lowerQuery = query.toLowerCase();
  return db.notes
    .filter(note => 
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
    .toArray();
}

export async function getNotesByTag(tag: string): Promise<Note[]> {
  return db.notes.where('tags').equals(tag).toArray();
}

export async function getAllTags(): Promise<string[]> {
  const notes = await db.notes.toArray();
  const tagSet = new Set<string>();
  notes.forEach(note => note.tags.forEach(tag => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

// Anti-forgetting helpers
export async function getOldUnviewedNotes(limit: number = 2): Promise<Note[]> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return db.notes
    .where('lastViewedAt')
    .below(oneWeekAgo)
    .toArray()
    .then(notes => {
      // Shuffle and take limit
      const shuffled = notes.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, limit);
    });
}

export async function getOnThisDayNotes(): Promise<{ period: string; notes: Note[] }[]> {
  const today = new Date();
  const results: { period: string; notes: Note[] }[] = [];
  
  // 1 week ago
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekNotes = await getNotesFromDate(weekAgo);
  if (weekNotes.length > 0) {
    results.push({ period: '1 week ago', notes: weekNotes });
  }
  
  // 1 month ago
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const monthNotes = await getNotesFromDate(monthAgo);
  if (monthNotes.length > 0) {
    results.push({ period: '1 month ago', notes: monthNotes });
  }
  
  // 1 year ago
  const yearAgo = new Date(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const yearNotes = await getNotesFromDate(yearAgo);
  if (yearNotes.length > 0) {
    results.push({ period: '1 year ago', notes: yearNotes });
  }
  
  return results;
}

async function getNotesFromDate(date: Date): Promise<Note[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return db.notes
    .where('createdAt')
    .between(startOfDay, endOfDay)
    .toArray();
}

export async function getMemorizeNotes(): Promise<Note[]> {
  return db.notes.where('memorize').equals(1).toArray();
}

export async function getNotesForReview(): Promise<Note[]> {
  const now = new Date();
  return db.notes
    .filter(note => note.memorize && (!note.nextReviewAt || note.nextReviewAt <= now))
    .toArray();
}

export async function updateReviewProgress(id: string, quality: number): Promise<void> {
  const note = await db.notes.get(id);
  if (!note) return;
  
  // Simple SM-2 algorithm implementation
  let easeFactor = note.easeFactor || 2.5;
  let interval = note.reviewInterval || 1;
  
  if (quality < 3) {
    // Failed review, reset
    interval = 1;
  } else {
    if (interval === 1) {
      interval = 1;
    } else if (interval === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easeFactor = Math.max(1.3, easeFactor);
  }
  
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);
  
  await db.notes.update(id, {
    nextReviewAt,
    reviewInterval: interval,
    easeFactor,
    lastViewedAt: new Date(),
  });
}

export async function getRandomNotes(count: number = 2): Promise<Note[]> {
  const notes = await db.notes.toArray();
  const shuffled = notes.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Settings
export async function getSettings(): Promise<AppSettings> {
  let settings = await db.settings.get('main');
  if (!settings) {
    settings = {
      id: 'main',
      theme: 'dark',
      showResurfaceOnOpen: true,
      resurfaceCount: 2,
    };
    await db.settings.add(settings);
  }
  return settings;
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<void> {
  await db.settings.update('main', updates);
}

// Export/Import
export async function exportData(): Promise<string> {
  const notes = await db.notes.toArray();
  const settings = await getSettings();
  return JSON.stringify({ notes, settings, exportedAt: new Date().toISOString() }, null, 2);
}

export async function importData(jsonString: string): Promise<{ imported: number; errors: number }> {
  try {
    const data = JSON.parse(jsonString);
    let imported = 0;
    let errors = 0;
    
    if (data.notes && Array.isArray(data.notes)) {
      for (const note of data.notes) {
        try {
          // Convert date strings back to Date objects
          note.createdAt = new Date(note.createdAt);
          note.updatedAt = new Date(note.updatedAt);
          note.lastViewedAt = new Date(note.lastViewedAt);
          if (note.nextReviewAt) note.nextReviewAt = new Date(note.nextReviewAt);
          
          await db.notes.put(note);
          imported++;
        } catch {
          errors++;
        }
      }
    }
    
    if (data.settings) {
      await db.settings.put({ ...data.settings, id: 'main' });
    }
    
    return { imported, errors };
  } catch {
    throw new Error('Invalid JSON format');
  }
}

// Calculate freshness (0-1, where 1 is fresh and 0 is forgotten)
export function calculateFreshness(note: Note): number {
  const now = new Date().getTime();
  const lastViewed = new Date(note.lastViewedAt).getTime();
  const daysSinceView = (now - lastViewed) / (1000 * 60 * 60 * 24);
  
  // Freshness decays over 30 days
  // Day 0-3: Fresh (green)
  // Day 3-14: Fading (yellow)  
  // Day 14+: Forgotten (red)
  
  if (daysSinceView <= 3) return 1;
  if (daysSinceView >= 30) return 0;
  
  return Math.max(0, 1 - (daysSinceView - 3) / 27);
}

export function getFreshnessColor(freshness: number): string {
  if (freshness > 0.7) return 'var(--freshness-fresh)';
  if (freshness > 0.3) return 'var(--freshness-fading)';
  return 'var(--freshness-forgotten)';
}

export function getFreshnessLabel(freshness: number): string {
  if (freshness > 0.7) return 'Fresh';
  if (freshness > 0.3) return 'Fading';
  return 'Forgotten';
}
