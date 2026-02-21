# 🧠 Quick Brain

> A personal notes PWA with anti-forgetting features. Never lose a thought again.

**Live Demo:** [https://mazbouhali.github.io/quick-brain/](https://mazbouhali.github.io/quick-brain/)

## ✨ Features

### Core Notes
- **Markdown Support** - Write in markdown with live preview
- **Full-text Search** - Find notes instantly (Cmd+K)
- **Tags** - Organize and filter your notes
- **Offline-first** - Works without internet, syncs when online
- **PWA Installable** - Add to home screen on mobile/desktop

### Anti-Forgetting Features

#### 🔮 Resurface Widget
When you open the app, it shows 1-2 random notes you haven't seen recently. Resurface forgotten knowledge!

#### 📊 Freshness Decay
Every note shows a visual freshness indicator:
- 🟢 **Green** - Fresh (viewed in last 3 days)
- 🟡 **Yellow** - Fading (3-14 days old)
- 🔴 **Red** - Forgotten (14+ days)

The indicator pulses gently to draw attention to fresh content.

#### 📅 On This Day
See notes from exactly 1 week, 1 month, and 1 year ago. A time capsule feature for reflection.

#### 🧠 Spaced Repetition Mode
Mark any note as "Memorize" to add it to your flashcard deck. Quiz yourself with SM-2 spaced repetition algorithm:
- Rate how well you remembered (Forgot → Easy)
- Cards reappear at optimal intervals for memory retention

#### 🎲 Serendipity Button
Mash two random notes together in split view. Find unexpected connections between ideas!

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Cmd+N` | New note |
| `Cmd+S` | Save note |
| `Cmd+K` | Search |

### Data Management
- **Export** - Download all notes as JSON backup
- **Import** - Restore notes from backup file
- **100% Client-side** - Your data stays on your device

## 🛠️ Tech Stack

- **React 18** + TypeScript
- **Vite** for blazing fast dev/build
- **Tailwind CSS** for styling
- **Dexie.js** (IndexedDB wrapper) for local storage
- **react-markdown** for rendering
- **date-fns** for date handling
- **Workbox** for service worker / PWA

## 🚀 Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## 📱 Screenshots

### Main Editor
Clean, distraction-free markdown editor with live preview toggle.

### Freshness Indicators
Visual decay shows which notes need attention.

### Quiz Mode
Spaced repetition flashcards help you actually remember what you wrote.

### Serendipity View
Two random notes side by side - spark new connections!

## 🧪 How It Works

### Freshness Algorithm
```
Days since view | Freshness
0-3             | Fresh (100%)
3-14            | Fading (declining)
14+             | Forgotten (~0%)
```

### Spaced Repetition (SM-2)
When you rate a card:
- **Easy**: Interval increases significantly
- **Good**: Interval increases moderately  
- **Hard**: Small interval increase
- **Forgot**: Reset to 1 day

Cards appear when their review date arrives.

## 📄 License

MIT

---

Made with 🧠 for better recall
