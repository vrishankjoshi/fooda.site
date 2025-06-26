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
      
      // Add Nutritionix results
      if (nutritionixResults.status === 'fulfilled') {
        allItems.push(...nutritionixResults.value);
      }
      
      // Add OpenFoodFacts results
      if (openFoodFactsResults.status === 'fulfilled') {
        allItems.push(...openFoodFactsResults.value);
      }
      
      // Add local results
      if (localResults.status === 'fulfilled') {
        allItems.push(...localResults.value.items);
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

  // Search local database
  private async searchLocalDatabase(query: string, page: number, limit: number): Promise<FoodSearchResult> {
    const localFoods = this.getLocalFoods();
    const lowercaseQuery = query.toLowerCase();
    
    const filteredFoods = localFoods.filter(food =>
      food.name.toLowerCase().includes(lowercaseQuery) ||
      food.brand?.toLowerCase().includes(lowercaseQuery) ||
      food.category.toLowerCase().includes(lowercaseQuery) ||
      food.ingredients.some(ingredient => ingredient.toLowerCase().includes(lowercaseQuery))
    );

    const startIndex = (page - 1) * limit;
    const paginatedFoods = filteredFoods.slice(startIndex, startIndex + limit);

    return {
      items: paginatedFoods,
      total: filteredFoods.length,
      page,
      hasMore: startIndex + limit < filteredFoods.length
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
      'fairlife', 'starbucks', 'red bull', 'monster', 'gatorade',
      'powerade', 'vitamin water', 'smartwater', 'dasani', 'aquafina',
      // Indian brands
      'amul', 'britannia', 'parle', 'haldiram', 'bikaji', 'balaji',
      'tata', 'itc', 'dabur', 'patanjali', 'mother dairy', 'kwality walls',
      'maggi', 'kissan', 'everest', 'mtr', 'gits', 'kohinoor',
      'aashirvaad', 'fortune', 'saffola', 'sundrop', 'dhara'
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

  // Get local foods (fallback database with popular brands and Indian foods)
  private getLocalFoods(): FoodItem[] {
    return [
      // === INDIAN FOODS SECTION ===
      
      // Amul Products
      {
        id: 'amul_butter',
        name: 'Amul Butter',
        brand: 'Amul',
        category: 'Dairy',
        barcode: '8901030801017',
        nutrition: {
          calories: 717,
          protein: 0.5,
          carbohydrates: 0.6,
          fat: 81,
          fiber: 0,
          sugar: 0.6,
          sodium: 11,
          saturatedFat: 51,
          transFat: 0,
          cholesterol: 215,
          vitamins: { 'Vitamin A': 684, 'Vitamin D': 1.5 },
          minerals: { calcium: 24 }
        },
        ingredients: ['Fresh cream', 'Salt'],
        allergens: ['Contains milk'],
        servingSize: '100g',
        servingsPerContainer: 1,
        healthScore: 45,
        tasteScore: 88,
        consumerScore: 95,
        vishScore: 76,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'amul_milk',
        name: 'Amul Taza Fresh Milk',
        brand: 'Amul',
        category: 'Dairy',
        barcode: '8901030801024',
        nutrition: {
          calories: 68,
          protein: 3.2,
          carbohydrates: 4.4,
          fat: 4.1,
          fiber: 0,
          sugar: 4.4,
          sodium: 44,
          saturatedFat: 2.5,
          transFat: 0,
          cholesterol: 14,
          vitamins: { 'Vitamin A': 56, 'Vitamin D': 0.1 },
          minerals: { calcium: 113 }
        },
        ingredients: ['Fresh cow milk', 'Vitamin A', 'Vitamin D3'],
        allergens: ['Contains milk'],
        servingSize: '200ml',
        servingsPerContainer: 2.5,
        healthScore: 82,
        tasteScore: 85,
        consumerScore: 92,
        vishScore: 86,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'amul_lassi',
        name: 'Amul Masti Spiced Buttermilk',
        brand: 'Amul',
        category: 'Beverages',
        barcode: '8901030801031',
        nutrition: {
          calories: 60,
          protein: 2.8,
          carbohydrates: 4.5,
          fat: 3.5,
          fiber: 0,
          sugar: 4.5,
          sodium: 180,
          saturatedFat: 2.2,
          transFat: 0,
          cholesterol: 12,
          vitamins: { 'Vitamin A': 45 },
          minerals: { calcium: 95 }
        },
        ingredients: ['Cultured buttermilk', 'Salt', 'Cumin powder', 'Black pepper', 'Mint', 'Coriander'],
        allergens: ['Contains milk'],
        servingSize: '200ml',
        servingsPerContainer: 1,
        healthScore: 75,
        tasteScore: 88,
        consumerScore: 85,
        vishScore: 83,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Britannia Products
      {
        id: 'britannia_good_day',
        name: 'Good Day Butter Cookies',
        brand: 'Britannia',
        category: 'Cookies',
        barcode: '8901063001015',
        nutrition: {
          calories: 480,
          protein: 6.9,
          carbohydrates: 66.4,
          fat: 20.7,
          fiber: 2.1,
          sugar: 22.5,
          sodium: 312,
          saturatedFat: 10.2,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: { iron: 3.2 }
        },
        ingredients: ['Wheat flour', 'Sugar', 'Edible vegetable oil', 'Butter', 'Milk solids', 'Salt', 'Raising agents', 'Emulsifiers', 'Flavors'],
        allergens: ['Contains wheat', 'Contains milk', 'May contain nuts'],
        servingSize: '100g',
        servingsPerContainer: 1,
        healthScore: 35,
        tasteScore: 90,
        consumerScore: 88,
        vishScore: 71,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'britannia_marie_gold',
        name: 'Marie Gold Biscuits',
        brand: 'Britannia',
        category: 'Biscuits',
        barcode: '8901063001022',
        nutrition: {
          calories: 454,
          protein: 8.1,
          carbohydrates: 75.8,
          fat: 13.1,
          fiber: 2.8,
          sugar: 15.2,
          sodium: 520,
          saturatedFat: 6.5,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin A': 60, 'Vitamin D': 1.2 },
          minerals: { iron: 4.8, calcium: 120 }
        },
        ingredients: ['Wheat flour', 'Sugar', 'Edible vegetable oil', 'Milk solids', 'Salt', 'Raising agents', 'Emulsifiers', 'Vitamins'],
        allergens: ['Contains wheat', 'Contains milk'],
        servingSize: '100g',
        servingsPerContainer: 1,
        healthScore: 55,
        tasteScore: 78,
        consumerScore: 92,
        vishScore: 75,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Parle Products
      {
        id: 'parle_g_biscuits',
        name: 'Parle-G Glucose Biscuits',
        brand: 'Parle',
        category: 'Biscuits',
        barcode: '8901719100017',
        nutrition: {
          calories: 456,
          protein: 7.8,
          carbohydrates: 76.2,
          fat: 13.5,
          fiber: 2.5,
          sugar: 18.8,
          sodium: 485,
          saturatedFat: 6.8,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin A': 55, 'Vitamin D': 1.0 },
          minerals: { iron: 4.2, calcium: 110 }
        },
        ingredients: ['Wheat flour', 'Sugar', 'Edible vegetable oil', 'Milk solids', 'Salt', 'Raising agents', 'Emulsifiers', 'Vitamins'],
        allergens: ['Contains wheat', 'Contains milk'],
        servingSize: '100g',
        servingsPerContainer: 1,
        healthScore: 52,
        tasteScore: 85,
        consumerScore: 95,
        vishScore: 77,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'parle_hide_seek',
        name: 'Hide & Seek Chocolate Chip Cookies',
        brand: 'Parle',
        category: 'Cookies',
        barcode: '8901719100024',
        nutrition: {
          calories: 485,
          protein: 6.5,
          carbohydrates: 68.2,
          fat: 21.8,
          fiber: 3.2,
          sugar: 25.5,
          sodium: 295,
          saturatedFat: 11.5,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: { iron: 2.8 }
        },
        ingredients: ['Wheat flour', 'Sugar', 'Edible vegetable oil', 'Chocolate chips', 'Cocoa powder', 'Milk solids', 'Salt', 'Raising agents', 'Emulsifiers', 'Flavors'],
        allergens: ['Contains wheat', 'Contains milk', 'May contain nuts'],
        servingSize: '100g',
        servingsPerContainer: 1,
        healthScore: 28,
        tasteScore: 92,
        consumerScore: 88,
        vishScore: 69,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Haldiram's Products
      {
        id: 'haldiram_bhujia',
        name: 'Aloo Bhujia',
        brand: 'Haldiram\'s',
        category: 'Snacks',
        barcode: '8904063200015',
        nutrition: {
          calories: 545,
          protein: 13.2,
          carbohydrates: 35.8,
          fat: 40.5,
          fiber: 4.8,
          sugar: 2.5,
          sodium: 1250,
          saturatedFat: 18.2,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: { iron: 3.5 }
        },
        ingredients: ['Gram flour', 'Potato', 'Edible vegetable oil', 'Salt', 'Red chili powder', 'Turmeric powder', 'Asafoetida', 'Spices'],
        allergens: ['May contain nuts'],
        servingSize: '100g',
        servingsPerContainer: 1,
        healthScore: 25,
        tasteScore: 95,
        consumerScore: 90,
        vishScore: 70,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'haldiram_samosa',
        name: 'Mini Samosa',
        brand: 'Haldiram\'s',
        category: 'Snacks',
        barcode: '8904063200022',
        nutrition: {
          calories: 425,
          protein: 8.5,
          carbohydrates: 45.2,
          fat: 23.8,
          fiber: 3.5,
          sugar: 3.2,
          sodium: 890,
          saturatedFat: 10.5,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: { iron: 2.8 }
        },
        ingredients: ['Wheat flour', 'Potato', 'Green peas', 'Edible vegetable oil', 'Onion', 'Ginger', 'Green chili', 'Spices', 'Salt'],
        allergens: ['Contains wheat'],
        servingSize: '100g',
        servingsPerContainer: 1,
        healthScore: 35,
        tasteScore: 88,
        consumerScore: 85,
        vishScore: 69,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'haldiram_rasgulla',
        name: 'Rasgulla',
        brand: 'Haldiram\'s',
        category: 'Sweets',
        barcode: '8904063200039',
        nutrition: {
          calories: 186,
          protein: 4.8,
          carbohydrates: 32.5,
          fat: 4.2,
          fiber: 0,
          sugar: 32.5,
          sodium: 25,
          saturatedFat: 2.8,
          transFat: 0,
          cholesterol: 15,
          vitamins: {},
          minerals: { calcium: 85 }
        },
        ingredients: ['Milk', 'Sugar', 'Cardamom', 'Rose water'],
        allergens: ['Contains milk'],
        servingSize: '100g',
        servingsPerContainer: 1,
        healthScore: 45,
        tasteScore: 92,
        consumerScore: 88,
        vishScore: 75,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Bikaji Products
      {
        id: 'bikaji_bhujia',
        name: 'Bikaneri Bhujia',
        brand: 'Bikaji',
        category: 'Snacks',
        barcode: '8906010350015',
        nutrition: {
          calories: 520,
          protein: 15.8,
          carbohydrates: 32.5,
          fat: 38.2,
          fiber: 5.2,
          sugar: 2.8,
          sodium: 1180,
          saturatedFat: 16.8,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: { iron: 4.2 }
        },
        ingredients: ['Gram flour', 'Moth bean flour', 'Edible vegetable oil', 'Salt', 'Red chili powder', 'Black pepper', 'Cloves', 'Spices'],
        allergens: ['May contain nuts'],
        servingSize: '100g',
        servingsPerContainer: 1,
        healthScore: 28,
        tasteScore: 92,
        consumerScore: 85,
        vishScore: 68,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'bikaji_rasgulla',
        name: 'Sponge Rasgulla',
        brand: 'Bikaji',
        category: 'Sweets',
        barcode: '8906010350022',
        nutrition: {
          calories: 195,
          protein: 5.2,
          carbohydrates: 35.8,
          fat: 4.5,
          fiber: 0,
          sugar: 35.8,
          sodium: 28,
          saturatedFat: 3.2,
          transFat: 0,
          cholesterol: 18,
          vitamins: {},
          minerals: { calcium: 92 }
        },
        ingredients: ['Milk', 'Sugar', 'Cardamom powder', 'Rose essence'],
        allergens: ['Contains milk'],
        servingSize: '100g',
        servingsPerContainer: 1,
        healthScore: 42,
        tasteScore: 90,
        consumerScore: 82,
        vishScore: 71,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Balaji Products
      {
        id: 'balaji_wafers',
        name: 'Simply Salted Potato Wafers',
        brand: 'Balaji',
        category: 'Snacks',
        barcode: '8901596100015',
        nutrition: {
          calories: 536,
          protein: 6.8,
          carbohydrates: 52.5,
          fat: 33.2,
          fiber: 4.2,
          sugar: 1.8,
          sodium: 825,
          saturatedFat: 14.5,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin C': 12 },
          minerals: { potassium: 485 }
        },
        ingredients: ['Potato', 'Edible vegetable oil', 'Salt'],
        allergens: [],
        servingSize: '100g',
        servingsPerContainer: 1,
        healthScore: 32,
        tasteScore: 85,
        consumerScore: 78,
        vishScore: 65,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Maggi Products
      {
        id: 'maggi_noodles',
        name: 'Maggi 2-Minute Masala Noodles',
        brand: 'Maggi',
        category: 'Instant Noodles',
        barcode: '8901030801048',
        nutrition: {
          calories: 205,
          protein: 6.1,
          carbohydrates: 30.9,
          fat: 6.6,
          fiber: 2.8,
          sugar: 2.5,
          sodium: 986,
          saturatedFat: 3.2,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin A': 15, 'Iron': 4.2 },
          minerals: { calcium: 45 }
        },
        ingredients: ['Wheat flour', 'Edible vegetable oil', 'Salt', 'Spices', 'Flavor enhancer', 'Hydrolyzed groundnut protein', 'Sugar', 'Thickener'],
        allergens: ['Contains wheat', 'Contains nuts'],
        servingSize: '70g (1 pack)',
        servingsPerContainer: 1,
        healthScore: 38,
        tasteScore: 88,
        consumerScore: 95,
        vishScore: 74,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // MTR Products
      {
        id: 'mtr_rava_idli',
        name: 'Rava Idli Mix',
        brand: 'MTR',
        category: 'Ready to Cook',
        barcode: '8901042100015',
        nutrition: {
          calories: 372,
          protein: 8.5,
          carbohydrates: 78.2,
          fat: 2.8,
          fiber: 3.5,
          sugar: 1.2,
          sodium: 485,
          saturatedFat: 0.8,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin B1': 0.12 },
          minerals: { iron: 2.8 }
        },
        ingredients: ['Semolina', 'Rice flour', 'Black gram flour', 'Salt', 'Raising agents', 'Spices', 'Curry leaves'],
        allergens: [],
        servingSize: '100g',
        servingsPerContainer: 2,
        healthScore: 68,
        tasteScore: 82,
        consumerScore: 85,
        vishScore: 78,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'mtr_sambar_powder',
        name: 'Sambar Powder',
        brand: 'MTR',
        category: 'Spices',
        barcode: '8901042100022',
        nutrition: {
          calories: 312,
          protein: 12.8,
          carbohydrates: 42.5,
          fat: 8.5,
          fiber: 18.2,
          sugar: 3.8,
          sodium: 1250,
          saturatedFat: 2.2,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin A': 125, 'Vitamin C': 45 },
          minerals: { iron: 8.5, calcium: 185 }
        },
        ingredients: ['Coriander seeds', 'Red chili', 'Turmeric', 'Fenugreek seeds', 'Cumin seeds', 'Black pepper', 'Asafoetida', 'Curry leaves'],
        allergens: [],
        servingSize: '10g',
        servingsPerContainer: 10,
        healthScore: 75,
        tasteScore: 88,
        consumerScore: 82,
        vishScore: 82,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Patanjali Products
      {
        id: 'patanjali_atta_noodles',
        name: 'Atta Noodles',
        brand: 'Patanjali',
        category: 'Instant Noodles',
        barcode: '8904109300015',
        nutrition: {
          calories: 348,
          protein: 11.2,
          carbohydrates: 68.5,
          fat: 4.8,
          fiber: 8.2,
          sugar: 2.8,
          sodium: 785,
          saturatedFat: 1.8,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin B1': 0.15, 'Iron': 3.8 },
          minerals: { calcium: 65 }
        },
        ingredients: ['Whole wheat flour', 'Edible vegetable oil', 'Salt', 'Spices', 'Natural flavor enhancer', 'Sugar', 'Thickener'],
        allergens: ['Contains wheat'],
        servingSize: '75g (1 pack)',
        servingsPerContainer: 1,
        healthScore: 58,
        tasteScore: 78,
        consumerScore: 75,
        vishScore: 70,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'patanjali_chyawanprash',
        name: 'Special Chyawanprash',
        brand: 'Patanjali',
        category: 'Health Supplements',
        barcode: '8904109300022',
        nutrition: {
          calories: 285,
          protein: 2.8,
          carbohydrates: 68.5,
          fat: 1.2,
          fiber: 4.5,
          sugar: 58.2,
          sodium: 15,
          saturatedFat: 0.5,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin C': 125, 'Vitamin A': 85 },
          minerals: { iron: 4.8, calcium: 95 }
        },
        ingredients: ['Amla', 'Honey', 'Ghee', 'Sugar', 'Ashwagandha', 'Giloy', 'Brahmi', 'Shankhpushpi', 'Various herbs and spices'],
        allergens: ['Contains milk'],
        servingSize: '12g (1 tsp)',
        servingsPerContainer: 42,
        healthScore: 78,
        tasteScore: 72,
        consumerScore: 82,
        vishScore: 77,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Tata Products
      {
        id: 'tata_tea_gold',
        name: 'Tata Tea Gold',
        brand: 'Tata Tea',
        category: 'Beverages',
        barcode: '8901030801055',
        nutrition: {
          calories: 2,
          protein: 0.1,
          carbohydrates: 0.3,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 1,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: { potassium: 25 }
        },
        ingredients: ['Black tea'],
        allergens: [],
        servingSize: '1 cup (2g tea)',
        servingsPerContainer: 250,
        healthScore: 85,
        tasteScore: 88,
        consumerScore: 92,
        vishScore: 88,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'tata_salt',
        name: 'Tata Salt',
        brand: 'Tata',
        category: 'Condiments',
        barcode: '8901030801062',
        nutrition: {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 38758,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: { iodine: 30 }
        },
        ingredients: ['Sodium chloride', 'Potassium iodate'],
        allergens: [],
        servingSize: '1g',
        servingsPerContainer: 1000,
        healthScore: 60,
        tasteScore: 70,
        consumerScore: 95,
        vishScore: 75,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // ITC Products
      {
        id: 'aashirvaad_atta',
        name: 'Aashirvaad Whole Wheat Flour',
        brand: 'Aashirvaad',
        category: 'Flour & Grains',
        barcode: '8901030801079',
        nutrition: {
          calories: 341,
          protein: 12.1,
          carbohydrates: 69.4,
          fat: 1.7,
          fiber: 11.2,
          sugar: 2.8,
          sodium: 4,
          saturatedFat: 0.4,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin B1': 0.45, 'Vitamin B3': 4.8 },
          minerals: { iron: 4.6, calcium: 48 }
        },
        ingredients: ['Whole wheat'],
        allergens: ['Contains wheat'],
        servingSize: '100g',
        servingsPerContainer: 10,
        healthScore: 88,
        tasteScore: 75,
        consumerScore: 90,
        vishScore: 84,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'sunfeast_dark_fantasy',
        name: 'Dark Fantasy Choco Fills',
        brand: 'Sunfeast',
        category: 'Cookies',
        barcode: '8901030801086',
        nutrition: {
          calories: 495,
          protein: 6.8,
          carbohydrates: 65.2,
          fat: 23.5,
          fiber: 3.2,
          sugar: 28.5,
          sodium: 285,
          saturatedFat: 12.8,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: { iron: 2.5 }
        },
        ingredients: ['Wheat flour', 'Sugar', 'Edible vegetable oil', 'Cocoa powder', 'Chocolate', 'Milk solids', 'Salt', 'Raising agents', 'Emulsifiers', 'Flavors'],
        allergens: ['Contains wheat', 'Contains milk', 'May contain nuts'],
        servingSize: '100g',
        servingsPerContainer: 1,
        healthScore: 25,
        tasteScore: 95,
        consumerScore: 88,
        vishScore: 69,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Dabur Products
      {
        id: 'dabur_honey',
        name: 'Dabur Honey',
        brand: 'Dabur',
        category: 'Natural Sweeteners',
        barcode: '8901207000015',
        nutrition: {
          calories: 304,
          protein: 0.3,
          carbohydrates: 82.4,
          fat: 0,
          fiber: 0.2,
          sugar: 82.1,
          sodium: 4,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin C': 0.5 },
          minerals: { potassium: 52 }
        },
        ingredients: ['Pure honey'],
        allergens: [],
        servingSize: '20g (1 tbsp)',
        servingsPerContainer: 25,
        healthScore: 65,
        tasteScore: 92,
        consumerScore: 88,
        vishScore: 82,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'dabur_real_juice',
        name: 'Real Mixed Fruit Juice',
        brand: 'Dabur Real',
        category: 'Beverages',
        barcode: '8901207000022',
        nutrition: {
          calories: 54,
          protein: 0.2,
          carbohydrates: 13.2,
          fat: 0.1,
          fiber: 0.5,
          sugar: 12.8,
          sodium: 8,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin C': 35 },
          minerals: { potassium: 125 }
        },
        ingredients: ['Mixed fruit juice', 'Water', 'Sugar', 'Acidity regulator', 'Natural flavors', 'Vitamin C'],
        allergens: [],
        servingSize: '200ml',
        servingsPerContainer: 1,
        healthScore: 58,
        tasteScore: 85,
        consumerScore: 82,
        vishScore: 75,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Mother Dairy Products
      {
        id: 'mother_dairy_ice_cream',
        name: 'Vanilla Ice Cream',
        brand: 'Mother Dairy',
        category: 'Frozen Desserts',
        barcode: '8901020000015',
        nutrition: {
          calories: 207,
          protein: 3.5,
          carbohydrates: 23.8,
          fat: 11.2,
          fiber: 0,
          sugar: 23.8,
          sodium: 65,
          saturatedFat: 7.2,
          transFat: 0,
          cholesterol: 35,
          vitamins: { 'Vitamin A': 85 },
          minerals: { calcium: 125 }
        },
        ingredients: ['Milk', 'Sugar', 'Milk solids', 'Edible vegetable oil', 'Stabilizers', 'Emulsifiers', 'Natural vanilla flavor'],
        allergens: ['Contains milk'],
        servingSize: '100ml',
        servingsPerContainer: 1,
        healthScore: 35,
        tasteScore: 92,
        consumerScore: 85,
        vishScore: 71,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Kwality Wall's Products
      {
        id: 'kwality_walls_cornetto',
        name: 'Cornetto Vanilla',
        brand: 'Kwality Wall\'s',
        category: 'Frozen Desserts',
        barcode: '8901030801093',
        nutrition: {
          calories: 185,
          protein: 2.8,
          carbohydrates: 22.5,
          fat: 9.5,
          fiber: 0.8,
          sugar: 21.2,
          sodium: 58,
          saturatedFat: 6.2,
          transFat: 0,
          cholesterol: 28,
          vitamins: { 'Vitamin A': 65 },
          minerals: { calcium: 95 }
        },
        ingredients: ['Milk', 'Sugar', 'Wheat flour', 'Edible vegetable oil', 'Cocoa powder', 'Milk solids', 'Stabilizers', 'Emulsifiers', 'Natural flavors'],
        allergens: ['Contains milk', 'Contains wheat'],
        servingSize: '1 cone (70ml)',
        servingsPerContainer: 1,
        healthScore: 32,
        tasteScore: 88,
        consumerScore: 82,
        vishScore: 67,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // === EXISTING INTERNATIONAL FOODS ===
      
      // Coca-Cola Products
      {
        id: 'coca_cola_classic',
        name: 'Coca-Cola Classic',
        brand: 'Coca-Cola',
        category: 'Beverages',
        barcode: '049000028911',
        nutrition: {
          calories: 140,
          protein: 0,
          carbohydrates: 39,
          fat: 0,
          fiber: 0,
          sugar: 39,
          sodium: 45,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Carbonated water', 'High fructose corn syrup', 'Caramel color', 'Phosphoric acid', 'Natural flavors', 'Caffeine'],
        allergens: [],
        servingSize: '12 fl oz (355ml)',
        servingsPerContainer: 1,
        healthScore: 15,
        tasteScore: 85,
        consumerScore: 95,
        vishScore: 65,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'diet_coke',
        name: 'Diet Coke',
        brand: 'Coca-Cola',
        category: 'Beverages',
        barcode: '049000028928',
        nutrition: {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 40,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Carbonated water', 'Caramel color', 'Aspartame', 'Phosphoric acid', 'Potassium benzoate', 'Natural flavors', 'Citric acid', 'Caffeine'],
        allergens: ['Contains phenylalanine'],
        servingSize: '12 fl oz (355ml)',
        servingsPerContainer: 1,
        healthScore: 35,
        tasteScore: 75,
        consumerScore: 88,
        vishScore: 66,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'sprite',
        name: 'Sprite',
        brand: 'Coca-Cola',
        category: 'Beverages',
        barcode: '049000028935',
        nutrition: {
          calories: 140,
          protein: 0,
          carbohydrates: 38,
          fat: 0,
          fiber: 0,
          sugar: 38,
          sodium: 65,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Carbonated water', 'High fructose corn syrup', 'Citric acid', 'Natural lemon and lime flavors', 'Sodium citrate'],
        allergens: [],
        servingSize: '12 fl oz (355ml)',
        servingsPerContainer: 1,
        healthScore: 18,
        tasteScore: 82,
        consumerScore: 85,
        vishScore: 62,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Fairlife Products
      {
        id: 'fairlife_chocolate_milk',
        name: 'Core Power Chocolate Protein Shake',
        brand: 'Fairlife',
        category: 'Dairy',
        barcode: '811620020015',
        nutrition: {
          calories: 170,
          protein: 26,
          carbohydrates: 9,
          fat: 4.5,
          fiber: 1,
          sugar: 8,
          sodium: 380,
          saturatedFat: 3,
          transFat: 0,
          cholesterol: 25,
          vitamins: { 'Vitamin A': 10, 'Vitamin D': 25, 'Vitamin B12': 25 },
          minerals: { calcium: 40, potassium: 490 }
        },
        ingredients: ['Fairlife ultrafiltered milk', 'Natural flavors', 'Alkalized cocoa', 'Monk fruit extract', 'Stevia leaf extract', 'Lactase enzyme', 'Vitamin A palmitate', 'Vitamin D3'],
        allergens: ['Contains milk'],
        servingSize: '14 fl oz (414ml)',
        servingsPerContainer: 1,
        healthScore: 85,
        tasteScore: 88,
        consumerScore: 82,
        vishScore: 85,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'fairlife_whole_milk',
        name: 'Fairlife Whole Milk',
        brand: 'Fairlife',
        category: 'Dairy',
        barcode: '811620020008',
        nutrition: {
          calories: 150,
          protein: 13,
          carbohydrates: 6,
          fat: 8,
          fiber: 0,
          sugar: 6,
          sodium: 180,
          saturatedFat: 5,
          transFat: 0,
          cholesterol: 35,
          vitamins: { 'Vitamin A': 10, 'Vitamin D': 25 },
          minerals: { calcium: 35 }
        },
        ingredients: ['Fairlife ultrafiltered milk', 'Lactase enzyme', 'Vitamin A palmitate', 'Vitamin D3'],
        allergens: ['Contains milk'],
        servingSize: '1 cup (240ml)',
        servingsPerContainer: 4,
        healthScore: 78,
        tasteScore: 85,
        consumerScore: 80,
        vishScore: 81,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // PepsiCo Products
      {
        id: 'pepsi_cola',
        name: 'Pepsi Cola',
        brand: 'PepsiCo',
        category: 'Beverages',
        barcode: '012000001765',
        nutrition: {
          calories: 150,
          protein: 0,
          carbohydrates: 41,
          fat: 0,
          fiber: 0,
          sugar: 41,
          sodium: 30,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Carbonated water', 'High fructose corn syrup', 'Caramel color', 'Sugar', 'Phosphoric acid', 'Caffeine', 'Citric acid', 'Natural flavor'],
        allergens: [],
        servingSize: '12 fl oz (355ml)',
        servingsPerContainer: 1,
        healthScore: 12,
        tasteScore: 83,
        consumerScore: 88,
        vishScore: 61,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'mountain_dew',
        name: 'Mountain Dew',
        brand: 'PepsiCo',
        category: 'Beverages',
        barcode: '012000001772',
        nutrition: {
          calories: 170,
          protein: 0,
          carbohydrates: 46,
          fat: 0,
          fiber: 0,
          sugar: 46,
          sodium: 60,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Carbonated water', 'High fructose corn syrup', 'Concentrated orange juice', 'Citric acid', 'Natural flavor', 'Sodium benzoate', 'Caffeine', 'Sodium citrate', 'Erythorbic acid', 'Gum arabic', 'Calcium disodium EDTA', 'Yellow 5'],
        allergens: [],
        servingSize: '12 fl oz (355ml)',
        servingsPerContainer: 1,
        healthScore: 8,
        tasteScore: 88,
        consumerScore: 85,
        vishScore: 60,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'lays_classic',
        name: 'Lay\'s Classic Potato Chips',
        brand: 'Lay\'s',
        category: 'Snacks',
        barcode: '028400064316',
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
          vitamins: { 'Vitamin C': 10 },
          minerals: { potassium: 350 }
        },
        ingredients: ['Potatoes', 'Vegetable oil (sunflower, corn, and/or canola oil)', 'Salt'],
        allergens: [],
        servingSize: '1 oz (28g)',
        servingsPerContainer: 5,
        healthScore: 25,
        tasteScore: 85,
        consumerScore: 90,
        vishScore: 67,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'doritos_nacho_cheese',
        name: 'Doritos Nacho Cheese',
        brand: 'Doritos',
        category: 'Snacks',
        barcode: '028400642316',
        nutrition: {
          calories: 150,
          protein: 2,
          carbohydrates: 18,
          fat: 8,
          fiber: 1,
          sugar: 1,
          sodium: 210,
          saturatedFat: 1,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Corn', 'Vegetable oil', 'Maltodextrin', 'Salt', 'Cheddar cheese', 'Whey', 'Monosodium glutamate', 'Buttermilk', 'Romano cheese', 'Whey protein concentrate', 'Onion powder', 'Corn flour', 'Natural and artificial flavor'],
        allergens: ['Contains milk'],
        servingSize: '1 oz (28g)',
        servingsPerContainer: 9,
        healthScore: 22,
        tasteScore: 92,
        consumerScore: 95,
        vishScore: 70,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Gatorade
      {
        id: 'gatorade_fruit_punch',
        name: 'Gatorade Thirst Quencher Fruit Punch',
        brand: 'Gatorade',
        category: 'Sports Drinks',
        barcode: '052000337761',
        nutrition: {
          calories: 80,
          protein: 0,
          carbohydrates: 21,
          fat: 0,
          fiber: 0,
          sugar: 21,
          sodium: 160,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: { potassium: 50 }
        },
        ingredients: ['Water', 'Sugar', 'Dextrose', 'Citric acid', 'Salt', 'Sodium citrate', 'Monopotassium phosphate', 'Natural flavor', 'Red 40', 'Blue 1'],
        allergens: [],
        servingSize: '12 fl oz (355ml)',
        servingsPerContainer: 1,
        healthScore: 45,
        tasteScore: 78,
        consumerScore: 85,
        vishScore: 69,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Red Bull
      {
        id: 'red_bull_energy',
        name: 'Red Bull Energy Drink',
        brand: 'Red Bull',
        category: 'Energy Drinks',
        barcode: '9002490100026',
        nutrition: {
          calories: 110,
          protein: 1,
          carbohydrates: 28,
          fat: 0,
          fiber: 0,
          sugar: 27,
          sodium: 105,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Niacin': 100, 'Vitamin B6': 250, 'Vitamin B12': 80, 'Pantothenic acid': 50 },
          minerals: {}
        },
        ingredients: ['Carbonated water', 'Sucrose', 'Glucose', 'Citric acid', 'Taurine', 'Sodium bicarbonate', 'Magnesium carbonate', 'Caffeine', 'Niacinamide', 'Calcium pantothenate', 'Pyridoxine HCl', 'Vitamin B12', 'Natural and artificial flavors', 'Colors'],
        allergens: [],
        servingSize: '8.4 fl oz (248ml)',
        servingsPerContainer: 1,
        healthScore: 35,
        tasteScore: 75,
        consumerScore: 88,
        vishScore: 66,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Starbucks
      {
        id: 'starbucks_frappuccino_vanilla',
        name: 'Starbucks Frappuccino Vanilla',
        brand: 'Starbucks',
        category: 'Coffee Drinks',
        barcode: '012000814471',
        nutrition: {
          calories: 200,
          protein: 6,
          carbohydrates: 32,
          fat: 6,
          fiber: 0,
          sugar: 31,
          sodium: 105,
          saturatedFat: 4,
          transFat: 0,
          cholesterol: 20,
          vitamins: { 'Vitamin A': 6, 'Vitamin D': 10 },
          minerals: { calcium: 20 }
        },
        ingredients: ['Brewed Starbucks coffee', 'Reduced-fat milk', 'Sugar', 'Maltodextrin', 'Pectin', 'Natural vanilla flavor'],
        allergens: ['Contains milk'],
        servingSize: '9.5 fl oz (281ml)',
        servingsPerContainer: 1,
        healthScore: 42,
        tasteScore: 85,
        consumerScore: 82,
        vishScore: 70,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Kellogg's
      {
        id: 'frosted_flakes',
        name: 'Frosted Flakes',
        brand: 'Kellogg\'s',
        category: 'Cereals',
        barcode: '038000199004',
        nutrition: {
          calories: 110,
          protein: 1,
          carbohydrates: 27,
          fat: 0,
          fiber: 1,
          sugar: 10,
          sodium: 140,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin A': 10, 'Vitamin C': 10, 'Vitamin D': 10, 'Thiamin': 25, 'Riboflavin': 25, 'Niacin': 25, 'Vitamin B6': 25, 'Folic acid': 25, 'Vitamin B12': 25 },
          minerals: { iron: 45, zinc: 25 }
        },
        ingredients: ['Milled corn', 'Sugar', 'Malt flavor', 'Contains 2% or less of salt', 'BHT for freshness', 'Vitamins and minerals'],
        allergens: [],
        servingSize: '3/4 cup (29g)',
        servingsPerContainer: 12,
        healthScore: 35,
        tasteScore: 88,
        consumerScore: 90,
        vishScore: 71,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // General Mills
      {
        id: 'cheerios_original',
        name: 'Cheerios Original',
        brand: 'General Mills',
        category: 'Cereals',
        barcode: '016000275270',
        nutrition: {
          calories: 100,
          protein: 3,
          carbohydrates: 20,
          fat: 2,
          fiber: 3,
          sugar: 1,
          sodium: 140,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin A': 10, 'Vitamin C': 10, 'Vitamin D': 10, 'Thiamin': 25, 'Riboflavin': 25, 'Niacin': 25, 'Vitamin B6': 25, 'Folic acid': 50, 'Vitamin B12': 25 },
          minerals: { calcium: 10, iron: 45, zinc: 25 }
        },
        ingredients: ['Whole grain oats', 'Corn starch', 'Sugar', 'Salt', 'Tripotassium phosphate', 'Vitamin E', 'Vitamins and minerals'],
        allergens: [],
        servingSize: '1 cup (28g)',
        servingsPerContainer: 12,
        healthScore: 75,
        tasteScore: 70,
        consumerScore: 88,
        vishScore: 78,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Oreo
      {
        id: 'oreo_original',
        name: 'Oreo Original Sandwich Cookies',
        brand: 'Oreo',
        category: 'Cookies',
        barcode: '044000032227',
        nutrition: {
          calories: 160,
          protein: 2,
          carbohydrates: 25,
          fat: 7,
          fiber: 1,
          sugar: 14,
          sodium: 135,
          saturatedFat: 2,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: { iron: 4 }
        },
        ingredients: ['Unbleached enriched flour', 'Sugar', 'Palm and/or canola oil', 'Cocoa', 'High fructose corn syrup', 'Leavening', 'Cornstarch', 'Salt', 'Soy lecithin', 'Vanillin', 'Chocolate'],
        allergens: ['Contains wheat', 'Contains soy', 'May contain milk'],
        servingSize: '3 cookies (34g)',
        servingsPerContainer: 15,
        healthScore: 25,
        tasteScore: 95,
        consumerScore: 95,
        vishScore: 72,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Kraft
      {
        id: 'kraft_mac_cheese',
        name: 'Kraft Macaroni & Cheese Dinner',
        brand: 'Kraft',
        category: 'Packaged Meals',
        barcode: '021000615421',
        nutrition: {
          calories: 350,
          protein: 11,
          carbohydrates: 47,
          fat: 13,
          fiber: 2,
          sugar: 6,
          sodium: 580,
          saturatedFat: 6,
          transFat: 0,
          cholesterol: 30,
          vitamins: { 'Vitamin A': 10, 'Vitamin C': 0 },
          minerals: { calcium: 20, iron: 10 }
        },
        ingredients: ['Enriched macaroni', 'Cheese sauce mix', 'Whey', 'Milkfat', 'Milk protein concentrate', 'Salt', 'Sodium tripolyphosphate', 'Citric acid', 'Lactic acid', 'Sodium phosphate', 'Calcium phosphate', 'Yellow 5', 'Yellow 6', 'Enzymes'],
        allergens: ['Contains wheat', 'Contains milk'],
        servingSize: '1 cup prepared (70g dry)',
        servingsPerContainer: 3,
        healthScore: 35,
        tasteScore: 85,
        consumerScore: 88,
        vishScore: 69,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Campbell's
      {
        id: 'campbells_chicken_noodle',
        name: 'Campbell\'s Chicken Noodle Soup',
        brand: 'Campbell\'s',
        category: 'Soups',
        barcode: '051000012081',
        nutrition: {
          calories: 60,
          protein: 3,
          carbohydrates: 8,
          fat: 2,
          fiber: 1,
          sugar: 1,
          sodium: 890,
          saturatedFat: 0.5,
          transFat: 0,
          cholesterol: 10,
          vitamins: { 'Vitamin A': 15 },
          minerals: {}
        },
        ingredients: ['Chicken stock', 'Enriched egg noodles', 'Chicken meat', 'Carrots', 'Celery', 'Salt', 'Chicken fat', 'Monosodium glutamate', 'Modified food starch', 'Onion powder', 'Yeast extract', 'Spice', 'Beta carotene', 'Natural flavoring'],
        allergens: ['Contains wheat', 'Contains eggs'],
        servingSize: '1/2 cup (120ml)',
        servingsPerContainer: 2.5,
        healthScore: 45,
        tasteScore: 75,
        consumerScore: 85,
        vishScore: 68,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // Existing items
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
      }
    ];
  }

  // Initialize default database
  private initializeDefaultDatabase(): void {
    const localFoods = this.getLocalFoods();
    localFoods.forEach(food => {
      if (!this.cache.has(food.id)) {
        this.cache.set(food.id, food);
      }
    });
    this.saveCacheToStorage();
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
    cacheSize: string;
  } {
    const foods = Array.from(this.cache.values());
    const apiSources = foods.filter(f => f.source === 'api').length;
    const userSources = foods.filter(f => f.source === 'user').length;
    const databaseSources = foods.filter(f => f.source === 'database').length;
    
    const cacheData = localStorage.getItem('foodcheck_food_cache');
    const cacheSize = cacheData ? `${(cacheData.length / 1024).toFixed(2)} KB` : '0 KB';

    return {
      totalFoods: foods.length,
      apiSources,
      userSources,
      databaseSources,
      cacheSize
    };
  }
}

// Export singleton instance
export const foodDatabaseService = FoodDatabaseService.getInstance();