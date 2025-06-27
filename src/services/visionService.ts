import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface NutritionAnalysis {
  nutrition: {
    calories: number;
    totalFat: string;
    saturatedFat: string;
    transFat: string;
    cholesterol: string;
    sodium: string;
    totalCarbohydrates: string;
    dietaryFiber: string;
    totalSugars: string;
    addedSugars: string;
    protein: string;
    vitamins: string[];
  };
  health: {
    score: number;
    warnings: string[];
    recommendations: string[];
    allergens: string[];
  };
  taste: {
    score: number;
    profile: string[];
    description: string;
  };
  consumer: {
    score: number;
    feedback: string;
    satisfaction: string;
    commonComplaints: string[];
    positiveAspects: string[];
  };
  overall: {
    grade: string;
    summary: string;
    vishScore: number;
    nutritionScore: number;
    tasteScore: number;
    consumerScore: number;
  };
}

const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get just the base64 string
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeNutritionLabel = async (
  imageFile: File,
  userHealthInfo?: string
): Promise<NutritionAnalysis> => {
  try {
    const base64Image = await convertImageToBase64(imageFile);
    
    const systemPrompt = `You are a nutrition expert AI that analyzes food labels. Analyze the nutrition label in the image and provide a comprehensive analysis in the following JSON format:

{
  "nutrition": {
    "calories": number,
    "totalFat": "string with unit",
    "saturatedFat": "string with unit",
    "transFat": "string with unit", 
    "cholesterol": "string with unit",
    "sodium": "string with unit",
    "totalCarbohydrates": "string with unit",
    "dietaryFiber": "string with unit",
    "totalSugars": "string with unit",
    "addedSugars": "string with unit",
    "protein": "string with unit",
    "vitamins": ["list of vitamins/minerals found"]
  },
  "health": {
    "score": number (1-100),
    "warnings": ["health warnings based on content"],
    "recommendations": ["health recommendations"],
    "allergens": ["potential allergens identified"]
  },
  "taste": {
    "score": number (1-100),
    "profile": ["taste characteristics"],
    "description": "brief taste description"
  },
  "consumer": {
    "score": number (1-100),
    "feedback": "general consumer sentiment",
    "satisfaction": "overall satisfaction level",
    "commonComplaints": ["typical consumer complaints"],
    "positiveAspects": ["what consumers typically like"]
  },
  "overall": {
    "grade": "A-F letter grade",
    "summary": "brief overall assessment",
    "vishScore": number (1-100, average of nutrition, taste, and consumer scores),
    "nutritionScore": number (1-100, same as health.score),
    "tasteScore": number (1-100, same as taste.score),
    "consumerScore": number (1-100, same as consumer.score)
  }
}

IMPORTANT SCORING GUIDELINES:

NUTRITION SCORE (health.score):
- Start with base score of 50
- HIGH PROTEIN (15g+): +15-20 points
- HIGH FIBER (5g+): +15-20 points  
- LOW SUGAR (<10g): +10-15 points
- LOW SODIUM (<400mg): +10-15 points
- LOW SATURATED FAT (<5g): +10-15 points
- HIGH SUGAR (20g+): -15-25 points
- HIGH SODIUM (800mg+): -15-25 points
- HIGH SATURATED FAT (10g+): -15-20 points
- VERY HIGH CALORIES (500+): -10-15 points

TASTE SCORE (taste.score):
- Start with base score of 50
- MODERATE SUGAR (5-15g): +15-20 points (enhances taste)
- MODERATE FAT (8-20g): +15-20 points (adds richness)
- MODERATE SODIUM (200-600mg): +10-15 points (enhances flavor)
- PROTEIN (10g+): +5-10 points (adds umami)
- Popular brands (McDonald's, Coca-Cola, Doritos, etc.): +10-15 points
- Dessert/snack categories: +5-10 points

CONSUMER SCORE (consumer.score):
- Start with base score of 50
- MEGA BRANDS (Coca-Cola, McDonald's, Doritos, KFC): +20-25 points
- POPULAR BRANDS (Nestle, Kraft, General Mills): +10-15 points
- ICONIC PRODUCTS (Big Mac, Oreo, Cheerios): +15-20 points
- FAST FOOD/SNACKS: +10-15 points (high consumer appeal)
- DESSERTS/ICE CREAM: +8-12 points
- Add random variation of -5 to +5 for realism

VISH SCORE = (nutritionScore + tasteScore + consumerScore) / 3

For the consumer analysis, base it on typical consumer feedback patterns for similar products, considering factors like:
- Taste satisfaction vs health benefits
- Price-to-value perception
- Ingredient quality concerns
- Texture and mouthfeel expectations
- Brand reputation factors
- Nutritional value vs taste trade-offs

${userHealthInfo ? `User health information: ${userHealthInfo}. Please provide personalized warnings and recommendations based on this information.` : ''}

Provide only the JSON response, no additional text.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: systemPrompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      model: 'llama-3.2-90b-vision-preview',
      temperature: 0.3,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    try {
      const analysis = JSON.parse(response);
      
      // Ensure all required scores are present and calculate Vish Score
      const nutritionScore = analysis.health?.score || 50;
      const tasteScore = analysis.taste?.score || 50;
      const consumerScore = analysis.consumer?.score || 50;
      const vishScore = Math.round((nutritionScore + tasteScore + consumerScore) / 3);
      
      // Update the overall section with all scores
      analysis.overall = {
        ...analysis.overall,
        nutritionScore,
        tasteScore,
        consumerScore,
        vishScore
      };
      
      return analysis;
    } catch (parseError) {
      // If JSON parsing fails, create a fallback response with proper scoring
      return {
        nutrition: {
          calories: 0,
          totalFat: "Unable to read",
          saturatedFat: "Unable to read",
          transFat: "Unable to read",
          cholesterol: "Unable to read",
          sodium: "Unable to read",
          totalCarbohydrates: "Unable to read",
          dietaryFiber: "Unable to read",
          totalSugars: "Unable to read",
          addedSugars: "Unable to read",
          protein: "Unable to read",
          vitamins: []
        },
        health: {
          score: 50,
          warnings: ["Unable to fully analyze the nutrition label. Please ensure the image is clear and well-lit."],
          recommendations: ["Try uploading a clearer image of the nutrition facts panel."],
          allergens: []
        },
        taste: {
          score: 50,
          profile: ["Unable to determine"],
          description: "Taste analysis unavailable due to unclear label."
        },
        consumer: {
          score: 50,
          feedback: "Consumer analysis unavailable due to unclear label.",
          satisfaction: "Unknown",
          commonComplaints: ["Image quality too poor for analysis"],
          positiveAspects: ["Please provide clearer image"]
        },
        overall: {
          grade: "N/A",
          summary: "Analysis incomplete due to image quality. Please try again with a clearer photo.",
          vishScore: 50,
          nutritionScore: 50,
          tasteScore: 50,
          consumerScore: 50
        }
      };
    }
  } catch (error) {
    console.error('Vision AI Error:', error);
    throw new Error('Failed to analyze nutrition label. Please try again.');
  }
};