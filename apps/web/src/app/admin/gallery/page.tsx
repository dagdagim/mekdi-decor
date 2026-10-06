'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GALLERY_PROJECTS } from '@/lib/data/mock-db';
import { GalleryProject, EventType, DecorationStyle } from '@/lib/types';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Sparkles,
  Search,
  Filter,
  Check,
  X,
  Star,
  Layers,
  Image as ImageIcon,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const PRESET_IMAGES = [
  {
    name: 'Royal Floral Stage',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
  },
  {
    name: 'Ballroom Grand Arch',
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1600&q=85',
  },
  {
    name: 'Waterfront Pavilion',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=85',
  },
  {
    name: 'Velvet Evening Soirée',
    url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1600&q=85',
  },
  {
    name: 'Botanical Centerpiece',
    url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1600&q=85',
  },
  {
    name: 'Gold Dining Tablescape',
    url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1600&q=85',
  },
];

const PRESET_PALETTES = [
  ['#5B1424', '#D4AF37', '#FAF6F0', '#F5D0C5'], // Royal Burgundy & Gold
  ['#1F3A2B', '#D4AF37', '#FFFFFF', '#2B2828'], // Emerald & Gold
  ['#4A0E17', '#D4AF37', '#FDFBF7', '#C49A6C'], // Crimson & Champagne
  ['#2A3B4C', '#D4AF37', '#FFFFFF', '#C9D6DF'], // Sapphire Blue & Gold
  ['#F7EDE2', '#84A59D', '#F28482', '#F5CAC3'], // Pastel Blush & Sage
];

const AVAILABLE_SERVICES = [
  'Stage Decoration',
  'Floral Design & Centerpieces',
  'Venue Decoration & Draping',
  'Table & Chair Styling',
  'Grand Entrance & Welcome Arches',
  'Photo Backdrops & Media Walls',
  'Architectural & Ambient Lighting',
  'Ceiling Suspensions & Chandeliers',
];

export default function AdminGalleryPage() {
  const [projects, setProjects] = useState<GalleryProject[]>(GALLERY_PROJECTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<GalleryProject>>({
    title: '',
    slug: '',
    eventType: 'Wedding',
    venueName: '',
    locationCity: 'Addis Ababa',
    guestCount: 200,
    decorationStyle: 'Luxury',
    heroImage: PRESET_IMAGES[0].url,
    beforeImage: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    afterImage: PRESET_IMAGES[0].url,
    description: '',
    colorPalette: PRESET_PALETTES[0],
    estimatedPriceRange: 'ETB 150,000 - 220,000',
    testimonialQuote: '',
    testimonialAuthor: '',
    servicesUsed: ['Stage Decoration', 'Floral Design & Centerpieces'],
    isFeatured: true,
  });

  // Fetch projects from API on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setProjects(data.data);
      }
    } catch (e) {
      console.warn('Using local fallback for gallery:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({
      title: '',
      slug: '',
      eventType: 'Wedding',
      venueName: '',
      locationCity: 'Addis Ababa',
      guestCount: 200,
      decorationStyle: 'Luxury',
      heroImage: PRESET_IMAGES[0].url,
      beforeImage: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
      afterImage: PRESET_IMAGES[0].url,
      description: '',
      colorPalette: PRESET_PALETTES[0],
      estimatedPriceRange: 'ETB 150,000 - 220,000',
      testimonialQuote: '',
      testimonialAuthor: '',
      servicesUsed: ['Stage Decoration', 'Floral Design & Centerpieces'],
      isFeatured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proj: GalleryProject) => {
    setModalMode('edit');
    setFormData({ ...proj });
    setIsModalOpen(true);
  };

  const handleTitleChange = (title: string) => {
    const autoSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    setFormData((prev) => ({
      ...prev,
      title,
      slug: modalMode === 'create' ? autoSlug : prev.slug,
    }));
  };

  const toggleService = (srv: string) => {
    const current = formData.servicesUsed || [];
    if (current.includes(srv)) {
      setFormData({ ...formData, servicesUsed: current.filter((s) => s !== srv) });
    } else {
      setFormData({ ...formData, servicesUsed: [...current, srv] });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.heroImage) {
      alert('Please provide a project title and hero image.');
      return;
    }

    try {
      setSaveStatus('Saving project...');
      const url = '/api/gallery';
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (result.success) {
        if (modalMode === 'create') {
          setProjects([result.data, ...projects]);
        } else {
          setProjects(projects.map((p) => (p.id === result.data.id || p.slug === result.data.slug ? result.data : p)));
        }
        setIsModalOpen(false);
        setSaveStatus(null);
      } else {
        alert(result.error || 'Failed to save project');
        setSaveStatus(null);
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred while saving project');
      setSaveStatus(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/gallery?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        setProjects(projects.filter((p) => p.id !== id && p.slug !== id));
        setDeleteConfirmId(null);
      } else {
        alert(result.error || 'Failed to delete project');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting project');
    }
  };

  const handleToggleFeatured = async (proj: GalleryProject) => {
    const newFeatured = !proj.isFeatured;
    try {
      const res = await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: proj.id, slug: proj.slug, isFeatured: newFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        setProjects(
          projects.map((p) => (p.id === proj.id ? { ...p, isFeatured: newFeatured } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered List
  const filteredProjects = projects.filter((p) => {
    const matchesType = selectedType === 'All' || p.eventType.toLowerCase() === selectedType.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(query) ||
      p.venueName.toLowerCase().includes(query) ||
      p.locationCity.toLowerCase().includes(query);
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900">
            Portfolio & Gallery Management
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 font-light mt-1">
            Curate published showcase projects, before/after transformations, and luxury tablescapes.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors inline-flex items-center gap-1.5 self-start shadow-sm"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-cream-200 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {['All', 'Wedding', 'Graduation', 'Birthday', 'Engagement', 'Corporate'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                selectedType === type
                  ? 'bg-burgundy-900 text-cream-50 shadow-sm'
                  : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search venue, city, title..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-cream-50 border border-cream-200 rounded-full focus:outline-none focus:border-burgundy-900"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            className="bg-white rounded-3xl overflow-hidden border border-cream-200 shadow-card flex flex-col justify-between hover:shadow-elevated transition-shadow"
          >
            {/* Image Header */}
            <div className="relative aspect-[16/10] overflow-hidden bg-charcoal-100">
              <img
                src={proj.heroImage}
                alt={proj.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute top-3 left-3 flex gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-burgundy-950/85 text-gold-300 backdrop-blur-sm">
                  {proj.eventType}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/50 text-cream-100 backdrop-blur-sm">
                  {proj.decorationStyle}
                </span>
              </div>

              {/* Star Featured Button */}
              <button
                onClick={() => handleToggleFeatured(proj)}
                title={proj.isFeatured ? 'Featured on Home Page (Click to unfeature)' : 'Mark as Featured'}
                className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md transition-colors ${
                  proj.isFeatured
                    ? 'bg-gold-500 text-burgundy-950 shadow-md'
                    : 'bg-black/40 text-cream-100 hover:bg-black/70'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-editorial text-lg font-bold text-charcoal-900 line-clamp-1 mb-1">
                  {proj.title}
                </h3>
                <p className="text-xs text-charcoal-500 flex items-center gap-1 mb-2.5">
                  <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                  <span>{proj.venueName}, {proj.locationCity}</span>
                </p>
                <p className="text-xs text-charcoal-600 line-clamp-2 font-light leading-relaxed mb-4">
                  {proj.description}
                </p>

                {/* Color Palette Display */}
                {proj.colorPalette && proj.colorPalette.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-wider mr-1">
                      Palette:
                    </span>
                    {proj.colorPalette.slice(0, 4).map((c, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-white shadow-xs inline-block"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="mt-4 pt-3.5 border-t border-cream-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-charcoal-500">
                  {proj.guestCount} Guests • <span className="text-burgundy-900 font-semibold">{proj.estimatedPriceRange}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/gallery/${proj.slug}`}
                    target="_blank"
                    className="p-2 rounded-xl text-charcoal-600 hover:text-burgundy-900 hover:bg-cream-100 transition-colors"
                    title="Preview Live Page"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleOpenEdit(proj)}
                    className="p-2 rounded-xl text-charcoal-600 hover:text-burgundy-900 hover:bg-cream-100 transition-colors"
                    title="Edit Project"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(proj.id)}
                    className="p-2 rounded-xl text-charcoal-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-cream-200">
          <Layers className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
          <h3 className="font-editorial text-lg font-bold text-charcoal-800">No Projects Found</h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1 mb-6">
            Try adjusting your search query or add a brand new luxury project to the portfolio.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-full text-xs font-semibold bg-burgundy-900 text-cream-50"
          >
            Create New Project
          </button>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-gold-400 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-cream-200">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-charcoal-900">
                  {modalMode === 'create' ? 'Add New Portfolio Project' : 'Edit Showcase Project'}
                </h3>
                <p className="text-xs text-charcoal-500 font-light mt-0.5">
                  Publish high-resolution photo highlights, transformation before/afters, and vendor details.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-charcoal-400 hover:text-charcoal-800 rounded-full hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Blen & Dawit's Lakeside Sunset Engagement"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 focus:bg-white focus:outline-none focus:border-burgundy-900"
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
                    placeholder="lakeside-sunset-engagement"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 focus:bg-white focus:outline-none focus:border-burgundy-900 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Event Type, Style, City, Guests */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Event Type</label>
                  <select
                    value={formData.eventType || 'Wedding'}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value as EventType })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Graduation">Graduation</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Private Event">Private Event</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Style</label>
                  <select
                    value={formData.decorationStyle || 'Luxury'}
                    onChange={(e) => setFormData({ ...formData, decorationStyle: e.target.value as DecorationStyle })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                  >
                    <option value="Luxury">Luxury</option>
                    <option value="Romantic">Romantic</option>
                    <option value="Modern">Modern</option>
                    <option value="Chic Glamour">Chic Glamour</option>
                    <option value="Traditional">Traditional</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.locationCity || 'Addis Ababa'}
                    onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Guest Count</label>
                  <input
                    type="number"
                    value={formData.guestCount || 200}
                    onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Venue & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Venue Name</label>
                  <input
                    type="text"
                    value={formData.venueName || ''}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    placeholder="Skyline Event Hall, Lake View"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Estimated Budget Range</label>
                  <input
                    type="text"
                    value={formData.estimatedPriceRange || ''}
                    onChange={(e) => setFormData({ ...formData, estimatedPriceRange: e.target.value })}
                    placeholder="ETB 180,000 - 250,000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Hero Image URL & Presets */}
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Hero Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.heroImage || ''}
                  onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none mb-2"
                />

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-charcoal-400 uppercase font-semibold">
                    Or select luxury photo preset:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESET_IMAGES.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, heroImage: img.url, afterImage: img.url })}
                        className={`group relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                          formData.heroImage === img.url ? 'border-burgundy-900 ring-2 ring-gold-400' : 'border-cream-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                        <span className="absolute inset-0 bg-black/40 text-[9px] text-white flex items-end p-1 line-clamp-1">
                          {img.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Before & After Transformation Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Before Image (Raw Hall)
                  </label>
                  <input
                    type="url"
                    value={formData.beforeImage || ''}
                    onChange={(e) => setFormData({ ...formData, beforeImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    After Image (Mekdi Finish)
                  </label>
                  <input
                    type="url"
                    value={formData.afterImage || ''}
                    onChange={(e) => setFormData({ ...formData, afterImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none text-[11px]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Description & Story</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail the floral architecture, bespoke lighting swags, drapery colorways..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                />
              </div>

              {/* Color Palette Presets */}
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1.5">
                  Colorway Scheme
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {PRESET_PALETTES.map((palette, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, colorPalette: palette })}
                      className={`flex items-center gap-1 p-1.5 rounded-xl border transition-all ${
                        JSON.stringify(formData.colorPalette) === JSON.stringify(palette)
                          ? 'border-burgundy-900 bg-burgundy-50 ring-1 ring-burgundy-800'
                          : 'border-cream-300 hover:border-charcoal-400'
                      }`}
                    >
                      {palette.map((c, ci) => (
                        <span key={ci} className="w-4 h-4 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </button>
                  ))}
                </div>
              </div>

              {/* Services Inclusions */}
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1.5">
                  Services Provided in This Project
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_SERVICES.map((srv) => {
                    const checked = (formData.servicesUsed || []).includes(srv);
                    return (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => toggleService(srv)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-colors ${
                          checked
                            ? 'bg-burgundy-50 border-burgundy-900 text-burgundy-950 font-medium'
                            : 'bg-cream-50 border-cream-200 text-charcoal-600 hover:border-cream-400'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                            checked ? 'bg-burgundy-900 border-burgundy-900 text-white' : 'border-cream-400 bg-white'
                          }`}
                        >
                          {checked && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span className="line-clamp-1">{srv}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Testimonial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Testimonial Quote</label>
                  <input
                    type="text"
                    value={formData.testimonialQuote || ''}
                    onChange={(e) => setFormData({ ...formData, testimonialQuote: e.target.value })}
                    placeholder="Mekdi Decor made our day magical..."
                    className="w-full px-3.5 py-2 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={formData.testimonialAuthor || ''}
                    onChange={(e) => setFormData({ ...formData, testimonialAuthor: e.target.value })}
                    placeholder="e.g. Sara & Michael"
                    className="w-full px-3.5 py-2 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={Boolean(formData.isFeatured)}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded border-cream-300 text-burgundy-900 focus:ring-burgundy-800"
                />
                <label htmlFor="featured-check" className="font-semibold text-charcoal-800 cursor-pointer">
                  Feature this project on Home Page & Showcase Banner
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
                  {saveStatus || (modalMode === 'create' ? 'Save & Publish' : 'Update Project')}
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
            <h3 className="font-editorial text-xl font-bold text-charcoal-900">Delete Project?</h3>
            <p className="text-xs text-charcoal-500 font-light">
              This will unpublish the project from the gallery and customer inspiration boards.
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
