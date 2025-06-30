import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface NutritionData {
  name?: string;
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
}

export interface HealthData {
  score: number;
  warnings: string[];
  recommendations: string[];
  allergens: string[];
}

export interface TasteData {
  score: number;
  profile: string[];
  description: string;
}

export interface ConsumerData {
  score: number;
  feedback: string;
  satisfaction: string;
  commonComplaints: string[];
  positiveAspects: string[];
}

export interface OverallData {
  vishScore: number;
  grade: string;
  summary: string;
  nutritionScore: number;
  tasteScore: number;
  consumerScore: number;
}

export interface NutritionAnalysis {
  nutrition: NutritionData;
  health: HealthData;
  taste: TasteData;
  consumer: ConsumerData;
  overall: OverallData;
}

export const analyzeNutritionLabel = async (
  imageFile: File,
  userHealthInfo?: string
): Promise<NutritionAnalysis> => {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    const prompt = `Analyze this nutrition label image and provide a comprehensive analysis. ${
      userHealthInfo ? `User health information: ${userHealthInfo}` : ''
    }

Please provide a detailed JSON response with the following structure:
{
  "nutrition": {
    "name": "Product name if visible",
    "calories": number,
    "totalFat": "amount with unit",
    "saturatedFat": "amount with unit", 
    "transFat": "amount with unit",
    "cholesterol": "amount with unit",
    "sodium": "amount with unit",
    "totalCarbohydrates": "amount with unit",
    "dietaryFiber": "amount with unit",
    "totalSugars": "amount with unit",
    "addedSugars": "amount with unit",
    "protein": "amount with unit",
    "vitamins": ["list of vitamins and minerals"]
  },
  "health": {
    "score": number (0-100),
    "warnings": ["health warnings based on nutrition"],
    "recommendations": ["health recommendations"],
    "allergens": ["potential allergens"]
  },
  "taste": {
    "score": number (0-100),
    "profile": ["taste characteristics like sweet, salty, etc"],
    "description": "detailed taste analysis"
  },
  "consumer": {
    "score": number (0-100),
    "feedback": "consumer satisfaction analysis",
    "satisfaction": "overall satisfaction level",
    "commonComplaints": ["typical consumer complaints"],
    "positiveAspects": ["what consumers like"]
  },
  "overall": {
    "vishScore": number (average of health, taste, consumer scores),
    "grade": "letter grade A-F",
    "summary": "comprehensive summary",
    "nutritionScore": number (same as health score),
    "tasteScore": number (same as taste score),
    "consumerScore": number (same as consumer score)
  }
}

Provide realistic scores and detailed analysis. Consider the user's health information if provided.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image
              }
            }
          ]
        }
      ],
      model: "llama-3.2-90b-vision-preview",
      temperature: 0.3,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate and ensure all required fields exist
    return validateAnalysis(analysis);
    
  } catch (error) {
    console.error('Vision analysis error:', error);
    throw new Error('Failed to analyze nutrition label. Please try again with a clearer image.');
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const validateAnalysis = (analysis: any): NutritionAnalysis => {
  // Ensure all required fields exist with defaults
  return {
    nutrition: {
      name: analysis.nutrition?.name || 'Unknown Product',
      calories: analysis.nutrition?.calories || 0,
      totalFat: analysis.nutrition?.totalFat || '0g',
      saturatedFat: analysis.nutrition?.saturatedFat || '0g',
      transFat: analysis.nutrition?.transFat || '0g',
      cholesterol: analysis.nutrition?.cholesterol || '0mg',
      sodium: analysis.nutrition?.sodium || '0mg',
      totalCarbohydrates: analysis.nutrition?.totalCarbohydrates || '0g',
      dietaryFiber: analysis.nutrition?.dietaryFiber || '0g',
      totalSugars: analysis.nutrition?.totalSugars || '0g',
      addedSugars: analysis.nutrition?.addedSugars || '0g',
      protein: analysis.nutrition?.protein || '0g',
      vitamins: analysis.nutrition?.vitamins || []
    },
    health: {
      score: analysis.health?.score || 50,
      warnings: analysis.health?.warnings || [],
      recommendations: analysis.health?.recommendations || [],
      allergens: analysis.health?.allergens || []
    },
    taste: {
      score: analysis.taste?.score || 50,
      profile: analysis.taste?.profile || ['Neutral'],
      description: analysis.taste?.description || 'No taste analysis available'
    },
    consumer: {
      score: analysis.consumer?.score || 50,
      feedback: analysis.consumer?.feedback || 'No consumer feedback available',
      satisfaction: analysis.consumer?.satisfaction || 'Average',
      commonComplaints: analysis.consumer?.commonComplaints || [],
      positiveAspects: analysis.consumer?.positiveAspects || []
    },
    overall: {
      vishScore: analysis.overall?.vishScore || Math.round(((analysis.health?.score || 50) + (analysis.taste?.score || 50) + (analysis.consumer?.score || 50)) / 3),
      grade: analysis.overall?.grade || calculateGrade(analysis.overall?.vishScore || 50),
      summary: analysis.overall?.summary || 'Analysis completed',
      nutritionScore: analysis.health?.score || 50,
      tasteScore: analysis.taste?.score || 50,
      consumerScore: analysis.consumer?.score || 50
    }
  };
};

const calculateGrade = (score: number): string => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};