import React, { useState } from 'react';
import { WeeklyTask, Priority, TaskCategory } from '../types';
import { DAYS_OF_WEEK, getCurrentDayId } from '../utils/dates';
import {
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowRightLeft,
  CalendarDays,
  ListFilter,
  CheckCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WeeklyTasksTabProps {
  tasks: WeeklyTask[];
  setTasks: React.Dispatch<React.SetStateAction<WeeklyTask[]>>;
}

export const WeeklyTasksTab: React.FC<WeeklyTasksTabProps> = ({ tasks, setTasks }) => {
  const currentDayId = getCurrentDayId();
  const [selectedDay, setSelectedDay] = useState<typeof DAYS_OF_WEEK[number]['id']>(currentDayId);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDay, setNewTaskDay] = useState<typeof DAYS_OF_WEEK[number]['id']>(selectedDay);
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('work');
  const [showAddModal, setShowAddModal] = useState(false);

  // Filters
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');

  // Categories metadata
  const categories: { id: TaskCategory; nameAr: string; color: string }[] = [
    { id: 'work', nameAr: 'عمل', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { id: 'study', nameAr: 'دراسة', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { id: 'worship', nameAr: 'عبادة', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { id: 'personal', nameAr: 'شخصي', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { id: 'health', nameAr: 'صحة', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  ];

  // Priority metadata
  const priorities: { id: Priority; nameAr: string; color: string }[] = [
    { id: 'high', nameAr: 'عالية', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    { id: 'medium', nameAr: 'متوسطة', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { id: 'low', nameAr: 'منخفضة', color: 'bg-slate-700 text-slate-300 border-slate-600' },
  ];

  // Add Task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: WeeklyTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      day: newTaskDay,
      completed: false,
      priority: newTaskPriority,
      category: newTaskCategory,
      createdAt: Date.now(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle('');
    setShowAddModal(false);
  };

  // Toggle Task Completion
  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            confetti({
              particleCount: 25,
              spread: 45,
              origin: { y: 0.7 },
            });
          }
          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );
  };

  // Delete Task
  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Move Task to Next Day
  const moveTaskToNextDay = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const currentIndex = DAYS_OF_WEEK.findIndex((d) => d.id === t.day);
          const nextIndex = (currentIndex + 1) % DAYS_OF_WEEK.length;
          return { ...t, day: DAYS_OF_WEEK[nextIndex].id };
        }
        return t;
      })
    );
  };

  // Clear completed tasks for selected day (or all)
  const clearCompleted = () => {
    if (viewMode === 'single') {
      setTasks((prev) => prev.filter((t) => !(t.day === selectedDay && t.completed)));
    } else {
      setTasks((prev) => prev.filter((t) => !t.completed));
    }
  };

  // Filter tasks
  const getFilteredTasks = (dayId?: string) => {
    return tasks.filter((t) => {
      if (dayId && t.day !== dayId) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      return true;
    });
  };

  // Total weekly stats
  const totalWeekly = tasks.length;
  const completedWeekly = tasks.filter((t) => t.completed).length;
  const weeklyPercent = totalWeekly > 0 ? Math.round((completedWeekly / totalWeekly) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Controls & Weekly Summary Bar */}
      <div className="bg-slate-950/40 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              جدول المهام الأسبوعية
            </h2>
            <p className="text-xs text-slate-400">
              أسبوعك منظم: السبت إلى الجمعة • خطط، نفّذ، وتابع إنجازك
            </p>
          </div>
        </div>

        {/* Progress & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
          <div className="flex items-center gap-2 bg-slate-800/60 px-3.5 py-1.5 rounded-2xl border border-slate-700/60">
            <div className="text-right">
              <span className="text-[11px] text-slate-400">إنجاز الأسبوع:</span>
              <span className="font-bold text-emerald-400 mr-1.5">{weeklyPercent}%</span>
            </div>
            <div className="w-20 bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${weeklyPercent}%` }}
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'single' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              يوم محدد
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'all' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              الأسبوع كاملاً
            </button>
          </div>

          {/* Add Task Button */}
          <button
            onClick={() => {
              setNewTaskDay(selectedDay);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>مهمة جديدة</span>
          </button>
        </div>
      </div>

      {/* Days Tabs (When Single Day View) */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {DAYS_OF_WEEK.map((d) => {
          const dayTasks = tasks.filter((t) => t.day === d.id);
          const dayCompleted = dayTasks.filter((t) => t.completed).length;
          const isToday = d.id === currentDayId;
          const isSelected = d.id === selectedDay;

          return (
            <button
              key={d.id}
              onClick={() => {
                setSelectedDay(d.id);
                if (viewMode === 'all') setViewMode('single');
              }}
              className={`p-2 sm:p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all relative border ${
                isSelected
                  ? 'bg-gradient-to-b from-emerald-950/80 to-slate-900 text-white border-emerald-500/60 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              {isToday && (
                <span className="absolute -top-1.5 right-1/2 translate-x-1/2 text-[9px] font-bold px-1.5 py-0.2 bg-emerald-500 text-slate-950 rounded-full shadow-sm">
                  اليوم
                </span>
              )}
              <span className="text-xs sm:text-sm font-bold mt-1">{d.nameAr}</span>
              <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                <span>{dayCompleted}/{dayTasks.length}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/35 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            فلترة:
          </span>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="all">كل الأولويات</option>
            <option value="high">عالية</option>
            <option value="medium">متوسطة</option>
            <option value="low">منخفضة</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="all">كل التصنيفات</option>
            <option value="work">عمل</option>
            <option value="study">دراسة</option>
            <option value="worship">عبادة</option>
            <option value="personal">شخصي</option>
            <option value="health">صحة</option>
          </select>
        </div>

        {tasks.some((t) => t.completed) && (
          <button
            onClick={clearCompleted}
            className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح المكتمل</span>
          </button>
        )}
      </div>

      {/* Single Day View vs 7-Day Grid View */}
      {viewMode === 'single' ? (
        <div className="bg-slate-950/40 rounded-3xl border border-white/10 p-5 sm:p-6 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>مهام يوم {DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.nameAr}</span>
                {selectedDay === currentDayId && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                    (اليوم الحالي)
                  </span>
                )}
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {getFilteredTasks(selectedDay).filter((t) => t.completed).length} من أصل{' '}
              {getFilteredTasks(selectedDay).length} مهمة
            </span>
          </div>

          {/* Tasks List */}
          <div className="space-y-2.5">
            {getFilteredTasks(selectedDay).length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ListFilter className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">لا توجد مهام مسجلة لهذا اليوم</p>
                <button
                  onClick={() => {
                    setNewTaskDay(selectedDay);
                    setShowAddModal(true);
                  }}
                  className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  + أضف مهمتك الأولى الآن
                </button>
              </div>
            ) : (
              getFilteredTasks(selectedDay).map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                    task.completed
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="text-slate-400 hover:text-emerald-400 transition-colors flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <span
                      className={`text-sm break-words ${
                        task.completed ? 'line-through text-slate-500' : 'text-slate-100 font-medium'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Category badge */}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        categories.find((c) => c.id === task.category)?.color
                      }`}
                    >
                      {categories.find((c) => c.id === task.category)?.nameAr}
                    </span>

                    {/* Priority badge */}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        priorities.find((p) => p.id === task.priority)?.color
                      }`}
                    >
                      {priorities.find((p) => p.id === task.priority)?.nameAr}
                    </span>

                    {/* Move to next day button */}
                    <button
                      onClick={() => moveTaskToNextDay(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-700/50 transition-colors"
                      title="ترحيل لليوم التالي"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition-colors opacity-80 group-hover:opacity-100"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* 7-Days Kanban Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {DAYS_OF_WEEK.map((d) => {
            const dayTasks = getFilteredTasks(d.id);
            const isToday = d.id === currentDayId;

            return (
              <div
                key={d.id}
                className={`bg-slate-950/40 backdrop-blur-xl rounded-2xl border p-4 flex flex-col min-h-[300px] ${
                  isToday ? 'border-emerald-400/50 ring-1 ring-emerald-500/20 shadow-lg' : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-xs">
                  <span className="font-bold text-slate-200">{d.nameAr}</span>
                  <span className="text-slate-500 font-mono">
                    {dayTasks.filter((t) => t.completed).length}/{dayTasks.length}
                  </span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto max-h-[320px]">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2 ${
                        task.completed
                          ? 'bg-slate-950/40 border-slate-800/40 opacity-50'
                          : 'bg-slate-800/60 border-slate-700/60'
                      }`}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-400"
                      >
                        {task.completed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-[9px]">
                          <span className={`px-1.5 py-0.2 rounded border ${categories.find((c) => c.id === task.category)?.color}`}>
                            {categories.find((c) => c.id === task.category)?.nameAr}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => moveTaskToNextDay(task.id)}
                        className="text-slate-500 hover:text-amber-400"
                        title="ترحيل"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setNewTaskDay(d.id);
                    setShowAddModal(true);
                  }}
                  className="mt-3 w-full py-1.5 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>إضافة</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>إضافة مهمة أسبوعية جديدة</span>
            </h3>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  عنوان المهمة *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: إنهاء التقرير الأسبوعي، مراجعة سورة الكهف..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              {/* Day selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  يوم المهمة
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {DAYS_OF_WEEK.map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => setNewTaskDay(d.id)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-colors ${
                        newTaskDay === d.id
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {d.nameAr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">الأولوية</label>
                <div className="grid grid-cols-3 gap-2">
                  {priorities.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setNewTaskPriority(p.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        newTaskPriority === p.id
                          ? 'ring-2 ring-emerald-400 ' + p.color
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {p.nameAr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">التصنيف</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setNewTaskCategory(c.id)}
                      className={`py-1.5 px-2.5 rounded-xl text-xs font-medium border transition-all ${
                        newTaskCategory === c.id
                          ? 'ring-2 ring-emerald-400 ' + c.color
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {c.nameAr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20"
                >
                  حفظ المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
