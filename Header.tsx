import React, { useState } from 'react';
import { TabType } from '../types';
import {
  Timer,
  Calendar,
  CheckSquare,
  RefreshCw,
  Moon,
  Clock,
  Compass,
  Maximize2,
  Minimize2,
  Download,
  Smartphone,
  Monitor,
  Sparkles,
} from 'lucide-react';
import { getFormattedArabicDate, getFormattedHijriDate, DAILY_INSPIRATIONS } from '../utils/dates';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  prayerCompletedCount: number;
  totalPrayersCount: number;
  streakCount: number;
  pendingTasksCount: number;
  onOpenInstallModal: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  isWideMode: boolean;
  toggleWideMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  prayerCompletedCount,
  totalPrayersCount,
  streakCount,
  pendingTasksCount,
  onOpenInstallModal,
  isFullscreen,
  toggleFullscreen,
  isWideMode,
  toggleWideMode,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  const rotateQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % DAILY_INSPIRATIONS.length);
  };

  const currentQuote = DAILY_INSPIRATIONS[quoteIndex];
  const gregorianDate = getFormattedArabicDate();
  const hijriDate = getFormattedHijriDate();

  return (
    <header className="w-full border-b border-white/10 bg-slate-950/40 backdrop-blur-xl sticky top-0 z-40 transition-colors">
      {/* Top Banner with Dates, Actions, and Inspiration */}
      <div className={`mx-auto px-4 sm:px-6 pt-2.5 pb-2 flex flex-col md:flex-row items-center justify-between gap-3 text-xs border-b border-white/10 ${isWideMode ? 'w-full max-w-[98%]' : 'max-w-7xl'}`}>
        <div className="flex items-center gap-2.5 text-slate-300 flex-wrap justify-center sm:justify-start">
          <span className="inline-flex items-center gap-1.5 bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium shadow-sm backdrop-blur-md">
            <Clock className="w-3.5 h-3.5" />
            {gregorianDate}
          </span>
          {hijriDate && (
            <span className="inline-flex items-center gap-1.5 bg-amber-950/50 text-amber-200 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-amiri font-bold text-sm shadow-sm backdrop-blur-md">
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              {hijriDate}
            </span>
          )}
          {streakCount > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold backdrop-blur-md" title="سلسلة الالتزام بالصلوات">
              🔥 {streakCount} يوم متواصل
            </span>
          )}

          {/* Quick Install APK / EXE Button */}
          <button
            onClick={onOpenInstallModal}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold shadow-sm backdrop-blur-md transition-all cursor-pointer"
            title="تثبيت التطبيق على الكمبيوتر (EXE) أو التابلت والهاتف (APK)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>تثبيت كـ APK / EXE</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 px-2.5 py-0.5 rounded-full font-medium transition-colors cursor-pointer"
            title={isFullscreen ? 'الخروج من وضع ملء الشاشة' : 'تفعيل ملء الشاشة للكمبيوتر والتابلت'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3 h-3 text-amber-400" />
                <span className="text-[11px]">تصغير</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px]">ملء الشاشة</span>
              </>
            )}
          </button>

          {/* Wide Mode Toggle */}
          <button
            onClick={toggleWideMode}
            className={`hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] transition-colors cursor-pointer ${
              isWideMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border-white/10'
            }`}
            title="تبديل حجم العرض الممتد للكمبيوتر والتابلت"
          >
            <span>{isWideMode ? 'عرض ممتد للشاشة ↔' : 'عرض قياسي'}</span>
          </button>
        </div>

        {/* Daily Inspiration / Ayah Quote */}
        <div className="flex items-center gap-2 text-slate-200 bg-slate-950/40 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/15 max-w-full shadow-sm">
          <span className="text-emerald-300 font-amiri text-sm font-semibold">«{currentQuote.text}»</span>
          <span className="text-slate-400 text-[11px]">— {currentQuote.source}</span>
          <button
            onClick={rotateQuote}
            className="p-1 hover:text-emerald-300 text-slate-400 transition-colors ml-1 cursor-pointer"
            title="حكمة أخرى"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Header & Nav */}
      <div className={`mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 ${isWideMode ? 'w-full max-w-[98%]' : 'max-w-7xl'}`}>
        {/* Logo and Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-400/40">
            <Moon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black bg-gradient-to-l from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
                سِرَاج
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-300">مؤقت التركيز • المهام الأسبوعية • قائمة الصلوات • اختصاراتي</p>
          </div>
        </div>

        {/* Tab Navigation (Glassmorphic) */}
        <nav className="flex items-center gap-1.5 p-1 bg-slate-950/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-inner overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('timer')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'timer'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>التايمر والتركيز</span>
          </button>

          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
              activeTab === 'weekly'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>المهام الأسبوعية</span>
            {pendingTasksCount > 0 && (
              <span className="bg-slate-800/80 text-slate-200 px-1.5 py-0.2 rounded-full text-[10px] font-mono border border-white/10">
                {pendingTasksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('prayer')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
              activeTab === 'prayer'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>صلواتي</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                prayerCompletedCount === totalPrayersCount && totalPrayersCount > 0
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {prayerCompletedCount}/{totalPrayersCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'shortcuts'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-lg shadow-amber-950/50'
                : 'text-amber-200 hover:text-white hover:bg-amber-500/20'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>اختصارات المواقع</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
