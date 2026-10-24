import http from 'http';
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser with 50mb limit for image payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Dedicated Zip file download endpoint for GitHub export
app.get(['/api/download-zip', '/siraj-app-source.zip', '/download-code'], (_req: Request, res: Response) => {
  const zipPath = path.resolve(__dirname, 'public', 'siraj-app-source.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="siraj-app-source.zip"');
    res.sendFile(zipPath);
  } else {
    res.status(404).json({ error: 'Archive not found' });
  }
});

// Initialize GoogleGenAI SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasKey: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString(),
  });
});

/**
 * Endpoint: POST /api/generate-image
 * Generates high-quality images using gemini-3-pro-image-preview
 * Supports imageSize: '1K' | '2K' | '4K' and customizable aspect ratio
 */
/**
 * Endpoint: POST /api/ai-plan
 * Free tier using gemini-3.8-flash for intelligent weekly planning and prayer schedule advice
 */
app.post('/api/ai-plan', async (req: Request, res: Response) => {
  try {
    const { prompt, currentTasks, completedPrayers } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'مفتاح Gemini API غير متوفر' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt || 'اقترح لي خطة أسبوعية متوازنة تجمع بين الإنتاجية والعبادة والراحة.',
      config: {
        systemInstruction:
          'أنت مستشار إنتاجي وإسلامي حكيم، تقدم اقتراحات عملية مختصرة وجداول أسبوعية ملهمة لتنظيم الوقت والمحافظة على الصلوات باللغة العربية بأسلوب راقٍ ومرتب بنقاط.',
      },
    });

    res.json({
      success: true,
      advice: response.text || 'بارك الله في وقتك وسدد خطاك.',
    });
  } catch (error: any) {
    console.error('Error generating AI plan:', error);
    res.status(500).json({ error: error?.message || 'تعذر الحصول على النصيحة الذكية' });
  }
});

/**
 * Endpoint: POST /api/generate-image
 * Generates images with gemini-3-pro-image-preview (requires paid key)
 */
app.post('/api/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, imageSize = '1K', aspectRatio = '1:1' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'الرجاء إدخال وصف للصورة' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(400).json({
        error: 'توليد الصور المتقدمة يتطلب ربط مفتاح API مدفوع في إعدادات التطبيق (Settings > Secrets).',
      });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize,
        },
      },
    });

    let imageUrl: string | null = null;
    let captionText = '';

    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          captionText += part.text;
        }
      }
    }

    if (!imageUrl) {
      res.status(500).json({
        error: 'لم تتوفر بيانات الصورة من النموذج.',
      });
      return;
    }

    res.json({
      success: true,
      imageUrl,
      caption: captionText,
      imageSize,
      aspectRatio,
    });
  } catch (error: any) {
    console.error('Error generating image:', error);
    res.status(500).json({
      error:
        error?.message?.includes('403') || error?.message?.includes('quota')
          ? 'تتطلب نماذج الصور فائقة الدقة تفعيل مفتاح API مدفوع في AI Studio.'
          : error?.message || 'حدث خطأ أثناء توليد الصورة',
    });
  }
});

/**
 * Endpoint: POST /api/animate-video
 * Animates photo into video using gemini-omni-1.1-flash via Interactions API (requires paid key)
 */
app.post('/api/animate-video', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/png', motionPrompt, aspectRatio = '16:9' } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'الرجاء توفير بيانات الصورة' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(400).json({
        error: 'تحريك الفيديو يتطلب ربط مفتاح API مدفوع في إعدادات التطبيق (Settings > Secrets).',
      });
      return;
    }

    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
    const validAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';
    const textPrompt =
      motionPrompt?.trim() ||
      'Smooth, gentle natural animation of this scene with cinematic camera motion and atmospheric ambient light.';

    const interaction = await ai.interactions.create(
      {
        model: 'gemini-omni-1.1-flash',
        input: [
          {
            type: 'image',
            mime_type: mimeType,
            data: cleanBase64,
          },
          {
            type: 'text',
            text: textPrompt,
          },
        ],
        background: false,
        store: false,
        stream: false,
        response_format: {
          type: 'video',
          aspect_ratio: validAspectRatio,
        },
      },
      { timeout: 300000 }
    );

    const videoPart = interaction.output_video;

    if (videoPart && videoPart.data) {
      const mime = videoPart.mime_type || 'video/mp4';
      res.json({
        success: true,
        videoUrl: `data:${mime};base64,${videoPart.data}`,
        aspectRatio: validAspectRatio,
      });
    } else if (videoPart && (videoPart as any).uri) {
      res.json({
        success: true,
        videoUrl: (videoPart as any).uri,
        aspectRatio: validAspectRatio,
      });
    } else {
      res.status(500).json({
        error: 'لم تتوفر بيانات الفيديو من النموذج.',
      });
    }
  } catch (error: any) {
    console.error('Error animating video:', error);
    res.status(500).json({
      error:
        error?.message?.includes('403') || error?.message?.includes('quota')
          ? 'يتطلب نموذج تحريك الفيديو (Omni Flash) تفعيل مفتاح API مدفوع.'
          : error?.message || 'حدث خطأ أثناء تحريك الصورة إلى فيديو.',
    });
  }
});

// Setup Vite in Dev or serve static in Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const server = http.createServer(app);

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: { server },
        hmr: { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
