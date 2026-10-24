import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Film,
  Upload,
  Download,
  AlertCircle,
  Loader2,
  Wand2,
  Palette,
  Bot,
  Info,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AIStudioTabProps {
  onSetCustomWallpaper?: (url: string) => void;
}

export const AIStudioTab: React.FC<AIStudioTabProps> = () => {
  const [activeSubTab, setActiveSubTab] = useState<'image' | 'video' | 'planner' | 'islamic_canvas'>('image');

  // --- Image Generation State (gemini-3-pro-image-preview) ---
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [imageAspectRatio, setImageAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // --- Video Animation State (gemini-omni-1.1-flash via Interactions API) ---
  const [videoSourceImage, setVideoSourceImage] = useState<string | null>(null);
  const [videoMimeType, setVideoMimeType] = useState('image/png');
  const [motionPrompt, setMotionPrompt] = useState('');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // --- Free Tier AI Smart Planner (gemini-3.8-flash) ---
  const [plannerGoal, setPlannerGoal] = useState('ساعدني في تنظيم وقتي بين العمل والعبادة وقراءة القرآن هذا الأسبوع.');
  const [plannerAdvice, setPlannerAdvice] = useState<string | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);

  // --- Interactive Canvas Wallpaper Generator (Client-Side, zero cost) ---
  const [canvasDhikr, setCanvasDhikr] = useState('سُبْحَانَ اللَّهِ وَبِحَمْدِهِ');
  const [canvasTheme, setCanvasTheme] = useState<'emerald' | 'gold' | 'night' | 'rose'>('emerald');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Presets
  const imagePresets = [
    {
      title: 'محراب إسلامي فخم',
      prompt: 'A majestic mosque interior with intricate Islamic arabesque patterns, warm golden morning light streaming through arched windows, photorealistic, 8k resolution, cinematic lighting.',
    },
    {
      title: 'مكتب تركيز هادئ مع مصحف',
      prompt: 'A minimalist wooden study desk in soft dawn light, an open holy Quran with elegant calligraphy, a steaming cup of tea, peaceful atmosphere, photorealistic depth of field.',
    },
    {
      title: 'خط عربي كوفي ذهبي',
      prompt: 'Luxurious 3D golden Islamic calligraphy sculpture floating over smooth dark obsidian marble, soft ambient golden reflections, modern Islamic art, high detail.',
    },
    {
      title: 'سماء ليلية مع هلال ونجوم',
      prompt: 'A serene night sky with a luminous crescent moon and bright stars over an ancient desert oasis, tranquil aesthetic, cinematic color grading.',
    },
  ];

  const motionPresets = [
    {
      title: 'نسيم هادئ وأضواء متحركة',
      prompt: 'Gentle ambient breeze with subtle movement, dust motes dancing in sunbeams, soft cinematic atmosphere.',
    },
    {
      title: 'حركة غيوم وشروق الشمس',
      prompt: 'Time-lapse movement of soft clouds, warm golden morning sunlight gradually sweeping across the architecture.',
    },
    {
      title: 'تقريب كاميرا سينمائي بطيء',
      prompt: 'Slow, graceful cinematic push-in camera motion with gentle subtle parallax depth.',
    },
  ];

  // Render Client-Side Islamic Card Canvas
  const drawIslamicCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1200;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const grad = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, 700);
    if (canvasTheme === 'emerald') {
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(0.6, '#022c22');
      grad.addColorStop(1, '#021a14');
    } else if (canvasTheme === 'gold') {
      grad.addColorStop(0, '#451a03');
      grad.addColorStop(0.6, '#1e1b4b');
      grad.addColorStop(1, '#09090b');
    } else if (canvasTheme === 'night') {
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.7, '#0f172a');
      grad.addColorStop(1, '#020617');
    } else {
      grad.addColorStop(0, '#4c0519');
      grad.addColorStop(0.7, '#1c1917');
      grad.addColorStop(1, '#0c0a09');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative Islamic Geometric Stars
    ctx.strokeStyle = canvasTheme === 'gold' ? 'rgba(234, 179, 8, 0.25)' : 'rgba(52, 211, 153, 0.2)';
    ctx.lineWidth = 2.5;

    const cx = width / 2;
    const cy = height / 2;

    // Concentric geometric circles & 8-point stars
    for (let r = 240; r <= 460; r += 110) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // 8-point star
      ctx.save();
      ctx.translate(cx, cy);
      for (let i = 0; i < 8; i++) {
        ctx.rotate((Math.PI * 2) / 8);
        ctx.strokeRect(-r / 1.6, -r / 1.6, (r * 2) / 1.6, (r * 2) / 1.6);
      }
      ctx.restore();
    }

    // Calligraphy / Text in center
    ctx.fillStyle = canvasTheme === 'gold' ? '#fde047' : '#6ee7b7';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 54px Amiri, serif';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 15;
    ctx.fillText(canvasDhikr, cx, cy - 20);

    // Decorative subtitle
    ctx.font = '28px Cairo, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('سِــرَاج • بطاقة ذكرى وتدبر', cx, cy + 70);

    // Border
    ctx.strokeStyle = canvasTheme === 'gold' ? '#ca8a04' : '#10b981';
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.strokeStyle = canvasTheme === 'gold' ? '#facc15' : '#34d399';
    ctx.lineWidth = 2;
    ctx.strokeRect(44, 44, width - 88, height - 88);
  };

  useEffect(() => {
    drawIslamicCanvas();
  }, [canvasDhikr, canvasTheme]);

  // Handle Image Generation
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;

    setIsGeneratingImage(true);
    setImageError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          imageSize,
          aspectRatio: imageAspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في توليد الصورة');
      }

      setGeneratedImageUrl(data.imageUrl);
      confetti({ particleCount: 40, spread: 60 });
    } catch (err: any) {
      console.error('Image generation error:', err);
      setImageError(err.message || 'حدث خطأ أثناء الاتصال بنموذج الصور.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Handle Video Animation
  const handleAnimateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoSourceImage) {
      setVideoError('الرجاء رفع صورة أولاً لتحريكها');
      return;
    }

    setIsGeneratingVideo(true);
    setVideoError(null);

    try {
      const response = await fetch('/api/animate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: videoSourceImage,
          mimeType: videoMimeType,
          motionPrompt: motionPrompt || undefined,
          aspectRatio: videoAspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في تحريك الصورة');
      }

      setGeneratedVideoUrl(data.videoUrl);
      confetti({ particleCount: 60, spread: 70 });
    } catch (err: any) {
      console.error('Video generation error:', err);
      setVideoError(err.message || 'حدث خطأ أثناء تحريك الفيديو.');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Handle AI Planner Advice (gemini-3.8-flash, free tier)
  const handleGetPlannerAdvice = async () => {
    setIsPlanning(true);
    try {
      const res = await fetch('/api/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: plannerGoal }),
      });
      const data = await res.json();
      if (data.advice) {
        setPlannerAdvice(data.advice);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPlanning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setVideoSourceImage(reader.result as string);
      setVideoError(null);
    };
    reader.readAsDataURL(file);
  };

  const downloadCanvasImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `siraj-card-${canvasTheme}.png`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Studio Header Card */}
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-950 p-6 rounded-3xl border border-purple-900/40 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>استوديو الذكاء الاصطناعي والإبداع</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              توليد الصور وتحريك الفيديو ومستشار التخطيط
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
              اختر بين توليد الصور الفائقة بدقة <strong className="text-purple-300">1K, 2K, 4K</strong>، تحريك الصور إلى فيديو بنسبة <strong className="text-pink-300">16:9 أو 9:16</strong>، مستشار التخطيط الذكي، أو تصميم بطاقات إسلامية عالية الدقة.
            </p>
          </div>

          {/* Subtabs switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner flex-wrap">
            <button
              onClick={() => setActiveSubTab('image')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'image'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>صور (1K/2K/4K)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('video')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'video'
                  ? 'bg-pink-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>فيديو (16:9 / 9:16)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('islamic_canvas')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'islamic_canvas'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>بطاقات إسلامية</span>
            </button>

            <button
              onClick={() => setActiveSubTab('planner')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'planner'
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>مستشار التخطيط</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: Image Generation */}
      {activeSubTab === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-900/80 rounded-3xl border border-slate-800 p-6 space-y-5 backdrop-blur-sm">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-purple-400" />
              <span>توليد الصور بنموذج gemini-3-pro-image-preview</span>
            </h3>

            {/* Presets */}
            <div>
              <span className="text-xs text-slate-400 mb-1.5 block">اقتراحات سريعة جاهزة:</span>
              <div className="grid grid-cols-2 gap-2">
                {imagePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImagePrompt(preset.prompt)}
                    className="p-2.5 rounded-xl text-right text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
                  >
                    <span className="font-semibold block text-purple-300">{preset.title}</span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">{preset.prompt}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGenerateImage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  وصف الصورة المطلوبة (Prompt) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="اكتب وصفاً للصورة المطلوبة بالإنجليزية أو العربية..."
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Resolution Affordance: 1K, 2K, 4K */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  دقة وحجم الصورة (Image Size Affordance)
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['1K', '2K', '4K'] as const).map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setImageSize(size)}
                      className={`py-2.5 px-3 rounded-xl text-center border font-mono transition-all ${
                        imageSize === size
                          ? 'bg-purple-600 text-white font-bold border-purple-400 ring-2 ring-purple-400/40 shadow-lg'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="text-sm block">{size}</span>
                      <span className="text-[10px] opacity-75">
                        {size === '1K' ? '1024px' : size === '2K' ? '2048px' : '4096px'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  نسبة الأبعاد (Aspect Ratio)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['1:1', '16:9', '9:16', '4:3'] as const).map((ar) => (
                    <button
                      type="button"
                      key={ar}
                      onClick={() => setImageAspectRatio(ar)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        imageAspectRatio === ar
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                          : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>

              {imageError && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info className="w-4 h-4 text-amber-400" />
                    <span>ملاحظة الحساب:</span>
                  </div>
                  <p>{imageError}</p>
                  <p className="text-[11px] text-slate-400">
                    يمكنك أيضاً تجربة تبويب «بطاقات إسلامية» لتوليد خلفيات فائقة الجودة مباشرة بدون مفتاح مدفوع!
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isGeneratingImage || !imagePrompt.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ توليد الصورة بدقة {imageSize}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>توليد الصورة بدقة {imageSize}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 bg-slate-900/80 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between backdrop-blur-sm min-h-[420px]">
            <div>
              <h3 className="text-sm font-bold text-white mb-3">معاينة الصورة الناتجة</h3>
              <div className="w-full aspect-square rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden relative">
                {isGeneratingImage ? (
                  <div className="text-center p-6 space-y-3">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                    <p className="text-xs text-slate-300 font-medium">جارٍ معالجة الصورة...</p>
                  </div>
                ) : generatedImageUrl ? (
                  <img src={generatedImageUrl} alt="Generated" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6 text-slate-600">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">ستظهر صورتك المولدة هنا</p>
                  </div>
                )}
              </div>
            </div>

            {generatedImageUrl && (
              <a
                href={generatedImageUrl}
                download="siraj-ai-art.png"
                className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>تحميل الصورة</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: Animate Image into Video */}
      {activeSubTab === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-900/80 rounded-3xl border border-slate-800 p-6 space-y-5 backdrop-blur-sm">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-pink-400" />
              <span>تحريك الصورة إلى فيديو (gemini-omni-1.1-flash via Interactions API)</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                الصورة المراد تحريكها *
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  videoSourceImage
                    ? 'border-pink-500/50 bg-pink-950/10'
                    : 'border-slate-700 hover:border-pink-500/40 bg-slate-950/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {videoSourceImage ? (
                  <div className="flex items-center justify-center gap-4">
                    <img
                      src={videoSourceImage}
                      alt="Selected"
                      className="w-16 h-16 object-cover rounded-xl border border-pink-500/40"
                    />
                    <div className="text-right">
                      <p className="text-xs font-bold text-pink-300">تم اختيار الصورة</p>
                      <p className="text-[10px] text-slate-400">انقر لتغييرها</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-pink-400 mx-auto opacity-70" />
                    <p className="text-xs font-medium text-slate-200">انقر لرفع صورة من جهازك</p>
                  </div>
                )}
              </div>
            </div>

            {/* Presets */}
            <div>
              <span className="text-xs text-slate-400 mb-1.5 block">اقتراحات حركة:</span>
              <div className="grid grid-cols-3 gap-2">
                {motionPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMotionPrompt(preset.prompt)}
                    className="p-2 rounded-xl text-right text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    <span className="font-semibold block text-pink-300 text-[11px]">{preset.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAnimateVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  وصف الحركة السينمائية (Motion Prompt)
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: حركة نسيم هادئ وأضواء متحركة..."
                  value={motionPrompt}
                  onChange={(e) => setMotionPrompt(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Video Aspect Ratio: 16:9 or 9:16 */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  نسبة أبعاد الفيديو (Aspect Ratio)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('16:9')}
                    className={`py-3 px-3 rounded-xl border text-center transition-all ${
                      videoAspectRatio === '16:9'
                        ? 'bg-pink-600 text-white font-bold border-pink-400 ring-2 ring-pink-400/40 shadow-lg'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <span className="text-sm block">16:9 شاشة عريضة</span>
                    <span className="text-[10px] opacity-75">أفقي (Landscape)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('9:16')}
                    className={`py-3 px-3 rounded-xl border text-center transition-all ${
                      videoAspectRatio === '9:16'
                        ? 'bg-pink-600 text-white font-bold border-pink-400 ring-2 ring-pink-400/40 shadow-lg'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <span className="text-sm block">9:16 طولي</span>
                    <span className="text-[10px] opacity-75">رأسي للجوال والقصص (Portrait)</span>
                  </button>
                </div>
              </div>

              {videoError && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info className="w-4 h-4 text-amber-400" />
                    <span>ملاحظة:</span>
                  </div>
                  <p>{videoError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isGeneratingVideo || !videoSourceImage}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-xl shadow-pink-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingVideo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ معالجة الفيديو بنموذج Omni Flash...</span>
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4" />
                    <span>تحريك الصورة إلى فيديو ({videoAspectRatio})</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 bg-slate-900/80 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between backdrop-blur-sm min-h-[420px]">
            <div>
              <h3 className="text-sm font-bold text-white mb-3">مشغل الفيديو</h3>
              <div
                className={`w-full rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden relative ${
                  videoAspectRatio === '9:16' ? 'aspect-[9/16] max-h-[440px] mx-auto' : 'aspect-video'
                }`}
              >
                {isGeneratingVideo ? (
                  <div className="text-center p-6 space-y-3">
                    <Loader2 className="w-8 h-8 text-pink-400 animate-spin mx-auto" />
                    <p className="text-xs text-slate-300 font-medium">جارٍ تحريك الإطارات...</p>
                  </div>
                ) : generatedVideoUrl ? (
                  <video
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-600">
                    <Film className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">سيظهر الفيديو هنا عند اكتماله</p>
                  </div>
                )}
              </div>
            </div>

            {generatedVideoUrl && (
              <a
                href={generatedVideoUrl}
                download="siraj-video.mp4"
                className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>تحميل الفيديو</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: Islamic Geometric Card Generator (Free, client-side, exportable) */}
      {activeSubTab === 'islamic_canvas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900/80 rounded-3xl border border-slate-800 p-6 space-y-5 backdrop-blur-sm">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-400" />
              <span>مصمم البطاقات والزخارف الهندسية الإسلامية</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                الذكر أو الآية الكريمة:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
                  'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
                  'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
                  'رَبِّ اشْرَحْ لِي صَدْرِي',
                  'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
                ].map((dhikr) => (
                  <button
                    key={dhikr}
                    onClick={() => setCanvasDhikr(dhikr)}
                    className={`p-2.5 rounded-xl text-right text-xs font-amiri font-bold border transition-all ${
                      canvasDhikr === dhikr
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:text-white'
                    }`}
                  >
                    {dhikr}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                النمط اللوني والخلفية:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['emerald', 'gold', 'night', 'rose'] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setCanvasTheme(theme)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                      canvasTheme === theme
                        ? 'bg-emerald-600 text-white font-bold border-emerald-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {theme === 'emerald' ? 'زمردي' : theme === 'gold' ? 'ذهبي' : theme === 'night' ? 'ليلي' : 'عنابي'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={downloadCanvasImage}
              className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              <span>تحميل البطاقة بدقة عالية (1200x1200px)</span>
            </button>
          </div>

          <div className="lg:col-span-6 bg-slate-900/80 rounded-3xl border border-slate-800 p-6 flex flex-col items-center justify-center">
            <canvas
              ref={canvasRef}
              className="w-full max-w-[380px] aspect-square rounded-2xl shadow-2xl border border-slate-700/60"
            />
          </div>
        </div>
      )}

      {/* SUBTAB 4: AI Smart Planner (gemini-3.8-flash, free tier) */}
      {activeSubTab === 'planner' && (
        <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 space-y-5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                مستشار التخطيط الأسبوعي الذكي (gemini-3.8-flash)
              </h3>
              <p className="text-xs text-slate-400">
                استشر الذكاء الاصطناعي لوضع خطة أسبوعية متوازنة وتوزيع الصلوات والمهام
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <textarea
              rows={3}
              value={plannerGoal}
              onChange={(e) => setPlannerGoal(e.target.value)}
              placeholder="اكتب هدفك أو ما تريد إنجازه هذا الأسبوع..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />

            <button
              onClick={handleGetPlannerAdvice}
              disabled={isPlanning || !plannerGoal.trim()}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isPlanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ التفكير وصياغة الخطة...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>اطلب خطة أسبوعية مقترحة</span>
                </>
              )}
            </button>
          </div>

          {plannerAdvice && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-teal-900/40 space-y-2">
              <div className="flex items-center gap-1.5 text-teal-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>الخطة المقترحة:</span>
              </div>
              <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                {plannerAdvice}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
