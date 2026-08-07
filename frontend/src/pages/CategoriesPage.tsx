import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import type { Category } from '../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.list();
      setCategories(data);
    } catch {
      // Error handled via API interceptor
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await categoryService.create({ name: newCategoryName.trim() });
      setNewCategoryName('');
      loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Delete category "${name}"? Expenses under this category will become uncategorized.`)) {
      try {
        await categoryService.delete(id);
        loadCategories();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to delete category');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Categories</h1>
        <p className="text-sm text-slate-500 mt-1">Organize your expenses with custom spending categories</p>
      </div>

      {/* Create Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Add New Category</h2>
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            placeholder="e.g. Utilities, Dining Out, Gym"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 px-3.5 py-2 border border-slate-200 rounded-lg text-sm outline-none transition focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newCategoryName.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </form>
      </div>

      {/* Category List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Your Categories ({categories.length})</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm">No custom categories created yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {categories.map((c) => (
              <li key={c.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <Tag className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-slate-900 text-sm">{c.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(c.id, c.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
