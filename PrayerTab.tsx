import React, { useState } from 'react';
import { WeeklyTask, PrayerItem, PrayerStatus } from '../types';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Award,
  Circle,
  HelpCircle,
  Layers,
  BarChart3,
  ListTodo,
} from 'lucide-react';
import { playTapSound, playChimeSound } from '../utils/audio';
import { getLast7DaysData } from '../utils/analytics';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import confetti from 'canvas-confetti';

interface PrayerTabProps {
  prayerStates: Record<string, PrayerStatus>;
  setPrayerStates: React.Dispatch<React.SetStateAction<Record<string, PrayerStatus>>>;
  currentDateStr: string;
  setCurrentDateStr: (date: string) => void;
  streakCount: number;
  tasks: WeeklyTask[];
}

export const PrayerTab: React.FC<PrayerTabProps> = ({
  prayerStates,
  setPrayerStates,
  currentDateStr,
  setCurrentDateStr,
  streakCount,
  tasks,
}) => {
  const [activeView, setActiveView] = useState<'checklist' | 'analytics'>('checklist');
  const [filterType, setFilterType] = useState<'all' | 'fard' | 'sunnah'>('all');
  const [showAdhkarModal, setShowAdhkarModal] = useState(false);
  const [tasbeehCount, setTasbeehCount] = useState(0);
  const [currentDhikr, setCurrentDhikr] = useState<'سبحان الله' | 'الحمد لله' | 'الله أكبر' | 'أستغفر الله'>('سبحان الله');

  // Compute 7 days trends data
  const last7DaysData = getLast7DaysData(currentDateStr, prayerStates, tasks);

  // The comprehensive prayer list with spiritual virtues
  const prayersList: PrayerItem[] = [
    // 1. Fajr
    {
      id: 'fajr_sunnah',
      name: 'سنة الفجر',
      arabicName: 'سنة الفجر (ركعتان قبليتان)',
      type: 'sunnah',
      rakahs: 2,
      timeHint: 'قبل صلاة الفجر',
      merit: '«رَكْعَتَا الْفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا»',
      status: prayerStates['fajr_sunnah'] || 'pending',
    },
    {
      id: 'fajr',
      name: 'صلاة الفجر',
      arabicName: 'صلاة الفجر (فرض)',
      type: 'fard',
      rakahs: 2,
      timeHint: 'من طلوع الفجر الصادق إلى الشروق',
      merit: '«مَنْ صَلَّى الصُّبْحَ فَهُوَ فِي ذِمَّةِ اللهِ»',
      status: prayerStates['fajr'] || 'pending',
    },
    // 2. Duha
    {
      id: 'duha',
      name: 'صلاة الضحى',
      arabicName: 'صلاة الضحى (ركعتان فأكثر)',
      type: 'sunnah',
      rakahs: 2,
      timeHint: 'بعد الشروق بـ 15 دقيقة إلى قبل الظهر',
      merit: 'تجزئ عن صدقة 360 مفصل في جسد الإنسان (صلاة الأوّابين)',
      status: prayerStates['duha'] || 'pending',
    },
    // 3. Dhuhr
    {
      id: 'dhuhr_sunnah_before',
      name: 'سنة الظهر القبلية',
      arabicName: 'سنة الظهر القبلية (4 ركعات)',
      type: 'sunnah',
      rakahs: 4,
      timeHint: 'قبل فريضة الظهر',
      merit: 'تفتح لها أبواب السماء',
      status: prayerStates['dhuhr_sunnah_before'] || 'pending',
    },
    {
      id: 'dhuhr',
      name: 'صلاة الظهر',
      arabicName: 'صلاة الظهر (فرض)',
      type: 'fard',
      rakahs: 4,
      timeHint: 'من زوال الشمس إلى وقت العصر',
      merit: 'أول صلاة صلاها جبريل بالنبي ﷺ',
      status: prayerStates['dhuhr'] || 'pending',
    },
    {
      id: 'dhuhr_sunnah_after',
      name: 'سنة الظهر البعدية',
      arabicName: 'سنة الظهر البعدية (ركعتان)',
      type: 'sunnah',
      rakahs: 2,
      timeHint: 'بعد فريضة الظهر',
      merit: 'من السنن الرواتب المؤكدة',
      status: prayerStates['dhuhr_sunnah_after'] || 'pending',
    },
    // 4. Asr
    {
      id: 'asr',
      name: 'صلاة العصر',
      arabicName: 'صلاة العصر (فرض)',
      type: 'fard',
      rakahs: 4,
      timeHint: 'الصلاة الوسطى',
      merit: '«مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ» (الفجر والعصر)',
      status: prayerStates['asr'] || 'pending',
    },
    // 5. Maghrib
    {
      id: 'maghrib',
      name: 'صلاة المغرب',
      arabicName: 'صلاة المغرب (فرض)',
      type: 'fard',
      rakahs: 3,
      timeHint: 'من غروب قرص الشمس إلى مغيب الشفق الأحمر',
      merit: 'وتر النهار وثوابها عظيم',
      status: prayerStates['maghrib'] || 'pending',
    },
    {
      id: 'maghrib_sunnah',
      name: 'سنة المغرب البعدية',
      arabicName: 'سنة المغرب البعدية (ركعتان)',
      type: 'sunnah',
      rakahs: 2,
      timeHint: 'بعد فريضة المغرب مباشرة',
      merit: 'من السنن الرواتب الـ 12',
      status: prayerStates['maghrib_sunnah'] || 'pending',
    },
    // 6. Isha
    {
      id: 'isha',
      name: 'صلاة العشاء',
      arabicName: 'صلاة العشاء (فرض)',
      type: 'fard',
      rakahs: 4,
      timeHint: 'من مغيب الشفق الأحمر إلى نصف الليل',
      merit: '«مَنْ صَلَّى الْعِشَاءَ فِي جَمَاعَةٍ فَكَأَنَّمَا قَامَ نِصْفَ اللَّيْلِ»',
      status: prayerStates['isha'] || 'pending',
    },
    {
      id: 'isha_sunnah',
      name: 'سنة العشاء البعدية',
      arabicName: 'سنة العشاء البعدية (ركعتان)',
      type: 'sunnah',
      rakahs: 2,
      timeHint: 'بعد فريضة العشاء',
      merit: 'من السنن الرواتب الـ 12',
      status: prayerStates['isha_sunnah'] || 'pending',
    },
    // 7. Qiyam / Witr
    {
      id: 'witr',
      name: 'الشفع والوتر وقيام الليل',
      arabicName: 'الشفع والوتر (قيام الليل)',
      type: 'sunnah',
      rakahs: 3,
      timeHint: 'بعد العشاء إلى قبيل الفجر',
      merit: '«إِنَّ اللَّهَ وِتْرٌ يُحِبُّ الْوِتْرَ فَأَوْتِرُوا يَا أَهْلَ الْقُرْآنِ»',
      status: prayerStates['witr'] || 'pending',
    },
  ];

  // Set prayer status handler
  const setPrayerStatus = (prayerId: string, status: PrayerStatus) => {
    playTapSound();
    const updated = { ...prayerStates, [prayerId]: status };
    setPrayerStates(updated);

    // Check if all 5 fard prayers are now completed
    const fardIds = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const allFardDone = fardIds.every(
      (id) => updated[id] === 'mosque' || updated[id] === 'on_time' || updated[id] === 'late'
    );

    if (allFardDone && (status === 'mosque' || status === 'on_time')) {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
      playChimeSound();
    }
  };

  // Quick mark all 5 fard on time
  const markAllFardOnTime = () => {
    const fardIds = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const updated = { ...prayerStates };
    fardIds.forEach((id) => {
      updated[id] = 'on_time';
    });
    setPrayerStates(updated);
    confetti({
      particleCount: 50,
      spread: 60,
    });
  };

  // Reset daily prayers
  const resetPrayers = () => {
    if (confirm('هل أنت متأكد من إعادة ضبط قائمة الصلوات لهذا اليوم؟')) {
      setPrayerStates({});
    }
  };

  // Calculations
  const fardPrayers = prayersList.filter((p) => p.type === 'fard');
  const completedFard = fardPrayers.filter(
    (p) => p.status === 'mosque' || p.status === 'on_time' || p.status === 'late'
  ).length;

  const sunnahPrayers = prayersList.filter((p) => p.type === 'sunnah');
  const completedSunnah = sunnahPrayers.filter(
    (p) => p.status === 'mosque' || p.status === 'on_time' || p.status === 'late'
  ).length;

  const totalCalculated = filterType === 'all' ? prayersList.length : filterType === 'fard' ? 5 : sunnahPrayers.length;
  const completedCalculated =
    filterType === 'all'
      ? completedFard + completedSunnah
      : filterType === 'fard'
      ? completedFard
      : completedSunnah;

  const completionPercent = Math.round((completedCalculated / totalCalculated) * 100);

  // Filter display
  const displayedPrayers = prayersList.filter((p) => {
    if (filterType === 'fard') return p.type === 'fard';
    if (filterType === 'sunnah') return p.type === 'sunnah';
    return true;
  });

  // Digital Tasbeeh increment
  const handleTasbeehClick = () => {
    playTapSound();
    const nextCount = tasbeehCount + 1;
    setTasbeehCount(nextCount);
    if (nextCount === 33 || nextCount === 100) {
      confetti({ particleCount: 20, spread: 40 });
      playChimeSound();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* View Switcher: Checklist vs 7-Day Analytics */}
      <div className="flex items-center justify-between gap-3 bg-slate-950/40 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-lg flex-wrap">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveView('checklist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeView === 'checklist'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>قائمة الصلوات اليومية</span>
          </button>

          <button
            onClick={() => setActiveView('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeView === 'analytics'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>تحليلات الـ 7 أيام الماضية (Recharts)</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-medium px-2 hidden sm:inline">
          {activeView === 'checklist' ? 'متابعة اليوم الحالي' : 'مقارنة الصلوات والمهام'}
        </span>
      </div>

      {activeView === 'analytics' ? (
        <AnalyticsDashboard data={last7DaysData} streakCount={streakCount} />
      ) : (
        <>
          {/* Top Banner Card */}
          <div className="bg-slate-950/40 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-right">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                  <Award className="w-4 h-4" />
                  <span>تودولست الصلاة اليومية • عماد الدين</span>
                </div>
                <h2 className="text-2xl font-black text-white">
                  قائمة تتبع الصلوات والسنن الرواتب
                </h2>
                <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                  «أَوَّلُ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ مِنْ عَمَلِهِ صَلَاتُهُ»، حافظ على صلواتك في وقتها وسجل سننك.
                </p>
              </div>

              {/* Circular Progress & Stats */}
              <div className="flex items-center gap-5 flex-shrink-0">
                <div className="relative flex items-center justify-center">
                  <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-slate-800"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-emerald-400 transition-all duration-700 ease-out"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 - (completionPercent / 100) * (2 * Math.PI * 40)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-bold text-white">
                    <span className="text-lg font-mono">{completionPercent}%</span>
                    <span className="text-[10px] text-slate-400 font-normal">مكتمل</span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>الفروض: </span>
                    <strong className="text-emerald-400">{completedFard}/5</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-teal-400" />
                    <span>السنن والنوافل: </span>
                    <strong className="text-teal-400">{completedSunnah}/7</strong>
                  </div>
                  {streakCount > 0 && (
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold pt-1">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>سلسلة الالتزام: {streakCount} يوم</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ambient geometric decoration */}
            <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          </div>

          {/* Filter Tabs & Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-lg">
            <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === 'all' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                كل الصلوات ({prayersList.length})
              </button>
              <button
                onClick={() => setFilterType('fard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === 'fard' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                الفرائض الخمس (5)
              </button>
              <button
                onClick={() => setFilterType('sunnah')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === 'sunnah' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                السنن والرواتب (7)
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Quick Jump to Analytics */}
              <button
                onClick={() => setActiveView('analytics')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                title="عرض الرسوم البيانية"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>إحصائيات 7 أيام</span>
              </button>

              {/* Adhkar button */}
              <button
                onClick={() => setShowAdhkarModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>أذكار بعد الصلاة والسبحة</span>
              </button>

              <button
                onClick={markAllFardOnTime}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                title="تعليم الفرائض الخمس في وقتها"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>إتمام الفرائض</span>
              </button>

              <button
                onClick={resetPrayers}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
                title="إعادة ضبط قائمة الصلوات"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

      {/* Prayers Todo Checklist */}
      <div className="space-y-3">
        {displayedPrayers.map((prayer) => {
          const isDone =
            prayer.status === 'mosque' || prayer.status === 'on_time' || prayer.status === 'late';

          return (
            <div
              key={prayer.id}
              className={`p-4 rounded-2xl border backdrop-blur-xl transition-all ${
                isDone
                  ? 'bg-emerald-950/25 border-emerald-500/30 hover:border-emerald-400/50'
                  : 'bg-slate-950/40 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Prayer Title & Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() =>
                      setPrayerStatus(prayer.id, isDone ? 'pending' : 'on_time')
                    }
                    className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors flex-shrink-0"
                    title={isDone ? 'إلغاء' : 'تعليم كمكتمل'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-base font-bold ${
                          isDone ? 'text-slate-300' : 'text-white'
                        }`}
                      >
                        {prayer.arabicName}
                      </h4>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                          prayer.type === 'fard'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-teal-500/10 text-teal-300 border-teal-500/20'
                        }`}
                      >
                        {prayer.type === 'fard' ? 'فرض مؤكد' : 'سنة / نافلة'}
                      </span>

                      <span className="text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md font-mono">
                        {prayer.rakahs} {prayer.rakahs === 2 ? 'ركعتان' : prayer.rakahs === 3 ? 'ركعات' : 'ركعات'}
                      </span>
                    </div>

                    {/* Merit / Hadith quote */}
                    {prayer.merit && (
                      <p className="text-xs text-amber-300/80 mt-1 font-amiri font-normal">
                        {prayer.merit}
                      </p>
                    )}

                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {prayer.timeHint}
                    </p>
                  </div>
                </div>

                {/* Status Selector Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap">
                  {/* In Mosque / Jamaah (only for fard or optional) */}
                  <button
                    onClick={() => setPrayerStatus(prayer.id, 'mosque')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                      prayer.status === 'mosque'
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 ring-1 ring-emerald-300'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="صليت في المسجد مع الجماعة"
                  >
                    🕌 بالمسجد / جماعة
                  </button>

                  {/* On time */}
                  <button
                    onClick={() => setPrayerStatus(prayer.id, 'on_time')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                      prayer.status === 'on_time'
                        ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="صليت في وقتها"
                  >
                    ⏱️ في وقتها
                  </button>

                  {/* Late / Qada */}
                  <button
                    onClick={() => setPrayerStatus(prayer.id, 'late')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                      prayer.status === 'late'
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="صليت قضاءً أو متأخراً"
                  >
                    🔄 قضاءً
                  </button>

                  {/* Clear / Pending */}
                  {prayer.status !== 'pending' && (
                    <button
                      onClick={() => setPrayerStatus(prayer.id, 'pending')}
                      className="px-2 py-1 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition-colors"
                      title="مسح الحالة"
                    >
                      إلغاء
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  )}

      {/* Adhkar & Digital Tasbeeh Modal */}
      {showAdhkarModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">أذكار دبر كل صلاة مكتوبة والسبحة</h3>
              </div>
              <button
                onClick={() => setShowAdhkarModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Interactive Digital Tasbeeh */}
            <div className="bg-gradient-to-b from-slate-950 to-slate-900 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
              <span className="text-xs text-amber-400/80 font-medium">السبحة الإلكترونية التفاعلية</span>

              {/* Dhikr selection */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {(['سبحان الله', 'الحمد لله', 'الله أكبر', 'أستغفر الله'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setCurrentDhikr(d);
                      setTasbeehCount(0);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                      currentDhikr === d
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Big Tap Area */}
              <div className="py-4">
                <button
                  onClick={handleTasbeehClick}
                  className="w-36 h-36 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 hover:from-emerald-500 hover:to-teal-700 mx-auto flex flex-col items-center justify-center shadow-2xl shadow-emerald-950/80 ring-4 ring-emerald-400/30 transform active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-4xl font-mono font-black text-white">{tasbeehCount}</span>
                  <span className="text-xs text-emerald-200 mt-1 font-amiri">{currentDhikr}</span>
                  <span className="text-[10px] text-emerald-300/80">انقر هنا للعد</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                <span>الهدف الموصى به: 33 مرة</span>
                <button
                  onClick={() => setTasbeehCount(0)}
                  className="text-rose-400 hover:underline"
                >
                  تصفير العداد
                </button>
              </div>
            </div>

            {/* Recommended Adhkar list */}
            <div className="space-y-2 text-xs text-slate-300">
              <h4 className="font-bold text-white text-sm">الأذكار المأثورة بعد السلام:</h4>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1">
                <p className="font-semibold text-emerald-400">1. الاستغفار والتهليل:</p>
                <p className="font-amiri text-sm text-slate-200">
                  «أَسْتَغْفِرُ اللهَ (ثلاثًا)، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالإِكْرَامِ».
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1">
                <p className="font-semibold text-emerald-400">2. آية الكرسي:</p>
                <p className="font-amiri text-sm text-slate-200">
                  «اللهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ...» (من قرأها دبر كل صلاة لم يمنعه من دخول الجنة إلا أن يموت).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1">
                <p className="font-semibold text-emerald-400">3. التسبيح والتحميد والتكبير:</p>
                <p className="font-amiri text-sm text-slate-200">
                  «سُبْحَانَ اللهِ (33)، وَالْحَمْدُ للهِ (33)، وَاللهُ أَكْبَرُ (33)، وتَمَامُ الْمِائَةِ: لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ».
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
