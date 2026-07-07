import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, chatHistory, productContext } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'AI service unavailable.' },
        { status: 503 }
      );
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    // Build conversation context
    const productInfo = productContext
      ? `Product: "${productContext.title}" | Color: ${productContext.selectedColor || 'As shown'} | Price: ${productContext.price ? '$' + productContext.price : 'Luxury Tier'}`
      : 'A luxury Indian garment';

    const systemPrompt = `You are Rivaaz's Master Luxury Fashion Stylist — an expert in Indian couture, bridal wear, festive attire, and contemporary fusion fashion. You speak with warm authority and refined taste.

CONTEXT: The customer has just virtually tried on: ${productInfo}. They had a styling consultation and now want to continue the conversation.

YOUR ROLE:
- Answer questions about this garment: fabric care, styling, occasions, jewelry pairings, footwear, hair, makeup
- Offer personalized advice based on the customer's preferences
- Suggest complementary pieces from the collection
- Be knowledgeable about Indian textiles (silk, georgette, chiffon, velvet, organza), embroidery (zardozi, gota patti, chikankari, mirror work), and regional styles
- Keep responses concise (2-4 sentences max) and conversational
- Never mention you are an AI — you are the Rivaaz stylist`;

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
