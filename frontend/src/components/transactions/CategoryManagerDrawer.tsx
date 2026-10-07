import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Tag, AlertCircle } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { CategoryIcon } from '../../utils/categoryIcons';
import type { Category } from '../../types';

interface CategoryManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryChange?: () => void;
}

export const CategoryManagerDrawer: React.FC<CategoryManagerDrawerProps> = ({
  isOpen,
  onClose,
  onCategoryChange,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [newCatName, setNewCatName] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.list();
      setCategories(data);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setError(null);
    try {
      await categoryService.create({
        name: newCatName.trim(),
        category_type: activeTab,
        icon: 'Folder',
        color: activeTab === 'income' ? '#059669' : '#1F6B50',
        parent_id: parentId,
      });
      setNewCatName('');
      setParentId(null);
      await loadCategories();
      onCategoryChange?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create category.');
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;

    setError(null);
    try {
      await categoryService.delete(id);
      await loadCategories();
      onCategoryChange?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Cannot delete category.');
    }
  };

  const filteredCategories = categories.filter((c) => c.category_type === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-[#E8E6DF] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="h-16 px-6 border-b border-[#E8E6DF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#164A3A]" />
            <h3 className="text-base font-bold text-neutral-900">Manage Categories</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Expense vs Income Categories */}
        <div className="p-4 border-b border-[#E8E6DF]">
          <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 rounded-lg">
            <button
              onClick={() => {
                setActiveTab('expense');
                setParentId(null);
              }}
              className={`py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === 'expense'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Expense Categories
            </button>
            <button
              onClick={() => {
                setActiveTab('income');
                setParentId(null);
              }}
              className={`py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === 'income'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Income Categories
            </button>
          </div>

          {error && (
            <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Inline Add Category Form */}
          <form onSubmit={handleCreateCategory} className="mt-3 flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={parentId ? 'Subcategory name...' : 'New category name...'}
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-[#E8E6DF] rounded-lg text-xs text-neutral-900 outline-none"
              />
              <button
                type="submit"
                disabled={!newCatName.trim()}
                className="px-3 py-1.5 bg-[#164A3A] text-white text-xs font-semibold rounded-lg hover:bg-[#12382c] transition disabled:opacity-50 flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            {parentId && (
              <div className="flex items-center justify-between text-[11px] text-[#164A3A] bg-[#164A3A]/5 px-2 py-1 rounded">
                <span>
                  Adding subcategory to:{' '}
                  <strong>{categories.find((c) => c.id === parentId)?.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setParentId(null)}
                  className="text-neutral-500 hover:text-neutral-800"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-[#E8E6DF]">
          {isLoading ? (
            <div className="text-center py-12 text-xs text-neutral-400">Loading categories...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-xs text-neutral-500">
              No categories found. Create one above.
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div key={cat.id} className="py-2.5 space-y-1.5">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: cat.color || '#1F6B50' }}
                    >
                      <CategoryIcon iconName={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-neutral-900">{cat.name}</span>
                      {cat.transaction_count ? (
                        <span className="text-[11px] text-neutral-400 ml-2">
                          ({cat.transaction_count} tx)
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => setParentId(cat.id)}
                      className="px-2 py-0.5 text-[11px] font-medium text-[#164A3A] hover:bg-[#164A3A]/10 rounded"
                      title="Add subcategory"
                    >
                      + Sub
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1 text-neutral-400 hover:text-rose-600 rounded"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subcategories preview */}
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="pl-9 space-y-1 pt-1">
                    {cat.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between text-xs text-neutral-600 py-0.5 group/sub"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                          <span>{sub.name}</span>
                        </span>
                        <button
                          onClick={() => handleDeleteCategory(sub.id, sub.name)}
                          className="opacity-0 group-hover/sub:opacity-100 p-0.5 text-neutral-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
