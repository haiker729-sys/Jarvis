import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Search,
  Database,
  Edit2,
  Trash2,
  Check,
  Tag,
  Clock,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { MemoryCategory, MemoryEntity, AppTheme } from '../types';
import {
  getStoredMemories,
  saveMemoryEntity,
  updateMemoryEntity,
  deleteMemoryEntity,
} from '../services/memoryStore';

interface MemoryModalProps {
  isOpen: boolean;
  theme: AppTheme;
  onClose: () => void;
}

const CATEGORIES: ('All' | MemoryCategory)[] = [
  'All',
  'Personal',
  'Preferences',
  'Contacts',
  'Routines',
  'Notes',
];

export const MemoryModal: React.FC<MemoryModalProps> = ({ isOpen, theme, onClose }) => {
  const [memories, setMemories] = useState<MemoryEntity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'All' | MemoryCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Add/Edit Dialog State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [inputCategory, setInputCategory] = useState<MemoryCategory>('Personal');
  const [inputKey, setInputKey] = useState('');
  const [inputValue, setInputValue] = useState('');

  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMemories(getStoredMemories());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredMemories = memories.filter((m) => {
    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      m.key.toLowerCase().includes(q) ||
      m.value.toLowerCase().includes(q) ||
      m.rawText.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const handleOpenAdd = () => {
    setEditId(null);
    setInputCategory(selectedCategory === 'All' ? 'Personal' : selectedCategory);
    setInputKey('');
    setInputValue('');
    setIsEditing(true);
  };

  const handleOpenEdit = (m: MemoryEntity) => {
    setEditId(m.id);
    setInputCategory(m.category);
    setInputKey(m.key);
    setInputValue(m.value);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim() || !inputValue.trim()) return;

    if (editId) {
      const updated = updateMemoryEntity(editId, inputCategory, inputKey.trim(), inputValue.trim());
      setMemories(updated);
    } else {
      const created = saveMemoryEntity(inputCategory, inputKey.trim(), inputValue.trim(), inputValue.trim());
      setMemories(getStoredMemories());
    }
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    const updated = deleteMemoryEntity(id);
    setMemories(updated);
    setDeleteConfirmId(null);
  };

  const isDark = theme === 'dark' || theme === 'red' || theme === 'sunset';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl max-h-[85vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl ${
          theme === 'sunset'
            ? 'bg-[#140A12] border-orange-500/30 text-orange-50'
            : theme === 'red'
            ? 'bg-[#140508] border-rose-500/30 text-rose-50'
            : theme === 'light'
            ? 'bg-slate-50 border-slate-300 text-slate-800'
            : 'bg-[#070D18] border-cyan-500/30 text-cyan-50'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Long-Term Memory Matrix</h2>
              <p className="text-xs text-slate-400">
                Persistent Knowledge Store ({memories.length} facts)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Fact</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Categories */}
        <div className="px-5 py-3 border-b border-white/5 space-y-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facts, names, routines, preferences..."
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-none ${
                isDark ? 'bg-black/40 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Memory List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredMemories.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Database className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-sm font-medium">No memory records found.</p>
              <p className="text-xs">
                {searchQuery
                  ? 'Try another search keyword.'
                  : 'Tell Jarvis "Remember that..." or click Add Fact.'}
              </p>
            </div>
          ) : (
            filteredMemories.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition-all flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
                    {m.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mr-2">
                      <Clock className="w-3 h-3" />
                      {new Date(m.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1 hover:text-cyan-400 text-slate-400 transition-colors"
                      title="Edit memory"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(m.id)}
                      className="p-1 hover:text-rose-400 text-slate-400 transition-colors"
                      title="Delete memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-200">{m.key}</h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{m.value}</p>
                </div>

                {deleteConfirmId === m.id && (
                  <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-between text-xs text-rose-200">
                    <span>Delete this memory permanently?</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="px-2 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px]"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 rounded-lg bg-white/10 text-slate-300 text-[11px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Modal Layer */}
        {isEditing && (
          <div className="absolute inset-0 bg-black/90 p-5 flex flex-col justify-center animate-in fade-in duration-150 z-20">
            <form onSubmit={handleSave} className="space-y-3.5 max-w-md mx-auto w-full">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>{editId ? 'Edit Memory' : 'Commit New Memory'}</span>
              </h3>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Category</label>
                <select
                  value={inputCategory}
                  onChange={(e) => setInputCategory(e.target.value as MemoryCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Topic / Key</label>
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="e.g. Favorite Song, Morning Alarm, Work Contact"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Memory Content / Value</label>
                <textarea
                  rows={3}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Detailed fact or instruction for Jarvis to recall..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  {editId ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
