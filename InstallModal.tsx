import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Monitor,
  CheckCircle2,
  X,
  ExternalLink,
  Laptop,
  Tablet,
  Share2,
  Sparkles,
  FileCode,
  ShieldCheck,
  Zap,
  Code2,
  Copy,
  Check,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isDesktop, install } = usePWAInstall();
  const [downloadedShortcut, setDownloadedShortcut] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk' | 'exe' | 'github'>('pwa');

  if (!isOpen) return null;

  // Generates and downloads a Windows desktop shortcut launcher (.bat file)
  // that launches the app in standalone app mode directly from Chrome or Edge
  const handleDownloadWindowsLauncher = () => {
    const currentUrl = window.location.href;
    const batContent = `@echo off
:: ============================================================
:: مشغل التطبيق الطبي والإنتاجي لسطح المكتب (Windows Desktop Launcher)
:: ============================================================
title مشغل تطبيق الطبيب المستقبلي والصلوات
echo جاري فتح التطبيق كنافذة سطح مكتب مستقلة...

:: البحث عن Chrome أو Edge لتشغيل التطبيق كنافذة مستقلة بدون شريط متصفح (مثل تطبيق EXE تماما)
set "APP_URL=${currentUrl}"

if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="%APP_URL%"
    exit
)

if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" --app="%APP_URL%"
    exit
)

if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%APP_URL%"
    exit
)

if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%APP_URL%"
    exit
)

start "" "%APP_URL%"
exit
`;

    const blob = new Blob([batContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Medical_Productivity_App.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadedShortcut(true);
    setTimeout(() => setDownloadedShortcut(false), 4000);
  };

  // Download Web App URL shortcut for Windows
  const handleDownloadUrlShortcut = () => {
    const currentUrl = window.location.href;
    const shortcutContent = `[InternetShortcut]\nURL=${currentUrl}\nIconIndex=0\nIconFile=${window.location.origin}/icon.svg\n`;
    const blob = new Blob([shortcutContent], { type: 'application/internet-shortcut' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Medical_Productivity_App.url';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-7 w-full max-w-2xl shadow-2xl relative overflow-hidden backdrop-blur-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>تثبيت وتشغيل التطبيق (APK & EXE & PWA)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  متوافق مع جميع الأجهزة
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                شغّل التطبيق كبرنامج أصلي على الكمبيوتر، التابلت، أو هاتف الأندرويد
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Alert if already installed */}
        {isInstalled && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>التطبيق مثبت ويعمل حالياً في وضع التطبيق المستقل (Standalone PWA).</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex items-center gap-2 mt-4 bg-slate-950/50 p-1.5 rounded-2xl border border-white/5 flex-shrink-0">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'pwa'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>التثبيت الفوري (PWA)</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'apk'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>للأندرويد والتابلت (APK)</span>
          </button>
          <button
            onClick={() => setActiveTab('exe')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'exe'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>للكمبيوتر (EXE)</span>
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'github'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>كود المشروع (GitHub)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          {/* TAB 1: Quick PWA 1-Click Install */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900/60 p-5 rounded-2xl border border-emerald-500/20 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      تثبيت فوري دون الحاجة لمتجر تطبيقات
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      هذا التطبيق مبني بأحدث معايير الـ PWA، مما يتيح لك تثبيته مباشرة على جهازك ليعمل كنافذة مستقلة بملء الشاشة، بدون شريط المتصفح وبدعم العمل دون إنترنت (Offline).
                    </p>
                  </div>
                </div>

                {/* Primary Action Button */}
                {isInstallable ? (
                  <button
                    onClick={async () => {
                      const success = await install();
                      if (success) onClose();
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    <span>تثبيت التطبيق على جهازك الآن بنقرة واحدة</span>
                  </button>
                ) : (
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-xs text-slate-300 space-y-2">
                    <p className="font-semibold text-emerald-400">💡 طريقة التثبيت من متصفحك مباشرة:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      <li>
                        <strong>على كمبيوتر (Chrome أو Edge):</strong> اضغط على أيقونة التثبيت <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white">⊕ تثبيت</span> في نهاية شريط العنوان (URL bar) بالأعلى، أو من القائمة (⋮) اختر <em>"تثبيت التطبيق"</em>.
                      </li>
                      <li>
                        <strong>على أندرويد وتابلت:</strong> من قائمة المتصفح (⋮) اضغط على <em>"إضافة إلى الشاشة الرئيسية"</em> أو <em>"تثبيت التطبيق"</em> ليتحول إلى تطبيق WebAPK أصلي.
                      </li>
                      <li>
                        <strong>على آيفون أو آيباد (Safari):</strong> اضغط زر <strong>مشاركة (Share)</strong> ثم اختر <strong>"إضافة إلى الصفحة الرئيسية (Add to Home Screen)"</strong>.
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Advantages grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 text-center space-y-1">
                  <Monitor className="w-5 h-5 text-emerald-400 mx-auto" />
                  <span className="text-xs font-bold text-white block">شاشة كاملة</span>
                  <span className="text-[10px] text-slate-400 block">بدون أي أشرطة متصفح مزعجة</span>
                </div>
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 text-center space-y-1">
                  <Zap className="w-5 h-5 text-amber-400 mx-auto" />
                  <span className="text-xs font-bold text-white block">سريع وخفيف</span>
                  <span className="text-[10px] text-slate-400 block">استهلاك منخفض جداً للذاكرة</span>
                </div>
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 text-center space-y-1">
                  <ShieldCheck className="w-5 h-5 text-teal-400 mx-auto" />
                  <span className="text-xs font-bold text-white block">حفظ تلقائي</span>
                  <span className="text-[10px] text-slate-400 block">بياناتك والصلوات محفوظة بجهازك</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Android & Tablet (APK) */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      تشغيل نسخة الأندرويد والتابلت (WebAPK / Native App)
                    </h4>
                    <p className="text-xs text-slate-400">
                      نظام أندرويد يقوم بإنشاء ملف APK حقيقي في هاتفك مباشرة عبر ميزة WebAPK
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-white/5">
                  <p className="font-bold text-emerald-400">خطوات تثبيت تطبيق الأندرويد على هاتفك أو التابلت:</p>
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                    <li>افتح رابط التطبيق داخل متصفح <strong>Google Chrome</strong> على تابلتك أو هاتفك.</li>
                    <li>اضغط على علامة القائمة (<strong>الثلاث نقاط ⋮</strong>) أعلى يمين أو يسار المتصفح.</li>
                    <li>اضغط على <strong>«تثبيت التطبيق» (Install App)</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.</li>
                    <li>
                      سيقوم نظام أندرويد فوراً بإنشاء <strong>حزمة APK رسمية</strong> وإضافتها مع باقي تطبيقاتك باسم <em>«إنتاجية وطب»</em> مع أيقونة السماعة الطبية ومصحف الصلاة.
                    </li>
                    <li>سيفتح التطبيق بملء شاشة التابلت بدون واجهة المتصفح، مع إمكانية استخدامه دون إنترنت.</li>
                  </ol>
                </div>

                <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-xs text-teal-300 flex items-center gap-2">
                  <Tablet className="w-4 h-4 flex-shrink-0" />
                  <span>
                    <strong>للتابلت:</strong> التطبيق مهيأ تلقائياً للتدوير والتمدد على كامل شاشة التابلت الأفقية والعمودية مع استغلال المساحة كاملة.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Desktop (Windows EXE) */}
          {activeTab === 'exe' && (
            <div className="space-y-4">
              <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      تشغيل نسخة الكمبيوتر المستقلة (Windows App / EXE)
                    </h4>
                    <p className="text-xs text-slate-400">
                      تشغيل التطبيق كنافذة سطح مكتب منفصلة كأي برنامج ويندوز رسمي
                    </p>
                  </div>
                </div>

                {/* Option 1: Quick Batch Launcher */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4" />
                      الخيار 1: مشغل سطح المكتب الفوري (ملف تشغيل للويندوز)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">.BAT Launcher</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    حمّل هذا المشغل وضعه على سطح مكتب جهازك؛ عند النقر عليه مرتين سيفتح التطبيق فوراً كنافذة ويندوز مستقلة بدون شريط المتصفح (Windowed App Mode).
                  </p>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      onClick={handleDownloadWindowsLauncher}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{downloadedShortcut ? '✓ تم التحميل بنجاح!' : 'تحميل مشغل سطح المكتب (.bat)'}</span>
                    </button>
                    <button
                      onClick={handleDownloadUrlShortcut}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
                    >
                      <span>تحميل اختصار سطح المكتب (.url)</span>
                    </button>
                  </div>
                </div>

                {/* Option 2: Browser Install as Desktop App */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-white/5 space-y-2 text-xs text-slate-300">
                  <p className="font-bold text-cyan-300">
                    الخيار 2: التثبيت المباشر كبرنامج ويندوز عبر Chrome أو Microsoft Edge:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed text-[11px]">
                    <li>في شريط عنوان المتصفح بالأعلى، انقر على أيقونة <strong>«تثبيت التطبيق» (Install app)</strong>.</li>
                    <li>أو اضغط (<strong>...</strong>) ثم <strong>التطبيقات (Apps)</strong> &larr; <strong>تثبيت هذا الموقع كتطبيق</strong>.</li>
                    <li>سيظهر لك التطبيق في قائمة ابدأ (Start Menu) وشريط المهام (Taskbar) تماماً كملف .EXE تنفيذي.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Download Source Code for GitHub */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-950/40 to-slate-900/60 p-5 rounded-2xl border border-purple-500/20 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-purple-400" />
                      تحميل كامل ملفات الأكواد لوضعها على GitHub
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      تم تجهيز حزمة مضغوطة (.ZIP) تحتوي على كل ملفات الكود المصدري للمشروع، جاهزة للرفع على حسابك في GitHub أو التشغيل محلياً على جهازك.
                    </p>
                  </div>
                </div>

                {/* Direct Download Button */}
                <a
                  href="/api/download-zip"
                  download="siraj-app-source.zip"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  <span>تحميل كود المشروع كاملاً الآن (siraj-app-source.zip)</span>
                </a>

                {/* Direct Link Box with Copy Button */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold text-purple-300">رابط التحميل المباشر:</span>
                    <button
                      onClick={() => {
                        const directUrl = `${window.location.origin}/api/download-zip`;
                        navigator.clipboard.writeText(directUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2500);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-purple-300 px-2 py-0.5 rounded cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? 'تم نسخ الرابط!' : 'نسخ الرابط'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 select-all break-all bg-black/40 p-2 rounded">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/download-zip` : '/api/download-zip'}
                  </div>
                </div>

                {/* Step by step GitHub instructions */}
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-white/10 space-y-2 text-xs text-slate-300">
                  <p className="font-bold text-emerald-400">خطوات رفع الكود على GitHub بكل سهولة:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                    <li>فك ضغط الملف <code className="bg-slate-800 text-purple-300 px-1 py-0.5 rounded">siraj-app-source.zip</code> على جهازك.</li>
                    <li>أنشئ مستودعاً جديداً (New Repository) فارغاً على موقع <strong>GitHub</strong>.</li>
                    <li>افتح موجه الأوامر (Terminal أو Git Bash) داخل مجلد المشروع، ونفذ الأوامر التالية:</li>
                  </ol>
                  <div className="bg-black/60 p-3 rounded-lg font-mono text-[11px] text-emerald-300 space-y-1 overflow-x-auto text-left" dir="ltr">
                    <div>git init</div>
                    <div>git add .</div>
                    <div>git commit -m "Initial commit of Siraj Productivity App"</div>
                    <div>git branch -M main</div>
                    <div>git remote add origin https://github.com/USERNAME/REPO_NAME.git</div>
                    <div>git push -u origin main</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-shrink-0 mt-2">
          <span className="text-[11px] text-slate-400">
            طُبّق بواسطة معايير الويب التقدمية PWA & WebAPK
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
