export type TabType = 'timer' | 'weekly' | 'prayer' | 'shortcuts';

export type Priority = 'high' | 'medium' | 'low';
export type TaskCategory = 'work' | 'study' | 'worship' | 'personal' | 'health';

export interface WeeklyTask {
  id: string;
  title: string;
  day: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  completed: boolean;
  priority: Priority;
  category: TaskCategory;
  createdAt: number;
}

export type PrayerStatus = 'pending' | 'mosque' | 'on_time' | 'late' | 'missed';

export interface PrayerItem {
  id: string;
  name: string;
  arabicName: string;
  type: 'fard' | 'sunnah' | 'nafl';
  rakahs: number;
  timeHint: string;
  merit?: string;
  status: PrayerStatus;
}

export interface DailyPrayerRecord {
  date: string; // YYYY-MM-DD
  prayers: Record<string, PrayerStatus>;
  notes?: string;
}

export interface GeneratedMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  aspectRatio: string;
  size?: '1K' | '2K' | '4K';
  createdAt: number;
}
