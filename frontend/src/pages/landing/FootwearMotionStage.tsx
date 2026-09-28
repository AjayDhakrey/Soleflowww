import React, { useState, useEffect, useRef } from 'react';
import {
  Footprints,
  Layers,
  Zap,
  CheckCircle2,
  RotateCcw,
  RotateCw,
  Sparkles,
  ShieldCheck,
  Activity,
  ArrowRight,
  Info,
  Maximize2,
  SlidersHorizontal,
  RefreshCw,
  Compass,
  Check,
  Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Images
import heroFootwearImg from '../../assets/images/hero_footwear_editorial_1790321154027.jpg';
import sneakerMotionImg from '../../assets/images/sneaker_motion_stride_1790321168010.jpg';
import leatherCraftImg from '../../assets/images/leather_craft_detail_1790321180013.jpg';
import outdoorBootImg from '../../assets/images/outdoor_technical_boot_1790321192724.jpg';

// Footwear Product Selector Thumbnails
import thumbApexRunner from '../../assets/images/thumb-apex-runner.png';
import thumbFirenzeDerby from '../../assets/images/thumb-firenze-derby.png';
import thumbTerraGripBoot from '../../assets/images/thumb-terragrip-boot.png';
import thumbAeroGlideKnit from '../../assets/images/thumb-aeroglide-knit.png';

const MODEL_THUMBNAILS: Record<string, string> = {
  'apex-runner': thumbApexRunner,
  'firenze-derby': thumbFirenzeDerby,
  'terragrip-boot': thumbTerraGripBoot,
  'aeroglide-knit': thumbAeroGlideKnit,
};

interface FootwearMotionStageProps {
  onSelectModel?: (modelCode: string) => void;
  onOpenOrderWizard?: () => void;
}

interface ShoeModel {
  id: string;
  code: string;
  name: string;
  category: string;
  tagline: string;
  image: string;
  price: string;
  retailMrp: string;
  hsn: string;
  material: string;
  cartonRatio: string;
  weight: string;
  qcTest: string;
  rebound: string;
  sizes: string[];
  features: string[];
  anatomy: {
    upper: string;
    midsole: string;
    outsole: string;
    heel: string;
  };
  colorways: {
    name: string;
    hex: string;
    accent: string;
  }[];
}

const SHOE_MODELS: ShoeModel[] = [
  {
    id: 'apex-runner',
    code: 'SF-1024',
    name: 'Apex Runner Pro',
    category: 'PU Direct Injection Athletic',
    tagline: 'High-velocity engineered runner with dual-density Phylon shock mitigation.',
    image: sneakerMotionImg,
    price: '₹780 / pair',
    retailMrp: '₹1,899',
    hsn: '6404',
    material: 'Engineered Jacquard Knit + Injected Phylon Sole',
    cartonRatio: '24 Prs · 2:4:6:6:4:2 (EU 40-45)',
    weight: '310g · Featherweight',
    qcTest: '180,000 SATRA TM92 Flex Cycles',
    rebound: '68.5% Energy Return',
    sizes: ['6', '7', '8', '9', '10', '11'],
    features: ['Lightweight mesh upper', 'High energy return Phylon', 'SATRA flex tested', 'Non-slip traction rubber'],
    anatomy: {
      upper: 'Engineered Jacquard Knit with TPU Welded Ribs',
      midsole: 'Dual-Density Injected Phylon & Nitrogen Foam Core',
      outsole: 'SATRA TM92 High-Abrasion Anti-Slip Rubber Tread',
      heel: 'Ergonomic 3D Molded Heel Counter for Stride Stability',
    },
    colorways: [
      { name: 'Obsidian Pulse', hex: '#1e293b', accent: '#3b82f6' },
      { name: 'Electric Cobalt', hex: '#1d4ed8', accent: '#60a5fa' },
      { name: 'Pure Platinum', hex: '#e2e8f0', accent: '#38bdf8' },
    ],
  },
  {
    id: 'firenze-derby',
    code: 'SF-884',
    name: 'Firenze Blake Derby',
    category: 'Handcrafted Executive Leather',
    tagline: 'Blake-stitched Italian crust calfskin with vegetable-tanned Argentine leather sole.',
    image: leatherCraftImg,
    price: '₹1,350 / pair',
    retailMrp: '₹2,999',
    hsn: '6403',
    material: 'Full-Grain Burnished Crust Calfskin + Leather Sole',
    cartonRatio: '20 Prs · 2:4:6:5:3 (EU 39-44)',
    weight: '440g · Structured',
    qcTest: '90,000 Wet/Dry Flex Cycles',
    rebound: 'Full Goodyear Shank Support',
    sizes: ['6', '7', '8', '9', '10', '11'],
    features: ['100% Genuine Crust Leather', 'Blake Stitch Construction', 'Breathable Leather Lining', 'Protective Heel Block'],
    anatomy: {
      upper: '1.4mm Full-Grain Burnished Crust Calfskin',
      midsole: 'Natural Cork Filler with Tempered Spring Steel Shank',
      outsole: 'Argentine Vegetable Tanned Leather with Rubber Inset',
      heel: 'Stacked Leather Heel Block with Brass Protective Nails',
    },
    colorways: [
      { name: 'Milano Tan', hex: '#854d0e', accent: '#d97706' },
      { name: 'Espresso Roast', hex: '#3e2723', accent: '#a1887f' },
      { name: 'Raven Black', hex: '#0f172a', accent: '#475569' },
    ],
  },
  {
    id: 'terragrip-boot',
    code: 'SF-512',
    name: 'TerraGrip All-Weather',
    category: 'Winterized Commando Boot',
    tagline: 'Waterproof Goodyear welted tactical boot built for harsh terrain durability.',
    image: outdoorBootImg,
    price: '₹1,620 / pair',
    retailMrp: '₹3,499',
    hsn: '6403',
    material: 'Hydrophobic Oiled Nubuck + Deep Lugged Commando Rubber',
    cartonRatio: '18 Prs · 2:4:6:4:2 (EU 41-46)',
    weight: '590g · Heavy Duty',
    qcTest: '-20°C Flex Crack Resistance',
    rebound: 'Triple-Density Vibram Compound',
    sizes: ['6', '7', '8', '9', '10', '11'],
    features: ['Hydrophobic Oiled Nubuck', 'Puncture-proof Kevlar Plate', 'Deep Lugged 5.5mm Cleats', 'Ankle Lock Anatomic Cup'],
    anatomy: {
      upper: 'Hydrophobic Pull-Up Oiled Nubuck (ISO 4920 Pass)',
      midsole: 'EVA Shock Cushion with Puncture-Proof Kevlar Plate',
      outsole: 'Deep Lugged Commando Rubber (5.5mm Cleats)',
      heel: 'Reinforced Ballistic Nylon Cup with Ankle Lock',
    },
    colorways: [
      { name: 'Desert Khaki', hex: '#78716c', accent: '#f59e0b' },
      { name: 'Alpine Forest', hex: '#2e3a2f', accent: '#10b981' },
      { name: 'Stealth Onyx', hex: '#18181b', accent: '#71717a' },
    ],
  },
  {
    id: 'aeroglide-knit',
    code: 'SF-204',
    name: 'AeroGlide Knit Runner',
    category: 'Ultralight Breathable Trainer',
    tagline: 'Injection molded marathon slip-on engineered for high-turnover retail shelves.',
    image: heroFootwearImg,
    price: '₹620 / pair',
    retailMrp: '₹1,499',
    hsn: '6404',
    material: 'Seamless 360° Monofilament Stretch Knit + Supercritical EVA',
    cartonRatio: '24 Prs · 3:4:5:5:4:3 (EU 38-43)',
    weight: '284g · Featherweight',
    qcTest: '150,000 Dynamic Stride Cycles',
    rebound: '71.2% High Resiliency PU',
    sizes: ['6', '7', '8', '9', '10', '11'],
    features: ['Lightweight knit upper', 'High energy return midsole', 'Anti-slip outsole', 'Available in multiple colours'],
    anatomy: {
      upper: 'Seamless 360° Monofilament Stretch Knit',
      midsole: 'Air-Infused Supercritical Foam Midsole',
      outsole: 'Zonal Rubber Pods on High-Wear Contact Zones',
      heel: 'Ribbed Knit Collar with Achilles Cushioning Pad',
    },
    colorways: [
      { name: 'Glacier Blue', hex: '#0284c7', accent: '#38bdf8' },
      { name: 'Carbon Stealth', hex: '#27272a', accent: '#e4e4e7' },
      { name: 'Solar Lime', hex: '#4d7c0f', accent: '#84cc16' },
    ],
  },
];

type MotionMode = 'stride' | 'float' | 'spin' | 'flex' | 'anatomy';

export const FootwearMotionStage: React.FC<FootwearMotionStageProps> = ({
  onSelectModel,
  onOpenOrderWizard,
}) => {
  const [selectedModel, setSelectedModel] = useState<ShoeModel>(SHOE_MODELS[3]); // Default to AeroGlide Knit Runner matching demo mockup
  const [motionMode, setMotionMode] = useState<MotionMode>('stride');
  const [spinSpeed, setSpinSpeed] = useState<'normal' | 'fast'>('normal');
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [activePin, setActivePin] = useState<string | null>('midsole');
  const [flexCycles, setFlexCycles] = useState<number>(180240);
  const [isGlintActive, setIsGlintActive] = useState<boolean>(false);
  const [isBouncing, setIsBouncing] = useState<boolean>(false);
  const [bounceCount, setBounceCount] = useState<number>(0);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Live flex cycle counter animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (motionMode === 'flex' || motionMode === 'stride') {
      interval = setInterval(() => {
        setFlexCycles((prev) => prev + Math.floor(Math.random() * 4) + 1);
      }, 350);
    }
    return () => clearInterval(interval);
  }, [motionMode]);

  // Handle subtle 3D mouse perspective tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) / rect.width - 0.5;
    const y = (touch.clientY - rect.top) / rect.height - 0.5;
    setMousePos({
      x: Math.max(-0.5, Math.min(0.5, x)),
      y: Math.max(-0.5, Math.min(0.5, y)),
    });
  };

  const handleTouchEnd = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const triggerGlint = () => {
    setIsGlintActive(true);
    setTimeout(() => setIsGlintActive(false), 900);
  };

  const handleShoeTap = () => {
    if (isBouncing) return;
    setIsBouncing(true);
    setBounceCount((c) => c + 1);
    triggerGlint();
    setTimeout(() => {
      setIsBouncing(false);
    }, 750);
  };

  const activeAccent = selectedModel.colorways[selectedColorIndex]?.accent || '#3b82f6';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Section Header */}
      <div className="space-y-4 text-left">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 tracking-wide uppercase">
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span>Interactive Product View</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Show Product Details Clearly Before Selling
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            View footwear from different angles, check construction details, product specifications and quality-test
            information before sharing it with buyers or dealers.
          </p>
        </div>

        {/* Footwear Product Selector Row: Premium Dark Navy Glassmorphic Container */}
        <div className="w-full bg-[#070e24]/90 backdrop-blur-xl border border-blue-900/40 rounded-2xl p-1.5 sm:p-2 shadow-[0_12px_36px_rgba(2,6,23,0.45)]">
          <div className="flex sm:grid sm:grid-cols-4 items-stretch gap-2 sm:gap-2.5 overflow-x-auto snap-x snap-mandatory hide-scrollbar">
            {SHOE_MODELS.map((model) => {
              const isActive = selectedModel.id === model.id;
              const thumb = MODEL_THUMBNAILS[model.id];

              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    setSelectedModel(model);
                    setSelectedColorIndex(0);
                    triggerGlint();
                    onSelectModel?.(model.code);
                  }}
                  className={`relative group shrink-0 w-[220px] xs:w-[240px] sm:w-auto snap-start rounded-xl sm:rounded-2xl px-3 py-2.5 sm:px-3.5 sm:py-2.5 flex items-center gap-3 cursor-pointer text-left select-none transition-all duration-200 outline-hidden min-h-[58px] sm:min-h-[62px] ${
                    isActive
                      ? 'z-10'
                      : 'bg-[#0a1535]/50 border border-blue-900/35 hover:bg-[#12214d]/70 hover:border-blue-400/40 hover:-translate-y-0.5 active:translate-y-0 z-0'
                  }`}
                  title={`${model.name} (${model.code})`}
                >
                  {/* Active Product: Smooth Sliding Indicator with Electric Blue Border & Soft Blue Glow */}
                  {isActive && (
                    <motion.div
                      layoutId="activeFootwearTab"
                      className="absolute inset-0 bg-white rounded-xl sm:rounded-2xl border border-blue-500 shadow-[0_0_24px_rgba(59,130,246,0.55)] pointer-events-none z-0"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 32,
                        mass: 0.8,
                      }}
                    />
                  )}

                  {/* Shoe Thumbnail on the Left */}
                  <div className="relative z-10 w-11 h-8 sm:w-12 sm:h-9 shrink-0 flex items-center justify-center">
                    {thumb && (
                      <img
                        src={thumb}
                        alt={model.name}
                        className={`max-h-full max-w-full object-contain pointer-events-none transition-all duration-200 ${
                          isActive
                            ? 'scale-105 drop-shadow-[0_3px_6px_rgba(0,0,0,0.18)]'
                            : 'scale-95 opacity-85 group-hover:opacity-100 group-hover:scale-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]'
                        }`}
                      />
                    )}
                  </div>

                  {/* Product Name & SKU Vertically Aligned */}
                  <div className="relative z-10 flex flex-col justify-center min-w-0 flex-1">
                    <span
                      className={`text-xs sm:text-[13px] font-bold tracking-tight truncate leading-tight transition-colors duration-200 ${
                        isActive ? 'text-slate-900 font-extrabold' : 'text-white group-hover:text-white'
                      }`}
                    >
                      {model.name}
                    </span>
                    <span
                      className={`text-[10px] sm:text-[11px] font-mono tracking-wider transition-colors duration-200 ${
                        isActive ? 'text-slate-500 font-semibold' : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    >
                      {model.code} · {model.price}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main 2-Column Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        {/* Left Canvas: Interactive 3D Physics Footwear Stage (7 cols) */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="lg:col-span-7 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 relative overflow-hidden flex flex-col justify-between min-h-[380px] sm:min-h-[440px] shadow-xl border border-slate-800 text-white select-none touch-pan-y"
        >
          {/* Top Canvas Controls & Mode Pill Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between z-20 gap-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/30 shrink-0">
                {selectedModel.code}
              </span>
              <span className="text-xs font-bold text-slate-300 truncate">
                {selectedModel.category}
              </span>
            </div>

            {/* Mode Controls Bar */}
            <div className="flex items-center bg-white/10 backdrop-blur-md rounded-xl p-0.5 border border-white/10 text-[10px] sm:text-[11px] overflow-x-auto hide-scrollbar w-full sm:w-auto">
              <button
                onClick={() => setMotionMode('spin')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 ${
                  motionMode === 'spin' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
                title="360° View"
              >
                <RotateCw className="w-3 h-3 shrink-0" />
                <span>360° View</span>
              </button>
              <button
                onClick={() => setMotionMode('flex')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 ${
                  motionMode === 'flex' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
                title="Quality & SATRA Flex Test"
              >
                <Zap className="w-3 h-3 shrink-0" />
                <span>Flex Test</span>
              </button>
              <button
                onClick={() => setMotionMode('anatomy')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 ${
                  motionMode === 'anatomy' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
                title="Shoe Anatomy"
              >
                <Layers className="w-3 h-3 shrink-0" />
                <span>Anatomy</span>
              </button>
              <button
                onClick={() => setMotionMode('stride')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 ${
                  motionMode === 'stride' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
                title="Runway Stride Cadence"
              >
                <Footprints className="w-3 h-3 shrink-0" />
                <span>Runway</span>
              </button>
            </div>
          </div>

          {/* Central Animated Shoe Container */}
          <div className="relative my-auto py-4 sm:py-6 flex flex-col items-center justify-center z-10 w-full max-w-full overflow-hidden">
            {/* 360 Spin Turntable Base */}
            {motionMode === 'spin' && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none flex items-center justify-center">
                <div className="w-56 sm:w-72 h-16 sm:h-20 rounded-[100%] border border-blue-400/30 bg-blue-500/10 blur-xs flex items-center justify-center">
                  <div className="w-40 sm:w-56 h-10 sm:h-14 rounded-[100%] border border-white/20 border-dashed" />
                </div>
              </div>
            )}

            {/* Interactive Floating Shoe */}
            <div
              onClick={handleShoeTap}
              style={{
                transform:
                  motionMode === 'spin'
                    ? undefined
                    : `perspective(1000px) rotateY(${mousePos.x * 12}deg) rotateX(${-mousePos.y * 8}deg)`,
                transition: motionMode === 'spin' ? undefined : 'transform 0.15s ease-out',
              }}
              className="relative cursor-pointer max-w-[92%]"
              title="Tap for sole rebound test"
            >
              <div
                className={`relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/15 transition-all duration-700 w-[240px] xs:w-[280px] sm:w-[340px] aspect-[16/10] ${
                  isBouncing
                    ? 'animate-shoe-bounce'
                    : motionMode === 'stride'
                    ? 'animate-shoe-stride'
                    : motionMode === 'spin'
                    ? 'animate-shoe-spin'
                    : motionMode === 'flex'
                    ? 'animate-shoe-flex'
                    : 'hover:scale-102'
                }`}
              >
                <img
                  src={selectedModel.image}
                  alt={selectedModel.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center filter brightness-95 select-none pointer-events-none"
                />

                {/* Shimmer glint */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none ${
                    isGlintActive ? 'animate-glint' : 'opacity-0'
                  }`}
                />
              </div>

              {/* Anatomy Hotspot Pins */}
              {motionMode === 'anatomy' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePin('upper');
                    }}
                    className={`absolute top-4 left-1/4 -translate-x-1/2 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer z-30 ${
                      activePin === 'upper' ? 'bg-blue-600 text-white ring-4 ring-blue-500/40 scale-110' : 'bg-white/20 text-white'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePin('midsole');
                    }}
                    className={`absolute bottom-8 left-1/3 -translate-x-1/2 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer z-30 ${
                      activePin === 'midsole' ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/40 scale-110' : 'bg-white/20 text-white'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePin('outsole');
                    }}
                    className={`absolute bottom-2 right-1/4 -translate-x-1/2 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer z-30 ${
                      activePin === 'outsole' ? 'bg-amber-600 text-white ring-4 ring-amber-500/40 scale-110' : 'bg-white/20 text-white'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bottom Canvas Info */}
          <div className="z-20 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="text-[11px] text-slate-300 font-mono">
              {motionMode === 'flex'
                ? `SATRA Flex Cycles: ${flexCycles.toLocaleString()} Passed`
                : motionMode === 'anatomy' && activePin
                ? `${activePin.toUpperCase()}: ${selectedModel.anatomy[activePin as keyof typeof selectedModel.anatomy]}`
                : `Interactive 3D Cadence · Click shoe to test rebound`}
            </div>

            {/* Color Swatches */}
            <div className="flex items-center gap-1.5">
              {selectedModel.colorways.map((c, idx) => (
                <button
                  key={c.name}
                  onClick={() => {
                    setSelectedColorIndex(idx);
                    triggerGlint();
                  }}
                  className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                    selectedColorIndex === idx ? 'ring-2 ring-white scale-125 border-transparent' : 'border-white/40'
                  }`}
                  style={{ backgroundColor: c.accent }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Clean Product Information Card (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 flex flex-col justify-between space-y-4 text-left">
          <div className="space-y-4">
            {/* Header: Name & Price */}
            <div>
              <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                {selectedModel.category}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                {selectedModel.name}
              </h3>
              <div className="flex items-baseline gap-2.5 mt-1.5">
                <span className="text-xl sm:text-2xl font-black text-blue-600 font-mono">
                  {selectedModel.price}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Retail MRP: <span className="line-through">{selectedModel.retailMrp}</span>
                </span>
              </div>
            </div>

            {/* Available Sizes */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-700 block">Available Sizes:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedModel.sizes.map((sz) => (
                  <span
                    key={sz}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-800 flex items-center justify-center shadow-2xs"
                  >
                    {sz}
                  </span>
                ))}
              </div>
            </div>

            {/* Material & HSN Code */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/80 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Material</span>
                <span className="font-semibold text-slate-800 text-[11px] block mt-0.5 leading-snug truncate" title={selectedModel.material}>
                  {selectedModel.material}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">HSN Code</span>
                <span className="font-mono font-bold text-slate-800 text-xs block mt-0.5">
                  {selectedModel.hsn} (Footwear)
                </span>
              </div>
            </div>

            {/* Key Features List */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-700 block">Key Features:</span>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600">
                {selectedModel.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={onOpenOrderWizard}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Full Details &amp; Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

