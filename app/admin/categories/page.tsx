'use client';

import React, { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/lib/hooks/useCategories';
import { useAdminStore } from '@/lib/stores/adminStore';
import { toast } from 'react-toastify';
import { Category } from '@/lib/hooks/useCategories';
import { useI18n } from '@/lib/contexts/I18nContext';
import { getLocalizedCategoryName } from '@/lib/utils/localizedNames';

/**
 * Categories Management Page (Admin Only)
 * 
 * API: GET /api/categories (public)
 * API: POST /api/categories (Admin/Super Admin only)
 * API: PATCH /api/categories/:id (Admin/Super Admin only)
 * API: DELETE /api/categories/:id (Admin/Super Admin only)
 */
export default function AdminCategoriesPage() {
  // API: GET /api/categories
  const { data: categories, isLoading } = useCategories();
  const { locale } = useI18n();
  const { hasPermission, isSuperAdmin } = useAdminStore();
  // API: POST /api/categories
  const createCategoryMutation = useCreateCategory();
  // API: PATCH /api/categories/:id
  const updateCategoryMutation = useUpdateCategory();
  // API: DELETE /api/categories/:id
  const deleteCategoryMutation = useDeleteCategory();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    nameEn: '',
    nameDe: '',
    nameFa: '',
    icon: '',
    parentId: '',
  });

  const canManage = isSuperAdmin() || hasPermission('categories.manage');

  if (!canManage) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">You do not have permission to manage categories</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600 mt-2">Manage advertisement categories</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          + Create Category
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading categories...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="space-y-4">
              {categories?.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {getLocalizedCategoryName(category.name, locale) || 'N/A'}
                    </div>
                    {category.description && (
                      <div className="text-sm text-gray-500">{category.description}</div>
                    )}
                    {category.children && category.children.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        {category.children.length} subcategories
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setFormData({
                          nameEn: category.name?.en || '',
                          nameDe: category.name?.de || '',
                          nameFa: category.name?.fa || '',
                          icon: category.icon || '',
                          parentId: category.parentId || '',
                        });
                      }}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this category?')) {
                          try {
                            // API: DELETE /api/categories/:id
                            await deleteCategoryMutation.mutateAsync(category.id);
                            toast.success('Category deleted successfully');
                          } catch (error: any) {
                            toast.error(error?.response?.data?.message || 'Failed to delete category');
                          }
                        }
                      }}
                      disabled={deleteCategoryMutation.isPending}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCategory) && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!formData.nameEn && !formData.nameDe && !formData.nameFa) {
                  toast.warning('Please provide at least one name');
                  return;
                }

                try {
                  if (editingCategory) {
                    // API: PATCH /api/categories/:id
                    await updateCategoryMutation.mutateAsync({
                      id: editingCategory.id,
                      data: {
                        name: {
                          en: formData.nameEn || undefined,
                          de: formData.nameDe || undefined,
                          fa: formData.nameFa || undefined,
                        },
                        icon: formData.icon || undefined,
                        parentId: formData.parentId || undefined,
                      },
                    });
                    toast.success('Category updated successfully');
                  } else {
                    // API: POST /api/categories
                    await createCategoryMutation.mutateAsync({
                      name: {
                        en: formData.nameEn || undefined,
                        de: formData.nameDe || undefined,
                        fa: formData.nameFa || undefined,
                      },
                      icon: formData.icon || undefined,
                      parentId: formData.parentId || undefined,
                    });
                    toast.success('Category created successfully');
                  }
                  setShowCreateModal(false);
                  setEditingCategory(null);
                  setFormData({ nameEn: '', nameDe: '', nameFa: '', icon: '', parentId: '' });
                } catch (error: any) {
                  toast.error(error?.response?.data?.message || 'Failed to save category');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (English)</label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (German)</label>
                <input
                  type="text"
                  value={formData.nameDe}
                  onChange={(e) => setFormData({ ...formData, nameDe: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (Persian)</label>
                <input
                  type="text"
                  value={formData.nameFa}
                  onChange={(e) => setFormData({ ...formData, nameFa: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🚗"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category (optional)</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">None (Root Category)</option>
                  {categories
                    ?.filter((cat) => !cat.parentId && cat.id !== editingCategory?.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {getLocalizedCategoryName(cat.name, locale) || 'N/A'}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCategory(null);
                    setFormData({ nameEn: '', nameDe: '', nameFa: '', icon: '', parentId: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {createCategoryMutation.isPending || updateCategoryMutation.isPending
                    ? 'Saving...'
                    : editingCategory
                    ? 'Update'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

