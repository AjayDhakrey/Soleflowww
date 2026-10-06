import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthProvider';
import { ShoeDesign } from '../../types';
import { designsService } from '../../services/designs';
import { useDesignCatalog } from '../../hooks/useDesignCatalog';
import { Icons } from '../../lib/icons';
import {
  PageHeader,
  Select,
  Button,
  EmptyState,
} from '../../components/ui';
import { DesignsKpiCards } from '../../components/designs/DesignsKpiCards';
import { DesignSharesModal } from '../../components/designs/DesignSharesModal';
import { AddDesignModal } from '../../components/designs/AddDesignModal';
import {
  Plus,
  Edit2,
  Archive,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  Trash2,
  RefreshCw,
  AlertCircle,
  Eye,
  Check,
  Search,
  Package,
  Layers,
  ArrowUpDown,
  ShoppingBag,
} from 'lucide-react';

interface DesignsPageProps {
  onNavigate: (path: string) => void;
}

export const DesignsPage: React.FC<DesignsPageProps> = ({ onNavigate }) => {
  const {
    currentUser,
    selectedDesignIds,
    toggleSelectDesign,
    clearSelectedDesigns,
    setIsShareModalOpen,
    setIsCreateOrderModalOpen,
    showToast,
  } = useApp();

  const { canManageCatalog, isAdmin, role: authRole } = useAuth();
  const queryClient = useQueryClient();

  const isUserAdmin = canManageCatalog || isAdmin || authRole === 'admin' || currentUser?.role === 'admin';

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'price_high' | 'margin'>('popular');
  const [quickViewShoe, setQuickViewShoe] = useState<ShoeDesign | null>(null);
  const [isShareHistoryOpen, setIsShareHistoryOpen] = useState(false);

  // Admin Catalog Management States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<ShoeDesign | null>(null);
  const [archivingDesign, setArchivingDesign] = useState<ShoeDesign | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Listen for global open-add-design-modal event
  useEffect(() => {
    const handleOpenAddModal = () => {
      setEditingDesign(null);
      setIsAddModalOpen(true);
    };
    window.addEventListener('open-add-design-modal', handleOpenAddModal);
    return () => window.removeEventListener('open-add-design-modal', handleOpenAddModal);
  }, []);

  // Delete State
  const [deletingDesign, setDeletingDesign] = useState<ShoeDesign | null>(null);
  const [deleteCheckLoading, setDeleteCheckLoading] = useState(false);
  const [deleteCheckResult, setDeleteCheckResult] = useState<{ canDelete: boolean; reason: string | null; orderCount: number } | null>(null);
  const [deleteConfirmationCode, setDeleteConfirmationCode] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Query Catalog
  const {
    data: rawDesigns = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useDesignCatalog({
    includeArchived: activeCategory === 'Archived',
    category: activeCategory !== 'All' && activeCategory !== 'Archived' ? activeCategory : undefined,
    search: searchQuery ? searchQuery : undefined,
  });

  const categories = [
    { label: 'All', value: 'All' },
    { label: 'Athletic Sneakers', value: 'Athletic Sneakers' },
    { label: 'Formal Derby & Oxford', value: 'Formal Derby & Oxford' },
    { label: 'Leather Boots', value: 'Leather Boots' },
    { label: 'Loafers & Casuals', value: 'Loafers & Casuals' },
    ...(isUserAdmin ? [{ label: 'Archived', value: 'Archived' }] : []),
  ];

  // Category counts
  const counts: Record<string, number> = {
    All: rawDesigns.filter((d) => !d.isArchived).length,
    'Athletic Sneakers': rawDesigns.filter((d) => !d.isArchived && d.category === 'Athletic Sneakers').length,
    'Formal Derby & Oxford': rawDesigns.filter((d) => !d.isArchived && d.category === 'Formal Derby & Oxford').length,
    'Leather Boots': rawDesigns.filter((d) => !d.isArchived && d.category === 'Leather Boots').length,
    'Loafers & Casuals': rawDesigns.filter((d) => !d.isArchived && d.category === 'Loafers & Casuals').length,
    Archived: rawDesigns.filter((d) => d.isArchived).length,
  };

  // Filtering
  const filteredDesigns = rawDesigns.filter((d) => {
    const matchesCat =
      activeCategory === 'All' ||
      (activeCategory === 'Archived' && d.isArchived) ||
      (!d.isArchived && d.category === activeCategory);
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.articleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.soleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.upperMaterial.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Sorting
  const sortedDesigns = [...filteredDesigns].sort((a, b) => {
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    if (sortBy === 'margin') {
      const marginA = a.marginBadge?.includes('High') ? 2 : 1;
      const marginB = b.marginBadge?.includes('High') ? 2 : 1;
      return marginB - marginA;
    }
    const popA = a.status === 'Popular' ? 2 : a.status === 'New Designs' ? 1 : 0;
    const popB = b.status === 'Popular' ? 2 : b.status === 'New Designs' ? 1 : 0;
    return popB - popA;
  });

  const activeCatalogCount = rawDesigns.filter((d) => !d.isArchived).length;
  const popularCount = rawDesigns.filter((d) => !d.isArchived && d.status === 'Popular').length;
  const highMarginCount = rawDesigns.filter(
    (d) => !d.isArchived && (d.marginBadge?.includes('High') || d.marginBadge?.includes('40%'))
  ).length;

  // Open Delete Check Modal
  const handleInitiateDelete = async (shoe: ShoeDesign) => {
    setDeletingDesign(shoe);
    setDeleteConfirmationCode('');
    setDeleteError(null);
    setDeleteCheckLoading(true);
    setDeleteCheckResult(null);

    const check = await designsService.checkDesignDeletable(shoe.id);
    setDeleteCheckResult(check);
    setDeleteCheckLoading(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDesign) return;
    if (deleteConfirmationCode.trim() !== deletingDesign.articleCode.trim()) {
      setDeleteError(`Please type "${deletingDesign.articleCode}" to confirm deletion.`);
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    const res = await designsService.deleteDesignV2(deletingDesign.id);
    setIsDeleting(false);

    if (res.success) {
      showToast(`Design ${deletingDesign.articleCode} permanently deleted.`);
      queryClient.setQueriesData<ShoeDesign[]>({ queryKey: ['designs'] }, (old) => {
        if (!old) return [];
        return old.filter((d) => d.id !== deletingDesign.id);
      });
      queryClient.invalidateQueries({ queryKey: ['designs'] });
      setDeletingDesign(null);
      if (quickViewShoe?.id === deletingDesign.id) {
        setQuickViewShoe(null);
      }
    } else {
      setDeleteError(res.error || 'Failed to delete design.');
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archivingDesign) return;
    setIsArchiving(true);
    const res = await designsService.archiveDesignV2(archivingDesign.id);
    setIsArchiving(false);
    if (res.success) {
      showToast(`Design ${archivingDesign.articleCode} archived successfully`);
      queryClient.setQueriesData<ShoeDesign[]>({ queryKey: ['designs'] }, (old) => {
        if (!old) return [];
        return old.map((d) => (d.id === archivingDesign.id ? { ...d, isArchived: true } : d));
      });
      queryClient.invalidateQueries({ queryKey: ['designs'] });
      setArchivingDesign(null);
      if (quickViewShoe?.id === archivingDesign.id) {
        setQuickViewShoe(null);
      }
    } else {
      showToast(res.error || 'Failed to archive design');
    }
  };

  const handleRestore = async (shoe: ShoeDesign) => {
    const res = await designsService.restoreDesignV2(shoe.id);
    if (res.success) {
      showToast(`Design ${shoe.articleCode} restored to active catalog`);
      queryClient.setQueriesData<ShoeDesign[]>({ queryKey: ['designs'] }, (old) => {
        if (!old) return [];
        return old.map((d) => (d.id === shoe.id ? { ...d, isArchived: false } : d));
      });
      queryClient.invalidateQueries({ queryKey: ['designs'] });
    } else {
      showToast(res.error || 'Failed to restore design');
    }
  };

  const isRecentNew = (shoe: ShoeDesign) => {
    if (shoe.status === 'New Designs') return true;
    if (shoe.createdAt) {
      const createdDate = new Date(shoe.createdAt).getTime();
      const sevenDaysAgo = Date.now() - 7 * 86400000;
      return createdDate > sevenDaysAgo;
    }
    return false;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto pb-24 md:pb-12 font-sans">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Catalogue' }]}
        title="Footwear Catalogue & Lookbook"
        subtitle="Curated B2B wholesale designs, material specs, and WhatsApp shareable lookbooks."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              icon={Icons.Clock}
              onClick={() => setIsShareHistoryOpen(true)}
              className="rounded-xl"
            >
              Sharing History
            </Button>
            <Button
              variant="secondary"
              icon={Icons.WhatsApp}
              onClick={() => setIsShareModalOpen(true)}
              className="text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800 rounded-xl"
            >
              Share Lookbook ({selectedDesignIds.length})
            </Button>
            {isUserAdmin && (
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => {
                  setEditingDesign(null);
                  setIsAddModalOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 rounded-xl font-bold"
              >
                Add Design
              </Button>
            )}
          </div>
        }
      />

      {/* 2. KPI Summary Row */}
      <DesignsKpiCards
        totalActiveModels={activeCatalogCount || rawDesigns.length || 0}
        popularStylesCount={popularCount || 0}
        highMarginCount={highMarginCount || 0}
        selectedCount={selectedDesignIds.length}
      />

      {/* 3. Sleek Redesigned Catalogue Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden transition-all">
        {/* Search & Sort Top Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by article code (e.g. SF-ART-104), model name, material..."
                className="w-full h-10 pl-10 pr-9 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1"
                >
                  <Icons.Close size={14} />
                </button>
              )}
            </div>

            {/* Sort & Quick Filters */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="margin">Highest Margin</option>
                </select>
              </div>

              {selectedDesignIds.length > 0 && (
                <button
                  type="button"
                  onClick={clearSelectedDesigns}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/80 dark:border-rose-900 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Icons.Close size={13} />
                  <span>Clear Selection ({selectedDesignIds.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.value;
              const count = counts[cat.value] ?? 0;

              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 select-none ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm shadow-slate-900/20 scale-[1.02]'
                      : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                      isSelected
                        ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Banner */}
        {isError && (
          <div className="m-4 md:m-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-rose-900 dark:text-rose-200">Failed to load catalog designs</p>
                <p className="text-xs text-rose-700 dark:text-rose-400">
                  {(error as Error)?.message || 'Database connection error. Click retry to reload.'}
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-4 animate-pulse"
              >
                <div className="w-full aspect-[4/3] bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footwear Grid */}
        {!isLoading && !isError && (
          <div className="p-4 sm:p-6">
            {sortedDesigns.length === 0 ? (
              <EmptyState
                icon={Icons.Designs}
                title={activeCategory === 'Archived' ? 'No Archived Designs' : 'No Footwear Models Found'}
                description={
                  activeCategory === 'Archived'
                    ? 'There are currently no archived shoe designs in the database.'
                    : `No articles match "${searchQuery}" in ${activeCategory}. Try adjusting your search query.`
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                {sortedDesigns.map((shoe) => {
                  const isSelected = selectedDesignIds.includes(shoe.id);
                  const isNew = isRecentNew(shoe);
                  const cartonUnits = shoe.pairsPerCarton || 12;
                  const cartonWholesaleTotal = shoe.price * cartonUnits;

                  return (
                    <div
                      key={shoe.id}
                      className={`group relative bg-white dark:bg-slate-850 rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md shadow-blue-500/10 dark:border-blue-400'
                          : 'border-slate-200/80 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Top Image Showcase Area */}
                      <div className="relative aspect-[4/3] bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-100/80 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900 p-4 flex items-center justify-center overflow-hidden">
                        <img
                          src={shoe.image}
                          alt={shoe.name}
                          className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-105 select-none"
                          onError={(e) => {
                            // No stock-photo substitution: hide the broken image and let the placeholder background show
                            (e.target as any).style.visibility = 'hidden';
                          }}
                        />

                        {/* Top Left: Selection Checkbox */}
                        {!shoe.isArchived && (
                          <button
                            type="button"
                            onClick={() => toggleSelectDesign(shoe.id)}
                            className={`absolute top-3 left-3 w-8 h-8 rounded-xl flex items-center justify-center border transition-all cursor-pointer backdrop-blur-md shadow-xs ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white ring-2 ring-blue-500/30'
                                : 'bg-white/90 dark:bg-slate-900/90 border-slate-300/80 dark:border-slate-700 text-transparent hover:border-slate-400 hover:text-slate-300'
                            }`}
                            title={isSelected ? 'Remove from Lookbook' : 'Select for Lookbook'}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        )}

                        {/* Top Right: Status Badges & Quick View Eye */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          {isNew && !shoe.isArchived && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/95 text-white tracking-wider shadow-sm flex items-center gap-1 backdrop-blur-xs">
                              <Sparkles className="w-2.5 h-2.5" /> NEW
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setQuickViewShoe(shoe)}
                            className="w-8 h-8 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white flex items-center justify-center transition-all cursor-pointer shadow-xs backdrop-blur-md"
                            title="Quick Specifications"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Bottom Left Badges */}
                        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5">
                          {shoe.isArchived ? (
                            <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                              Archived
                            </span>
                          ) : shoe.marginBadge ? (
                            <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80">
                              {shoe.marginBadge}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Card Body Information */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                        <div className="space-y-2">
                          {/* Article Code & Category Tag */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                              {shoe.articleCode}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              {shoe.category.split(' ')[0]}
                            </span>
                          </div>

                          {/* Shoe Name */}
                          <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight leading-snug line-clamp-1">
                            {shoe.name}
                          </h3>

                          {/* Material Micro-specs Chips */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                              <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[130px]">{shoe.upperMaterial}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                              <Package className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[90px]">{shoe.soleType}</span>
                            </span>
                          </div>
                        </div>

                        {/* Pricing & Packaging Bar */}
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
                              Wholesale Ex-Factory
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tabular-nums">
                                ₹{Number(shoe.price || 0).toLocaleString('en-IN')}
                              </span>
                              <span className="text-[11px] font-medium text-slate-400">/ pair</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 inline-block">
                              {cartonUnits} Prs/Ctn
                            </span>
                            <span className="block text-[11px] font-mono text-slate-400 mt-0.5">
                              ₹{Number(cartonWholesaleTotal || 0).toLocaleString('en-IN')}/ctn
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="pt-1">
                          {isUserAdmin ? (
                            shoe.isArchived ? (
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  icon={RotateCcw}
                                  onClick={() => handleRestore(shoe)}
                                  className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 rounded-xl"
                                >
                                  Restore
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  icon={Trash2}
                                  onClick={() => handleInitiateDelete(shoe)}
                                  className="rounded-xl"
                                >
                                  Delete
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingDesign(shoe);
                                    setIsAddModalOpen(true);
                                  }}
                                  className="flex-1 h-8 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Edit Specs</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setArchivingDesign(shoe)}
                                  title="Archive Design"
                                  className="h-8 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 text-xs font-semibold transition-all flex items-center justify-center cursor-pointer border border-transparent hover:border-amber-200"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleInitiateDelete(shoe)}
                                  title="Permanently Delete Design"
                                  className="h-8 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 text-xs font-semibold transition-all flex items-center justify-center cursor-pointer border border-transparent hover:border-rose-200"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setQuickViewShoe(shoe)}
                                className="h-8 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Specs</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsCreateOrderModalOpen(true)}
                                className="h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-600/30"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Book Order</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Quick Specs Modal */}
      {quickViewShoe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none animate-in fade-in duration-150 font-sans">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight font-display">
                  {quickViewShoe.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Article Code: {quickViewShoe.articleCode} • {quickViewShoe.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickViewShoe(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <Icons.Close size={16} strokeWidth={2} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/20 rounded-2xl p-6 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                <img
                  src={quickViewShoe.image}
                  alt={quickViewShoe.name}
                  className="max-h-52 object-contain mix-blend-multiply dark:mix-blend-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Upper Material</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{quickViewShoe.upperMaterial}</span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Sole Construction</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{quickViewShoe.soleType}</span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Carton Packing</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {quickViewShoe.pairsPerCarton ? `${quickViewShoe.pairsPerCarton} Pairs / Carton` : '12 Pairs / Carton'}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Size Breakdown</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {quickViewShoe.sizes?.length ? quickViewShoe.sizes.join(', ') : '6, 7, 8, 9, 10'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Wholesale Ex-Factory Rate</span>
                  <span className="text-xl font-black tabular-nums">
                    ₹{Number(quickViewShoe.price || 0).toLocaleString('en-IN')} / Pair
                  </span>
                </div>
                {isUserAdmin ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDesign(quickViewShoe);
                        setIsAddModalOpen(true);
                        setQuickViewShoe(null);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleInitiateDelete(quickViewShoe);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickViewShoe(null);
                      setIsCreateOrderModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-600/40"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Create Order</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add / Edit Design Modal */}
      <AddDesignModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingDesign(null);
        }}
        designToEdit={editingDesign}
        onSaved={(saved) => {
          queryClient.setQueriesData<ShoeDesign[]>({ queryKey: ['designs'] }, (old) => {
            if (!old) return [saved];
            if (editingDesign) {
              return old.map((d) => (d.id === saved.id ? saved : d));
            }
            return [saved, ...old.filter((d) => d.id !== saved.id && d.articleCode !== saved.articleCode)];
          });
          queryClient.invalidateQueries({ queryKey: ['designs'] });
          showToast(editingDesign ? 'Design specifications updated.' : 'New design published to catalog.');
        }}
      />

      {/* 6. Archive Confirmation Dialog */}
      {archivingDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn font-sans">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Archive Footwear Design?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to archive <strong>{archivingDesign.name}</strong> ({archivingDesign.articleCode})? It will be hidden from all salespeople lookbooks and order booking.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setArchivingDesign(null)}
                disabled={isArchiving}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleArchiveConfirm}
                disabled={isArchiving}
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
              >
                {isArchiving ? 'Archiving...' : 'Yes, Archive Design'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Step 4B: Permanent Delete Confirmation Modal */}
      {deletingDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn select-none font-sans">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setDeletingDesign(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <Icons.Close size={16} />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Delete Footwear Design
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                {deletingDesign.name} ({deletingDesign.articleCode})
              </p>
            </div>

            {deleteCheckLoading ? (
              <div className="py-6 flex flex-col items-center justify-center space-y-2 text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-xs">Checking order relationships &amp; history...</span>
              </div>
            ) : deleteCheckResult?.canDelete === false ? (
              /* Scenario A: Used in orders -> CANNOT delete, must archive */
              <div className="space-y-4">
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-300">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Cannot Permanently Delete</p>
                      <p className="mt-0.5">{deleteCheckResult.reason}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  To remove this design from salesman lookbooks without breaking previous order records or invoice histories, you can archive it instead.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="secondary" onClick={() => setDeletingDesign(null)} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      const toArchive = deletingDesign;
                      setDeletingDesign(null);
                      setArchivingDesign(toArchive);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
                  >
                    Archive Design Instead
                  </Button>
                </div>
              </div>
            ) : (
              /* Scenario B: Can be permanently deleted */
              <div className="space-y-4">
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-xs text-rose-800 dark:text-rose-300">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <div>
                      <p className="font-bold">Irreversible Action</p>
                      <p className="mt-0.5">
                        This will permanently delete this model from the database, remove all lookbook share references, and delete its uploaded product image from storage.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Type <span className="font-mono text-rose-600 dark:text-rose-400 font-black select-all">{deletingDesign.articleCode}</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmationCode}
                    onChange={(e) => {
                      setDeleteConfirmationCode(e.target.value);
                      setDeleteError(null);
                    }}
                    placeholder={deletingDesign.articleCode}
                    className="w-full h-10 px-3 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {deleteError && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                    {deleteError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="secondary" onClick={() => setDeletingDesign(null)} disabled={isDeleting} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting || deleteConfirmationCode.trim() !== deletingDesign.articleCode.trim()}
                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
                  >
                    {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. Lookbook Shares History Modal */}
      <DesignSharesModal
        isOpen={isShareHistoryOpen}
        onClose={() => setIsShareHistoryOpen(false)}
      />

      {/* 9. Mobile Floating Action Button (Admin only) */}
      {isUserAdmin && (
        <button
          type="button"
          onClick={() => {
            setEditingDesign(null);
            setIsAddModalOpen(true);
          }}
          className="fixed bottom-20 right-6 z-40 md:hidden w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
          title="Add New Design"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}
    </div>
  );
};
