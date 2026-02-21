import { useRef, useState } from 'react';
import { exportData, importData } from '../db/database';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Settings({ isOpen, onClose, theme, onToggleTheme }: SettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: number } | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quick-brain-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const result = await importData(text);
      setImportResult(result);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please check the file format.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚙️</div>
            <h2 className="text-xl font-bold text-white">Settings</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Theme */}
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-3">Appearance</h3>
            <button
              onClick={onToggleTheme}
              className="w-full p-4 bg-slate-700/50 rounded-lg flex items-center justify-between hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{theme === 'dark' ? '🌙' : '☀️'}</span>
                <span className="text-white">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${
                theme === 'dark' ? 'bg-purple-600' : 'bg-slate-500'
              }`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </div>
            </button>
          </div>

          {/* Data */}
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-3">Data Management</h3>
            <div className="space-y-3">
              <button
                onClick={handleExport}
                className="w-full p-4 bg-slate-700/50 rounded-lg flex items-center gap-3 hover:bg-slate-700 transition-colors"
              >
                <span className="text-2xl">📤</span>
                <div className="text-left">
                  <div className="text-white">Export Backup</div>
                  <div className="text-sm text-slate-400">Download all notes as JSON</div>
                </div>
              </button>

              <button
                onClick={handleImportClick}
                disabled={importing}
                className="w-full p-4 bg-slate-700/50 rounded-lg flex items-center gap-3 hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <span className="text-2xl">{importing ? '⏳' : '📥'}</span>
                <div className="text-left">
                  <div className="text-white">{importing ? 'Importing...' : 'Import Backup'}</div>
                  <div className="text-sm text-slate-400">Restore notes from JSON file</div>
                </div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              {importResult && (
                <div className="p-3 bg-green-600/20 text-green-300 rounded-lg text-sm">
                  ✅ Imported {importResult.imported} notes
                  {importResult.errors > 0 && ` (${importResult.errors} errors)`}
                </div>
              )}
            </div>
          </div>

          {/* Keyboard shortcuts */}
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-3">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>New note</span>
                <kbd className="px-2 py-0.5 bg-slate-700 rounded text-xs">⌘N</kbd>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Save note</span>
                <kbd className="px-2 py-0.5 bg-slate-700 rounded text-xs">⌘S</kbd>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Search</span>
                <kbd className="px-2 py-0.5 bg-slate-700 rounded text-xs">⌘K</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700">
          <div className="text-center text-sm text-slate-500">
            <p>Quick Brain v1.0.0</p>
            <p className="mt-1">Made with 🧠 for better recall</p>
          </div>
        </div>
      </div>
    </div>
  );
}
