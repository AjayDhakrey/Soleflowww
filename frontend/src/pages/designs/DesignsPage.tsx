import React, { useState } from 'react';
import {
  Search,
  Share2,
  Plus,
  Check,
  Star,
  Zap,
  ShoppingBag,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Eye,
  X,
  Truck,
  ShieldCheck,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ShoeDesign } from '../../types';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickViewShoe, setQuickViewShoe] = useState<ShoeDesign | null>(null);

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

  // Sorting (Amazon / Flipkart Style)
  const sortedDesigns = [...filteredDesigns].sort((a, b) => {
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    if (sortBy === 'margin') {
      const marginA = a.marginBadge?.includes('High') ? 2 : 1;
      const marginB = b.marginBadge?.includes('High') ? 2 : 1;
      return marginB - marginA;
    }
    // Default: 'popular'
    const popA = a.status === 'Popular' ? 2 : a.status === 'New Designs' ? 1 : 0;
    const popB = b.status === 'Popular' ? 2 : b.status === 'New Designs' ? 1 : 0;
    return popB - popA;
  });

  // Calculate estimated retail MRP and margin %
  const getEstimatedMrp = (price: number) => {
    return Math.round((price * 2.2) / 50) * 50 - 1; // e.g. 1100 -> 2399
  };

  const getMarginPercentage = (price: number, mrp: number) => {
    return Math.round(((mrp - price) / mrp) * 100);
  };

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-3.5 sm:space-y-6 max-w-7xl mx-auto select-none pb-28">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 inline-block">
            B2B Wholesale Catalogue
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            SoleFlow Footwear Collection
          </h1>
        </div>

        {/* Lookbook Share Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share WhatsApp Lookbook ({selectedDesignIds.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Amazon / Flipkart Style Sticky Search & Filter Bar */}
      <div className="bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs space-y-2 sticky top-0 z-20">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Search Box */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-2.5 sm:left-3 top-2.5 sm:top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search article (SF-204), shoe name..."
              className="w-full h-8 sm:h-10 pl-7 sm:pl-9 pr-7 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 sm:top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold p-0.5"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown (Amazon / Flipkart Style) */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 sm:h-10 px-2 sm:px-3 text-[11px] sm:text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none cursor-pointer max-w-[110px] sm:max-w-none truncate"
            >
              <option value="popular">Popular</option>
              <option value="price_low">Price: Low</option>
              <option value="price_high">Price: High</option>
              <option value="margin">Margin %</option>
            </select>
          </div>

          {/* Grid vs List View Toggle (Hidden on small mobile to favor Amazon 2-col standard) */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View (Amazon / Flipkart 2-Col)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Chips (Horizontal Scroll like Amazon / Flipkart App) */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-1 min-w-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Select All Toggle for Lookbook */}
          <button
            onClick={() => {
              if (selectedDesignIds.length === designs.length) {
                clearSelectedDesigns();
              } else {
                designs.forEach((d) => {
                  if (!selectedDesignIds.includes(d.id)) toggleSelectDesign(d.id);
                });
              }
            }}
            className="text-[10px] sm:text-xs font-bold text-blue-600 hover:text-blue-800 whitespace-nowrap shrink-0 px-1 py-0.5"
          >
            {selectedDesignIds.length === designs.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* 3. Product Catalog Grid (Amazon / Flipkart 2-Column Mobile Standard) */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4'
            : 'space-y-3'
        }
      >
        {sortedDesigns.map((shoe) => {
          const isSelected = selectedDesignIds.includes(shoe.id);
          const mrp = getEstimatedMrp(shoe.price);
          const marginPct = getMarginPercentage(shoe.price, mrp);

          // Amazon / Flipkart 2-Column Card View
          if (viewMode === 'grid') {
            return (
              <div
                key={shoe.id}
                className={`bg-white rounded-xl sm:rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                  isSelected ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200/90'
                }`}
              >
                <div>
                  {/* Image Container with Badges */}
                  <div
                    onClick={() => setQuickViewShoe(shoe)}
                    className="relative aspect-square sm:aspect-4/3 bg-slate-50 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={shoe.image}
                      alt={shoe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Flipkart / Amazon Style Assured / Bestseller Badge (Top-Left) */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
                      {shoe.status === 'Popular' ? (
                        <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5 fill-slate-950" /> Bestseller
                        </span>
                      ) : shoe.status === 'New Designs' ? (
                        <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-xs">
                          New Launch
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" /> Assured
                        </span>
                      )}

                      {shoe.marginBadge && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-xs text-white">
                          {shoe.marginBadge}
                        </span>
                      )}
                    </div>

                    {/* Lookbook Checkbox / Heart Pill (Top-Right) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectDesign(shoe.id);
                      }}
                      className={`absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl backdrop-blur-xs flex items-center justify-center cursor-pointer shadow-xs transition-all z-10 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/90 text-slate-400 hover:text-slate-800 hover:bg-white'
                      }`}
                      title={isSelected ? 'Selected for Lookbook' : 'Add to WhatsApp Lookbook'}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Quick View Button on Image Hover */}
                    <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-2.5 py-1 bg-white/95 backdrop-blur-xs text-slate-900 rounded-lg text-[10px] font-bold shadow-md flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Quick Specs
                      </span>
                    </div>

                    {/* Bottom Floating Color Swatch Snippet */}
                    <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-slate-900/70 backdrop-blur-xs text-white text-[8px] font-bold">
                      {shoe.colors.length} Colors • UK {shoe.sizes[0]}-{shoe.sizes[shoe.sizes.length - 1]}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-2.5 sm:p-3.5 space-y-1.5">
                    {/* Article Code & Category */}
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
                      <span>{shoe.articleCode}</span>
                      <span className="truncate max-w-[80px] sm:max-w-none">{shoe.category.split(' ')[0]}</span>
                    </div>

                    {/* Shoe Title (Amazon / Flipkart 2-line title) */}
                    <h3
                      onClick={() => setQuickViewShoe(shoe)}
                      className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight line-clamp-2 hover:text-blue-600 cursor-pointer"
                    >
                      {shoe.name}
                    </h3>

                    {/* Star Rating & Sold Count (Classic Flipkart / Amazon Social Proof) */}
                    <div className="flex items-center gap-1 pt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-700 text-white font-black text-[9px] flex items-center gap-0.5">
                        4.8 <Star className="w-2.5 h-2.5 fill-current" />
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium truncate">
                        (850+ prs)
                      </span>
                    </div>

                    {/* Pricing Block (Amazon / Flipkart Wholesale Style) */}
                    <div className="pt-1">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-sm sm:text-base font-black text-slate-900 font-display">
                          ₹{shoe.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400">/pair</span>
                        <span className="text-[10px] text-slate-400 line-through">
                          ₹{mrp.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 block">
                        {marginPct}% Retail Margin
                      </span>
                    </div>

                    {/* Packaging & MOQ */}
                    <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100 flex items-center justify-between">
                      <span>MOQ: <strong>{shoe.moqPairs} Prs</strong></span>
                      <span className="font-mono text-slate-400">{shoe.moqCartons} Ctns</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions (Amazon / Flipkart Style) */}
                <div className="p-2 sm:p-3 pt-0 flex items-center gap-1.5">
                  <button
                    onClick={() => setIsCreateOrderModalOpen(true)}
                    className="flex-1 py-2 sm:py-2 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-all min-h-[34px]"
                  >
                    <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span>+ Order</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!isSelected) toggleSelectDesign(shoe.id);
                      setIsShareModalOpen(true);
                    }}
                    className="py-2 sm:py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-colors min-h-[34px] shrink-0"
                    title="Share WhatsApp Lookbook"
                  >
                    <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                    <span className="hidden xs:inline">Share</span>
                  </button>
                </div>
              </div>
            );
          }

          // List View (Full Horizontal Card)
          return (
            <div
              key={shoe.id}
              className={`bg-white rounded-2xl border p-3 sm:p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between ${
                isSelected ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200/90'
              }`}
            >
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div
                  onClick={() => setQuickViewShoe(shoe)}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0 cursor-pointer relative"
                >
                  <img
                    src={shoe.image}
                    alt={shoe.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 px-1 rounded bg-slate-900/80 text-white text-[8px] font-bold">
                    {shoe.status}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-blue-600">
                      {shoe.articleCode}
                    </span>
                    <span className="text-[10px] text-slate-400">• {shoe.category}</span>
                  </div>
                  <h3
                    onClick={() => setQuickViewShoe(shoe)}
                    className="text-sm font-extrabold text-slate-900 truncate hover:text-blue-600 cursor-pointer"
                  >
                    {shoe.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {shoe.upperMaterial} • {shoe.soleType}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-700 text-white font-bold text-[9px]">
                      4.8 ★
                    </span>
                    <span className="text-xs font-black text-slate-900 font-mono">
                      ₹{shoe.price.toLocaleString('en-IN')}/pair
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      ({marginPct}% Margin)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <button
                  onClick={() => setQuickViewShoe(shoe)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Specs
                </button>
                <button
                  onClick={() => setIsCreateOrderModalOpen(true)}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Order</span>
                </button>
                <button
                  onClick={() => {
                    toggleSelectDesign(shoe.id);
                  }}
                  className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Toggle Lookbook"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {sortedDesigns.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <p className="text-sm font-bold text-slate-700">No shoe designs match your filter.</p>
          <p className="text-xs text-slate-400">Try searching another article code or clear category filters.</p>
          <button
            onClick={() => {
              setActiveCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. AMAZON / FLIPKART STYLE PRODUCT QUICK VIEW MODAL / DETAIL SHEET        */}
      {/* ========================================================================= */}
      {quickViewShoe && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {quickViewShoe.articleCode}
                </span>
                <span className="text-xs font-bold text-slate-900 truncate">
                  {quickViewShoe.name}
                </span>
              </div>
              <button
                onClick={() => setQuickViewShoe(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Product Hero Image */}
              <div className="relative aspect-16/9 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                <img
                  src={quickViewShoe.image}
                  alt={quickViewShoe.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black uppercase">
                    {quickViewShoe.status}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                    {quickViewShoe.category}
                  </span>
                </div>
              </div>

              {/* Price Breakdown (Amazon / Flipkart Style) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block font-medium">Ex-Factory Wholesale Rate</span>
                    <span className="text-2xl font-black text-slate-900 font-display">
                      ₹{quickViewShoe.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500 font-normal"> / pair + GST</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 block font-medium">Suggested Retail (MRP)</span>
                    <span className="text-lg font-bold text-slate-400 line-through">
                      ₹{getEstimatedMrp(quickViewShoe.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Retailer Gross Margin: ~{getMarginPercentage(quickViewShoe.price, getEstimatedMrp(quickViewShoe.price))}%
                  </span>
                  <span className="font-mono text-slate-600">
                    Carton (12 prs): ₹{(quickViewShoe.price * 12).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Flipkart / Amazon Style Delivery & Assurance Highlights */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight">24-48 Hr Dispatch</span>
                    <span className="text-[10px] text-slate-500">Agra Bilty &amp; Transport</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight">100% QA Inspection</span>
                    <span className="text-[10px] text-slate-500">Zero Defect Guarantee</span>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Footwear Specifications
                </h4>
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden text-xs">
                  <div className="p-2.5 flex justify-between bg-slate-50/50">
                    <span className="text-slate-500">Sole Formulation</span>
                    <span className="font-semibold text-slate-900 text-right">{quickViewShoe.soleType}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="text-slate-500">Upper Material</span>
                    <span className="font-semibold text-slate-900 text-right">{quickViewShoe.upperMaterial}</span>
                  </div>
                  <div className="p-2.5 flex justify-between bg-slate-50/50">
                    <span className="text-slate-500">Master Packaging</span>
                    <span className="font-semibold text-slate-900 text-right">
                      {quickViewShoe.pairsPerCarton} Pairs / Carton (Assorted Size Ratio)
                    </span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="text-slate-500">Minimum Order (MOQ)</span>
                    <span className="font-semibold text-slate-900 text-right font-mono">
                      {quickViewShoe.moqPairs} Pairs ({quickViewShoe.moqCartons} Cartons)
                    </span>
                  </div>
                  <div className="p-2.5 flex justify-between bg-slate-50/50">
                    <span className="text-slate-500">Available Sizes</span>
                    <span className="font-semibold text-slate-900 text-right font-mono">
                      UK {quickViewShoe.sizes.join(', ')}
                    </span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="text-slate-500">Color Options</span>
                    <span className="font-semibold text-slate-900 text-right">
                      {quickViewShoe.colors.join(' • ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-100 flex items-center gap-2 bg-slate-50/80">
              <button
                onClick={() => {
                  toggleSelectDesign(quickViewShoe.id);
                  setQuickViewShoe(null);
                  showToast('Added to WhatsApp Lookbook selection');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border ${
                  selectedDesignIds.includes(quickViewShoe.id)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{selectedDesignIds.includes(quickViewShoe.id) ? 'Selected for Lookbook' : 'Add to Lookbook'}</span>
              </button>

              <button
                onClick={() => {
                  setQuickViewShoe(null);
                  setIsCreateOrderModalOpen(true);
                }}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Book Wholesale Batch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. AMAZON / FLIPKART STICKY BOTTOM LOOKBOOK BAR                            */}
      {/* ========================================================================= */}
      {selectedDesignIds.length > 0 && (
        <div className="fixed bottom-16 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-2xl flex items-center justify-between sm:justify-start gap-2.5 sm:gap-6 z-40 border border-slate-700 max-w-lg mx-auto animate-in slide-in-from-bottom-5">
          <div className="min-w-0">
            <span className="text-xs font-bold block truncate">
              {selectedDesignIds.length} Selected
            </span>
            <span className="text-[10px] text-slate-400 hidden xs:block">
              WhatsApp wholesale catalog
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={clearSelectedDesigns}
              className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg active:bg-slate-800"
            >
              Clear
            </button>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3 sm:px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
