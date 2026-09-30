import React, { useState, useEffect, useRef } from 'react';
import { ShoeDesign } from '../../types';
import { designsService } from '../../services/designs';
import { Icons } from '../../lib/icons';
import { Button } from '../ui';
import { X, Upload, Image as ImageIcon, Check, Plus, AlertCircle, Loader2, Trash2 } from 'lucide-react';

interface AddDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  designToEdit?: ShoeDesign | null;
  onSaved?: (design: ShoeDesign) => void;
}

const CATEGORIES: ShoeDesign['category'][] = [
  'Athletic Sneakers',
  'Formal Derby & Oxford',
  'Leather Boots',
  'Loafers & Casuals',
];

const AVAILABLE_SIZES = [5, 6, 7, 8, 9, 10, 11, 12];
const DEFAULT_COLORS = ['Midnight Black', 'Classic Tan', 'Dark Brown', 'Slate Grey', 'Navy Blue', 'Burgundy', 'Pure White'];

const STATUS_OPTIONS: ShoeDesign['status'][] = [
  'New Designs',
  'Available',
  'Popular',
  'Archived',
];

export const AddDesignModal: React.FC<AddDesignModalProps> = ({
  isOpen,
  onClose,
  designToEdit,
  onSaved,
}) => {
  const isEditing = Boolean(designToEdit);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [articleCode, setArticleCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ShoeDesign['category']>('Formal Derby & Oxford');
  const [price, setPrice] = useState<number | string>(1450);
  const [moqPairs, setMoqPairs] = useState<number | string>(24);
  const [moqCartons, setMoqCartons] = useState<number | string>(2);
  const [pairsPerCarton, setPairsPerCarton] = useState<number | string>(12);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([6, 7, 8, 9, 10]);
  const [colors, setColors] = useState<string[]>(['Midnight Black', 'Classic Tan']);
  const [customColorInput, setCustomColorInput] = useState('');
  const [soleType, setSoleType] = useState('TPR Lug Sole');
  const [upperMaterial, setUpperMaterial] = useState('Full Grain Leather');
  const [subline, setSubline] = useState('');
  const [status, setStatus] = useState<ShoeDesign['status']>('New Designs');
  const [imageUrl, setImageUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [articleError, setArticleError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (designToEdit) {
        setArticleCode(designToEdit.articleCode || '');
        setName(designToEdit.name || '');
        setCategory(designToEdit.category || 'Formal Derby & Oxford');
        setPrice(designToEdit.price || 0);
        setMoqPairs(designToEdit.moqPairs || 24);
        setMoqCartons(designToEdit.moqCartons || 2);
        setPairsPerCarton(designToEdit.pairsPerCarton || 12);
        setSelectedSizes(Array.isArray(designToEdit.sizes) && designToEdit.sizes.length > 0 ? designToEdit.sizes : [6, 7, 8, 9, 10]);
        setColors(Array.isArray(designToEdit.colors) && designToEdit.colors.length > 0 ? designToEdit.colors : ['Midnight Black']);
        setSoleType(designToEdit.soleType || 'TPR Lug Sole');
        setUpperMaterial(designToEdit.upperMaterial || 'Full Grain Leather');
        setSubline(designToEdit.subline || '');
        setStatus(designToEdit.status || 'Available');
        setImageUrl(designToEdit.image || '');
      } else {
        // Reset form for fresh design creation — do NOT prefill any mock image
        const randId = Math.floor(1000 + Math.random() * 9000);
        setArticleCode(`SF-ART-${randId}`);
        setName('');
        setCategory('Formal Derby & Oxford');
        setPrice(1450);
        setMoqPairs(24);
        setMoqCartons(2);
        setPairsPerCarton(12);
        setSelectedSizes([6, 7, 8, 9, 10]);
        setColors(['Midnight Black', 'Classic Tan']);
        setSoleType('TPR Lug Sole');
        setUpperMaterial('Full Grain Leather');
        setSubline('Heritage Executive Series');
        setStatus('New Designs');
        setImageUrl('');
      }
      setErrorMessage(null);
      setArticleError(null);
      setCustomColorInput('');
      setIsDragOver(false);
    }
  }, [isOpen, designToEdit]);

  if (!isOpen) return null;

  const toggleSize = (sz: number) => {
    setSelectedSizes((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz].sort((a, b) => a - b)
    );
  };

  const toggleColor = (c: string) => {
    setColors((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const handleAddCustomColor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customColorInput.trim();
    if (trimmed && !colors.includes(trimmed)) {
      setColors((prev) => [...prev, trimmed]);
      setCustomColorInput('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setIsUploading(true);
      setErrorMessage(null);
      const uploadRes = await designsService.uploadDesignImage(file);
      setIsUploading(false);
      if (uploadRes.success && uploadRes.url) {
        setImageUrl(uploadRes.url);
      } else {
        setErrorMessage(uploadRes.error || 'Failed to upload design image.');
      }
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);

    const uploadRes = await designsService.uploadDesignImage(file);
    setIsUploading(false);

    if (uploadRes.success && uploadRes.url) {
      setImageUrl(uploadRes.url);
    } else {
      setErrorMessage(uploadRes.error || 'Failed to upload design image.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setArticleError(null);

    // Client-side validations
    if (!articleCode.trim()) {
      setArticleError('Article code is required.');
      return;
    }
    if (!name.trim()) {
      setErrorMessage('Design title/name is required.');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage('Wholesale price must be greater than ₹0.');
      return;
    }
    if (selectedSizes.length === 0) {
      setErrorMessage('Please select at least one available shoe size.');
      return;
    }
    if (colors.length === 0) {
      setErrorMessage('Please specify at least one colorway.');
      return;
    }

    setIsSaving(true);

    if (isEditing && designToEdit) {
      const updateRes = await designsService.updateDesignV2(designToEdit.id, {
        name: name.trim(),
        category,
        price: numPrice,
        moqPairs: Number(moqPairs) || 24,
        moqCartons: Number(moqCartons) || 2,
        sizes: selectedSizes,
        colors,
        soleType: soleType.trim(),
        upperMaterial: upperMaterial.trim(),
        subline: subline.trim(),
        status,
        image: imageUrl,
      });

      setIsSaving(false);

      if (updateRes.success && updateRes.data) {
        if (onSaved) onSaved(updateRes.data);
        onClose();
      } else {
        setErrorMessage(updateRes.error || 'Failed to update design.');
      }
    } else {
      const createRes = await designsService.createDesignV2({
        articleCode: articleCode.trim(),
        name: name.trim(),
        category,
        price: numPrice,
        moqPairs: Number(moqPairs) || 24,
        moqCartons: Number(moqCartons) || 2,
        sizes: selectedSizes,
        colors,
        soleType: soleType.trim(),
        upperMaterial: upperMaterial.trim(),
        subline: subline.trim(),
        image: imageUrl,
      });

      setIsSaving(false);

      if (createRes.success && createRes.data) {
        if (onSaved) onSaved(createRes.data);
        onClose();
      } else {
        const err = createRes.error || 'Failed to create design.';
        if (err.includes('already exists') || err.includes('23505')) {
          setArticleError(err);
        } else {
          setErrorMessage(err);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Icons.Designs className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? `Edit Design (${designToEdit?.articleCode})` : 'Add New Footwear Design'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? 'Update specifications and pricing in the master catalog'
                  : 'Only administrators can add new models to the wholesale catalog'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMessage && (
            <div className="flex items-center gap-3 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Top Row: Image Upload & Preview + Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Image Upload & Preview Box (5 cols) */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Article Shoe Image <span className="text-slate-400 font-normal">(Required)</span>
                </label>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-[11px] text-rose-500 hover:text-rose-600 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Remove Photo
                  </button>
                )}
              </div>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative group border-2 border-dashed rounded-2xl p-3 flex flex-col items-center justify-center min-h-[210px] overflow-hidden transition-all ${
                  isDragOver
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-400'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 hover:border-slate-400'
                }`}
              >
                {imageUrl ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-xs border border-slate-200/60 dark:border-slate-700/60">
                    <img
                      src={imageUrl}
                      alt="Design Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        icon={Upload}
                        className="bg-white/95 text-slate-900 text-xs shadow-md"
                      >
                        {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Change Photo'}
                      </Button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="p-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs shadow-md transition-colors cursor-pointer"
                        title="Remove Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 w-full flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
                      {isUploading ? <Loader2 className="w-7 h-7 animate-spin text-indigo-600" /> : <Upload className="w-7 h-7" />}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Upload Shoe Image
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                      Drag & drop your product photo or click below
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      icon={Upload}
                      className="mt-3 text-xs"
                    >
                      {isUploading ? 'Uploading...' : 'Choose Shoe Image'}
                    </Button>
                    <p className="text-[10px] text-slate-400 mt-2">PNG, JPG, WebP up to 10 MB</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/jpg"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </div>

              {/* Direct URL Input fallback */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Or Paste Image URL (Optional)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... (e.g. Supabase or CDN link)"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Right: Core Fields (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Article Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={articleCode}
                    onChange={(e) => {
                      setArticleCode(e.target.value.toUpperCase());
                      setArticleError(null);
                    }}
                    placeholder="e.g. SF-DRB-902"
                    disabled={isEditing}
                    className={`w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border rounded-xl font-mono uppercase focus:outline-none focus:ring-2 ${
                      articleError
                        ? 'border-rose-500 focus:ring-rose-400'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                    } ${isEditing ? 'opacity-70 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50' : ''}`}
                    required
                  />
                  {articleError && <p className="text-xs text-rose-500 mt-1">{articleError}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ShoeDesign['category'])}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Design Title / Model Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Italian Oxford Cap Toe"
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Wholesale Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    MOQ Pairs
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={moqPairs}
                    onChange={(e) => setMoqPairs(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    MOQ Cartons
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={moqCartons}
                    onChange={(e) => setMoqCartons(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sizes & Colors Configuration */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
            {/* Size Run Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Available Size Run (UK/IND) <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SIZES.map((sz) => {
                  const isSelected = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`w-10 h-10 rounded-xl font-semibold text-xs transition-all flex items-center justify-center ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors Selection & Custom Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Colorways <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {DEFAULT_COLORS.map((col) => {
                  const isSelected = colors.includes(col);
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => toggleColor(col)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {col}
                    </button>
                  );
                })}

                {/* Custom active colors */}
                {colors
                  .filter((c) => !DEFAULT_COLORS.includes(c))
                  .map((customCol) => (
                    <span
                      key={customCol}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white flex items-center gap-1.5"
                    >
                      <Check className="w-3 h-3" />
                      {customCol}
                      <button
                        type="button"
                        onClick={() => toggleColor(customCol)}
                        className="hover:text-rose-200 ml-1"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
              </div>

              {/* Add Custom Color Input */}
              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  value={customColorInput}
                  onChange={(e) => setCustomColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomColor();
                    }
                  }}
                  placeholder="Custom color (e.g. Cherry Mahogany)"
                  className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddCustomColor}
                  icon={Plus}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Technical Specifications</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sole Type
                </label>
                <input
                  type="text"
                  value={soleType}
                  onChange={(e) => setSoleType(e.target.value)}
                  placeholder="e.g. Molded TPR Outsole"
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Upper Material
                </label>
                <input
                  type="text"
                  value={upperMaterial}
                  onChange={(e) => setUpperMaterial(e.target.value)}
                  placeholder="e.g. Full Grain Crust Leather"
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subline / Tagline
                </label>
                <input
                  type="text"
                  value={subline}
                  onChange={(e) => setSubline(e.target.value)}
                  placeholder="e.g. Handcrafted Executive Edition"
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Display Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ShoeDesign['status'])}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSaving || isUploading}
            icon={isSaving ? Loader2 : Check}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
          >
            {isSaving ? 'Saving to Catalog...' : isEditing ? 'Update Design' : 'Publish Design'}
          </Button>
        </div>
      </div>
    </div>
  );
};
