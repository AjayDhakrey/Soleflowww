import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthProvider';
import { ShoeDesign } from '../../types';
import { designsService } from '../../services/designs';
import { useDesignCatalog } from '../../hooks/useDesignCatalog';
import { useDesignsRealtime } from '../../hooks/useDesignsRealtime';
import { Icons } from '../../lib/icons';
import {
  PageHeader,
  Panel,
  FilterBar,
  SearchInput,
  Select,
  Button,
  Tag,
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
  CheckCircle2,
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
    'All',
    'Athletic Sneakers',
    'Formal Derby & Oxford',
    'Leather Boots',
    'Loafers & Casuals',
    ...(isUserAdmin ? ['Archived'] : []),
  ];

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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-12">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Catalogue' }]}
        title="Footwear Catalogue & Lookbook"
        subtitle="Curated B2B wholesale designs, material specs, and WhatsApp shareable lookbooks."
        actions={
          <>
            <Button
              variant="secondary"
              icon={Icons.AuditLog}
              onClick={() => setIsShareHistoryOpen(true)}
            >
              Sharing History
            </Button>
            <Button
              variant="secondary"
              icon={Icons.WhatsApp}
              onClick={() => setIsShareModalOpen(true)}
              className="text-emerald-700 dark:text-emerald-400"
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
                className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
              >
                Add Design
              </Button>
            )}
          </>
        }
      />

      {/* 2. KPI Summary Row */}
      <DesignsKpiCards
        totalActiveModels={activeCatalogCount || rawDesigns.length || 0}
        popularStylesCount={popularCount || 0}
        highMarginCount={highMarginCount || 0}
        selectedCount={selectedDesignIds.length}
      />

      {/* 3. Catalogue Grid Panel */}
      <Panel noPadding>
        {/* Filter Bar */}
        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <FilterBar>
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search by article code (e.g. SF-104), model name, material..."
              containerClassName="max-w-md"
            />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              options={[
                { label: 'Sort: Most Popular', value: 'popular' },
                { label: 'Price: Low to High', value: 'price_low' },
                { label: 'Price: High to Low', value: 'price_high' },
                { label: 'Highest Margin', value: 'margin' },
              ]}
            />
            {selectedDesignIds.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                icon={Icons.Close}
                onClick={clearSelectedDesigns}
              >
                Clear Selection ({selectedDesignIds.length})
              </Button>
            )}
          </FilterBar>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold shadow-xs'
                      : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Banner */}
        {isError && (
          <div className="m-4 md:m-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between">
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
          <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4 animate-pulse"
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
          <div className="p-4 md:p-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedDesigns.map((shoe) => {
                  const isSelected = selectedDesignIds.includes(shoe.id);
                  const isNew = isRecentNew(shoe);

                  return (
                    <div
                      key={shoe.id}
                      className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-150 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${
                        isSelected
                          ? 'border-[#4F8EF7] ring-2 ring-[#4F8EF7]/20 dark:border-[#4F8EF7]'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Image Area on Slate-50 */}
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 relative aspect-[4/3] flex items-center justify-center">
                        <img
                          src={shoe.image}
                          alt={shoe.name}
                          className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-200 hover:scale-105"
                          onError={(e) => {
                            (e.target as any).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff';
                          }}
                        />

                        {/* Floating Selection Checkbox */}
                        {!shoe.isArchived && (
                          <button
                            type="button"
                            onClick={() => toggleSelectDesign(shoe.id)}
                            className={`absolute top-3 left-3 w-7 h-7 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#3B82F6] border-[#3B82F6] text-white shadow-xs'
                                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-transparent hover:border-slate-400'
                            }`}
                            title={isSelected ? 'Deselect from Lookbook' : 'Select for Lookbook'}
                          >
                            <Icons.Check size={16} strokeWidth={2.5} />
                          </button>
                        )}

                        {/* Top Right: New Badge & Quick View */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          {isNew && !shoe.isArchived && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> New
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setQuickViewShoe(shoe)}
                            className="w-7 h-7 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                            title="Quick Specifications"
                          >
                            <Icons.View size={15} strokeWidth={1.75} />
                          </button>
                        </div>

                        {/* Status / Margin Badge */}
                        {shoe.marginBadge && !shoe.isArchived && (
                          <div className="absolute bottom-3 left-3">
                            <Tag variant="purple">{shoe.marginBadge}</Tag>
                          </div>
                        )}

                        {shoe.isArchived && (
                          <div className="absolute bottom-3 left-3">
                            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                              Archived
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Content Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                              {shoe.articleCode}
                            </span>
                            <Tag variant="slate">{shoe.category.split(' ')[0]}</Tag>
                          </div>

                          <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight mt-1 leading-snug">
                            {shoe.name}
                          </h3>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                            {shoe.upperMaterial} • {shoe.soleType}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                          <div>
                            <span className="text-xs text-slate-400">Wholesale:</span>
                            <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                              ₹{shoe.price.toLocaleString('en-IN')}{' '}
                              <span className="text-xs font-normal text-slate-400">/ pr</span>
                            </p>
                          </div>
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            {shoe.pairsPerCarton ? `${shoe.pairsPerCarton} Prs/Ctn` : '12 Prs/Ctn'}
                          </span>
                        </div>

                        {/* Actions Area */}
                        {isUserAdmin ? (
                          <div className="pt-2 space-y-2">
                            {shoe.isArchived ? (
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  icon={RotateCcw}
                                  onClick={() => handleRestore(shoe)}
                                  className="text-emerald-600 hover:text-emerald-700"
                                >
                                  Restore
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  icon={Trash2}
                                  onClick={() => handleInitiateDelete(shoe)}
                                >
                                  Delete
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  icon={Edit2}
                                  onClick={() => {
                                    setEditingDesign(shoe);
                                    setIsAddModalOpen(true);
                                  }}
                                  className="flex-1"
                                >
                                  Edit Specs
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  icon={Archive}
                                  onClick={() => setArchivingDesign(shoe)}
                                  title="Archive Design"
                                  className="text-amber-600 hover:text-amber-700"
                                >
                                  Archive
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={Trash2}
                                  onClick={() => handleInitiateDelete(shoe)}
                                  title="Permanently Delete Design"
                                  className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-2"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={Icons.View}
                              onClick={() => setQuickViewShoe(shoe)}
                            >
                              Specs
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              icon={Icons.Orders}
                              onClick={() => {
                                setIsCreateOrderModalOpen(true);
                              }}
                            >
                              Book Order
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Panel>

      {/* 4. Quick Specs Modal */}
      {quickViewShoe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs select-none animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  {quickViewShoe.name}
                </h3>
                <p className="text-xs font-mono text-slate-500">
                  Article Code: {quickViewShoe.articleCode} • {quickViewShoe.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickViewShoe(null)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl cursor-pointer"
              >
                <Icons.Close size={18} strokeWidth={1.75} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-center justify-center">
                <img
                  src={quickViewShoe.image}
                  alt={quickViewShoe.name}
                  className="max-h-48 object-contain mix-blend-multiply dark:mix-blend-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="text-xs text-slate-400 block">Upper Material</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{quickViewShoe.upperMaterial}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="text-xs text-slate-400 block">Sole Construction</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{quickViewShoe.soleType}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="text-xs text-slate-400 block">Carton Packing</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {quickViewShoe.pairsPerCarton ? `${quickViewShoe.pairsPerCarton} Pairs / Carton` : '12 Pairs / Carton'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="text-xs text-slate-400 block">Size Breakdown</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {quickViewShoe.sizes?.length ? quickViewShoe.sizes.join(', ') : '6, 7, 8, 9, 10'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold block">Wholesale Ex-Factory Rate</span>
                  <span className="text-xl font-bold text-zinc-900 dark:text-white tabular-nums">
                    ₹{quickViewShoe.price.toLocaleString('en-IN')} / Pair
                  </span>
                </div>
                {isUserAdmin ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Edit2}
                      onClick={() => {
                        setEditingDesign(quickViewShoe);
                        setIsAddModalOpen(true);
                        setQuickViewShoe(null);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() => {
                        handleInitiateDelete(quickViewShoe);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    icon={Icons.Orders}
                    onClick={() => {
                      setQuickViewShoe(null);
                      setIsCreateOrderModalOpen(true);
                    }}
                  >
                    Create Order
                  </Button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
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
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleArchiveConfirm}
                disabled={isArchiving}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isArchiving ? 'Archiving...' : 'Yes, Archive Design'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Step 4B: Permanent Delete Confirmation Modal */}
      {deletingDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn select-none">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setDeletingDesign(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <Icons.Close size={18} />
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
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="text-xs">Checking order relationships &amp; history...</span>
              </div>
            ) : deleteCheckResult?.canDelete === false ? (
              /* Scenario A: Used in orders -> CANNOT delete, must archive */
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                  <div className="flex items-start gap-2">
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
                  <Button variant="secondary" onClick={() => setDeletingDesign(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      const toArchive = deletingDesign;
                      setDeletingDesign(null);
                      setArchivingDesign(toArchive);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Archive Design Instead
                  </Button>
                </div>
              </div>
            ) : (
              /* Scenario B: Can be permanently deleted */
              <div className="space-y-4">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-800 dark:text-rose-300">
                  <div className="flex items-start gap-2">
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
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {deleteError && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                    {deleteError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="secondary" onClick={() => setDeletingDesign(null)} disabled={isDeleting}>
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting || deleteConfirmationCode.trim() !== deletingDesign.articleCode.trim()}
                    className="bg-rose-600 hover:bg-rose-700 text-white"
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
          className="fixed bottom-20 right-6 z-40 md:hidden w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
          title="Add New Design"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}
    </div>
  );
};
