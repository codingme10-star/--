import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Search,
  ExternalLink,
  Copy,
  Check,
  FolderPlus,
  Globe,
  Sparkles,
} from 'lucide-react';

export interface ShortcutItem {
  id: string;
  title: string;
  url: string;
  category: 'google' | 'study' | 'tools' | 'islamic' | 'other';
}

const DEFAULT_SHORTCUTS: ShortcutItem[] = [
  {
    id: '1',
    title: 'جوجل',
    url: 'https://www.google.com',
    category: 'google',
  },
  {
    id: '2',
    title: 'جوجل درايف',
    url: 'https://drive.google.com',
    category: 'google',
  },
  {
    id: '3',
    title: 'جيميل',
    url: 'https://mail.google.com',
    category: 'google',
  },
  {
    id: '4',
    title: 'مستندات جوجل',
    url: 'https://docs.google.com',
    category: 'google',
  },
  {
    id: '5',
    title: 'يوتيوب',
    url: 'https://www.youtube.com',
    category: 'tools',
  },
  {
    id: '6',
    title: 'القرآن الكريم',
    url: 'https://quran.com',
    category: 'islamic',
  },
  {
    id: '7',
    title: 'PubMed طب',
    url: 'https://pubmed.ncbi.nlm.nih.gov',
    category: 'study',
  },
  {
    id: '8',
    title: 'ChatGPT',
    url: 'https://chatgpt.com',
    category: 'tools',
  },
  {
    id: '9',
    title: 'ويكيبيديا',
    url: 'https://ar.wikipedia.org',
    category: 'study',
  },
  {
    id: '10',
    title: 'ترجمة جوجل',
    url: 'https://translate.google.com',
    category: 'google',
  },
];

// Helper to extract clean domain for fetching high-resolution favicon
function getDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname;
  } catch (e) {
    return url.replace(/^https?:\/\//i, '').split('/')[0];
  }
}

function getFaviconUrl(url: string): string {
  const domain = getDomainFromUrl(url);
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

export const ShortcutsWidget: React.FC = () => {
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>(() => {
    try {
      const saved = localStorage.getItem('siraj_user_shortcuts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading shortcuts');
    }
    return DEFAULT_SHORTCUTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<ShortcutItem['category']>('google');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('siraj_user_shortcuts', JSON.stringify(shortcuts));
  }, [shortcuts]);

  const handleAddShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const item: ShortcutItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      url: formattedUrl,
      category: newCategory,
    };

    setShortcuts((prev) => [item, ...prev]);
    setNewTitle('');
    setNewUrl('');
    setShowAddModal(false);
  };

  const deleteShortcut = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShortcuts((prev) => prev.filter((s) => s.id !== id));
  };

  const handleGoogleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery.trim())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copyUrl = (id: string, url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Frosted Glass Container showcasing the background */}
      <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 transition-all">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-950/40">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                اختصارات وروابط المواقع المفضلة
              </h3>
              <p className="text-xs text-amber-200/80">
                أيقونات المواقع الرسمية التلقائية وروابط سريعة لأهم مواقعك
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة موقع جديد</span>
          </button>
        </div>

        {/* Compact Frosted Google Search Bar */}
        <form onSubmit={handleGoogleSearch} className="relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث مباشرة في جوجل (بحث طبي، محاضرات، أوقات، مراجع...)"
              className="w-full bg-slate-900/40 backdrop-blur-md border border-white/15 rounded-2xl py-3 px-4 pl-24 text-sm text-slate-100 placeholder:text-slate-400/80 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 shadow-inner"
            />
            <button
              type="submit"
              className="absolute left-2 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>بحث جوجل</span>
            </button>
          </div>
        </form>

        {/* Compact Speed-Dial / Launchpad Grid with Real Website Favicons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 pt-2">
          {shortcuts.map((item) => {
            const faviconUrl = getFaviconUrl(item.url);
            const domain = getDomainFromUrl(item.url);

            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-slate-900/35 hover:bg-slate-900/60 backdrop-blur-lg border border-white/10 hover:border-amber-400/50 rounded-2xl p-3 flex flex-col items-center justify-between text-center transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-950/30"
              >
                {/* Floating Quick Action Buttons on hover */}
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => copyUrl(item.id, item.url, e)}
                    className="p-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="نسخ الرابط"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>

                  <button
                    onClick={(e) => deleteShortcut(item.id, e)}
                    className="p-1 rounded-lg bg-slate-950/80 hover:bg-rose-900 text-slate-400 hover:text-rose-200 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Website Favicon Image */}
                <div className="w-12 h-12 rounded-2xl bg-white/10 p-2 border border-white/15 flex items-center justify-center my-1 group-hover:scale-110 transition-transform shadow-md">
                  <img
                    src={faviconUrl}
                    alt={item.title}
                    className="w-7 h-7 object-contain rounded-md"
                    onError={(e) => {
                      // Fallback if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Title & Domain */}
                <div className="w-full mt-1">
                  <span className="block text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                    {item.title}
                  </span>
                  <span
                    className="block text-[10px] text-slate-400/80 font-mono truncate"
                    dir="ltr"
                  >
                    {domain}
                  </span>
                </div>

                {/* Subtle launch hint */}
                <div className="mt-2 text-[10px] text-amber-300/80 opacity-0 group-hover:opacity-100 flex items-center gap-1 font-medium transition-opacity">
                  <span>فتح</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </div>
              </a>
            );
          })}

          {/* Quick Add Tile */}
          <button
            onClick={() => setShowAddModal(true)}
            className="border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all hover:bg-amber-500/10 group cursor-pointer min-h-[120px]"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-300 flex items-center justify-center transition-colors mb-2">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-300 group-hover:text-amber-300">
              أضف موقع
            </span>
          </button>
        </div>
      </div>

      {/* Add Shortcut Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-white/15 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 backdrop-blur-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-amber-400" />
              <span>إضافة موقع جديد (سيتم جلب الأيقونة تلقائياً)</span>
            </h3>

            <form onSubmit={handleAddShortcut} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  اسم الموقع أو الاختصار *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يوتيوب، منصة الجامعة، بنك المعرفة..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  رابط الموقع (URL) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono text-left"
                  dir="ltr"
                />
                {newUrl && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 p-2 rounded-xl border border-white/10">
                    <img
                      src={getFaviconUrl(newUrl)}
                      alt="favicon preview"
                      className="w-4 h-4 object-contain rounded"
                      onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                    />
                    <span>معاينة الأيقونة التلقائية للموقع</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25"
                >
                  حفظ الموقع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
