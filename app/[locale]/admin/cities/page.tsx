'use client';

import React, { useState } from 'react';
import { useCities, useCreateCity } from '@/lib/hooks/useCities';
import { useAdminStore } from '@/lib/stores/adminStore';
import { toast } from 'react-toastify';
import { useI18n } from '@/lib/contexts/I18nContext';
import { getLocalizedName } from '@/lib/utils/localizedNames';

/**
 * Cities Management Page (Admin Only)
 * 
 * API: GET /api/cities (public)
 * API: POST /api/cities (Admin/Super Admin only)
 */
export default function AdminCitiesPage() {
  const { hasPermission, isSuperAdmin } = useAdminStore();
  const { locale } = useI18n();
  const { data: cities, isLoading } = useCities();
  const createCityMutation = useCreateCity();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    nameEn: '',
    nameDe: '',
    nameFa: '',
  });

  const canManage = isSuperAdmin() || hasPermission('cities.manage');

  if (!canManage) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">You do not have permission to manage cities</p>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameEn && !formData.nameDe && !formData.nameFa) {
      toast.warning('Please provide at least one name');
      return;
    }

    try {
      // API: POST /api/cities
      await createCityMutation.mutateAsync({
        name: {
          en: formData.nameEn || undefined,
          de: formData.nameDe || undefined,
          fa: formData.nameFa || undefined,
        },
      });
      toast.success('City created successfully');
      setShowCreateModal(false);
      setFormData({ nameEn: '', nameDe: '', nameFa: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create city');
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cities Management</h1>
          <p className="text-gray-600 mt-2">Manage available cities</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          + Create City
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading cities...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cities?.map((city) => (
                <div
                  key={city.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">
                    {getLocalizedName(city.name, locale) || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {city.name?.en && <div>EN: {city.name.en}</div>}
                    {city.name?.de && <div>DE: {city.name.de}</div>}
                    {city.name?.fa && <div>FA: {city.name.fa}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create City Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create City</h2>
            <form onSubmit={handleCreate} className="space-y-4">
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
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ nameEn: '', nameDe: '', nameFa: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCityMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {createCityMutation.isPending ? 'Creating...' : 'Create City'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

