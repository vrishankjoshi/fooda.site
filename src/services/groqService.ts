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
        
        Key information about FoodCheck:
        - We analyze nutrition labels sent via email to Vrishankjo@gmail.com
        - Analysis takes 1-20 minutes
        - We provide personalized health warnings (e.g., diabetes warnings)
        - We're a non-profit helping people make better food choices
        - We analyze nutrition, taste, and health impact of packaged foods
        
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