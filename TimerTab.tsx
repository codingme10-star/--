import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Coffee,
  Brain,
  Clock,
  Sparkles,
  Zap,
  Stethoscope,
  AlertTriangle,
} from 'lucide-react';
import { playChimeSound, startAmbientNoise, stopAmbientNoise } from '../utils/audio';
import confetti from 'canvas-confetti';

type TimerMode = 'pomodoro' | 'short_break' | 'long_break' | 'custom' | 'stopwatch';

interface TimerTabProps {
  isRunning?: boolean;
  onRunningChange?: (running: boolean) => void;
}

export const TimerTab: React.FC<TimerTabProps> = ({ isRunning: externalIsRunning, onRunningChange }) => {
  // Timer State
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [isRunning, setIsRunningInternal] = useState(false);
  const [showExitWarningModal, setShowExitWarningModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const setIsRunning = (val: boolean) => {
    setIsRunningInternal(val);
    onRunningChange?.(val);
  };
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [totalDuration, setTotalDuration] = useState(25 * 60);
  const [customMinutes, setCustomMinutes] = useState(15);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(() => {
    return parseInt(localStorage.getItem('siraj_completed_sessions') || '0', 10);
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Ambient sound
  const [ambientType, setAmbientType] = useState<'off' | 'rain' | 'waves' | 'ticking'>('off');

  // Ref for interval
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Switch modes
  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);

    if (newMode === 'pomodoro') {
      setTimeLeft(25 * 60);
      setTotalDuration(25 * 60);
    } else if (newMode === 'short_break') {
      setTimeLeft(5 * 60);
      setTotalDuration(5 * 60);
    } else if (newMode === 'long_break') {
      setTimeLeft(15 * 60);
      setTotalDuration(15 * 60);
    } else if (newMode === 'custom') {
      setTimeLeft(customMinutes * 60);
      setTotalDuration(customMinutes * 60);
    } else if (newMode === 'stopwatch') {
      setStopwatchSeconds(0);
    }
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (mode === 'stopwatch') {
          setStopwatchSeconds((prev) => prev + 1);
        } else {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              // Timer finished!
              setIsRunning(false);
              playChimeSound();
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
              });

              if (mode === 'pomodoro' || mode === 'custom') {
                setCompletedSessions((s) => {
                  const updated = s + 1;
                  localStorage.setItem('siraj_completed_sessions', updated.toString());
                  return updated;
                });
              }
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  // Handle Ambient Sound
  useEffect(() => {
    if (ambientType === 'off' || !isRunning) {
      stopAmbientNoise();
    } else {
      startAmbientNoise(ambientType);
    }
    return () => {
      stopAmbientNoise();
    };
  }, [ambientType, isRunning]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress for circle
  const progressPercent =
    mode === 'stopwatch'
      ? 100
      : totalDuration > 0
      ? ((totalDuration - timeLeft) / totalDuration) * 100
      : 0;

  // Circle SVG dimensions
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const toggleTimer = () => {
    if (isRunning) {
      // User is attempting to pause/stop while running!
      setPendingAction(() => () => setIsRunning(false));
      setShowExitWarningModal(true);
    } else {
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    if (isRunning) {
      setPendingAction(() => () => {
        setIsRunning(false);
        if (mode === 'pomodoro') setTimeLeft(25 * 60);
        else if (mode === 'short_break') setTimeLeft(5 * 60);
        else if (mode === 'long_break') setTimeLeft(15 * 60);
        else if (mode === 'custom') setTimeLeft(customMinutes * 60);
        else if (mode === 'stopwatch') setStopwatchSeconds(0);
      });
      setShowExitWarningModal(true);
      return;
    }

    setIsRunning(false);
    if (mode === 'pomodoro') setTimeLeft(25 * 60);
    else if (mode === 'short_break') setTimeLeft(5 * 60);
    else if (mode === 'long_break') setTimeLeft(15 * 60);
    else if (mode === 'custom') setTimeLeft(customMinutes * 60);
    else if (mode === 'stopwatch') setStopwatchSeconds(0);
  };

  const applyCustomMinutes = (mins: number) => {
    setCustomMinutes(mins);
    setTimeLeft(mins * 60);
    setTotalDuration(mins * 60);
    setIsRunning(false);
  };

  return (
    <div
      className={`transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 overflow-y-auto'
          : 'max-w-4xl mx-auto'
      }`}
    >
      {/* Motivational Medical Banner while running */}
      {isRunning && (
        <div className="mb-4 p-3.5 rounded-3xl bg-gradient-to-r from-rose-950/90 via-red-900/80 to-amber-950/90 border border-rose-500/50 shadow-2xl text-center backdrop-blur-md animate-pulse">
          <div className="flex items-center justify-center gap-2 text-rose-200 font-black text-sm sm:text-base">
            <Stethoscope className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span className="tracking-wide">«عايز طب اتعب و خف لعب!»</span>
            <span className="text-xs bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
              جلسة تركيز مقدسة 🩺
            </span>
          </div>
          <p className="text-[11px] text-rose-200/80 mt-1 font-medium">
            كل دقيقة تركيز دلوقتي هي خطوة حقيقية نحو حلمك.. مفيش خروج لحد ما التايمر يخلص!
          </p>
        </div>
      )}

      {/* Timer Container Card */}
      <div className="relative bg-slate-950/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-10">
        {/* Fullscreen & Zen Toggle */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
            title={isFullscreen ? 'تصغير' : 'وضع الشاشة الكاملة (تركيز كامل)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Ambient Sound Controller */}
        <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-slate-800/40 p-1 rounded-2xl border border-slate-700/50">
          <button
            onClick={() => setAmbientType(ambientType === 'off' ? 'rain' : 'off')}
            className={`p-1.5 rounded-xl text-xs flex items-center gap-1 transition-all ${
              ambientType !== 'off'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="أصوات محيطة للتركيز"
          >
            {ambientType !== 'off' ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">أصوات التركيز</span>
          </button>

          {ambientType !== 'off' && (
            <div className="flex items-center gap-1 pr-1">
              <button
                onClick={() => setAmbientType('rain')}
                className={`px-2 py-0.5 rounded-lg text-xs ${
                  ambientType === 'rain' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                مطر
              </button>
              <button
                onClick={() => setAmbientType('waves')}
                className={`px-2 py-0.5 rounded-lg text-xs ${
                  ambientType === 'waves' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                أمواج
              </button>
              <button
                onClick={() => setAmbientType('ticking')}
                className={`px-2 py-0.5 rounded-lg text-xs ${
                  ambientType === 'ticking' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                تكتكة
              </button>
            </div>
          )}
        </div>

        {/* Header Tabs inside Timer */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 pt-4">
          <button
            onClick={() => handleModeChange('pomodoro')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'pomodoro'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/50'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>بومودورو (25د)</span>
          </button>

          <button
            onClick={() => handleModeChange('short_break')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'short_break'
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/25 ring-2 ring-teal-400/50'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>استراحة قصيرة (5د)</span>
          </button>

          <button
            onClick={() => handleModeChange('long_break')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'long_break'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>استراحة طويلة (15د)</span>
          </button>

          <button
            onClick={() => handleModeChange('custom')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'custom'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>مؤقت مخصص</span>
          </button>

          <button
            onClick={() => handleModeChange('stopwatch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'stopwatch'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>ساعة إيقاف</span>
          </button>
        </div>

        {/* Custom Timer Presets */}
        {mode === 'custom' && (
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            <span className="text-xs text-slate-400">تحديد سريع:</span>
            {[10, 15, 30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => applyCustomMinutes(mins)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  customMinutes === mins
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                {mins} دقيقة
              </button>
            ))}
          </div>
        )}

        {/* Circular Display */}
        <div className="relative flex items-center justify-center my-6">
          <svg className="w-72 h-72 sm:w-80 sm:h-80 -rotate-90 transform" viewBox="0 0 300 300">
            {/* Background Circle */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              className="stroke-slate-800/80"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Progress Circle */}
            {mode !== 'stopwatch' && (
              <circle
                cx="150"
                cy="150"
                r={radius}
                className={`transition-all duration-1000 ${
                  mode === 'pomodoro'
                    ? 'stroke-emerald-500'
                    : mode === 'short_break'
                    ? 'stroke-teal-400'
                    : mode === 'long_break'
                    ? 'stroke-cyan-400'
                    : 'stroke-amber-400'
                }`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            )}
          </svg>

          {/* Time & State in Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            <span className="text-6xl sm:text-7xl font-bold font-mono tracking-tight text-white drop-shadow-md">
              {mode === 'stopwatch' ? formatTime(stopwatchSeconds) : formatTime(timeLeft)}
            </span>
            <span className="mt-2 text-sm font-medium text-slate-400 flex items-center gap-1.5">
              {isRunning ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>جلسة نشطة • ركّز الآن</span>
                </>
              ) : (
                <span>متوقف مؤقتاً</span>
              )}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all transform hover:scale-105 active:scale-95 border border-slate-700/60"
            title="إعادة ضبط"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-2xl font-bold text-base flex items-center gap-2.5 shadow-xl transition-all transform hover:scale-105 active:scale-95 ${
              isRunning
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>ابدأ الآن</span>
              </>
            )}
          </button>
        </div>

        {/* Stats & Motivational Footer */}
        <div className="mt-10 pt-6 border-t border-slate-800/60 flex flex-wrap items-center justify-around gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">{completedSessions} جلسات</p>
              <p className="text-[11px] text-slate-500">الجلسات المكتملة اليوم</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">
                {Math.round((completedSessions * 25) / 60 * 10) / 10} ساعة
              </p>
              <p className="text-[11px] text-slate-500">مجموع وقت التركيز</p>
            </div>
          </div>
        </div>
      </div>

      {/* Strict Motivation Interceptor Modal */}
      {showExitWarningModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-rose-500/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-rose-400 mx-auto shadow-lg shadow-rose-950/60">
              <Stethoscope className="w-9 h-9 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                رسالة حاسمة لطالب الطب
              </span>
              <h3 className="text-2xl font-black text-white pt-1">
                «عايز طب اتعب و خف لعب!»
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                جلسة التركيز شغالة ومفيش مجال للتشتت! البالطو الأبيض والسماعة والنجاح محتاجين تعب وعزيمة من حديد.. هتكمل الـ 25 دقيقة ولا هتفرّط في حلمك؟
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => {
                  setShowExitWarningModal(false);
                  setPendingAction(null);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all transform hover:scale-[1.02] active:scale-98"
              >
                💪 أنا مكمل للآخر! (عايز طب)
              </button>

              <button
                onClick={() => {
                  setShowExitWarningModal(false);
                  if (pendingAction) pendingAction();
                  setPendingAction(null);
                }}
                className="w-full py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-rose-300 text-xs font-semibold border border-slate-700 transition-colors"
              >
                إيقاف مؤقت على مسؤوليتي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
