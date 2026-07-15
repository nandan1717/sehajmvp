import { NextResponse } from 'next/server';
import { getShopName } from '@/lib/shopify/client';

// In-memory fixed-window rate limiter for stylist chat (3 seconds cooldown per IP/user)
const chatRateLimitCache = new Map();

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of chatRateLimitCache.entries()) {
      if (now - timestamp > 30000) {
        chatRateLimitCache.delete(key);
      }
    }
  }, 30000);
}

function checkChatRateLimit(req, userId, windowSeconds = 3) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const identifier = (userId && userId !== 'guest') ? `chat_user_${userId}` : `chat_ip_${ip}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const lastRequestTime = chatRateLimitCache.get(identifier);
  if (lastRequestTime && (now - lastRequestTime) < windowMs) {
    const retryAfter = Math.ceil((lastRequestTime + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  chatRateLimitCache.set(identifier, now);
  return { allowed: true, retryAfter: 0 };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, chatHistory, productContext, userId } = body;

    const rateLimit = checkChatRateLimit(req, userId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: `Please wait ${rateLimit.retryAfter}s before sending another message.` },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      );
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'AI service unavailable.' },
        { status: 503 }
      );
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    // Build conversation context
    const shopName = await getShopName();
    const productInfo = productContext
      ? `Product: "${productContext.title}" | Color: ${productContext.selectedColor || 'As shown'} | Price: ${productContext.price ? '$' + productContext.price : 'Luxury Tier'}`
      : 'A luxury Indian garment';

    const systemPrompt = `You are ${shopName}'s Master Luxury Fashion Stylist — an expert in Indian couture, bridal wear, festive attire, and contemporary fusion fashion. You speak with warm authority and refined taste.

CONTEXT: The customer has just virtually tried on: ${productInfo}. They had a styling consultation and now want to continue the conversation.

YOUR ROLE:
- Answer questions about this garment: fabric care, styling, occasions, jewelry pairings, footwear, hair, makeup
- Offer personalized advice based on the customer's preferences
- Suggest complementary pieces from the collection
- Be knowledgeable about Indian textiles (silk, georgette, chiffon, velvet, organza), embroidery (zardozi, gota patti, chikankari, mirror work), and regional styles
- Keep responses concise (2-4 sentences max) and conversational
- Never mention you are an AI — you are the ${shopName} stylist`;

    // Build the messages for Gemini
    const contents = [];

    // Add system context as first user/model exchange
    contents.push({
      role: 'user',
      parts: [{ text: systemPrompt }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: 'Understood. I am ready to assist with personalized styling advice for this exquisite piece.' }]
    });

    // Add chat history
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const msg of chatHistory) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents
    });

    const responseText = typeof response?.text === 'function'
      ? response.text()
      : (response?.text || '');

    return NextResponse.json({
      success: true,
      reply: responseText || 'I appreciate your question. Could you share more details so I can offer the best styling advice?'
    });

  } catch (error) {
    console.error('Stylist Chat API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Chat service unavailable.' },
      { status: 500 }
    );
  }
}
