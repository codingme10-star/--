import React, { useState, useEffect } from 'react';
import { TabType, WeeklyTask, PrayerStatus } from './types';
import { Header } from './components/Header';
import { TimerTab } from './components/TimerTab';
import { WeeklyTasksTab } from './components/WeeklyTasksTab';
import { PrayerTab } from './components/PrayerTab';
import { ShortcutsWidget } from './components/ShortcutsWidget';
import { InstallModal } from './components/InstallModal';
import { Heart, Moon, ShieldCheck, CheckCircle2, Stethoscope, AlertTriangle } from 'lucide-react';

const DEFAULT_TASKS: WeeklyTask[] = [
  {
    id: '1',
    title: 'مراجعة الورد القرآني اليومي (جزء عم)',
    day: 'saturday',
    completed: true,
    priority: 'high',
    category: 'worship',
    createdAt: Date.now() - 3600000,
  },
  {
    id: '2',
    title: 'جلسة تركيز 25 دقيقة لإنجاز مشروع البرمجة',
    day: 'sunday',
    completed: false,
    priority: 'high',
    category: 'work',
    createdAt: Date.now() - 7200000,
  },
  {
    id: '3',
    title: 'قراءة 20 صفحة من كتاب رياض الصالحين',
    day: 'monday',
    completed: false,
    priority: 'medium',
    category: 'study',
    createdAt: Date.now(),
  },
  {
    id: '4',
    title: 'رياضة مشي نصف ساعة قبل المغرب',
    day: 'tuesday',
    completed: false,
    priority: 'medium',
    category: 'health',
    createdAt: Date.now(),
  },
  {
    id: '5',
    title: 'صلة الرحم والاتصال بالأهل',
    day: 'wednesday',
    completed: false,
    priority: 'high',
    category: 'personal',
    createdAt: Date.now(),
  },
  {
    id: '6',
    title: 'جلسة مراجعة المهام والتخطيط للأسبوع القادم',
    day: 'thursday',
    completed: false,
    priority: 'medium',
    category: 'work',
    createdAt: Date.now(),
  },
  {
    id: '7',
    title: 'قراءة سورة الكهف والتبكير لصلاة الجمعة',
    day: 'friday',
    completed: false,
    priority: 'high',
    category: 'worship',
    createdAt: Date.now(),
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('timer');

  // Today's date string YYYY-MM-DD
  const todayStr = '2026-10-24';
  const [currentDateStr, setCurrentDateStr] = useState(todayStr);

  // Timer running lock state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [blockedTargetTab, setBlockedTargetTab] = useState<TabType | null>(null);

  // Fullscreen, Wide screen mode, and Install modal states
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWideMode, setIsWideMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768; // Auto-wide for tablet and desktop!
    }
    return true;
  });

  // Track fullscreen changes from ESC or browser shortcuts
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  // Weekly tasks state with localStorage
  const [tasks, setTasks] = useState<WeeklyTask[]>(() => {
    try {
      const saved = localStorage.getItem('siraj_weekly_tasks');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading saved tasks');
    }
    return DEFAULT_TASKS;
  });

  // Prayer state with localStorage (keyed by date)
  const [prayerStates, setPrayerStates] = useState<Record<string, PrayerStatus>>(() => {
    try {
      const saved = localStorage.getItem(`siraj_prayers_${todayStr}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading saved prayers');
    }
    return {
      fajr: 'on_time',
      fajr_sunnah: 'on_time',
      duha: 'pending',
      dhuhr: 'pending',
      dhuhr_sunnah_before: 'pending',
      dhuhr_sunnah_after: 'pending',
      asr: 'pending',
      maghrib: 'pending',
      maghrib_sunnah: 'pending',
      isha: 'pending',
      isha_sunnah: 'pending',
      witr: 'pending',
    };
  });

  // Streak counter
  const [streakCount, setStreakCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('siraj_prayer_streak') || '3', 10);
    } catch (e) {
      return 3;
    }
  });

  // Strict beforeunload preventer when Timer is running
  useEffect(() => {
    if (!isTimerRunning) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      const msg = 'عايز طب اتعب و خف لعب';
      e.returnValue = msg;
      return msg;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isTimerRunning]);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('siraj_weekly_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Save prayers to localStorage
  useEffect(() => {
    localStorage.setItem(`siraj_prayers_${currentDateStr}`, JSON.stringify(prayerStates));

    const fardDone = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].every(
      (id) =>
        prayerStates[id] === 'mosque' ||
        prayerStates[id] === 'on_time' ||
        prayerStates[id] === 'late'
    );
    if (fardDone) {
      const lastCompletedDate = localStorage.getItem('siraj_last_fard_date');
      if (lastCompletedDate !== currentDateStr) {
        const nextStreak = streakCount + 1;
        setStreakCount(nextStreak);
        localStorage.setItem('siraj_prayer_streak', nextStreak.toString());
        localStorage.setItem('siraj_last_fard_date', currentDateStr);
      }
    }
  }, [prayerStates, currentDateStr]);

  // Safe tab change handler that protects against leaving active timer
  const handleTabChange = (targetTab: TabType) => {
    if (isTimerRunning && activeTab === 'timer' && targetTab !== 'timer') {
      setBlockedTargetTab(targetTab);
      setShowExitModal(true);
    } else {
      setActiveTab(targetTab);
    }
  };

  // Count calculations for Header badges
  const fardIds = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const prayerCompletedCount = fardIds.filter(
    (id) =>
      prayerStates[id] === 'mosque' ||
      prayerStates[id] === 'on_time' ||
      prayerStates[id] === 'late'
  ).length;

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen relative text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Image: Sunset Meadow and Clouds */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `url('/assets/aistudio/Picsart_26-10-14_13-42-35-858_2d000a09.jpg')`,
        }}
      >
        {/* Soft atmospheric overlay letting the gorgeous meadow & clouds shine clearly */}
        <div className="absolute inset-0 bg-slate-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-slate-950/45" />
      </div>

      {/* Main App Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        prayerCompletedCount={prayerCompletedCount}
        totalPrayersCount={5}
        streakCount={streakCount}
        pendingTasksCount={pendingTasksCount}
        onOpenInstallModal={() => setShowInstallModal(true)}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        isWideMode={isWideMode}
        toggleWideMode={() => setIsWideMode((prev) => !prev)}
      />

      {/* Main Content Area: Responsive full width on computer & tablet */}
      <main className={`flex-1 w-full mx-auto px-3 sm:px-6 py-5 sm:py-8 z-10 transition-all duration-300 ${isWideMode ? 'max-w-[98%]' : 'max-w-7xl'}`}>
        {activeTab === 'timer' && (
          <TimerTab onRunningChange={(running) => setIsTimerRunning(running)} />
        )}

        {activeTab === 'weekly' && (
          <WeeklyTasksTab tasks={tasks} setTasks={setTasks} />
        )}

        {activeTab === 'prayer' && (
          <PrayerTab
            prayerStates={prayerStates}
            setPrayerStates={setPrayerStates}
            currentDateStr={currentDateStr}
            setCurrentDateStr={setCurrentDateStr}
            streakCount={streakCount}
            tasks={tasks}
          />
        )}

        {activeTab === 'shortcuts' && <ShortcutsWidget />}
      </main>

      {/* Strict Tab Exit Interceptor Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-rose-500/70 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-rose-400 mx-auto shadow-lg shadow-rose-950/60">
              <Stethoscope className="w-9 h-9 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                ممنوع الهروب أثناء المذاكرة!
              </span>
              <h3 className="text-2xl font-black text-white pt-1">
                «عايز طب اتعب و خف لعب!»
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                التايمر شغال وجلسة التركيز دي اتعملت عشان حلمك في كلية الطب! متشتتش نفسك ولا تطلع قبل ما تخلص الـ 25 دقيقة كاملة.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => {
                  setShowExitModal(false);
                  setBlockedTargetTab(null);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all transform hover:scale-[1.02] active:scale-98"
              >
                💪 راجع أكمل تركيزي يا دكتور
              </button>

              <button
                onClick={() => {
                  setShowExitModal(false);
                  setIsTimerRunning(false);
                  if (blockedTargetTab) {
                    setActiveTab(blockedTargetTab);
                  }
                  setBlockedTargetTab(null);
                }}
                className="w-full py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-rose-300 text-xs font-semibold border border-slate-700 transition-colors"
              >
                إيقاف المؤقت ومغادرة الجلسة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install App Modal (APK & EXE & PWA) */}
      <InstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-slate-950/80 backdrop-blur-md py-4 text-center text-xs text-slate-400 z-10">
        <div className={`mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 ${isWideMode ? 'w-full max-w-[98%]' : 'max-w-7xl'}`}>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">سِرَاج (Siraj)</span>
            <span>—</span>
            <span>رفيقك اليومي للتركيز وتنظيم الأسبوع وعمارة الأوقات بالصلاة</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              حفظ تلقائي محلي
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-amber-400">
              <Stethoscope className="w-3.5 h-3.5" />
              عايز طب اتعب و خف لعب
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
