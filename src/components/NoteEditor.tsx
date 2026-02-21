import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { type Note, calculateFreshness, getFreshnessColor, getFreshnessLabel } from '../db/database';
import { formatDistanceToNow } from 'date-fns';

interface NoteEditorProps {
  note: Note | null;
  onSave: (updates: Partial<Note>) => void;
  onDelete: () => void;
  onToggleMemorize: () => void;
}

export function NoteEditor({ note, onSave, onDelete, onToggleMemorize }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
      setHasChanges(false);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
      setHasChanges(false);
    }
  }, [note?.id]);

  useEffect(() => {
    if (note) {
      const changed = title !== note.title || content !== note.content || 
        JSON.stringify(tags) !== JSON.stringify(note.tags);
      setHasChanges(changed);
    }
  }, [title, content, tags, note]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;
    onSave({ title: title || 'Untitled', content, tags });
    setHasChanges(false);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 bg-slate-900">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg">Select a note or create a new one</p>
          <p className="text-sm mt-2">Press Cmd+N to create a new note</p>
        </div>
      </div>
    );
  }

  const freshness = calculateFreshness(note);
  const freshnessColor = getFreshnessColor(freshness);

  return (
    <div className="flex-1 flex flex-col bg-slate-900 h-full">
      {/* Header */}
      <div className="border-b border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: freshnessColor }}
              title={`${getFreshnessLabel(freshness)} - Last viewed ${formatDistanceToNow(note.lastViewedAt)} ago`}
            />
            <span className="text-xs text-slate-500">
              {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
            </span>
            <span className="text-xs text-slate-600">|</span>
            <span className="text-xs text-slate-500">
              {note.viewCount} views
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMemorize}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                note.memorize 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              title={note.memorize ? 'Remove from flashcards' : 'Add to flashcards'}
            >
              {note.memorize ? '🧠 Memorizing' : '📝 Memorize'}
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                showPreview 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                hasChanges 
                  ? 'bg-green-600 text-white hover:bg-green-500' 
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              Save
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1 rounded text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
        
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full bg-transparent text-2xl font-bold text-white placeholder-slate-500 outline-none"
        />
        
        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-blue-600/30 text-blue-300 rounded text-sm flex items-center gap-1"
            >
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:text-red-400 ml-1"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tag..."
            className="bg-transparent text-sm text-slate-300 placeholder-slate-500 outline-none min-w-24"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {showPreview ? (
          <div className="p-6 overflow-y-auto h-full markdown-content text-slate-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || '*No content*'}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing... (Markdown supported)"
            className="w-full h-full p-6 bg-transparent text-slate-200 placeholder-slate-500 outline-none resize-none font-mono text-sm leading-relaxed"
          />
        )}
      </div>
    </div>
  );
}
