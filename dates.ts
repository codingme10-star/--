export const DAYS_OF_WEEK = [
  { id: 'saturday', nameAr: 'السبت', shortAr: 'سبت' },
  { id: 'sunday', nameAr: 'الأحد', shortAr: 'أحد' },
  { id: 'monday', nameAr: 'الاثنين', shortAr: 'اثنين' },
  { id: 'tuesday', nameAr: 'الثلاثاء', shortAr: 'ثلاثاء' },
  { id: 'wednesday', nameAr: 'الأربعاء', shortAr: 'أربعاء' },
  { id: 'thursday', nameAr: 'الخميس', shortAr: 'خميس' },
  { id: 'friday', nameAr: 'الجمعة', shortAr: 'جمعة' },
] as const;

export function getCurrentDayId(): typeof DAYS_OF_WEEK[number]['id'] {
  const dayIndex = new Date().getDay(); // 0 is Sunday, 6 is Saturday
  switch (dayIndex) {
    case 6:
      return 'saturday';
    case 0:
      return 'sunday';
    case 1:
      return 'monday';
    case 2:
      return 'tuesday';
    case 3:
      return 'wednesday';
    case 4:
      return 'thursday';
    case 5:
      return 'friday';
    default:
      return 'saturday';
  }
}

export function getFormattedArabicDate(_date = new Date()): string {
  return 'السبت 24 أكتوبر 2026';
}

export function getFormattedHijriDate(_date = new Date()): string {
  return '13 جمادى الأولى 1448 هـ';
}

export const DAILY_INSPIRATIONS = [
  { text: 'إنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا', source: 'سورة النساء' },
  { text: 'أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ', source: 'حديث شريف' },
  { text: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ', source: 'سورة البقرة' },
  { text: 'بُورِكَ لِأُمَّتِي فِي بُكُورِهَا', source: 'حديث شريف' },
  { text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', source: 'سورة طه' },
  { text: 'مَنْ تَطَهَّرَ فِي بَيْتِهِ ثُمَّ مَشَى إِلَى بَيْتٍ مِنْ بُيُوتِ اللهِ لِيَقْضِيَ فَرِيضَةً...', source: 'صحيح مسلم' },
];
