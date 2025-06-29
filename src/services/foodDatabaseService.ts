export interface FoodItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  barcode?: string;
  vishScore: number;
  healthScore: number;
  tasteScore: number;
  consumerScore: number;
  environmentalScore: number;
  servingSize: string;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
    fiber: number;
    sugar: number;
    sodium: number;
    cholesterol: number;
    saturatedFat: number;
    transFat: number;
    vitamins: string[];
    minerals: string[];
  };
  ingredients: string[];
  allergens: string[];
  certifications: string[];
  priceRange: string;
  availability: string[];
  seasonality?: string;
  culturalOrigin?: string;
  dietaryTags: string[];
  sustainabilityInfo?: {
    carbonFootprint: number;
    waterUsage: number;
    packaging: string;
    locallySourced: boolean;
  };
  healthWarnings?: string[];
  moodImpact?: {
    energy: number;
    focus: number;
    mood: number;
  };
}

export interface FoodSearchResult {
  items: FoodItem[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface NearbyStore {
  id: string;
  name: string;
  address: string;
  distance: number;
  type: string;
  rating: number;
  priceLevel: number;
  hasHealthyOptions: boolean;
}

class FoodDatabaseService {
  private static instance: FoodDatabaseService;
  private foods: FoodItem[] = [];

  static getInstance(): FoodDatabaseService {
    if (!FoodDatabaseService.instance) {
      FoodDatabaseService.instance = new FoodDatabaseService();
    }
    return FoodDatabaseService.instance;
  }

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase() {
    this.foods = [
      // Healthy Foods (70+ Vish Score)
      {
        id: 'quinoa-bowl-1',
        name: 'Organic Quinoa Power Bowl',
        brand: 'Whole Foods',
        category: 'Grain Bowls',
        barcode: '123456789012',
        vishScore: 92,
        healthScore: 95,
        tasteScore: 88,
        consumerScore: 93,
        environmentalScore: 85,
        servingSize: '1 bowl (300g)',
        nutrition: {
          calories: 420,
          protein: 18,
          fat: 12,
          carbohydrates: 58,
          fiber: 12,
          sugar: 8,
          sodium: 380,
          cholesterol: 0,
          saturatedFat: 2,
          transFat: 0,
          vitamins: ['Vitamin B6', 'Folate', 'Vitamin E', 'Thiamine'],
          minerals: ['Iron', 'Magnesium', 'Phosphorus', 'Zinc']
        },
        ingredients: ['Organic Quinoa', 'Black Beans', 'Sweet Potato', 'Avocado', 'Spinach', 'Lime', 'Olive Oil'],
        allergens: [],
        certifications: ['USDA Organic', 'Non-GMO', 'Gluten-Free'],
        priceRange: '$8-12',
        availability: ['Whole Foods', 'Fresh Market', 'Online'],
        seasonality: 'Year-round',
        culturalOrigin: 'South American',
        dietaryTags: ['Vegan', 'Gluten-Free', 'High-Protein', 'High-Fiber'],
        sustainabilityInfo: {
          carbonFootprint: 2.1,
          waterUsage: 150,
          packaging: 'Compostable',
          locallySourced: true
        },
        moodImpact: {
          energy: 85,
          focus: 80,
          mood: 75
        }
      },
      {
        id: 'salmon-fillet-1',
        name: 'Wild Alaskan Salmon Fillet',
        brand: 'Trader Joe\'s',
        category: 'Seafood',
        barcode: '234567890123',
        vishScore: 89,
        healthScore: 94,
        tasteScore: 91,
        consumerScore: 82,
        environmentalScore: 78,
        servingSize: '1 fillet (150g)',
        nutrition: {
          calories: 280,
          protein: 39,
          fat: 12,
          carbohydrates: 0,
          fiber: 0,
          sugar: 0,
          sodium: 95,
          cholesterol: 85,
          saturatedFat: 3,
          transFat: 0,
          vitamins: ['Vitamin D', 'Vitamin B12', 'Niacin', 'Vitamin B6'],
          minerals: ['Selenium', 'Phosphorus', 'Potassium', 'Omega-3']
        },
        ingredients: ['Wild Alaskan Salmon'],
        allergens: ['Fish'],
        certifications: ['MSC Certified', 'Wild-Caught'],
        priceRange: '$12-18',
        availability: ['Trader Joe\'s', 'Whole Foods', 'Costco'],
        seasonality: 'Summer peak',
        culturalOrigin: 'Pacific Northwest',
        dietaryTags: ['Keto', 'Paleo', 'High-Protein', 'Omega-3 Rich'],
        sustainabilityInfo: {
          carbonFootprint: 3.2,
          waterUsage: 200,
          packaging: 'Recyclable',
          locallySourced: false
        },
        moodImpact: {
          energy: 75,
          focus: 90,
          mood: 85
        }
      },
      {
        id: 'greek-yogurt-1',
        name: 'Plain Greek Yogurt',
        brand: 'Fage',
        category: 'Dairy',
        barcode: '345678901234',
        vishScore: 86,
        healthScore: 88,
        tasteScore: 82,
        consumerScore: 88,
        environmentalScore: 65,
        servingSize: '1 cup (227g)',
        nutrition: {
          calories: 130,
          protein: 23,
          fat: 0,
          carbohydrates: 9,
          fiber: 0,
          sugar: 9,
          sodium: 65,
          cholesterol: 10,
          saturatedFat: 0,
          transFat: 0,
          vitamins: ['Vitamin B12', 'Riboflavin', 'Vitamin B6'],
          minerals: ['Calcium', 'Phosphorus', 'Potassium', 'Probiotics']
        },
        ingredients: ['Grade A Pasteurized Skimmed Milk', 'Live Active Yogurt Cultures'],
        allergens: ['Milk'],
        certifications: ['rBST-Free'],
        priceRange: '$4-6',
        availability: ['Most Grocery Stores'],
        seasonality: 'Year-round',
        culturalOrigin: 'Greek',
        dietaryTags: ['Vegetarian', 'High-Protein', 'Probiotic'],
        sustainabilityInfo: {
          carbonFootprint: 4.5,
          waterUsage: 300,
          packaging: 'Recyclable Plastic',
          locallySourced: false
        },
        moodImpact: {
          energy: 70,
          focus: 75,
          mood: 80
        }
      },
      {
        id: 'avocado-toast-1',
        name: 'Ezekiel Bread with Avocado',
        brand: 'Food for Life',
        category: 'Bread & Spreads',
        barcode: '456789012345',
        vishScore: 84,
        healthScore: 87,
        tasteScore: 79,
        consumerScore: 86,
        environmentalScore: 82,
        servingSize: '2 slices + 1/2 avocado',
        nutrition: {
          calories: 320,
          protein: 12,
          fat: 18,
          carbohydrates: 28,
          fiber: 14,
          sugar: 2,
          sodium: 160,
          cholesterol: 0,
          saturatedFat: 3,
          transFat: 0,
          vitamins: ['Folate', 'Vitamin K', 'Vitamin E', 'Vitamin C'],
          minerals: ['Potassium', 'Magnesium', 'Fiber', 'Healthy Fats']
        },
        ingredients: ['Sprouted Wheat', 'Sprouted Barley', 'Sprouted Millet', 'Avocado', 'Sea Salt'],
        allergens: ['Wheat', 'Gluten'],
        certifications: ['Organic', 'Sprouted Grains'],
        priceRange: '$6-8',
        availability: ['Health Food Stores', 'Whole Foods'],
        seasonality: 'Year-round',
        culturalOrigin: 'Modern American',
        dietaryTags: ['Vegetarian', 'High-Fiber', 'Sprouted Grains'],
        sustainabilityInfo: {
          carbonFootprint: 1.8,
          waterUsage: 120,
          packaging: 'Recyclable',
          locallySourced: true
        },
        moodImpact: {
          energy: 80,
          focus: 85,
          mood: 75
        }
      },
      {
        id: 'kale-smoothie-1',
        name: 'Green Goddess Smoothie',
        brand: 'Naked Juice',
        category: 'Beverages',
        barcode: '567890123456',
        vishScore: 81,
        healthScore: 85,
        tasteScore: 74,
        consumerScore: 84,
        environmentalScore: 75,
        servingSize: '1 bottle (450ml)',
        nutrition: {
          calories: 270,
          protein: 6,
          fat: 1,
          carbohydrates: 63,
          fiber: 6,
          sugar: 53,
          sodium: 35,
          cholesterol: 0,
          saturatedFat: 0,
          transFat: 0,
          vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin K', 'Folate'],
          minerals: ['Potassium', 'Iron', 'Calcium', 'Antioxidants']
        },
        ingredients: ['Apple Juice', 'Kale', 'Spinach', 'Mango', 'Pineapple', 'Banana', 'Ginger'],
        allergens: [],
        certifications: ['No Sugar Added', 'Non-GMO'],
        priceRange: '$3-5',
        availability: ['Most Grocery Stores'],
        seasonality: 'Year-round',
        culturalOrigin: 'Modern Health Food',
        dietaryTags: ['Vegan', 'Gluten-Free', 'Antioxidant-Rich'],
        sustainabilityInfo: {
          carbonFootprint: 2.5,
          waterUsage: 180,
          packaging: 'Recyclable Plastic',
          locallySourced: false
        },
        moodImpact: {
          energy: 90,
          focus: 70,
          mood: 85
        }
      },
      {
        id: 'sweet-potato-1',
        name: 'Roasted Sweet Potato',
        brand: 'Organic Valley',
        category: 'Vegetables',
        barcode: '678901234567',
        vishScore: 88,
        healthScore: 92,
        tasteScore: 85,
        consumerScore: 87,
        environmentalScore: 90,
        servingSize: '1 medium potato (150g)',
        nutrition: {
          calories: 112,
          protein: 2,
          fat: 0,
          carbohydrates: 26,
          fiber: 4,
          sugar: 5,
          sodium: 7,
          cholesterol: 0,
          saturatedFat: 0,
          transFat: 0,
          vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin B6', 'Thiamine'],
          minerals: ['Potassium', 'Manganese', 'Copper', 'Pantothenic Acid']
        },
        ingredients: ['Organic Sweet Potato'],
        allergens: [],
        certifications: ['USDA Organic', 'Non-GMO'],
        priceRange: '$2-4',
        availability: ['All Grocery Stores'],
        seasonality: 'Fall peak',
        culturalOrigin: 'Native American',
        dietaryTags: ['Vegan', 'Gluten-Free', 'Paleo', 'High-Vitamin A'],
        sustainabilityInfo: {
          carbonFootprint: 0.8,
          waterUsage: 60,
          packaging: 'None',
          locallySourced: true
        },
        moodImpact: {
          energy: 75,
          focus: 70,
          mood: 80
        }
      },

      // Moderate Foods (50-69 Vish Score)
      {
        id: 'whole-grain-pasta-1',
        name: 'Whole Grain Spaghetti',
        brand: 'Barilla',
        category: 'Pasta',
        barcode: '789012345678',
        vishScore: 68,
        healthScore: 72,
        tasteScore: 65,
        consumerScore: 67,
        environmentalScore: 60,
        servingSize: '2 oz dry (56g)',
        nutrition: {
          calories: 200,
          protein: 7,
          fat: 1,
          carbohydrates: 42,
          fiber: 6,
          sugar: 2,
          sodium: 0,
          cholesterol: 0,
          saturatedFat: 0,
          transFat: 0,
          vitamins: ['Thiamine', 'Niacin', 'Folate'],
          minerals: ['Iron', 'Magnesium', 'Selenium']
        },
        ingredients: ['Whole Grain Durum Wheat'],
        allergens: ['Wheat', 'Gluten'],
        certifications: ['Whole Grain'],
        priceRange: '$1-3',
        availability: ['All Grocery Stores'],
        seasonality: 'Year-round',
        culturalOrigin: 'Italian',
        dietaryTags: ['Vegetarian', 'Whole Grain'],
        sustainabilityInfo: {
          carbonFootprint: 1.2,
          waterUsage: 90,
          packaging: 'Recyclable Cardboard',
          locallySourced: false
        },
        moodImpact: {
          energy: 65,
          focus: 60,
          mood: 70
        }
      },
      {
        id: 'peanut-butter-1',
        name: 'Natural Peanut Butter',
        brand: 'Jif',
        category: 'Nut Butters',
        barcode: '890123456789',
        vishScore: 64,
        healthScore: 68,
        tasteScore: 78,
        consumerScore: 46,
        environmentalScore: 55,
        servingSize: '2 tbsp (32g)',
        nutrition: {
          calories: 190,
          protein: 8,
          fat: 16,
          carbohydrates: 8,
          fiber: 3,
          sugar: 3,
          sodium: 140,
          cholesterol: 0,
          saturatedFat: 3,
          transFat: 0,
          vitamins: ['Niacin', 'Vitamin E'],
          minerals: ['Magnesium', 'Phosphorus', 'Zinc']
        },
        ingredients: ['Peanuts', 'Sugar', 'Palm Oil', 'Salt'],
        allergens: ['Peanuts'],
        certifications: ['Gluten-Free'],
        priceRange: '$3-5',
        availability: ['All Grocery Stores'],
        seasonality: 'Year-round',
        culturalOrigin: 'American',
        dietaryTags: ['Vegetarian', 'High-Protein'],
        sustainabilityInfo: {
          carbonFootprint: 2.8,
          waterUsage: 220,
          packaging: 'Recyclable Plastic',
          locallySourced: false
        },
        moodImpact: {
          energy: 70,
          focus: 65,
          mood: 75
        }
      },
      {
        id: 'granola-bar-1',
        name: 'Oats & Honey Granola Bar',
        brand: 'Nature Valley',
        category: 'Snack Bars',
        barcode: '901234567890',
        vishScore: 62,
        healthScore: 58,
        tasteScore: 72,
        consumerScore: 56,
        environmentalScore: 50,
        servingSize: '1 bar (42g)',
        nutrition: {
          calories: 190,
          protein: 4,
          fat: 6,
          carbohydrates: 29,
          fiber: 2,
          sugar: 11,
          sodium: 160,
          cholesterol: 0,
          saturatedFat: 1,
          transFat: 0,
          vitamins: ['Thiamine'],
          minerals: ['Iron', 'Zinc']
        },
        ingredients: ['Whole Grain Oats', 'Sugar', 'Canola Oil', 'Honey', 'Salt', 'Natural Flavor'],
        allergens: ['May contain nuts'],
        certifications: ['Whole Grain'],
        priceRange: '$3-5',
        availability: ['All Grocery Stores'],
        seasonality: 'Year-round',
        culturalOrigin: 'American',
        dietaryTags: ['Vegetarian'],
        sustainabilityInfo: {
          carbonFootprint: 1.5,
          waterUsage: 110,
          packaging: 'Mixed Materials',
          locallySourced: false
        },
        moodImpact: {
          energy: 75,
          focus: 55,
          mood: 65
        }
      },
      {
        id: 'white-rice-1',
        name: 'Jasmine White Rice',
        brand: 'Uncle Ben\'s',
        category: 'Rice & Grains',
        barcode: '012345678901',
        vishScore: 58,
        healthScore: 52,
        tasteScore: 68,
        consumerScore: 54,
        environmentalScore: 45,
        servingSize: '1/4 cup dry (45g)',
        nutrition: {
          calories: 160,
          protein: 3,
          fat: 0,
          carbohydrates: 36,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          cholesterol: 0,
          saturatedFat: 0,
          transFat: 0,
          vitamins: ['Thiamine', 'Niacin', 'Folate'],
          minerals: ['Iron']
        },
        ingredients: ['Enriched Long Grain White Rice'],
        allergens: [],
        certifications: ['Enriched'],
        priceRange: '$2-4',
        availability: ['All Grocery Stores'],
        seasonality: 'Year-round',
        culturalOrigin: 'Asian',
        dietaryTags: ['Vegan', 'Gluten-Free'],
        sustainabilityInfo: {
          carbonFootprint: 2.7,
          waterUsage: 400,
          packaging: 'Recyclable Cardboard',
          locallySourced: false
        },
        moodImpact: {
          energy: 60,
          focus: 50,
          mood: 55
        }
      },
      {
        id: 'chicken-breast-1',
        name: 'Grilled Chicken Breast',
        brand: 'Perdue',
        category: 'Poultry',
        barcode: '123450987654',
        vishScore: 66,
        healthScore: 78,
        tasteScore: 62,
        consumerScore: 58,
        environmentalScore: 40,
        servingSize: '1 breast (150g)',
        nutrition: {
          calories: 231,
          protein: 43,
          fat: 5,
          carbohydrates: 0,
          fiber: 0,
          sugar: 0,
          sodium: 104,
          cholesterol: 128,
          saturatedFat: 1,
          transFat: 0,
          vitamins: ['Niacin', 'Vitamin B6', 'Vitamin B12'],
          minerals: ['Phosphorus', 'Selenium', 'Potassium']
        },
        ingredients: ['Chicken Breast', 'Salt', 'Natural Flavoring'],
        allergens: [],
        certifications: ['No Antibiotics Ever'],
        priceRange: '$6-10',
        availability: ['Most Grocery Stores'],
        seasonality: 'Year-round',
        culturalOrigin: 'Universal',
        dietaryTags: ['Keto', 'Paleo', 'High-Protein'],
        sustainabilityInfo: {
          carbonFootprint: 6.9,
          waterUsage: 550,
          packaging: 'Plastic Wrap',
          locallySourced: false
        },
        moodImpact: {
          energy: 70,
          focus: 75,
          mood: 60
        }
      },

      // Unhealthy Foods (Below 50 Vish Score)
      {
        id: 'soda-cola-1',
        name: 'Classic Cola',
        brand: 'Coca-Cola',
        category: 'Soft Drinks',
        barcode: '234561098765',
        vishScore: 28,
        healthScore: 15,
        tasteScore: 85,
        consumerScore: 85,
        environmentalScore: 25,
        servingSize: '1 can (355ml)',
        nutrition: {
          calories: 140,
          protein: 0,
          fat: 0,
          carbohydrates: 39,
          fiber: 0,
          sugar: 39,
          sodium: 45,
          cholesterol: 0,
          saturatedFat: 0,
          transFat: 0,
          vitamins: [],
          minerals: []
        },
        ingredients: ['Carbonated Water', 'High Fructose Corn Syrup', 'Caramel Color', 'Phosphoric Acid', 'Natural Flavors', 'Caffeine'],
        allergens: [],
        certifications: [],
        priceRange: '$1-2',
        availability: ['Everywhere'],
        seasonality: 'Year-round',
        culturalOrigin: 'American',
        dietaryTags: ['Vegan', 'High-Sugar'],
        sustainabilityInfo: {
          carbonFootprint: 0.5,
          waterUsage: 300,
          packaging: 'Recyclable Aluminum',
          locallySourced: false
        },
        healthWarnings: ['High Sugar Content', 'No Nutritional Value', 'May Contribute to Tooth Decay'],
        moodImpact: {
          energy: 85,
          focus: 30,
          mood: 60
        }
      },
      {
        id: 'potato-chips-1',
        name: 'Classic Potato Chips',
        brand: 'Lay\'s',
        category: 'Snacks',
        barcode: '345672109876',
        vishScore: 32,
        healthScore: 22,
        tasteScore: 78,
        consumerScore: 76,
        environmentalScore: 30,
        servingSize: '1 oz (28g)',
        nutrition: {
          calories: 160,
          protein: 2,
          fat: 10,
          carbohydrates: 15,
          fiber: 1,
          sugar: 0,
          sodium: 170,
          cholesterol: 0,
          saturatedFat: 1.5,
          transFat: 0,
          vitamins: ['Vitamin C'],
          minerals: ['Potassium']
        },
        ingredients: ['Potatoes', 'Vegetable Oil', 'Salt'],
        allergens: [],
        certifications: ['Gluten-Free'],
        priceRange: '$2-4',
        availability: ['All Grocery Stores'],
        seasonality: 'Year-round',
        culturalOrigin: 'American',
        dietaryTags: ['Vegan', 'High-Sodium', 'High-Fat'],
        sustainabilityInfo: {
          carbonFootprint: 3.2,
          waterUsage: 250,
          packaging: 'Foil Bag',
          locallySourced: false
        },
        healthWarnings: ['High Sodium', 'High Fat', 'Processed Food'],
        moodImpact: {
          energy: 50,
          focus: 40,
          mood: 70
        }
      },
      {
        id: 'donut-glazed-1',
        name: 'Glazed Donut',
        brand: 'Krispy Kreme',
        category: 'Bakery',
        barcode: '456783210987',
        vishScore: 25,
        healthScore: 12,
        tasteScore: 88,
        consumerScore: 75,
        environmentalScore: 20,
        servingSize: '1 donut (52g)',
        nutrition: {
          calories: 190,
          protein: 3,
          fat: 11,
          carbohydrates: 22,
          fiber: 1,
          sugar: 10,
          sodium: 95,
          cholesterol: 5,
          saturatedFat: 5,
          transFat: 0,
          vitamins: [],
          minerals: ['Iron']
        },
        ingredients: ['Enriched Wheat Flour', 'Sugar', 'Soybean Oil', 'Eggs', 'Yeast', 'Salt', 'Milk'],
        allergens: ['Wheat', 'Eggs', 'Milk', 'Soy'],
        certifications: [],
        priceRange: '$1-2',
        availability: ['Krispy Kreme', 'Some Grocery Stores'],
        seasonality: 'Year-round',
        culturalOrigin: 'American',
        dietaryTags: ['Vegetarian', 'High-Sugar', 'High-Fat'],
        sustainabilityInfo: {
          carbonFootprint: 2.8,
          waterUsage: 180,
          packaging: 'Paper Box',
          locallySourced: false
        },
        healthWarnings: ['High Sugar', 'High Saturated Fat', 'High Calories', 'Minimal Nutrients'],
        moodImpact: {
          energy: 90,
          focus: 25,
          mood: 80
        }
      },
      {
        id: 'instant-ramen-1',
        name: 'Chicken Flavor Instant Ramen',
        brand: 'Maruchan',
        category: 'Instant Meals',
        barcode: '567894321098',
        vishScore: 35,
        healthScore: 28,
        tasteScore: 65,
        consumerScore: 62,
        environmentalScore: 25,
        servingSize: '1 package (85g)',
        nutrition: {
          calories: 380,
          protein: 8,
          fat: 14,
          carbohydrates: 52,
          fiber: 2,
          sugar: 2,
          sodium: 1820,
          cholesterol: 0,
          saturatedFat: 7,
          transFat: 0,
          vitamins: ['Thiamine', 'Riboflavin', 'Niacin'],
          minerals: ['Iron']
        },
        ingredients: ['Enriched Wheat Flour', 'Palm Oil', 'Salt', 'Monosodium Glutamate', 'Chicken Powder', 'Spices'],
        allergens: ['Wheat', 'Soy'],
        certifications: [],
        priceRange: '$0.25-0.50',
        availability: ['All Grocery Stores'],
        seasonality: 'Year-round',
        culturalOrigin: 'Japanese',
        dietaryTags: ['High-Sodium', 'Processed'],
        sustainabilityInfo: {
          carbonFootprint: 1.8,
          waterUsage: 120,
          packaging: 'Plastic Wrapper',
          locallySourced: false
        },
        healthWarnings: ['Extremely High Sodium', 'High Saturated Fat', 'Highly Processed', 'Contains MSG'],
        moodImpact: {
          energy: 60,
          focus: 35,
          mood: 55
        }
      },
      {
        id: 'candy-bar-1',
        name: 'Milk Chocolate Bar',
        brand: 'Hershey\'s',
        category: 'Candy',
        barcode: '678905432109',
        vishScore: 22,
        healthScore: 8,
        tasteScore: 82,
        consumerScore: 76,
        environmentalScore: 15,
        servingSize: '1 bar (43g)',
        nutrition: {
          calories: 210,
          protein: 3,
          fat: 13,
          carbohydrates: 26,
          fiber: 1,
          sugar: 24,
          sodium: 35,
          cholesterol: 10,
          saturatedFat: 8,
          transFat: 0,
          vitamins: [],
          minerals: ['Calcium', 'Iron']
        },
        ingredients: ['Milk Chocolate', 'Sugar', 'Cocoa Butter', 'Chocolate', 'Milk', 'Lactose', 'Milk Fat', 'Soy Lecithin', 'PGPR', 'Vanillin'],
        allergens: ['Milk', 'Soy', 'May contain nuts'],
        certifications: [],
        priceRange: '$1-2',
        availability: ['Everywhere'],
        seasonality: 'Year-round',
        culturalOrigin: 'American',
        dietaryTags: ['Vegetarian', 'High-Sugar', 'High-Fat'],
        sustainabilityInfo: {
          carbonFootprint: 4.2,
          waterUsage: 300,
          packaging: 'Foil Wrapper',
          locallySourced: false
        },
        healthWarnings: ['Very High Sugar', 'High Saturated Fat', 'High Calories', 'Minimal Nutrients'],
        moodImpact: {
          energy: 95,
          focus: 20,
          mood: 85
        }
      },
      {
        id: 'frozen-pizza-1',
        name: 'Pepperoni Pizza',
        brand: 'DiGiorno',
        category: 'Frozen Foods',
        barcode: '789016543210',
        vishScore: 38,
        healthScore: 32,
        tasteScore: 72,
        consumerScore: 70,
        environmentalScore: 30,
        servingSize: '1/4 pizza (140g)',
        nutrition: {
          calories: 320,
          protein: 14,
          fat: 13,
          carbohydrates: 37,
          fiber: 2,
          sugar: 6,
          sodium: 700,
          cholesterol: 25,
          saturatedFat: 6,
          transFat: 0,
          vitamins: ['Vitamin A', 'Calcium'],
          minerals: ['Iron', 'Calcium']
        },
        ingredients: ['Enriched Wheat Flour', 'Water', 'Mozzarella Cheese', 'Pepperoni', 'Tomato Sauce', 'Yeast', 'Salt', 'Sugar', 'Spices'],
        allergens: ['Wheat', 'Milk'],
        certifications: [],
        priceRange: '$4-7',
        availability: ['Most Grocery Stores'],
        seasonality: 'Year-round',
        culturalOrigin: 'Italian-American',
        dietaryTags: ['High-Sodium', 'Processed'],
        sustainabilityInfo: {
          carbonFootprint: 5.1,
          waterUsage: 400,
          packaging: 'Cardboard Box',
          locallySourced: false
        },
        healthWarnings: ['High Sodium', 'High Saturated Fat', 'Processed Meat'],
        moodImpact: {
          energy: 65,
          focus: 45,
          mood: 75
        }
      },
      {
        id: 'energy-drink-1',
        name: 'Energy Drink Original',
        brand: 'Red Bull',
        category: 'Energy Drinks',
        barcode: '890127654321',
        vishScore: 29,
        healthScore: 18,
        tasteScore: 68,
        consumerScore: 82,
        environmentalScore: 20,
        servingSize: '1 can (250ml)',
        nutrition: {
          calories: 110,
          protein: 1,
          fat: 0,
          carbohydrates: 28,
          fiber: 0,
          sugar: 27,
          sodium: 105,
          cholesterol: 0,
          saturatedFat: 0,
          transFat: 0,
          vitamins: ['Niacin', 'Vitamin B6', 'Vitamin B12', 'Pantothenic Acid'],
          minerals: ['Caffeine', 'Taurine']
        },
        ingredients: ['Carbonated Water', 'Sucrose', 'Glucose', 'Citric Acid', 'Taurine', 'Sodium Bicarbonate', 'Magnesium Carbonate', 'Caffeine', 'Niacinamide', 'Calcium Pantothenate', 'Pyridoxine HCl', 'Vitamin B12', 'Natural and Artificial Flavors', 'Colors'],
        allergens: [],
        certifications: [],
        priceRange: '$2-4',
        availability: ['Most Stores'],
        seasonality: 'Year-round',
        culturalOrigin: 'Austrian',
        dietaryTags: ['High-Sugar', 'High-Caffeine'],
        sustainabilityInfo: {
          carbonFootprint: 0.8,
          waterUsage: 200,
          packaging: 'Recyclable Aluminum',
          locallySourced: false
        },
        healthWarnings: ['High Sugar', 'High Caffeine', 'May Cause Jitters', 'Not Recommended for Children'],
        moodImpact: {
          energy: 100,
          focus: 85,
          mood: 70
        }
      },
      {
        id: 'fast-food-burger-1',
        name: 'Big Mac',
        brand: 'McDonald\'s',
        category: 'Fast Food',
        barcode: '901238765432',
        vishScore: 31,
        healthScore: 25,
        tasteScore: 78,
        consumerScore: 89,
        environmentalScore: 15,
        servingSize: '1 burger (230g)',
        nutrition: {
          calories: 563,
          protein: 25,
          fat: 33,
          carbohydrates: 45,
          fiber: 3,
          sugar: 9,
          sodium: 1040,
          cholesterol: 85,
          saturatedFat: 11,
          transFat: 1,
          vitamins: ['Vitamin A', 'Vitamin C'],
          minerals: ['Calcium', 'Iron']
        },
        ingredients: ['Beef Patties', 'Sesame Seed Bun', 'Big Mac Sauce', 'Lettuce', 'Cheese', 'Pickles', 'Onions'],
        allergens: ['Wheat', 'Milk', 'Eggs', 'Soy', 'Sesame'],
        certifications: [],
        priceRange: '$4-6',
        availability: ['McDonald\'s'],
        seasonality: 'Year-round',
        culturalOrigin: 'American',
        dietaryTags: ['High-Sodium', 'High-Fat', 'Fast Food'],
        sustainabilityInfo: {
          carbonFootprint: 7.8,
          waterUsage: 650,
          packaging: 'Paper Wrapper',
          locallySourced: false
        },
        healthWarnings: ['Very High Sodium', 'High Saturated Fat', 'Contains Trans Fat', 'High Calories'],
        moodImpact: {
          energy: 70,
          focus: 40,
          mood: 80
        }
      }
    ];
  }

  // Search foods with advanced filtering
  async searchFoods(
    query: string, 
    page: number = 1, 
    limit: number = 20,
    filters?: {
      category?: string;
      minVishScore?: number;
      maxVishScore?: number;
      dietaryTags?: string[];
      allergenFree?: string[];
      priceRange?: string;
      environmentalScore?: number;
    }
  ): Promise<FoodSearchResult> {
    let filteredFoods = this.foods;

    // Text search
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(' ');
      filteredFoods = filteredFoods.filter(food => 
        searchTerms.every(term =>
          food.name.toLowerCase().includes(term) ||
          food.brand.toLowerCase().includes(term) ||
          food.category.toLowerCase().includes(term) ||
          food.ingredients.some(ing => ing.toLowerCase().includes(term)) ||
          food.dietaryTags.some(tag => tag.toLowerCase().includes(term))
        )
      );
    }

    // Apply filters
    if (filters) {
      if (filters.category) {
        filteredFoods = filteredFoods.filter(food => food.category === filters.category);
      }
      
      if (filters.minVishScore !== undefined) {
        filteredFoods = filteredFoods.filter(food => food.vishScore >= filters.minVishScore!);
      }
      
      if (filters.maxVishScore !== undefined) {
        filteredFoods = filteredFoods.filter(food => food.vishScore <= filters.maxVishScore!);
      }
      
      if (filters.dietaryTags && filters.dietaryTags.length > 0) {
        filteredFoods = filteredFoods.filter(food => 
          filters.dietaryTags!.some(tag => food.dietaryTags.includes(tag))
        );
      }
      
      if (filters.allergenFree && filters.allergenFree.length > 0) {
        filteredFoods = filteredFoods.filter(food => 
          !filters.allergenFree!.some(allergen => food.allergens.includes(allergen))
        );
      }
      
      if (filters.environmentalScore !== undefined) {
        filteredFoods = filteredFoods.filter(food => food.environmentalScore >= filters.environmentalScore!);
      }
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFoods = filteredFoods.slice(startIndex, endIndex);

    return {
      items: paginatedFoods,
      total: filteredFoods.length,
      page,
      hasMore: endIndex < filteredFoods.length
    };
  }

  // Get food by barcode
  async getFoodByBarcode(barcode: string): Promise<FoodItem | null> {
    const food = this.foods.find(f => f.barcode === barcode);
    return food || null;
  }

  // Get popular foods
  getPopularFoods(limit: number = 10): FoodItem[] {
    return this.foods
      .sort((a, b) => b.consumerScore - a.consumerScore)
      .slice(0, limit);
  }

  // Get healthy foods
  getHealthyFoods(limit: number = 10): FoodItem[] {
    return this.foods
      .filter(food => food.vishScore >= 70)
      .sort((a, b) => b.vishScore - a.vishScore)
      .slice(0, limit);
  }

  // Get American foods
  getAmericanFoods(limit: number = 10): FoodItem[] {
    return this.foods
      .filter(food => food.culturalOrigin === 'American' || food.culturalOrigin === 'Modern American')
      .sort((a, b) => b.vishScore - a.vishScore)
      .slice(0, limit);
  }

  // Get foods by category
  getFoodsByCategory(category: string): FoodItem[] {
    return this.foods.filter(food => food.category === category);
  }

  // Get all categories
  getCategories(): string[] {
    return [...new Set(this.foods.map(food => food.category))];
  }

  // Get dietary tags
  getDietaryTags(): string[] {
    const allTags = this.foods.flatMap(food => food.dietaryTags);
    return [...new Set(allTags)];
  }

  // Get foods for specific dietary needs
  getFoodsForDiet(dietaryTag: string): FoodItem[] {
    return this.foods.filter(food => food.dietaryTags.includes(dietaryTag));
  }

  // Get seasonal foods
  getSeasonalFoods(season: string): FoodItem[] {
    return this.foods.filter(food => 
      food.seasonality?.toLowerCase().includes(season.toLowerCase()) ||
      food.seasonality === 'Year-round'
    );
  }

  // Get environmentally friendly foods
  getEcoFriendlyFoods(minScore: number = 70): FoodItem[] {
    return this.foods
      .filter(food => food.environmentalScore >= minScore)
      .sort((a, b) => b.environmentalScore - a.environmentalScore);
  }

  // Get foods by mood impact
  getFoodsForMood(moodType: 'energy' | 'focus' | 'mood', minScore: number = 70): FoodItem[] {
    return this.foods
      .filter(food => food.moodImpact && food.moodImpact[moodType] >= minScore)
      .sort((a, b) => (b.moodImpact?.[moodType] || 0) - (a.moodImpact?.[moodType] || 0));
  }

  // Find nearby stores (mock implementation)
  async findNearbyStores(latitude: number, longitude: number): Promise<NearbyStore[]> {
    // Mock data - in real app, this would use a maps API
    return [
      {
        id: 'store-1',
        name: 'Whole Foods Market',
        address: '123 Health St, Your City',
        distance: 0.5,
        type: 'Organic Grocery',
        rating: 4.5,
        priceLevel: 3,
        hasHealthyOptions: true
      },
      {
        id: 'store-2',
        name: 'Trader Joe\'s',
        address: '456 Fresh Ave, Your City',
        distance: 0.8,
        type: 'Specialty Grocery',
        rating: 4.3,
        priceLevel: 2,
        hasHealthyOptions: true
      },
      {
        id: 'store-3',
        name: 'Safeway',
        address: '789 Main St, Your City',
        distance: 1.2,
        type: 'Supermarket',
        rating: 3.8,
        priceLevel: 2,
        hasHealthyOptions: true
      }
    ];
  }

  // Get food recommendations based on health goals
  getRecommendationsForHealthGoals(goals: string[]): FoodItem[] {
    const recommendations: FoodItem[] = [];
    
    goals.forEach(goal => {
      switch (goal.toLowerCase()) {
        case 'weight loss':
          recommendations.push(...this.foods.filter(f => 
            f.nutrition.calories < 200 && f.nutrition.fiber >= 3
          ));
          break;
        case 'muscle gain':
          recommendations.push(...this.foods.filter(f => 
            f.nutrition.protein >= 15
          ));
          break;
        case 'heart health':
          recommendations.push(...this.foods.filter(f => 
            f.nutrition.sodium < 400 && f.nutrition.saturatedFat < 5
          ));
          break;
        case 'diabetes management':
          recommendations.push(...this.foods.filter(f => 
            f.nutrition.sugar < 10 && f.nutrition.fiber >= 3
          ));
          break;
      }
    });

    // Remove duplicates and sort by Vish Score
    const uniqueRecommendations = recommendations.filter((food, index, self) => 
      index === self.findIndex(f => f.id === food.id)
    );

    return uniqueRecommendations
      .sort((a, b) => b.vishScore - a.vishScore)
      .slice(0, 20);
  }
}

export const foodDatabaseService = FoodDatabaseService.getInstance();