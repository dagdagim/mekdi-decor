'use client';

import React, { useState, useEffect } from 'react';
import { PACKAGES_DATA } from '@/lib/data/mock-db';
import { PackageItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Check,
  Sparkles,
  Star,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';

const COMMON_INCLUSIONS = [
  'Grand Floral Arch & Elevated Stage',
  '15-25 Table Centerpiece Tablescapes',
  'Luxury Linen & Brushed Gold Cutlery',
  'Ambient Perimeter Amber Uplighting',
  'Monumental Floral Entrance Arch & Runway',
  'Custom 3D Photo Backdrop & Monogram Neon',
  'Suspended Crystal Pendants & Floral Clouds',
  'Chiavari or Dior Velvet Seating Styling',
  'Dedicated On-Site Lighting & Floral Director',
];

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>(PACKAGES_DATA);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Inclusion Input
  const [newInclusionText, setNewInclusionText] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<PackageItem>>({
    name: '',
    slug: '',
    tierLabel: 'Most Popular',
    tagline: '',
    description: '',
    startingPrice: 120000,
    currency: 'ETB',
    isFeatured: false,
    includedServices: [
      'Grand Floral Arch & Elevated Stage',
      '15-25 Table Centerpiece Tablescapes',
      'Ambient Perimeter Amber Uplighting',
    ],
    displayOrder: 1,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/packages');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setPackages(data.data);
      }
    } catch (e) {
      console.warn('Fallback to local packages:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({
      name: '',
      slug: '',
      tierLabel: 'Custom Package',
      tagline: 'Tailored luxury decoration crafted specifically for your celebration',
      description: 'Comprehensive venue transformation, artisanal floral design, and atmospheric lighting.',
      startingPrice: 95000,
      currency: 'ETB',
      isFeatured: false,
      includedServices: [
        'Curated stage floral backdrop',
        'Guest seating styling & customized runners',
        'Welcome entryway arch & mirror signage',
      ],
      displayOrder: packages.length + 1,
    });
    setNewInclusionText('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: PackageItem) => {
    setModalMode('edit');
    setFormData({ ...pkg });
    setNewInclusionText('');
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const autoSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    setFormData((prev) => ({
      ...prev,
      name,
      slug: modalMode === 'create' ? autoSlug : prev.slug,
    }));
  };

  const addInclusion = (text: string) => {
    if (!text.trim()) return;
    const current = formData.includedServices || [];
    if (!current.includes(text.trim())) {
      setFormData({ ...formData, includedServices: [...current, text.trim()] });
    }
    setNewInclusionText('');
  };

  const removeInclusion = (index: number) => {
    const current = [...(formData.includedServices || [])];
    current.splice(index, 1);
    setFormData({ ...formData, includedServices: current });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startingPrice) {
      alert('Package name and starting price are required.');
      return;
    }

    try {
      setSaveStatus('Saving package...');
      const url = '/api/packages';
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (result.success) {
        if (modalMode === 'create') {
          setPackages([...packages, result.data]);
        } else {
          setPackages(packages.map((p) => (p.id === result.data.id || p.slug === result.data.slug ? result.data : p)));
        }
        setIsModalOpen(false);
        setSaveStatus(null);
      } else {
        alert(result.error || 'Failed to save package');
        setSaveStatus(null);
      }
    } catch (err: any) {
      alert(err.message || 'Error saving package');
      setSaveStatus(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/packages?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        setPackages(packages.filter((p) => p.id !== id && p.slug !== id));
        setDeleteConfirmId(null);
      } else {
        alert(result.error || 'Failed to delete package');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting package');
    }
  };

  const handleToggleFeatured = async (pkg: PackageItem) => {
    const newFeatured = !pkg.isFeatured;
    try {
      const res = await fetch('/api/packages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pkg.id, slug: pkg.slug, isFeatured: newFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        setPackages(
          packages.map((p) => (p.id === pkg.id ? { ...p, isFeatured: newFeatured } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900">
            Decoration Packages & Pricing Tiers
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 font-light mt-1">
            Database-driven pricing tiers, inclusions, marketing feature flags, and custom curated packages.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors inline-flex items-center gap-1.5 self-start shadow-sm"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>Add Custom Package</span>
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-white rounded-3xl p-6 border shadow-card flex flex-col justify-between transition-all hover:shadow-elevated relative ${
              pkg.isFeatured ? 'border-gold-500/80 ring-2 ring-gold-400/20' : 'border-cream-200'
            }`}
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-800 bg-gold-100/70 px-2.5 py-0.5 rounded-full">
                  {pkg.tierLabel || 'Tier'}
                </span>

                <button
                  onClick={() => handleToggleFeatured(pkg)}
                  title={pkg.isFeatured ? 'Featured Tier (Click to unfeature)' : 'Mark as Featured Tier'}
                  className={`p-1.5 rounded-full transition-colors ${
                    pkg.isFeatured ? 'bg-gold-500 text-burgundy-950' : 'bg-cream-100 text-charcoal-400 hover:text-gold-600'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              <h3 className="font-editorial text-xl font-bold text-charcoal-900">
                {pkg.name}
              </h3>
              <p className="text-xs text-charcoal-500 line-clamp-2 mt-1 font-light leading-relaxed">
                {pkg.tagline}
              </p>

              {/* Price Banner */}
              <div className="my-5 p-3.5 rounded-2xl bg-cream-50 border border-cream-200">
                <span className="text-[10px] uppercase text-charcoal-400 block font-semibold tracking-wider">
                  Starting Rate
                </span>
                <span className="font-mono text-xl font-bold text-burgundy-900">
                  {formatCurrency(pkg.startingPrice, pkg.currency)}
                </span>
              </div>

              {/* Inclusions */}
              <div className="mb-6">
                <span className="text-[10px] font-semibold uppercase text-charcoal-400 tracking-wider block mb-2">
                  Package Inclusions ({pkg.includedServices.length})
                </span>
                <ul className="space-y-2">
                  {pkg.includedServices.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-charcoal-700">
                      <Check className="w-3.5 h-3.5 text-botanical-700 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-cream-100 flex items-center gap-2">
              <button
                onClick={() => handleOpenEdit(pkg)}
                className="flex-1 py-2.5 rounded-full text-xs font-semibold uppercase bg-cream-100 text-charcoal-800 hover:bg-cream-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => setDeleteConfirmId(pkg.id)}
                className="p-2.5 rounded-full text-charcoal-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                title="Delete Package"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT PACKAGE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-gold-400 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-cream-200">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-charcoal-900">
                  {modalMode === 'create' ? 'Create Custom Package' : 'Edit Decoration Package'}
                </h3>
                <p className="text-xs text-charcoal-500 font-light mt-0.5">
                  Set tier name, starting rate in ETB, and customize bulleted inclusions.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-charcoal-400 hover:text-charcoal-800 rounded-full hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Signature Royale"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 focus:bg-white focus:outline-none focus:border-burgundy-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Tier Label
                  </label>
                  <input
                    type="text"
                    value={formData.tierLabel || ''}
                    onChange={(e) => setFormData({ ...formData, tierLabel: e.target.value })}
                    placeholder="e.g. Most Popular, Grand Luxury"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 focus:bg-white focus:outline-none focus:border-burgundy-900"
                  />
                </div>
              </div>

              {/* Starting Price & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Starting Price (ETB) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.startingPrice || 0}
                    onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
                    placeholder="135000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none font-mono text-sm font-semibold text-burgundy-950"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="signature-royale"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="The quintessential luxury package for memorable weddings & engagements"
                  className="w-full px-3.5 py-2 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Grand floral arch stage, 15 floral centerpieces, ambient lighting..."
                  className="w-full px-3.5 py-2 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                />
              </div>

              {/* Inclusions Builder */}
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1.5">
                  Package Inclusions ({formData.includedServices?.length || 0})
                </label>

                {/* Inclusion List */}
                <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto pr-1">
                  {(formData.includedServices || []).map((inc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-cream-100 border border-cream-200 text-charcoal-800"
                    >
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-botanical-700 shrink-0" />
                        <span>{inc}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeInclusion(i)}
                        className="text-charcoal-400 hover:text-red-700 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Inclusion */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInclusionText}
                    onChange={(e) => setNewInclusionText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addInclusion(newInclusionText);
                      }
                    }}
                    placeholder="Type a new inclusion (e.g. 20 Velvet Dior Chairs)..."
                    className="flex-1 px-3 py-2 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addInclusion(newInclusionText)}
                    className="px-4 py-2 rounded-xl font-semibold bg-burgundy-900 text-cream-50 hover:bg-burgundy-800"
                  >
                    + Add
                  </button>
                </div>

                {/* Quick Add Suggestions */}
                <div className="mt-2.5 space-y-1">
                  <span className="text-[10px] text-charcoal-400 font-semibold uppercase">
                    Suggested Inclusions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_INCLUSIONS.filter(
                      (item) => !(formData.includedServices || []).includes(item)
                    ).slice(0, 4).map((sugg, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => addInclusion(sugg)}
                        className="px-2 py-1 rounded-md text-[10px] bg-cream-200/80 text-charcoal-700 hover:bg-cream-300 hover:text-burgundy-900 transition-colors"
                      >
                        + {sugg}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pkg-featured"
                  checked={Boolean(formData.isFeatured)}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded border-cream-300 text-burgundy-900 focus:ring-burgundy-800"
                />
                <label htmlFor="pkg-featured" className="font-semibold text-charcoal-800 cursor-pointer">
                  Highlight as &ldquo;Featured / Most Popular&rdquo; package
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-charcoal-700 bg-cream-100 hover:bg-cream-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Boolean(saveStatus)}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {saveStatus || (modalMode === 'create' ? 'Create Package' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-red-300 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-xl font-bold text-charcoal-900">Delete Package?</h3>
            <p className="text-xs text-charcoal-500 font-light">
              This will remove this pricing tier from public and customer plan event selectors.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2 rounded-full text-xs font-medium text-charcoal-700 bg-cream-100 hover:bg-cream-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-red-700 text-white hover:bg-red-800"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
