import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface ProductAnalysis {
  product: {
    name: string;
    brand: string;
    category: string;
    description: string;
    barcode?: string;
  };
  analysis: {
    overview: string;
    keyFeatures: string[];
    pros: string[];
    cons: string[];
    recommendations: string[];
  };
  details: {
    ingredients?: string[];
    materials?: string[];
    specifications?: string[];
    warnings?: string[];
  };
  rating: {
    overall: number;
    quality: number;
    value: number;
    safety: number;
  };
}

const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeProduct = async (imageFile: File): Promise<ProductAnalysis> => {
  try {
    const base64Image = await convertImageToBase64(imageFile);
    
    const systemPrompt = `You are a product analysis expert AI. Analyze the product in the image and provide a comprehensive analysis in the following JSON format:

{
  "product": {
    "name": "product name",
    "brand": "brand name",
    "category": "product category",
    "description": "brief product description",
    "barcode": "barcode if visible (optional)"
  },
  "analysis": {
    "overview": "comprehensive overview of the product",
    "keyFeatures": ["list of key features"],
    "pros": ["positive aspects"],
    "cons": ["potential drawbacks or concerns"],
    "recommendations": ["usage recommendations or alternatives"]
  },
  "details": {
    "ingredients": ["ingredients if food/cosmetic product"],
    "materials": ["materials if applicable"],
    "specifications": ["technical specs if applicable"],
    "warnings": ["safety warnings or concerns"]
  },
  "rating": {
    "overall": number (1-10),
    "quality": number (1-10),
    "value": number (1-10),
    "safety": number (1-10)
  }
}

Analyze everything visible in the image including text, labels, packaging, and any identifying features. Provide helpful insights about the product's quality, safety, value, and usage. If it's a food product, focus on nutritional aspects. If it's a consumer product, focus on quality and value. Be thorough and helpful.

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
      return JSON.parse(response);
    } catch (parseError) {
      // Fallback response if JSON parsing fails
      return {
        product: {
          name: "Unknown Product",
          brand: "Unknown Brand",
          category: "General Product",
          description: "Unable to fully identify the product from the image."
        },
        analysis: {
          overview: "The image quality or angle may have prevented complete analysis. Please try capturing a clearer image with better lighting and ensure all text and labels are visible.",
          keyFeatures: ["Product visible in image"],
          pros: ["Available for analysis"],
          cons: ["Image quality may limit detailed analysis"],
          recommendations: ["Try capturing a clearer image", "Ensure good lighting", "Include all product labels and text"]
        },
        details: {
          warnings: ["Analysis incomplete due to image quality"]
        },
        rating: {
          overall: 5,
          quality: 5,
          value: 5,
          safety: 5
        }
      };
    }
  } catch (error) {
    console.error('Product Analysis Error:', error);
    throw new Error('Failed to analyze product. Please try again with a clearer image.');
  }
};