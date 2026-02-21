# Quick Brain — Personal Notes PWA with Anti-Forgetting

## Core Concept
A fast, offline-first notes app that fights the "write and forget" problem.
Most notes apps optimize for capture. This one optimizes for **retrieval and rediscovery**.

## Core Features (The Basics)
- Create, edit, delete notes
- Markdown rendering with live preview
- Full-text search
- Tags for organization
- Dark/light mode toggle
- PWA manifest (installable)
- Service worker for offline
- Export/import JSON backup
- Keyboard shortcuts (Cmd+N new, Cmd+S save, Cmd+K search)

## Anti-Forgetting Features (The Magic)
1. **Resurface Widget**: On open, show 1-2 random old notes you haven't seen recently
2. **Decay Visualization**: Notes show "freshness" indicator — fades over time, brightens on interaction
3. **"On This Day"**: Show notes from 1 week / 1 month / 1 year ago (if any exist)
4. **Spaced Repetition Mode**: Mark any note as "memorize" — it becomes a flashcard for self-quizzing
5. **Serendipity Button**: Mash two random notes together in a split view — spark connections

## Tech Stack
- React 18 + Vite
- Tailwind CSS
- IndexedDB via Dexie.js (stores notes + metadata like lastViewed, viewCount)
- date-fns for date handling
- react-markdown for rendering
- No backend — 100% client-side

## Data Model
```typescript
interface Note {
  id: string;
  title: string;
  content: string; // markdown
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastViewedAt: Date;
  viewCount: number;
  memorize: boolean; // spaced repetition flag
}
```

## UI Layout
- Top bar: Search (Cmd+K), New Note, Settings
- Left sidebar: Note list with freshness indicators (green=fresh, yellow=fading, red=forgotten)
- Main area: Editor with markdown preview toggle
- Bottom bar or modal: Resurface widget on app open

## Design Vibe
- Clean, minimal, fast
- Subtle animations for delight
- Mobile responsive (works great on phone)
- The "freshness decay" should be visually obvious but not distracting

## Deployment
- Build outputs to `dist/`
- Deploy to GitHub Pages via gh-pages package
- Base URL: /quick-brain/

## Done Criteria
- App works fully offline
- Can create/edit/search/tag notes
- Resurface widget works (shows old notes on open)
- Freshness decay is visible
- "On This Day" feature works
- At least basic spaced repetition (mark as memorize, quiz mode)
- PWA installable
- Deployed and live at https://mazbouhali.github.io/quick-brain/
- README with features + screenshots

When completely finished, run:
clawdbot gateway wake --text "Done: Quick Brain PWA with anti-forgetting features deployed to GitHub Pages" --mode now
