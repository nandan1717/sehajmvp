import { NextResponse } from 'next/server';
import { getShopName } from '@/lib/shopify/client';

// Helper to extract base64 data and mime type from a data URL
function parseBase64(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return {
      mimeType: matches[1],
      data: matches[2]
    };
  }
  return null;
}

// Helper to fetch remote URLs as base64 for Gemini vision analysis
async function fetchImageAsBase64(urlOrBase64) {
  if (!urlOrBase64 || typeof urlOrBase64 !== 'string') return null;
  const parsed = parseBase64(urlOrBase64);
  if (parsed) return parsed;

  if (urlOrBase64.startsWith('http://') || urlOrBase64.startsWith('https://')) {
    try {
      const parsedUrl = new URL(urlOrBase64);
      // SSRF Protection: Block localhost, private IP ranges, and cloud metadata
      const hostname = parsedUrl.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('169.254.') ||
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
      ) {
        console.warn('SSRF protection triggered: blocked fetch to internal host:', hostname);
        return null;
      }

      const res = await fetch(urlOrBase64);
      if (!res.ok) return null;
      const contentType = res.headers.get('content-type') || 'image/jpeg';
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return {
        mimeType: contentType.split(';')[0],
        data: buffer.toString('base64')
      };
    } catch (e) {
      console.warn('Failed to fetch remote image:', e.message);
      return null;
    }
  }
  return null;
}

// Retry helper with exponential backoff
async function callWithRetry(fn, retries = 2, delay = 2000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRateLimit = err.status === 429 || (err.message && (
        err.message.includes('429') ||
        err.message.includes('RESOURCE_EXHAUSTED') ||
        err.message.includes('quota')
      ));
      if (isRateLimit && attempt < retries) {
        console.warn(`Rate limit hit. Waiting ${delay / 1000}s before retry ${attempt + 1}/${retries}...`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2;
      } else {
        throw err;
      }
    }
  }
}

// In-memory fixed-window store (simulates Redis fixed-window / token bucket)
const rateLimitCache = new Map();

// Periodic cleanup of old keys (> 30s)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of rateLimitCache.entries()) {
      if (now - timestamp > 30000) {
        rateLimitCache.delete(key);
      }
    }
  }, 30000);
}

// Fixed-Window Rate Limiting Wrapper (1 request per 15 seconds)
async function checkRateLimit(userId, reqHeaderIp, windowSeconds = 15) {
  const identifier = (userId && userId !== 'guest') ? `user_${userId}` : `ip_${reqHeaderIp || 'anonymous'}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // 1. Check in-memory fixed window
  const lastRequestTime = rateLimitCache.get(identifier);
  if (lastRequestTime && (now - lastRequestTime) < windowMs) {
    const retryAfter = Math.ceil((lastRequestTime + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // 2. Distributed check via Supabase tryon_looks if configured and registered user
  if (userId && userId !== 'guest') {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data, error } = await supabase
          .from('tryon_looks')
          .select('created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          const lastCreated = new Date(data[0].created_at).getTime();
          if (!isNaN(lastCreated) && (now - lastCreated) < windowMs) {
            const retryAfter = Math.ceil((lastCreated + windowMs - now) / 1000);
            rateLimitCache.set(identifier, lastCreated);
            return { allowed: false, retryAfter };
          }
        }
      } catch (err) {
        console.warn('Supabase rate check skipped, using memory store:', err.message);
      }
    }
  }

  // Record current request timestamp
  rateLimitCache.set(identifier, now);
  return { allowed: true };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { userPhoto, productTitle, productImage, color, price, userId } = body;
    const shopName = await getShopName();

    if (!userPhoto || !productImage) {
      return NextResponse.json(
        { success: false, error: 'Both user photo and product image are required.' },
        { status: 400 }
      );
    }

    // Enforce 1 request per 15 seconds rate limit wrapper
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'guest';
    const rateLimitResult = await checkRateLimit(userId, clientIp, 15);
    if (!rateLimitResult.allowed) {
      const retryAfter = rateLimitResult.retryAfter || 15;
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit exceeded. Please wait ${retryAfter} second${retryAfter !== 1 ? 's' : ''} before generating another look.`,
          rateLimited: true,
          retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter)
          }
        }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    let tryonImageDataUrl = null;
    let stylistNotes = '';
    let fitAnalysis = '';
    let colorScore = '98%';
    let stylingAdvice = '';
    let isLiveGemini = false;

    // Fetch both images as base64 for Gemini
    const [parsedUserPhoto, parsedProductImage] = await Promise.all([
      fetchImageAsBase64(userPhoto),
      fetchImageAsBase64(productImage)
    ]);

    if (apiKey && parsedUserPhoto && parsedProductImage) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });

        // ─── STEP 1: Generate the Virtual Try-On Image ───
        // Use gemini-2.5-flash-image with responseModalities for actual image output
        try {
          const imageResponse = await callWithRetry(async () => {
            return await ai.models.generateContent({
              model: 'gemini-3.1-flash-image',
              contents: [{
                role: 'user',
                parts: [
                  {
                    text: `You are a professional virtual garment try-on system. You will receive exactly TWO images:

IMAGE 1 (PERSON): A photo of a real person — the customer.
IMAGE 2 (GARMENT): The EXACT product garment: "${productTitle}".

CRITICAL INSTRUCTIONS — follow every rule precisely:

1. GARMENT FIDELITY IS THE #1 PRIORITY: The garment in the output MUST be a pixel-faithful reproduction of IMAGE 2. Preserve the EXACT:
   - Color and color tones (do NOT shift, brighten, darken, or reinterpret the color)
   - Pattern, print, and embroidery details exactly as shown
   - Fabric texture and sheen
   - Neckline, sleeve style, hemline, and silhouette
   - All embellishments, borders, lace, zari work, and decorative elements

2. PERSON FIDELITY: Keep the person from IMAGE 1 exactly as they are:
   - Same face, expression, skin tone, hair
   - Same body proportions and pose
   - Same background setting

3. COMPOSITION: Dress the person from IMAGE 1 in the garment from IMAGE 2 as if they are wearing it in a natural fashion photo. The garment should drape realistically on their body.

4. DO NOT: Invent new colors, change the shade or hue of the garment, add patterns that don't exist in IMAGE 2, or simplify any details. The customer must see THEIR EXACT product on themselves.

Generate the image now.`
                  },
                  {
                    inlineData: {
                      mimeType: parsedUserPhoto.mimeType,
                      data: parsedUserPhoto.data
                    }
                  },
                  {
                    inlineData: {
                      mimeType: parsedProductImage.mimeType,
                      data: parsedProductImage.data
                    }
                  }
                ]
              }],
              config: {
                responseModalities: ['TEXT', 'IMAGE']
              }
            });
          });

          // Extract the generated image from the response
          if (imageResponse && imageResponse.candidates && imageResponse.candidates[0]) {
            const parts = imageResponse.candidates[0].content?.parts || [];
            for (const part of parts) {
              if (part.inlineData && part.inlineData.data) {
                const mime = part.inlineData.mimeType || 'image/png';
                tryonImageDataUrl = `data:${mime};base64,${part.inlineData.data}`;
                isLiveGemini = true;
                break;
              }
            }
          }
        } catch (imgErr) {
          console.warn('Gemini image generation failed, will use product image as fallback:', imgErr.message);
        }

        // ─── STEP 2: Generate Styling Consultation (text-only, lightweight) ───
        try {
          const textParts = [
            {
              text: `You are ${shopName}'s Master Luxury Fashion Stylist.
We have provided TWO images:
1. The first image is our client's reference photo.
2. The second image is our luxury Indian garment: "${productTitle}" (Color: ${color || 'Royal Gold'}, Price: ${price ? '$' + price : 'Luxury Tier'}).

Analyze BOTH images to provide a bespoke styling consultation in JSON format:
1. "stylistNotes": How this garment's silhouette, color palette, and embroidery elevates this client's complexion and stature. (2 sentences max)
2. "fitAnalysis": Technical draping notes on shoulder alignment, dupatta placement, and fabric flow for their proportions. (2 sentences max)
3. "stylingAdvice": Specific jewelry, hair styling, and footwear recommendations tailored to harmonize with both the dress and the client's features. (2 sentences max)
4. "colorScore": A percentage string (e.g. "98%", "96%") rating the harmony between the garment color and client's skin tone.

Respond ONLY with valid JSON containing keys: "stylistNotes", "fitAnalysis", "stylingAdvice", "colorScore".`
            },
            {
              inlineData: {
                mimeType: parsedUserPhoto.mimeType,
                data: parsedUserPhoto.data
              }
            },
            {
              inlineData: {
                mimeType: parsedProductImage.mimeType,
                data: parsedProductImage.data
              }
            }
          ];

          const textResponse = await callWithRetry(async () => {
            return await ai.models.generateContent({
              model: 'gemini-3.1-flash-lite',
              contents: [{ role: 'user', parts: textParts }],
              config: {
                responseMimeType: 'application/json'
              }
            });
          });

          const responseText = typeof textResponse?.text === 'function' ? textResponse.text() : (textResponse?.text || '');
          if (responseText) {
            try {
              const cleanJson = responseText.replace(/```json|```/g, '').trim();
              const parsed = JSON.parse(cleanJson);
              stylistNotes = parsed.stylistNotes || '';
              fitAnalysis = parsed.fitAnalysis || '';
              stylingAdvice = parsed.stylingAdvice || '';
              if (parsed.colorScore) colorScore = parsed.colorScore;
            } catch (e) {
              stylistNotes = responseText.slice(0, 200);
            }
          }
        } catch (textErr) {
          console.warn('Gemini text consultation failed, using simulation:', textErr.message);
        }

      } catch (geminiErr) {
        console.warn('Gemini API initialization failed:', geminiErr.message);
      }
    }

    // ─── Fallback: If image generation failed, use the product image ───
    if (!tryonImageDataUrl) {
      tryonImageDataUrl = productImage;
    }

    // ─── Fallback: If text consultation failed, use simulation ───
    if (!stylistNotes) {
      stylistNotes = `The regal silhouette of ${productTitle} creates an exquisite contrast with your natural complexion. The zardozi border work and silk weave drape harmoniously across your frame, radiating timeless elegance.`;
      fitAnalysis = `Custom AI proportion mapping indicates a flawless shoulder-to-waist fall. The dupatta is styled with an asymmetrical royal drape to highlight the intricate zari border.`;
      stylingAdvice = `Pair with antique gold jhumkas or handcrafted Kundan polki earrings. Complete the ensemble with embellished ivory or gold juttis for an unforgettable statement.`;
    }

    return NextResponse.json({
      success: true,
      result: {
        tryonImageUrl: tryonImageDataUrl,
        photoUsedUrl: userPhoto,
        stylistNotes,
        fitAnalysis,
        stylingAdvice,
        colorScore,
        isLiveGemini,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Try-On API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process virtual try-on.' },
      { status: 500 }
    );
  }
}
