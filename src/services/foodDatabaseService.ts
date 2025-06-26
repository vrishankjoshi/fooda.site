// Enhanced Food Database Service with API Integration
export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  category: string;
  barcode?: string;
  nutrition: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    saturatedFat: number;
    transFat: number;
    cholesterol: number;
    vitamins: { [key: string]: number };
    minerals: { [key: string]: number };
  };
  ingredients: string[];
  allergens: string[];
  servingSize: string;
  servingsPerContainer: number;
  healthScore: number;
  tasteScore: number;
  consumerScore: number;
  vishScore: number;
  imageUrl?: string;
  lastUpdated: string;
  source: 'api' | 'user' | 'database';
}

export interface FoodSearchResult {
  items: FoodItem[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface NutritionixFood {
  food_name: string;
  brand_name?: string;
  serving_qty: number;
  serving_unit: string;
  nf_calories: number;
  nf_total_fat: number;
  nf_saturated_fat: number;
  nf_cholesterol: number;
  nf_sodium: number;
  nf_total_carbohydrate: number;
  nf_dietary_fiber: number;
  nf_sugars: number;
  nf_protein: number;
  nf_potassium: number;
  nf_p: number;
  photo: {
    thumb: string;
    highres: string;
  };
}

export interface OpenFoodFactsProduct {
  product_name: string;
  brands: string;
  categories: string;
  ingredients_text: string;
  allergens: string;
  nutriments: {
    'energy-kcal_100g': number;
    'fat_100g': number;
    'saturated-fat_100g': number;
    'carbohydrates_100g': number;
    'sugars_100g': number;
    'fiber_100g': number;
    'proteins_100g': number;
    'salt_100g': number;
    'sodium_100g': number;
  };
  image_url: string;
  code: string;
  nutrition_grades: string;
}

class FoodDatabaseService {
  private static instance: FoodDatabaseService;
  private cache: Map<string, FoodItem> = new Map();
  private searchCache: Map<string, FoodSearchResult> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly NUTRITIONIX_APP_ID = import.meta.env.VITE_NUTRITIONIX_APP_ID;
  private readonly NUTRITIONIX_API_KEY = import.meta.env.VITE_NUTRITIONIX_API_KEY;

  static getInstance(): FoodDatabaseService {
    if (!FoodDatabaseService.instance) {
      FoodDatabaseService.instance = new FoodDatabaseService();
    }
    return FoodDatabaseService.instance;
  }

  constructor() {
    this.loadCacheFromStorage();
    this.initializeDefaultDatabase();
  }

  // Search foods from multiple sources
  async searchFoods(query: string, page: number = 1, limit: number = 20): Promise<FoodSearchResult> {
    const cacheKey = `search_${query}_${page}_${limit}`;
    
    // Check cache first
    if (this.searchCache.has(cacheKey)) {
      const cached = this.searchCache.get(cacheKey)!;
      if (this.isCacheValid(cached as any)) {
        return cached;
      }
    }

    try {
      // Search from multiple sources in parallel
      const [nutritionixResults, openFoodFactsResults, localResults] = await Promise.allSettled([
        this.searchNutritionix(query, limit),
        this.searchOpenFoodFacts(query, limit),
        this.searchLocalDatabase(query, page, limit)
      ]);

      // Combine results
      const allItems: FoodItem[] = [];
      
      // Add local results FIRST (prioritize our comprehensive Indian database)
      if (localResults.status === 'fulfilled') {
        allItems.push(...localResults.value.items);
      }
      
      // Add Nutritionix results
      if (nutritionixResults.status === 'fulfilled') {
        allItems.push(...nutritionixResults.value);
      }
      
      // Add OpenFoodFacts results
      if (openFoodFactsResults.status === 'fulfilled') {
        allItems.push(...openFoodFactsResults.value);
      }

      // Remove duplicates and sort by relevance
      const uniqueItems = this.removeDuplicates(allItems);
      const sortedItems = this.sortByRelevance(uniqueItems, query);
      
      // Paginate results
      const startIndex = (page - 1) * limit;
      const paginatedItems = sortedItems.slice(startIndex, startIndex + limit);

      const result: FoodSearchResult = {
        items: paginatedItems,
        total: sortedItems.length,
        page,
        hasMore: startIndex + limit < sortedItems.length
      };

      // Cache the result
      this.searchCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Error searching foods:', error);
      
      // Fallback to local database only
      return this.searchLocalDatabase(query, page, limit);
    }
  }

  // Search Nutritionix API
  private async searchNutritionix(query: string, limit: number): Promise<FoodItem[]> {
    if (!this.NUTRITIONIX_APP_ID || !this.NUTRITIONIX_API_KEY) {
      return [];
    }

    try {
      const response = await fetch('https://trackapi.nutritionix.com/v2/search/instant', {
        method: 'GET',
        headers: {
          'x-app-id': this.NUTRITIONIX_APP_ID,
          'x-app-key': this.NUTRITIONIX_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          limit
        })
      });

      if (!response.ok) {
        throw new Error(`Nutritionix API error: ${response.status}`);
      }

      const data = await response.json();
      const foods: FoodItem[] = [];

      // Process branded foods
      if (data.branded) {
        for (const item of data.branded.slice(0, limit)) {
          const foodItem = this.convertNutritionixToFoodItem(item);
          foods.push(foodItem);
          this.cache.set(foodItem.id, foodItem);
        }
      }

      return foods;
    } catch (error) {
      console.error('Nutritionix search error:', error);
      return [];
    }
  }

  // Search OpenFoodFacts API
  private async searchOpenFoodFacts(query: string, limit: number): Promise<FoodItem[]> {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${limit}`
      );

      if (!response.ok) {
        throw new Error(`OpenFoodFacts API error: ${response.status}`);
      }

      const data = await response.json();
      const foods: FoodItem[] = [];

      if (data.products) {
        for (const product of data.products.slice(0, limit)) {
          if (product.product_name && product.nutriments) {
            const foodItem = this.convertOpenFoodFactsToFoodItem(product);
            foods.push(foodItem);
            this.cache.set(foodItem.id, foodItem);
          }
        }
      }

      return foods;
    } catch (error) {
      console.error('OpenFoodFacts search error:', error);
      return [];
    }
  }

  // Search local database - ENHANCED FOR INDIAN FOODS
  private async searchLocalDatabase(query: string, page: number, limit: number): Promise<FoodSearchResult> {
    // Get ALL foods from cache (includes our comprehensive Indian database)
    const allCachedFoods = Array.from(this.cache.values());
    const lowercaseQuery = query.toLowerCase();
    
    // Enhanced search that includes multiple search terms and aliases
    const searchTerms = [
      lowercaseQuery,
      // Add common aliases for Indian foods
      ...(lowercaseQuery === 'atta' ? ['wheat flour', 'whole wheat'] : []),
      ...(lowercaseQuery === 'besan' ? ['chickpea flour', 'gram flour'] : []),
      ...(lowercaseQuery === 'frooti' ? ['mango drink', 'mango juice'] : []),
      ...(lowercaseQuery === 'ragi' ? ['finger millet'] : []),
      ...(lowercaseQuery === 'jowar' ? ['sorghum'] : []),
      ...(lowercaseQuery.includes('flour') ? ['atta', 'besan', 'ragi', 'jowar'] : []),
      ...(lowercaseQuery.includes('indian') ? ['atta', 'besan', 'frooti', 'lassi', 'rajma', 'chole', 'parle', 'haldiram'] : [])
    ];
    
    const filteredFoods = allCachedFoods.filter(food => {
      // Check if any search term matches
      return searchTerms.some(term => 
        food.name.toLowerCase().includes(term) ||
        food.brand?.toLowerCase().includes(term) ||
        food.category.toLowerCase().includes(term) ||
        food.ingredients.some(ingredient => ingredient.toLowerCase().includes(term)) ||
        food.id.toLowerCase().includes(term)
      );
    });

    // Sort by relevance - prioritize exact matches and Indian foods
    const sortedFoods = filteredFoods.sort((a, b) => {
      const aIsIndian = a.category.toLowerCase().includes('indian') || 
                       ['atta', 'besan', 'frooti', 'lassi', 'rajma', 'chole', 'parle', 'haldiram', 'bikaji', 'amul'].some(brand => 
                         a.brand?.toLowerCase().includes(brand) || a.name.toLowerCase().includes(brand)
                       );
      const bIsIndian = b.category.toLowerCase().includes('indian') || 
                       ['atta', 'besan', 'frooti', 'lassi', 'rajma', 'chole', 'parle', 'haldiram', 'bikaji', 'amul'].some(brand => 
                         b.brand?.toLowerCase().includes(brand) || b.name.toLowerCase().includes(brand)
                       );
      
      // Prioritize Indian foods for Indian-related searches
      if (lowercaseQuery.includes('indian') || ['atta', 'besan', 'frooti', 'ragi', 'jowar'].includes(lowercaseQuery)) {
        if (aIsIndian && !bIsIndian) return -1;
        if (!aIsIndian && bIsIndian) return 1;
      }
      
      // Then sort by exact name matches
      const aExactMatch = a.name.toLowerCase().includes(lowercaseQuery);
      const bExactMatch = b.name.toLowerCase().includes(lowercaseQuery);
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // Finally sort by Vish score
      return b.vishScore - a.vishScore;
    });

    const startIndex = (page - 1) * limit;
    const paginatedFoods = sortedFoods.slice(startIndex, startIndex + limit);

    return {
      items: paginatedFoods,
      total: sortedFoods.length,
      page,
      hasMore: startIndex + limit < sortedFoods.length
    };
  }

  // Get food by barcode
  async getFoodByBarcode(barcode: string): Promise<FoodItem | null> {
    // Check cache first
    const cached = Array.from(this.cache.values()).find(food => food.barcode === barcode);
    if (cached && this.isCacheValid(cached as any)) {
      return cached;
    }

    try {
      // Try OpenFoodFacts first (better barcode support)
      const openFoodFactsResult = await this.getFromOpenFoodFactsByBarcode(barcode);
      if (openFoodFactsResult) {
        this.cache.set(openFoodFactsResult.id, openFoodFactsResult);
        return openFoodFactsResult;
      }

      // Try Nutritionix
      const nutritionixResult = await this.getFromNutritionixByBarcode(barcode);
      if (nutritionixResult) {
        this.cache.set(nutritionixResult.id, nutritionixResult);
        return nutritionixResult;
      }

      return null;
    } catch (error) {
      console.error('Error getting food by barcode:', error);
      return null;
    }
  }

  // Get food by barcode from OpenFoodFacts
  private async getFromOpenFoodFactsByBarcode(barcode: string): Promise<FoodItem | null> {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        return this.convertOpenFoodFactsToFoodItem(data.product);
      }

      return null;
    } catch (error) {
      console.error('OpenFoodFacts barcode lookup error:', error);
      return null;
    }
  }

  // Get food by barcode from Nutritionix
  private async getFromNutritionixByBarcode(barcode: string): Promise<FoodItem | null> {
    if (!this.NUTRITIONIX_APP_ID || !this.NUTRITIONIX_API_KEY) {
      return null;
    }

    try {
      const response = await fetch('https://trackapi.nutritionix.com/v2/search/item', {
        method: 'GET',
        headers: {
          'x-app-id': this.NUTRITIONIX_APP_ID,
          'x-app-key': this.NUTRITIONIX_API_KEY,
        },
        body: JSON.stringify({
          upc: barcode
        })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (data.foods && data.foods.length > 0) {
        return this.convertNutritionixToFoodItem(data.foods[0]);
      }

      return null;
    } catch (error) {
      console.error('Nutritionix barcode lookup error:', error);
      return null;
    }
  }

  // Convert Nutritionix data to FoodItem
  private convertNutritionixToFoodItem(nutritionixFood: NutritionixFood): FoodItem {
    const healthScore = this.calculateHealthScore({
      calories: nutritionixFood.nf_calories,
      protein: nutritionixFood.nf_protein,
      fiber: nutritionixFood.nf_dietary_fiber,
      sugar: nutritionixFood.nf_sugars,
      sodium: nutritionixFood.nf_sodium,
      saturatedFat: nutritionixFood.nf_saturated_fat
    });

    const tasteScore = this.calculateTasteScore({
      sugar: nutritionixFood.nf_sugars,
      fat: nutritionixFood.nf_total_fat,
      sodium: nutritionixFood.nf_sodium
    });

    const consumerScore = this.calculateConsumerScore(nutritionixFood.brand_name || '');
    const vishScore = Math.round((healthScore + tasteScore + consumerScore) / 3);

    return {
      id: `nutritionix_${nutritionixFood.food_name.replace(/\s+/g, '_').toLowerCase()}`,
      name: nutritionixFood.food_name,
      brand: nutritionixFood.brand_name,
      category: 'Packaged Food',
      nutrition: {
        calories: nutritionixFood.nf_calories,
        protein: nutritionixFood.nf_protein,
        carbohydrates: nutritionixFood.nf_total_carbohydrate,
        fat: nutritionixFood.nf_total_fat,
        fiber: nutritionixFood.nf_dietary_fiber,
        sugar: nutritionixFood.nf_sugars,
        sodium: nutritionixFood.nf_sodium,
        saturatedFat: nutritionixFood.nf_saturated_fat,
        transFat: 0,
        cholesterol: nutritionixFood.nf_cholesterol,
        vitamins: {},
        minerals: {
          potassium: nutritionixFood.nf_potassium,
          phosphorus: nutritionixFood.nf_p
        }
      },
      ingredients: [],
      allergens: [],
      servingSize: `${nutritionixFood.serving_qty} ${nutritionixFood.serving_unit}`,
      servingsPerContainer: 1,
      healthScore,
      tasteScore,
      consumerScore,
      vishScore,
      imageUrl: nutritionixFood.photo?.thumb,
      lastUpdated: new Date().toISOString(),
      source: 'api'
    };
  }

  // Convert OpenFoodFacts data to FoodItem
  private convertOpenFoodFactsToFoodItem(product: OpenFoodFactsProduct): FoodItem {
    const nutrition = product.nutriments || {};
    
    const healthScore = this.calculateHealthScore({
      calories: nutrition['energy-kcal_100g'] || 0,
      protein: nutrition['proteins_100g'] || 0,
      fiber: nutrition['fiber_100g'] || 0,
      sugar: nutrition['sugars_100g'] || 0,
      sodium: nutrition['sodium_100g'] || 0,
      saturatedFat: nutrition['saturated-fat_100g'] || 0
    });

    const tasteScore = this.calculateTasteScore({
      sugar: nutrition['sugars_100g'] || 0,
      fat: nutrition['fat_100g'] || 0,
      sodium: nutrition['sodium_100g'] || 0
    });

    const consumerScore = this.calculateConsumerScore(product.brands || '');
    const vishScore = Math.round((healthScore + tasteScore + consumerScore) / 3);

    return {
      id: `openfoodfacts_${product.code || Date.now()}`,
      name: product.product_name,
      brand: product.brands,
      category: product.categories?.split(',')[0] || 'Food',
      barcode: product.code,
      nutrition: {
        calories: nutrition['energy-kcal_100g'] || 0,
        protein: nutrition['proteins_100g'] || 0,
        carbohydrates: nutrition['carbohydrates_100g'] || 0,
        fat: nutrition['fat_100g'] || 0,
        fiber: nutrition['fiber_100g'] || 0,
        sugar: nutrition['sugars_100g'] || 0,
        sodium: nutrition['sodium_100g'] || 0,
        saturatedFat: nutrition['saturated-fat_100g'] || 0,
        transFat: 0,
        cholesterol: 0,
        vitamins: {},
        minerals: {}
      },
      ingredients: product.ingredients_text ? product.ingredients_text.split(',').map(i => i.trim()) : [],
      allergens: product.allergens ? product.allergens.split(',').map(a => a.trim()) : [],
      servingSize: '100g',
      servingsPerContainer: 1,
      healthScore,
      tasteScore,
      consumerScore,
      vishScore,
      imageUrl: product.image_url,
      lastUpdated: new Date().toISOString(),
      source: 'api'
    };
  }

  // Calculate health score based on nutrition
  private calculateHealthScore(nutrition: {
    calories: number;
    protein: number;
    fiber: number;
    sugar: number;
    sodium: number;
    saturatedFat: number;
  }): number {
    let score = 50; // Base score

    // Positive factors
    if (nutrition.protein > 10) score += 15;
    else if (nutrition.protein > 5) score += 10;
    
    if (nutrition.fiber > 5) score += 15;
    else if (nutrition.fiber > 3) score += 10;

    // Negative factors
    if (nutrition.sugar > 20) score -= 20;
    else if (nutrition.sugar > 10) score -= 10;
    
    if (nutrition.sodium > 600) score -= 20;
    else if (nutrition.sodium > 300) score -= 10;
    
    if (nutrition.saturatedFat > 10) score -= 15;
    else if (nutrition.saturatedFat > 5) score -= 10;

    if (nutrition.calories > 400) score -= 10;
    else if (nutrition.calories < 100) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  // Calculate taste score based on components
  private calculateTasteScore(nutrition: {
    sugar: number;
    fat: number;
    sodium: number;
  }): number {
    let score = 50; // Base score

    // Sweet taste (moderate sugar is good for taste)
    if (nutrition.sugar > 5 && nutrition.sugar < 15) score += 15;
    else if (nutrition.sugar > 15) score += 10; // Too sweet
    
    // Fat content (adds richness)
    if (nutrition.fat > 5 && nutrition.fat < 20) score += 15;
    else if (nutrition.fat > 20) score += 5; // Too fatty
    
    // Sodium (enhances flavor in moderation)
    if (nutrition.sodium > 100 && nutrition.sodium < 400) score += 10;
    else if (nutrition.sodium > 400) score -= 5; // Too salty

    return Math.max(0, Math.min(100, score));
  }

  // Calculate consumer score based on brand recognition
  private calculateConsumerScore(brand: string): number {
    const popularBrands = [
      'coca-cola', 'pepsi', 'nestle', 'unilever', 'kraft', 'general mills',
      'kellogg', 'mars', 'ferrero', 'mondelez', 'danone', 'campbell',
      'heinz', 'oreo', 'lay\'s', 'doritos', 'cheetos', 'pringles',
      'parle', 'britannia', 'amul', 'haldiram', 'bikaji', 'iffco', 'patanjali'
    ];

    const brandLower = brand.toLowerCase();
    const isPopular = popularBrands.some(popular => brandLower.includes(popular));
    
    // Popular brands get higher consumer scores (people know and buy them)
    return isPopular ? Math.floor(Math.random() * 20) + 70 : Math.floor(Math.random() * 30) + 40;
  }

  // Remove duplicate foods
  private removeDuplicates(foods: FoodItem[]): FoodItem[] {
    const seen = new Set<string>();
    return foods.filter(food => {
      const key = `${food.name.toLowerCase()}_${food.brand?.toLowerCase() || ''}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Sort foods by relevance to query
  private sortByRelevance(foods: FoodItem[], query: string): FoodItem[] {
    const queryLower = query.toLowerCase();
    
    return foods.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(queryLower);
      const bNameMatch = b.name.toLowerCase().includes(queryLower);
      
      const aBrandMatch = a.brand?.toLowerCase().includes(queryLower) || false;
      const bBrandMatch = b.brand?.toLowerCase().includes(queryLower) || false;
      
      // Prioritize exact name matches, then brand matches, then Vish score
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      if (aBrandMatch && !bBrandMatch) return -1;
      if (!aBrandMatch && bBrandMatch) return 1;
      
      return b.vishScore - a.vishScore;
    });
  }

  // Check if cache is valid
  private isCacheValid(item: { lastUpdated: string }): boolean {
    const lastUpdated = new Date(item.lastUpdated);
    const now = new Date();
    return (now.getTime() - lastUpdated.getTime()) < this.CACHE_DURATION;
  }

  // Load cache from localStorage
  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem('foodcheck_food_cache');
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(data.cache || []);
        this.searchCache = new Map(data.searchCache || []);
      }
    } catch (error) {
      console.error('Error loading food cache:', error);
    }
  }

  // Save cache to localStorage
  private saveCacheToStorage(): void {
    try {
      const data = {
        cache: Array.from(this.cache.entries()),
        searchCache: Array.from(this.searchCache.entries()),
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('foodcheck_food_cache', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving food cache:', error);
    }
  }

  // Get local foods (fallback database) - NOW WITH COMPREHENSIVE INDIAN FOODS
  private getLocalFoods(): FoodItem[] {
    return [
      // Original foods
      {
        id: 'local_organic_granola_bar',
        name: 'Organic Granola Bar',
        brand: 'Nature Valley',
        category: 'Snack Bars',
        nutrition: {
          calories: 190,
          protein: 4,
          carbohydrates: 29,
          fat: 7,
          fiber: 3,
          sugar: 11,
          sodium: 160,
          saturatedFat: 1,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin E': 2.5 },
          minerals: { iron: 1.8 }
        },
        ingredients: ['Whole grain oats', 'Sugar', 'Canola oil', 'Rice flour', 'Honey'],
        allergens: ['May contain nuts', 'Contains gluten'],
        servingSize: '1 bar (42g)',
        servingsPerContainer: 6,
        healthScore: 75,
        tasteScore: 80,
        consumerScore: 85,
        vishScore: 80,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'local_greek_yogurt',
        name: 'Greek Yogurt Plain',
        brand: 'Chobani',
        category: 'Dairy',
        nutrition: {
          calories: 100,
          protein: 18,
          carbohydrates: 6,
          fat: 0,
          fiber: 0,
          sugar: 4,
          sodium: 65,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 10,
          vitamins: { 'Vitamin B12': 1.1 },
          minerals: { calcium: 200 }
        },
        ingredients: ['Cultured pasteurized nonfat milk', 'Live and active cultures'],
        allergens: ['Contains milk'],
        servingSize: '1 container (170g)',
        servingsPerContainer: 1,
        healthScore: 95,
        tasteScore: 70,
        consumerScore: 90,
        vishScore: 85,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'local_potato_chips',
        name: 'Classic Potato Chips',
        brand: 'Lay\'s',
        category: 'Snacks',
        nutrition: {
          calories: 160,
          protein: 2,
          carbohydrates: 15,
          fat: 10,
          fiber: 1,
          sugar: 0,
          sodium: 170,
          saturatedFat: 1.5,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin C': 9.6 },
          minerals: { potassium: 350 }
        },
        ingredients: ['Potatoes', 'Vegetable oil', 'Salt'],
        allergens: [],
        servingSize: '1 oz (28g)',
        servingsPerContainer: 5,
        healthScore: 25,
        tasteScore: 85,
        consumerScore: 80,
        vishScore: 63,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // COMPREHENSIVE INDIAN FOODS SECTION

      // INDIAN FLOURS & GRAINS
      {
        id: 'indian_wheat_atta',
        name: 'Whole Wheat Atta Flour',
        brand: 'Aashirvaad',
        category: 'Indian Flour & Grains',
        nutrition: {
          calories: 340,
          protein: 12,
          carbohydrates: 72,
          fat: 1.5,
          fiber: 12,
          sugar: 2,
          sodium: 2,
          saturatedFat: 0.3,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin B1': 0.4, 'Vitamin B3': 5.1, 'Folate': 44 },
          minerals: { iron: 3.6, magnesium: 126, phosphorus: 288, zinc: 2.6 }
        },
        ingredients: ['100% Whole wheat flour'],
        allergens: ['Contains gluten'],
        servingSize: '100g',
        servingsPerContainer: 50,
        healthScore: 88,
        tasteScore: 75,
        consumerScore: 92,
        vishScore: 85,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'indian_besan_flour',
        name: 'Besan (Chickpea Flour)',
        brand: 'Everest',
        category: 'Indian Flour & Grains',
        nutrition: {
          calories: 387,
          protein: 22,
          carbohydrates: 57,
          fat: 6,
          fiber: 11,
          sugar: 11,
          sodium: 64,
          saturatedFat: 1.4,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin B6': 0.5, 'Folate': 557 },
          minerals: { iron: 4.9, magnesium: 166, phosphorus: 318, potassium: 846 }
        },
        ingredients: ['100% Ground chickpeas'],
        allergens: ['May contain traces of nuts'],
        servingSize: '100g',
        servingsPerContainer: 10,
        healthScore: 92,
        tasteScore: 78,
        consumerScore: 85,
        vishScore: 85,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'indian_rice_flour',
        name: 'Rice Flour',
        brand: '24 Mantra Organic',
        category: 'Indian Flour & Grains',
        nutrition: {
          calories: 366,
          protein: 6,
          carbohydrates: 80,
          fat: 1.4,
          fiber: 2.4,
          sugar: 0.1,
          sodium: 1,
          saturatedFat: 0.4,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin B3': 1.6 },
          minerals: { iron: 0.8, magnesium: 35, phosphorus: 98 }
        },
        ingredients: ['100% Ground rice'],
        allergens: ['Gluten-free'],
        servingSize: '100g',
        servingsPerContainer: 10,
        healthScore: 75,
        tasteScore: 70,
        consumerScore: 80,
        vishScore: 75,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'indian_ragi_flour',
        name: 'Ragi Flour (Finger Millet)',
        brand: 'Organic India',
        category: 'Indian Flour & Grains',
        nutrition: {
          calories: 328,
          protein: 7.3,
          carbohydrates: 72,
          fat: 1.3,
          fiber: 3.6,
          sugar: 0.6,
          sodium: 11,
          saturatedFat: 0.2,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin B1': 0.4, 'Vitamin B3': 1.1 },
          minerals: { calcium: 344, iron: 3.9, magnesium: 137, phosphorus: 283 }
        },
        ingredients: ['100% Finger millet flour'],
        allergens: ['Gluten-free'],
        servingSize: '100g',
        servingsPerContainer: 5,
        healthScore: 90,
        tasteScore: 72,
        consumerScore: 78,
        vishScore: 80,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'indian_jowar_flour',
        name: 'Jowar Flour (Sorghum)',
        brand: 'Patanjali',
        category: 'Indian Flour & Grains',
        nutrition: {
          calories: 329,
          protein: 10.4,
          carbohydrates: 70.7,
          fat: 1.9,
          fiber: 9.7,
          sugar: 2.5,
          sodium: 2,
          saturatedFat: 0.6,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin B1': 0.2, 'Vitamin B3': 2.9 },
          minerals: { iron: 9.9, magnesium: 171, phosphorus: 222, potassium: 130 }
        },
        ingredients: ['100% Sorghum flour'],
        allergens: ['Gluten-free'],
        servingSize: '100g',
        servingsPerContainer: 10,
        healthScore: 88,
        tasteScore: 74,
        consumerScore: 76,
        vishScore: 79,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // INDIAN BEVERAGES
      {
        id: 'indian_frooti_mango',
        name: 'Frooti Mango Drink',
        brand: 'Parle Agro',
        category: 'Indian Beverages',
        nutrition: {
          calories: 60,
          protein: 0,
          carbohydrates: 15,
          fat: 0,
          fiber: 0,
          sugar: 14,
          sodium: 10,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin C': 30 },
          minerals: {}
        },
        ingredients: ['Water', 'Sugar', 'Mango pulp (8%)', 'Acidity regulator (330)', 'Natural identical flavoring substances', 'Vitamin C', 'Preservative (211)', 'Antioxidant (300)'],
        allergens: [],
        servingSize: '200ml',
        servingsPerContainer: 1,
        healthScore: 35,
        tasteScore: 88,
        consumerScore: 92,
        vishScore: 72,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'indian_lassi_sweet',
        name: 'Sweet Lassi',
        brand: 'Amul',
        category: 'Indian Beverages',
        nutrition: {
          calories: 89,
          protein: 3.1,
          carbohydrates: 13.8,
          fat: 2.5,
          fiber: 0,
          sugar: 13.8,
          sodium: 46,
          saturatedFat: 1.6,
          transFat: 0,
          cholesterol: 10,
          vitamins: { 'Vitamin B12': 0.4, 'Riboflavin': 0.2 },
          minerals: { calcium: 120, phosphorus: 95 }
        },
        ingredients: ['Cultured buttermilk', 'Sugar', 'Stabilizer (412)', 'Natural flavoring'],
        allergens: ['Contains milk'],
        servingSize: '200ml',
        servingsPerContainer: 1,
        healthScore: 65,
        tasteScore: 85,
        consumerScore: 88,
        vishScore: 79,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'indian_nimbu_paani',
        name: 'Nimbu Paani (Lemon Water)',
        brand: 'Real',
        category: 'Indian Beverages',
        nutrition: {
          calories: 45,
          protein: 0.1,
          carbohydrates: 11.2,
          fat: 0,
          fiber: 0.1,
          sugar: 10.8,
          sodium: 15,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin C': 25 },
          minerals: { potassium: 80 }
        },
        ingredients: ['Water', 'Sugar', 'Lemon juice (5%)', 'Salt', 'Acidity regulator (330)', 'Natural lemon flavor', 'Preservative (211)'],
        allergens: [],
        servingSize: '200ml',
        servingsPerContainer: 1,
        healthScore: 55,
        tasteScore: 82,
        consumerScore: 78,
        vishScore: 72,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // INDIAN SNACKS
      {
        id: 'indian_namkeen_mixture',
        name: 'Namkeen Mixture',
        brand: 'Haldiram\'s',
        category: 'Indian Snacks',
        nutrition: {
          calories: 520,
          protein: 15,
          carbohydrates: 45,
          fat: 32,
          fiber: 8,
          sugar: 3,
          sodium: 850,
          saturatedFat: 8,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin E': 2.5 },
          minerals: { iron: 4.2, magnesium: 85 }
        },
        ingredients: ['Gram flour noodles', 'Peanuts', 'Green peas', 'Curry leaves', 'Vegetable oil', 'Salt', 'Spices', 'Turmeric'],
        allergens: ['Contains nuts', 'May contain sesame'],
        servingSize: '30g',
        servingsPerContainer: 10,
        healthScore: 45,
        tasteScore: 92,
        consumerScore: 90,
        vishScore: 76,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'indian_bhujia_sev',
        name: 'Aloo Bhujia',
        brand: 'Bikaji',
        category: 'Indian Snacks',
        nutrition: {
          calories: 545,
          protein: 12,
          carbohydrates: 42,
          fat: 36,
          fiber: 6,
          sugar: 2,
          sodium: 920,
          saturatedFat: 9,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin A': 15 },
          minerals: { iron: 3.8, potassium: 280 }
        },
        ingredients: ['Gram flour', 'Potato flakes', 'Vegetable oil', 'Salt', 'Red chili powder', 'Turmeric', 'Asafoetida', 'Spices'],
        allergens: ['May contain nuts'],
        servingSize: '25g',
        servingsPerContainer: 8,
        healthScore: 38,
        tasteScore: 90,
        consumerScore: 88,
        vishScore: 72,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'indian_khakhra_methi',
        name: 'Methi Khakhra',
        brand: 'Lijjat',
        category: 'Indian Snacks',
        nutrition: {
          calories: 380,
          protein: 14,
          carbohydrates: 65,
          fat: 8,
          fiber: 12,
          sugar: 2,
          sodium: 650,
          saturatedFat: 2,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin B1': 0.3, 'Folate': 25 },
          minerals: { iron: 6.2, calcium: 180, magnesium: 95 }
        },
        ingredients: ['Whole wheat flour', 'Fenugreek leaves', 'Vegetable oil', 'Salt', 'Turmeric', 'Red chili powder', 'Cumin'],
        allergens: ['Contains gluten'],
        servingSize: '20g (1 piece)',
        servingsPerContainer: 10,
        healthScore: 78,
        tasteScore: 85,
        consumerScore: 82,
        vishScore: 82,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // INDIAN SWEETS & DESSERTS
      {
        id: 'indian_gulab_jamun',
        name: 'Gulab Jamun',
        brand: 'Haldiram\'s',
        category: 'Indian Sweets',
        nutrition: {
          calories: 387,
          protein: 6,
          carbohydrates: 52,
          fat: 18,
          fiber: 1,
          sugar: 48,
          sodium: 45,
          saturatedFat: 11,
          transFat: 0,
          cholesterol: 25,
          vitamins: { 'Vitamin A': 8 },
          minerals: { calcium: 150, phosphorus: 120 }
        },
        ingredients: ['Milk solids', 'Sugar', 'Refined flour', 'Ghee', 'Cardamom', 'Rose water', 'Vegetable oil'],
        allergens: ['Contains milk', 'Contains gluten'],
        servingSize: '50g (2 pieces)',
        servingsPerContainer: 4,
        healthScore: 25,
        tasteScore: 95,
        consumerScore: 92,
        vishScore: 71,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'indian_rasgulla',
        name: 'Rasgulla',
        brand: 'Bengali Sweet House',
        category: 'Indian Sweets',
        nutrition: {
          calories: 186,
          protein: 4,
          carbohydrates: 32,
          fat: 4,
          fiber: 0,
          sugar: 30,
          sodium: 25,
          saturatedFat: 2.5,
          transFat: 0,
          cholesterol: 15,
          vitamins: { 'Vitamin B12': 0.2 },
          minerals: { calcium: 120, phosphorus: 95 }
        },
        ingredients: ['Cottage cheese', 'Sugar', 'Water', 'Cardamom', 'Rose water'],
        allergens: ['Contains milk'],
        servingSize: '50g (2 pieces)',
        servingsPerContainer: 4,
        healthScore: 35,
        tasteScore: 88,
        consumerScore: 85,
        vishScore: 69,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // INDIAN READY-TO-EAT
      {
        id: 'indian_rajma_ready',
        name: 'Ready to Eat Rajma',
        brand: 'MTR',
        category: 'Indian Ready-to-Eat',
        nutrition: {
          calories: 142,
          protein: 8,
          carbohydrates: 22,
          fat: 3,
          fiber: 6,
          sugar: 4,
          sodium: 580,
          saturatedFat: 0.8,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin C': 5, 'Folate': 45 },
          minerals: { iron: 2.8, potassium: 350, magnesium: 65 }
        },
        ingredients: ['Red kidney beans', 'Water', 'Onions', 'Tomatoes', 'Vegetable oil', 'Ginger-garlic paste', 'Spices', 'Salt'],
        allergens: [],
        servingSize: '300g (1 pack)',
        servingsPerContainer: 1,
        healthScore: 82,
        tasteScore: 85,
        consumerScore: 88,
        vishScore: 85,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'indian_chole_ready',
        name: 'Ready to Eat Chole',
        brand: 'ITC Aashirvaad',
        category: 'Indian Ready-to-Eat',
        nutrition: {
          calories: 156,
          protein: 9,
          carbohydrates: 24,
          fat: 4,
          fiber: 7,
          sugar: 5,
          sodium: 620,
          saturatedFat: 1,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin B6': 0.3, 'Folate': 55 },
          minerals: { iron: 3.2, potassium: 380, magnesium: 75 }
        },
        ingredients: ['Chickpeas', 'Water', 'Onions', 'Tomatoes', 'Vegetable oil', 'Ginger-garlic paste', 'Spices', 'Salt'],
        allergens: [],
        servingSize: '300g (1 pack)',
        servingsPerContainer: 1,
        healthScore: 85,
        tasteScore: 88,
        consumerScore: 90,
        vishScore: 88,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // INDIAN BISCUITS & COOKIES
      {
        id: 'indian_parle_g_biscuit',
        name: 'Parle-G Glucose Biscuits',
        brand: 'Parle',
        category: 'Indian Biscuits',
        nutrition: {
          calories: 456,
          protein: 7,
          carbohydrates: 75,
          fat: 14,
          fiber: 2,
          sugar: 22,
          sodium: 350,
          saturatedFat: 6,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin B1': 0.2, 'Iron': 12 },
          minerals: { calcium: 50, iron: 12 }
        },
        ingredients: ['Wheat flour', 'Sugar', 'Edible vegetable oil', 'Invert syrup', 'Baking powder', 'Salt', 'Milk solids', 'Emulsifiers'],
        allergens: ['Contains gluten', 'Contains milk'],
        servingSize: '25g (4-5 biscuits)',
        servingsPerContainer: 20,
        healthScore: 45,
        tasteScore: 85,
        consumerScore: 95,
        vishScore: 75,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'indian_marie_biscuit',
        name: 'Marie Gold Biscuits',
        brand: 'Britannia',
        category: 'Indian Biscuits',
        nutrition: {
          calories: 443,
          protein: 8,
          carbohydrates: 70,
          fat: 15,
          fiber: 3,
          sugar: 18,
          sodium: 420,
          saturatedFat: 7,
          transFat: 0,
          cholesterol: 5,
          vitamins: { 'Vitamin B1': 0.3, 'Iron': 10 },
          minerals: { calcium: 80, iron: 10 }
        },
        ingredients: ['Wheat flour', 'Sugar', 'Edible vegetable oil', 'Milk solids', 'Salt', 'Baking powder', 'Emulsifiers', 'Dough conditioner'],
        allergens: ['Contains gluten', 'Contains milk'],
        servingSize: '20g (3-4 biscuits)',
        servingsPerContainer: 25,
        healthScore: 48,
        tasteScore: 80,
        consumerScore: 88,
        vishScore: 72,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // INDIAN SPICES & CONDIMENTS
      {
        id: 'indian_pickle_mango',
        name: 'Mango Pickle (Aam ka Achaar)',
        brand: 'Priya',
        category: 'Indian Condiments',
        nutrition: {
          calories: 165,
          protein: 2,
          carbohydrates: 8,
          fat: 15,
          fiber: 3,
          sugar: 5,
          sodium: 1200,
          saturatedFat: 2,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin A': 20, 'Vitamin C': 15 },
          minerals: { iron: 1.5, potassium: 180 }
        },
        ingredients: ['Raw mango', 'Mustard oil', 'Salt', 'Red chili powder', 'Turmeric', 'Fenugreek seeds', 'Mustard seeds', 'Asafoetida'],
        allergens: ['Contains mustard'],
        servingSize: '15g (1 tablespoon)',
        servingsPerContainer: 33,
        healthScore: 55,
        tasteScore: 92,
        consumerScore: 88,
        vishScore: 78,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'indian_chutney_mint',
        name: 'Mint Chutney',
        brand: 'Kissan',
        category: 'Indian Condiments',
        nutrition: {
          calories: 85,
          protein: 1.5,
          carbohydrates: 18,
          fat: 1,
          fiber: 2,
          sugar: 15,
          sodium: 450,
          saturatedFat: 0.2,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin C': 25, 'Vitamin A': 10 },
          minerals: { iron: 1.2, potassium: 120 }
        },
        ingredients: ['Mint leaves', 'Sugar', 'Water', 'Green chilies', 'Ginger', 'Salt', 'Acetic acid', 'Preservatives'],
        allergens: [],
        servingSize: '20g (1 tablespoon)',
        servingsPerContainer: 25,
        healthScore: 62,
        tasteScore: 88,
        consumerScore: 82,
        vishScore: 77,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      }
    ];
  }

  // Initialize default database - ENHANCED TO ENSURE ALL FOODS ARE CACHED
  private initializeDefaultDatabase(): void {
    const localFoods = this.getLocalFoods();
    console.log(`🇮🇳 Initializing database with ${localFoods.length} foods including comprehensive Indian foods...`);
    
    localFoods.forEach(food => {
      this.cache.set(food.id, food);
      console.log(`✅ Added to cache: ${food.name} (${food.brand}) - Category: ${food.category}`);
    });
    
    this.saveCacheToStorage();
    console.log(`🎉 Database initialized! Total foods in cache: ${this.cache.size}`);
    
    // Log Indian foods specifically
    const indianFoods = localFoods.filter(food => food.category.toLowerCase().includes('indian'));
    console.log(`🇮🇳 Indian foods added: ${indianFoods.length}`);
    indianFoods.forEach(food => {
      console.log(`  - ${food.name} (${food.brand})`);
    });
  }

  // Add custom food item
  addCustomFood(food: Omit<FoodItem, 'id' | 'lastUpdated' | 'source'>): FoodItem {
    const customFood: FoodItem = {
      ...food,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date().toISOString(),
      source: 'user'
    };

    this.cache.set(customFood.id, customFood);
    this.saveCacheToStorage();
    
    return customFood;
  }

  // Get food by ID
  getFoodById(id: string): FoodItem | null {
    return this.cache.get(id) || null;
  }

  // Get popular foods
  getPopularFoods(limit: number = 10): FoodItem[] {
    const foods = Array.from(this.cache.values());
    return foods
      .sort((a, b) => b.consumerScore - a.consumerScore)
      .slice(0, limit);
  }

  // Get healthy foods
  getHealthyFoods(limit: number = 10): FoodItem[] {
    const foods = Array.from(this.cache.values());
    return foods
      .filter(food => food.healthScore >= 70)
      .sort((a, b) => b.healthScore - a.healthScore)
      .slice(0, limit);
  }

  // Get Indian foods specifically
  getIndianFoods(limit: number = 20): FoodItem[] {
    const foods = Array.from(this.cache.values());
    return foods
      .filter(food => 
        food.category.toLowerCase().includes('indian') ||
        ['atta', 'besan', 'frooti', 'lassi', 'rajma', 'chole', 'parle', 'haldiram', 'bikaji', 'amul'].some(brand => 
          food.brand?.toLowerCase().includes(brand) || food.name.toLowerCase().includes(brand)
        )
      )
      .sort((a, b) => b.vishScore - a.vishScore)
      .slice(0, limit);
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    this.searchCache.clear();
    localStorage.removeItem('foodcheck_food_cache');
    this.initializeDefaultDatabase();
  }

  // Get cache statistics
  getCacheStats(): {
    totalFoods: number;
    apiSources: number;
    userSources: number;
    databaseSources: number;
    indianFoods: number;
    cacheSize: string;
  } {
    const foods = Array.from(this.cache.values());
    const apiSources = foods.filter(f => f.source === 'api').length;
    const userSources = foods.filter(f => f.source === 'user').length;
    const databaseSources = foods.filter(f => f.source === 'database').length;
    const indianFoods = foods.filter(f => 
      f.category.toLowerCase().includes('indian') ||
      ['atta', 'besan', 'frooti', 'lassi', 'rajma', 'chole', 'parle', 'haldiram', 'bikaji', 'amul'].some(brand => 
        f.brand?.toLowerCase().includes(brand) || f.name.toLowerCase().includes(brand)
      )
    ).length;
    
    const cacheData = localStorage.getItem('foodcheck_food_cache');
    const cacheSize = cacheData ? `${(cacheData.length / 1024).toFixed(2)} KB` : '0 KB';

    return {
      totalFoods: foods.length,
      apiSources,
      userSources,
      databaseSources,
      indianFoods,
      cacheSize
    };
  }
}

// Export singleton instance
export const foodDatabaseService = FoodDatabaseService.getInstance();