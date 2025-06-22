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
      return `🌟 **Vish Score** is our revolutionary comprehensive scoring system that evaluates food across THREE key dimensions:

**🎯 The Three Pillars of Vish Score:**

**1. 📊 Nutrition Analysis (33.3%)**
• Complete macro and micronutrient breakdown
• Health impact assessment with personalized warnings
• Vitamin and mineral content evaluation
• Additive and preservative analysis

**2. 🍽️ Taste Evaluation (33.3%)**
• Advanced flavor profiling and sensory analysis
• Texture and mouthfeel assessment
• Ingredient quality impact on taste
• Culinary science-based scoring

**3. 👥 Consumer Ratings (33.3%)**
• Real user feedback and satisfaction scores
• Crowd-sourced taste and quality reviews
• Purchase intent and repeat buying patterns
• Value-for-money consumer perception

**✨ How it works:**
1. Send your nutrition label photo to **Vrishankjo@gmail.com**
2. Our AI analyzes all three dimensions simultaneously
3. Get a comprehensive Vish Score report in 1-20 minutes
4. Receive personalized recommendations based on your health profile

**🎯 Final Vish Score = (Nutrition + Taste + Consumer) ÷ 3**

This revolutionary approach ensures you get foods that are not only healthy but also taste great AND have proven consumer satisfaction. It's the perfect balance of wellness, enjoyment, and real-world validation!

Want to try it? Send a clear photo of any nutrition label to our email! 🚀`;
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
        - Our service that analyzes packaged food for nutrition, taste, and consumer satisfaction
        - The Vish Score feature that combines nutrition, taste, and consumer ratings
        
        Key information about FoodCheck:
        - We analyze nutrition labels sent via email to Vrishankjo@gmail.com
        - Analysis takes 1-20 minutes
        - We provide personalized health warnings (e.g., diabetes warnings)
        - We're a non-profit helping people make better food choices
        - We analyze nutrition, taste, and consumer satisfaction of packaged foods
        - Vish Score is our comprehensive feature that scores nutrition (33.3%), taste (33.3%), and consumer ratings (33.3%)
        
        Special responses:
        - If asked about "Vish Score" or "VishScore", explain it's our comprehensive system that evaluates nutrition, taste quality, AND consumer ratings equally. Users send nutrition labels to our email for analysis.
        - If asked about consumer ratings, explain how we incorporate real user feedback and satisfaction data into our scoring.
        
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