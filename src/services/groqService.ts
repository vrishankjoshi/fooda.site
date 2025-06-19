import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface ChatMessage {
  type: 'user' | 'bot';
  message: string;
}

export const sendMessageToGroq = async (
  messages: ChatMessage[],
  userMessage: string
): Promise<string> => {
  try {
    // Check for Vish Score question
    if (userMessage.toLowerCase().includes('vish score') || userMessage.toLowerCase().includes('vishscore')) {
      return `🌟 **Vish Score** is our revolutionary new feature that provides comprehensive scoring not just for nutrition, but for taste quality as well!

Here's what makes Vish Score special:

🎯 **Dual Analysis System:**
• Nutrition scoring (health impact, vitamins, minerals, additives)
• Taste scoring (flavor profile, sensory analysis, consumer preference data)

📊 **How it works:**
1. Send your nutrition label photo to **Vrishankjo@gmail.com**
2. Our advanced AI analyzes both nutritional content AND taste characteristics
3. Get a comprehensive Vish Score report in 1-20 minutes

✨ **What you get:**
• Overall Vish Score (combines nutrition + taste)
• Detailed breakdown of both health and taste metrics
• Personalized recommendations based on your health conditions
• Taste profile mapping and flavor characteristics

This innovative scoring system helps you make informed decisions about food that tastes great AND supports your health goals. It's the perfect balance of wellness and enjoyment!

Want to try it? Just send a clear photo of any nutrition label to our email and experience the Vish Score difference! 🚀`;
    }

    // Convert our chat format to Groq's format
    const groqMessages = [
      {
        role: 'system' as const,
        content: `You are a helpful AI assistant for FoodCheck, a food analysis service. You help users understand:
        - Food nutrition analysis and health impacts
        - How our food analysis process works
        - Nutritional information and dietary advice
        - Health conditions and food recommendations
        - Our service that analyzes packaged food for nutrition, taste, and health impact
        - The Vish Score feature that combines nutrition and taste analysis
        
        Key information about FoodCheck:
        - We analyze nutrition labels sent via email to Vrishankjo@gmail.com
        - Analysis takes 1-20 minutes
        - We provide personalized health warnings (e.g., diabetes warnings)
        - We're a non-profit helping people make better food choices
        - We analyze nutrition, taste, and health impact of packaged foods
        - Vish Score is our new feature that scores both nutrition AND taste quality
        
        Special responses:
        - If asked about "Vish Score" or "VishScore", explain it's our new feature that provides comprehensive scoring for both nutrition and taste quality. Users send nutrition labels to our email for analysis.
        
        Be helpful, informative, and focus on food-related topics. Keep responses concise but informative.`
      },
      ...messages.map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.message
      })),
      {
        role: 'user' as const,
        content: userMessage
      }
    ];

    const completion = await groq.chat.completions.create({
      messages: groqMessages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || 'Sorry, I encountered an error. Please try again.';
  } catch (error) {
    console.error('Groq API Error:', error);
    return 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or feel free to email us directly at Vrishankjo@gmail.com for food analysis.';
  }
};