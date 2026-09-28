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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Images
import heroFootwearImg from '../../assets/images/hero_footwear_editorial_1790321154027.jpg';
import sneakerMotionImg from '../../assets/images/sneaker_motion_stride_1790321168010.jpg';
import leatherCraftImg from '../../assets/images/leather_craft_detail_1790321180013.jpg';
import outdoorBootImg from '../../assets/images/outdoor_technical_boot_1790321192724.jpg';

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
  cartonRatio: string;
  weight: string;
  qcTest: string;
  rebound: string;
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
    price: '₹780 / pr (FOB)',
    cartonRatio: '24 Prs · 2:4:6:6:4:2 (EU 40-45)',
    weight: '310g · Featherweight',
    qcTest: '180,000 SATRA TM92 Flex Cycles',
    rebound: '68.5% Energy Return',
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
    price: '₹1,350 / pr (FOB)',
    cartonRatio: '20 Prs · 2:4:6:5:3 (EU 39-44)',
    weight: '440g · Structured',
    qcTest: '90,000 Wet/Dry Flex Cycles',
    rebound: 'Full Goodyear Shank Support',
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
    price: '₹1,620 / pr (FOB)',
    cartonRatio: '18 Prs · 2:4:6:4:2 (EU 41-46)',
    weight: '590g · Heavy Duty',
    qcTest: '-20°C Flex Crack Resistance',
    rebound: 'Triple-Density Vibram Compound',
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
    price: '₹620 / pr (FOB)',
    cartonRatio: '24 Prs · 3:4:5:5:4:3 (EU 38-43)',
    weight: '284g · Featherweight',
    qcTest: '150,000 Dynamic Stride Cycles',
    rebound: '71.2% High Resiliency PU',
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
  const [selectedModel, setSelectedModel] = useState<ShoeModel>(SHOE_MODELS[0]);
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

  // Live flex cycle counter animation when in 'flex' or 'stride' mode
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

  // Touch event support for phone and tablet 3D tilt & drag
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

  // Trigger glint sweep when changing color or model
  const triggerGlint = () => {
    setIsGlintActive(true);
    setTimeout(() => setIsGlintActive(false), 900);
  };

  // Interactive Sole Rebound / Squish test
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
    <section className="cinematic-transparent-section py-8 sm:py-16 lg:py-20 px-3 sm:px-6 relative overflow-hidden">
      {/* Background ambient lighting dynamically colored by shoe accent */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[700px] h-[300px] sm:h-[450px] blur-3xl rounded-full pointer-events-none opacity-20 transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${activeAccent} 0%, transparent 70%)`,
        }}
      />

      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-7 relative z-10">
        {/* Section Header: Optimized for phone, tablet, and desktop */}
        <div className="space-y-3.5 text-left">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-blue-600 tracking-wide uppercase">
              <Activity className="w-3.5 h-3.5 shrink-0" />
              <span>Interactive Footwear Motion Lab</span>
            </div>
            <h2 className="text-xl xs:text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.18] text-balance">
              Dynamic Shoe Physics &amp;{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Runway Stride
              </span>
            </h2>
            <p className="cinematic-section-description text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl text-balance">
              Interact with real-time 3D stride physics, 360° turntable spin, SATRA TM92 flex tests, and technical lasting anatomy.
            </p>
          </div>

          {/* Model Switcher Tabs: Dedicated full-width bar with smooth touch scroll on mobile/tablet */}
          <div className="flex items-center gap-1.5 p-1 sm:p-1.5 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar w-full border border-slate-200/60">
            {SHOE_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  setSelectedModel(model);
                  setSelectedColorIndex(0);
                  triggerGlint();
                  onSelectModel?.(model.code);
                }}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                  selectedModel.id === model.id
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-900/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>{model.name}</span>
                <span className="text-[10px] font-mono text-slate-400">{model.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN STAGE GRID: Visual Interactive Canvas (Left) + Telemetry Data (Right)*/}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          {/* Left Canvas: Floating Animated Shoe with 3D Physics & Turntable */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="lg:col-span-7 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 relative overflow-hidden flex flex-col justify-between min-h-[380px] sm:min-h-[480px] shadow-xl border border-slate-800 text-white select-none touch-pan-y"
          >
            {/* Top Canvas Controls & Mode Pill Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between z-20 gap-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/30 shrink-0">
                  {selectedModel.code}
                </span>
                <span className="text-xs font-bold text-slate-300 truncate">
                  {selectedModel.category}
                </span>
              </div>

              {/* Mode Controls: Touch friendly scrollable bar on mobile */}
              <div className="flex items-center bg-white/10 backdrop-blur-md rounded-xl p-0.5 border border-white/10 text-[10px] sm:text-[11px] overflow-x-auto no-scrollbar w-full sm:w-auto">
                <button
                  onClick={() => setMotionMode('stride')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 ${
                    motionMode === 'stride'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Runway walking cadence"
                >
                  <Footprints className="w-3 h-3 shrink-0" />
                  <span>Runway</span>
                </button>
                <button
                  onClick={() => setMotionMode('float')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 ${
                    motionMode === 'float'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Floating 3D levitation"
                >
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>Float</span>
                </button>
                <button
                  onClick={() => setMotionMode('spin')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 ${
                    motionMode === 'spin'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="360° Turntable Runway Spin"
                >
                  <RotateCw className="w-3 h-3 shrink-0" />
                  <span>360° Spin</span>
                </button>
                <button
                  onClick={() => setMotionMode('flex')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 ${
                    motionMode === 'flex'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="SATRA TM92 sole flex test"
                >
                  <Zap className="w-3 h-3 shrink-0" />
                  <span>Flex Test</span>
                </button>
                <button
                  onClick={() => setMotionMode('anatomy')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 ${
                    motionMode === 'anatomy'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Anatomy hotspot pins"
                >
                  <Layers className="w-3 h-3 shrink-0" />
                  <span>Anatomy</span>
                </button>
              </div>
            </div>

            {/* Central Animated Shoe Container with 3D Tilt, Spin Turntable, and Rebound Compression */}
            <div className="relative my-auto py-5 sm:py-8 flex flex-col items-center justify-center z-10 w-full max-w-full overflow-hidden">
              {/* Dynamic Footprint Ripple / Sonar under shoe in Stride Mode */}
              {motionMode === 'stride' && (
                <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-44 h-16 pointer-events-none flex items-center justify-center">
                  <div className="w-24 sm:w-28 h-8 sm:h-10 rounded-full border border-blue-400/40 animate-sonar" />
                  <div className="w-32 sm:w-36 h-10 sm:h-12 rounded-full border border-indigo-400/20 animate-sonar delay-300" />
                </div>
              )}

              {/* 360° Spin Illuminated Turntable Pedestal Base */}
              {motionMode === 'spin' && (
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 pointer-events-none flex items-center justify-center">
                  <div className="w-56 xs:w-72 sm:w-88 h-20 sm:h-24 rounded-[100%] border border-blue-400/30 bg-blue-500/10 blur-xs animate-turntable-pedestal flex items-center justify-center">
                    <div className="w-40 sm:w-56 h-12 sm:h-16 rounded-[100%] border border-white/20 border-dashed" />
                  </div>
                  {/* Subtle speed switch indicator */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSpinSpeed((s) => (s === 'normal' ? 'fast' : 'normal'));
                    }}
                    className="pointer-events-auto absolute -bottom-5 px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-white/20 text-[10px] font-mono text-blue-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 shadow-md"
                  >
                    <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                    <span>Speed: {spinSpeed === 'normal' ? '1x Normal' : '2x Turbo'}</span>
                  </button>
                </div>
              )}

              {/* Dynamic Ground Shadow */}
              <div
                className={`w-44 xs:w-56 sm:w-76 h-6 bg-blue-500/25 blur-xl rounded-full absolute bottom-2 sm:bottom-4 transition-all duration-500 pointer-events-none ${
                  motionMode === 'stride'
                    ? 'animate-shadow-pulse'
                    : motionMode === 'flex'
                    ? 'scale-90 opacity-40'
                    : motionMode === 'spin'
                    ? 'scale-105 opacity-50'
                    : 'animate-shadow-pulse'
                }`}
              />

              {/* Interactive Floating Shoe Picture Frame with dynamic CSS transforms */}
              <div
                onClick={handleShoeTap}
                style={{
                  transform:
                    motionMode === 'spin'
                      ? undefined
                      : `perspective(1000px) rotateY(${mousePos.x * 14}deg) rotateX(${
                          -mousePos.y * 10
                        }deg)`,
                  transition: motionMode === 'spin' ? undefined : 'transform 0.15s ease-out',
                }}
                className="relative cursor-pointer active:cursor-grabbing group max-w-[92%]"
                title="Tap or click shoe for Sole Rebound Test"
              >
                {/* Visual Image Asset with Animation Class */}
                <div
                  className={`relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/15 transition-all duration-700 w-[240px] xs:w-[290px] sm:w-[370px] md:w-[390px] max-w-full aspect-[16/10] ${
                    isBouncing
                      ? 'animate-shoe-bounce'
                      : motionMode === 'stride'
                      ? 'animate-shoe-stride'
                      : motionMode === 'float'
                      ? 'animate-shoe-float'
                      : motionMode === 'spin'
                      ? spinSpeed === 'fast'
                        ? 'animate-shoe-spin-fast'
                        : 'animate-shoe-spin'
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

                  {/* Dynamic Shimmer Glint Sweep */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none ${
                      isGlintActive ? 'animate-glint' : 'opacity-0'
                    }`}
                  />

                  {/* Dark subtle vignette scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

                  {/* Tap to Rebound Badge Indicator */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[9px] font-semibold text-white/90 border border-white/15 flex items-center gap-1 pointer-events-none">
                    <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                    <span>Tap to Compress</span>
                  </div>

                  {/* Pop-up Rebound Surge Alert on Tap */}
                  <AnimatePresence>
                    {isBouncing && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        className="absolute inset-x-4 bottom-3 p-1.5 rounded-xl bg-blue-600/90 backdrop-blur-md border border-white/30 text-center text-[10px] sm:text-xs font-black text-white shadow-lg pointer-events-none flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        <span>{selectedModel.rebound} Rebound Surge!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Hotspot Anatomy Pins in 'anatomy' mode */}
                {motionMode === 'anatomy' && (
                  <>
                    {/* Pin 1: Upper */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePin('upper');
                      }}
                      className={`absolute top-4 left-1/4 -translate-x-1/2 p-2 sm:p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer z-30 touch-manipulation ${
                        activePin === 'upper'
                          ? 'bg-blue-600 text-white ring-4 ring-blue-500/40 scale-110'
                          : 'bg-white/20 hover:bg-white/40 text-white'
                      }`}
                      title="Upper Material"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                      <span className="sr-only">Upper</span>
                    </button>

                    {/* Pin 2: Midsole */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePin('midsole');
                      }}
                      className={`absolute bottom-10 left-1/3 -translate-x-1/2 p-2 sm:p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer z-30 touch-manipulation ${
                        activePin === 'midsole'
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/40 scale-110'
                          : 'bg-white/20 hover:bg-white/40 text-white'
                      }`}
                      title="Midsole Cushion"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                      <span className="sr-only">Midsole</span>
                    </button>

                    {/* Pin 3: Outsole */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePin('outsole');
                      }}
                      className={`absolute bottom-3 right-1/4 -translate-x-1/2 p-2 sm:p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer z-30 touch-manipulation ${
                        activePin === 'outsole'
                          ? 'bg-amber-600 text-white ring-4 ring-amber-500/40 scale-110'
                          : 'bg-white/20 hover:bg-white/40 text-white'
                      }`}
                      title="Outsole Compound"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                      <span className="sr-only">Outsole</span>
                    </button>

                    {/* Pin 4: Heel Counter */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePin('heel');
                      }}
                      className={`absolute top-10 right-8 -translate-x-1/2 p-2 sm:p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer z-30 touch-manipulation ${
                        activePin === 'heel'
                          ? 'bg-purple-600 text-white ring-4 ring-purple-500/40 scale-110'
                          : 'bg-white/20 hover:bg-white/40 text-white'
                      }`}
                      title="Heel Counter"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                      <span className="sr-only">Heel Counter</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Canvas Toolbar: Active Spec Callout / Stride Telemetry */}
            <div className="z-20 pt-2.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px] sm:text-xs">
              {motionMode === 'anatomy' && activePin ? (
                <div className="flex items-center gap-1.5 text-slate-300 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                  <span className="font-semibold text-white capitalize shrink-0">{activePin}:</span>
                  <span className="truncate text-slate-300 text-[10px] sm:text-xs">
                    {selectedModel.anatomy[activePin as keyof typeof selectedModel.anatomy]}
                  </span>
                </div>
              ) : motionMode === 'stride' ? (
                <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Runway Cadence: 114 SPM</span>
                  </div>
                  <span className="text-white/40 hidden sm:inline">·</span>
                  <span className="text-slate-400 hidden xs:inline truncate">
                    Heel-to-toe force distribution
                  </span>
                </div>
              ) : motionMode === 'spin' ? (
                <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px]">
                  <div className="flex items-center gap-1.5 text-blue-400 font-mono font-bold shrink-0">
                    <Compass className="w-3.5 h-3.5 animate-spin" />
                    <span>360° Continuous Turntable Showcase</span>
                  </div>
                  <span className="text-white/40 hidden sm:inline">·</span>
                  <span className="text-slate-400 hidden xs:inline">Seamless Last Angle Inspection</span>
                </div>
              ) : motionMode === 'flex' ? (
                <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px]">
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                    <span>35° Dynamic Flex</span>
                  </div>
                  <span className="text-white/40 hidden sm:inline">·</span>
                  <span className="text-slate-400 font-mono">
                    {flexCycles.toLocaleString()} Cycles Passed
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 text-[10px] sm:text-[11px]">
                  <span>Touch &amp; drag or hover across shoe to tilt in 3D</span>
                </div>
              )}

              {/* Colorway Switcher */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Finish:</span>
                <div className="flex items-center gap-1.5">
                  {selectedModel.colorways.map((c, idx) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setSelectedColorIndex(idx);
                        triggerGlint();
                      }}
                      className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                        selectedColorIndex === idx
                          ? 'ring-2 ring-white scale-125 border-transparent shadow-xs'
                          : 'border-white/40 hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.accent }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Technical Telemetry & Commercial Assortment (Tablet Optimized) */}
          <div className="lg:col-span-5 bg-slate-50/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 flex flex-col justify-between space-y-4 sm:space-y-5 text-left">
            {/* Top Specs */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900 text-sm">{selectedModel.name}</span>
                  <span className="font-mono font-bold text-blue-600">{selectedModel.price}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedModel.tagline}</p>
              </div>

              {/* Key Technical Gauges: Responsive grid on tablet (md:grid-cols-2) and 1 col on mobile/desktop */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200/80 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2.5">
                  {/* SATRA flex card */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">
                        SATRA TM92 Flex Fatigue Rating
                      </span>
                      <span className="font-mono text-[11px] font-bold text-emerald-600">
                        {flexCycles.toLocaleString()} Cycles
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: '92%' }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block pt-0.5">
                      Zero delamination or outsole fissure after continuous fatigue testing.
                    </span>
                  </div>

                  {/* Rebound gauge */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Energy Rebound
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">
                      {selectedModel.rebound}
                    </span>
                  </div>

                  {/* Weight gauge */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Shoe Weight
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">
                      {selectedModel.weight}
                    </span>
                  </div>

                  {/* Master Carton Ratio Assortment */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5 md:col-span-2 lg:col-span-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Master Carton Size Curve
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {selectedModel.cartonRatio}
                    </span>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                      <span>Volumetric: 0.14 CBM</span>
                      <span>Gross: 18.5 kg / carton</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  onOpenOrderWizard?.();
                }}
                className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book Master Cartons for {selectedModel.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>QC Guaranteed</span>
                </span>
                <span>·</span>
                <span>Immediate FOB Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
