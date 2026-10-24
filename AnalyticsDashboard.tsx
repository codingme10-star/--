import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { DayAnalytics } from '../utils/analytics';
import {
  TrendingUp,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  BarChart3,
  Moon,
  Clock,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  data: DayAnalytics[];
  streakCount: number;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data, streakCount }) => {
  const [activeMetric, setActiveMetric] = useState<'both' | 'prayers' | 'tasks'>('both');

  // Overall calculations
  const totalFardPossible = data.length * 5;
  const totalFardCompleted = data.reduce((acc, d) => acc + d.fardCompleted, 0);
  const avgFardPerDay = (totalFardCompleted / data.length).toFixed(1);
  const fardPercentage = Math.round((totalFardCompleted / totalFardPossible) * 100);

  const totalTasksPossible = data.reduce((acc, d) => acc + d.tasksTotal, 0);
  const totalTasksCompleted = data.reduce((acc, d) => acc + d.tasksCompleted, 0);
  const avgTaskRate =
    totalTasksPossible > 0 ? Math.round((totalTasksCompleted / totalTasksPossible) * 100) : 0;

  const totalMosquePrayers = data.reduce((acc, d) => acc + d.mosqueCount, 0);

  // Custom Dark Arabic Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs space-y-1.5 backdrop-blur-md">
          <p className="font-bold text-white border-b border-slate-800 pb-1 flex items-center justify-between gap-3">
            <span>{label}</span>
            <span className="text-slate-400 font-mono text-[10px]">
              {payload[0]?.payload?.dateStr}
            </span>
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-bold font-mono text-slate-100">
                {entry.value}
                {entry.unit || ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-2xl space-y-6">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              لوحة تحليلات وإحصائيات الـ 7 أيام الماضية
            </h3>
            <p className="text-xs text-slate-400">
              متابعة اتجاهات الالتزام بالصلوات ومعدلات إنجاز المهام الأسبوعية
            </p>
          </div>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => setActiveMetric('both')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeMetric === 'both'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            نظرة شاملة
          </button>
          <button
            onClick={() => setActiveMetric('prayers')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeMetric === 'prayers'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            الصلوات فقط
          </button>
          <button
            onClick={() => setActiveMetric('tasks')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeMetric === 'tasks'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            المهام فقط
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Fard Completion Rate */}
        <div className="bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">الفرائض (7 أيام)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-emerald-400">{fardPercentage}%</span>
              <span className="text-[10px] text-slate-500 font-mono">({avgFardPerDay}/5 يومياً)</span>
            </div>
          </div>
        </div>

        {/* Task Completion Rate */}
        <div className="bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">إنجاز المهام</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-teal-400">{avgTaskRate}%</span>
              <span className="text-[10px] text-slate-500 font-mono">({totalTasksCompleted}/{totalTasksPossible})</span>
            </div>
          </div>
        </div>

        {/* Mosque Prayers */}
        <div className="bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">صلوات المسجد</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-cyan-300">{totalMosquePrayers}</span>
              <span className="text-[10px] text-slate-500">صلاة بجماعة</span>
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">سلسلة الالتزام</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-amber-400">{streakCount}</span>
              <span className="text-[10px] text-slate-500">أيام متواصلة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* CHART 1: Prayer Trends over 7 Days (Area / Bar) */}
        {(activeMetric === 'both' || activeMetric === 'prayers') && (
          <div className="bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h4 className="text-sm font-bold text-white">
                  اتجاه أداء الصلوات المفروضة والسنن
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">الصلوات المنجزة (0-12)</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFard" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorSunnah" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis
                    dataKey="dayName"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                    domain={[0, 7]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    iconType="circle"
                  />
                  <Area
                    type="monotone"
                    dataKey="fardCompleted"
                    name="الفرائض (من 5)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorFard)"
                  />
                  <Area
                    type="monotone"
                    dataKey="sunnahCompleted"
                    name="السنن (من 7)"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSunnah)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              الأخضر: الفرائض الخمس • السماوي: السنن الرواتب والنوافل
            </p>
          </div>
        )}

        {/* CHART 2: Task Completion Rates over 7 Days */}
        {(activeMetric === 'both' || activeMetric === 'tasks') && (
          <div className="bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                <h4 className="text-sm font-bold text-white">
                  معدل إنجاز المهام الأسبوعية (%)
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">النسبة المئوية %</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis
                    dataKey="dayName"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                    domain={[0, 100]}
                    unit="%"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    iconType="rect"
                  />
                  <Bar
                    dataKey="taskRate"
                    name="نسبة إنجاز المهام"
                    fill="#14b8a6"
                    radius={[6, 6, 0, 0]}
                    unit="%"
                  />
                  <Line
                    type="monotone"
                    dataKey="prayerRate"
                    name="نسبة الصلوات الكلية"
                    stroke="#eab308"
                    strokeWidth={2.5}
                    dot={{ fill: '#eab308', r: 3 }}
                    unit="%"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              الأعمدة الفيروزية: إنجاز المهام • الخط الذهبي: معدل الالتزام بالصلاة
            </p>
          </div>
        )}
      </div>

      {/* 7-Day Day-by-Day Table */}
      <div className="pt-2">
        <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>تفاصيل الـ 7 أيام الأخيرة بالتاريخ</span>
        </h4>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700/60 font-semibold">
              <tr>
                <th className="py-2.5 px-3.5">اليوم</th>
                <th className="py-2.5 px-3">التاريخ</th>
                <th className="py-2.5 px-3">الفرائض (من 5)</th>
                <th className="py-2.5 px-3">السنن (من 7)</th>
                <th className="py-2.5 px-3">بالمسجد 🕌</th>
                <th className="py-2.5 px-3">المهام المنجزة</th>
                <th className="py-2.5 px-3.5">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {data.map((day, idx) => (
                <tr
                  key={day.dateStr}
                  className={idx === data.length - 1 ? 'bg-emerald-950/20 font-medium' : 'hover:bg-slate-800/30'}
                >
                  <td className="py-2.5 px-3.5 font-bold text-slate-200">
                    {day.dayName}
                    {idx === data.length - 1 && (
                      <span className="mr-1.5 text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-full font-normal">
                        اليوم
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                    {day.dateStr}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-emerald-400">
                    {day.fardCompleted}/5
                  </td>
                  <td className="py-2.5 px-3 font-mono text-cyan-300">
                    {day.sunnahCompleted}/7
                  </td>
                  <td className="py-2.5 px-3 font-mono text-amber-300">
                    {day.mosqueCount}
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    <span className="text-teal-400 font-bold">{day.tasksCompleted}</span>/{day.tasksTotal}
                    <span className="text-[10px] text-slate-500 mr-1 font-sans">({day.taskRate}%)</span>
                  </td>
                  <td className="py-2.5 px-3.5">
                    {day.fardCompleted === 5 ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                        مكتمل ممتاز ⭐
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        جيد ({day.fardCompleted}/5)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
