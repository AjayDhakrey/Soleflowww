import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoeDesign } from '../../types';
import { Icons } from '../../lib/icons';
import {
  PageHeader,
  KpiCard,
  Panel,
  FilterBar,
  SearchInput,
  Select,
  Button,
  Tag,
  StatusBadge,
  EmptyState,
} from '../../components/ui';
import { DesignSharesModal } from '../../components/designs/DesignSharesModal';

interface DesignsPageProps {
  onNavigate: (path: string) => void;
}

export const DesignsPage: React.FC<DesignsPageProps> = ({ onNavigate }) => {
  const {
    designs,
    selectedDesignIds,
    toggleSelectDesign,
    clearSelectedDesigns,
    setIsShareModalOpen,
    setIsCreateOrderModalOpen,
    showToast,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'price_high' | 'margin'>('popular');
  const [quickViewShoe, setQuickViewShoe] = useState<ShoeDesign | null>(null);
  const [isShareHistoryOpen, setIsShareHistoryOpen] = useState(false);

  const categories = [
    'All',
    'Athletic Sneakers',
    'Formal Derby & Oxford',
    'Leather Boots',
    'Loafers & Casuals',
  ];

  // Filtering
  const filteredDesigns = designs.filter((d) => {
    const matchesCat = activeCategory === 'All' || d.category === activeCategory;
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

  const popularCount = designs.filter((d) => d.status === 'Popular').length;
  const highMarginCount = designs.filter((d) => d.marginBadge?.includes('High') || d.marginBadge?.includes('40%')).length;

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
              variant="primary"
              icon={Icons.WhatsApp}
              onClick={() => setIsShareModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Share Lookbook ({selectedDesignIds.length})
            </Button>
          </>
        }
      />

      {/* 2. KPI Summary Row with Violet Bubbles for Designs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KpiCard
          label="Total Active Articles"
          value={`${designs.length} Models`}
          icon={Icons.Designs}
          bubbleColor="violet"
          caption="Ready for factory booking"
        />
        <KpiCard
          label="Popular Fast-Movers"
          value={`${popularCount} Styles`}
          icon={Icons.TrendingUp}
          bubbleColor="amber"
          caption="High wholesale repeat rates"
        />
        <KpiCard
          label="High Margin Lines"
          value={`${highMarginCount} SKUs`}
          icon={Icons.Payments}
          bubbleColor="green"
          caption="35%–45% retailer markups"
        />
        <KpiCard
          label="Selected for Sharing"
          value={`${selectedDesignIds.length} Articles`}
          icon={Icons.Share}
          bubbleColor="zinc"
          caption="Included in WhatsApp lookbook"
        />
      </div>

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

        {/* Footwear Grid */}
        <div className="p-4 md:p-6">
          {sortedDesigns.length === 0 ? (
            <EmptyState
              icon={Icons.Designs}
              title="No Footwear Models Found"
              description={`No articles match "${searchQuery}" in ${activeCategory}. Try adjusting your search query.`}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedDesigns.map((shoe) => {
                const isSelected = selectedDesignIds.includes(shoe.id);

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
                      />

                      {/* Floating Selection Checkbox */}
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

                      {/* Quick View Button */}
                      <button
                        type="button"
                        onClick={() => setQuickViewShoe(shoe)}
                        className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Quick Specifications"
                      >
                        <Icons.View size={15} strokeWidth={1.75} />
                      </button>

                      {/* Status / Margin Badge */}
                      {shoe.marginBadge && (
                        <div className="absolute bottom-3 left-3">
                          <Tag variant="purple">{shoe.marginBadge}</Tag>
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
                          {shoe.cartonPack || '12 Prs/Ctn'}
                        </span>
                      </div>

                      {/* Actions */}
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl"
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
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{quickViewShoe.cartonPack || '12 Pairs / Carton'}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="text-xs text-slate-400 block">Size Breakdown</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{quickViewShoe.sizeBreakdown || '6(2), 7(3), 8(3), 9(2), 10(2)'}</span>
                </div>
              </div>

              <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold block">Wholesale Ex-Factory Rate</span>
                  <span className="text-xl font-bold text-zinc-900 dark:text-white tabular-nums">
                    ₹{quickViewShoe.price.toLocaleString('en-IN')} / Pair
                  </span>
                </div>
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Lookbook Shares History Modal */}
      <DesignSharesModal
        isOpen={isShareHistoryOpen}
        onClose={() => setIsShareHistoryOpen(false)}
      />
    </div>
  );
};
