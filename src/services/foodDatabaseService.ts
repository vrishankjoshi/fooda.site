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

  // MAIN SEARCH FUNCTION - COMPLETELY REWRITTEN FOR RELIABILITY
  async searchFoods(query: string, page: number = 1, limit: number = 20): Promise<FoodSearchResult> {
    console.log(`🔍 SEARCH CALLED: "${query}" (page ${page}, limit ${limit})`);
    
    // Clear search cache to ensure fresh results
    this.searchCache.clear();
    
    const lowercaseQuery = query.toLowerCase().trim();
    console.log(`🔍 Lowercase query: "${lowercaseQuery}"`);
    
    // Get ALL foods from cache (this includes our American foods)
    const allFoods = Array.from(this.cache.values());
    console.log(`📦 Total foods in cache: ${allFoods.length}`);
    
    // Log some sample foods to verify they're there
    const americanFoods = allFoods.filter(food => 
      food.category.toLowerCase().includes('american') ||
      food.name.toLowerCase().includes('burger') ||
      food.name.toLowerCase().includes('pizza') ||
      food.name.toLowerCase().includes('fries')
    );
    console.log(`🇺🇸 American foods found in cache: ${americanFoods.length}`);
    americanFoods.forEach(food => {
      console.log(`  - ${food.name} (${food.brand}) - Category: ${food.category}`);
    });

    // ENHANCED SEARCH LOGIC
    const searchTerms = this.getSearchTerms(lowercaseQuery);
    console.log(`🔍 Search terms: ${searchTerms.join(', ')}`);
    
    const matchedFoods = allFoods.filter(food => {
      const foodName = food.name.toLowerCase();
      const foodBrand = (food.brand || '').toLowerCase();
      const foodCategory = food.category.toLowerCase();
      const foodIngredients = food.ingredients.join(' ').toLowerCase();
      
      // Check if any search term matches
      const matches = searchTerms.some(term => 
        foodName.includes(term) ||
        foodBrand.includes(term) ||
        foodCategory.includes(term) ||
        foodIngredients.includes(term) ||
        food.id.toLowerCase().includes(term)
      );
      
      if (matches) {
        console.log(`✅ MATCH: ${food.name} (${food.brand})`);
      }
      
      return matches;
    });

    console.log(`🎯 Total matches found: ${matchedFoods.length}`);

    // Sort results by relevance
    const sortedFoods = this.sortByRelevance(matchedFoods, lowercaseQuery);
    
    // Paginate results
    const startIndex = (page - 1) * limit;
    const paginatedFoods = sortedFoods.slice(startIndex, startIndex + limit);

    const result: FoodSearchResult = {
      items: paginatedFoods,
      total: sortedFoods.length,
      page,
      hasMore: startIndex + limit < sortedFoods.length
    };

    console.log(`📊 SEARCH RESULT: ${result.items.length} items on page ${page} of ${Math.ceil(result.total / limit)}`);
    result.items.forEach(item => {
      console.log(`  📄 ${item.name} (${item.brand}) - Score: ${item.vishScore}`);
    });

    return result;
  }

  // Get comprehensive search terms including aliases
  private getSearchTerms(query: string): string[] {
    const terms = [query];
    
    // Add aliases for common American food searches
    const aliases: { [key: string]: string[] } = {
      'burger': ['cheeseburger', 'hamburger', 'big mac', 'whopper', 'quarter pounder'],
      'pizza': ['pepperoni', 'cheese pizza', 'margherita', 'supreme'],
      'fries': ['french fries', 'potato fries', 'mcdonald\'s fries'],
      'chicken': ['fried chicken', 'chicken nuggets', 'chicken sandwich', 'kfc'],
      'sandwich': ['sub', 'subway', 'club sandwich', 'blt'],
      'soda': ['coca cola', 'pepsi', 'sprite', 'dr pepper'],
      'cereal': ['cheerios', 'frosted flakes', 'corn flakes', 'lucky charms'],
      'chips': ['doritos', 'lays', 'cheetos', 'pringles'],
      'ice cream': ['ben jerry', 'haagen dazs', 'vanilla', 'chocolate'],
      'american': ['burger', 'pizza', 'fries', 'hot dog', 'bbq', 'mac cheese'],
      'fast food': ['mcdonald', 'burger king', 'kfc', 'taco bell', 'subway'],
      'snack': ['chips', 'crackers', 'cookies', 'pretzels'],
      'breakfast': ['pancakes', 'waffles', 'cereal', 'bagel', 'muffin'],
      'dessert': ['cake', 'pie', 'cookies', 'brownies', 'ice cream'],
      'doritos': ['nacho cheese', 'cool ranch', 'spicy nacho', 'flamin hot', 'sweet chili'],
      'deritors': ['doritos', 'nacho cheese', 'cool ranch', 'spicy nacho', 'flamin hot']
    };
    
    if (aliases[query]) {
      terms.push(...aliases[query]);
    }
    
    // Add partial matches for compound words
    if (query.includes(' ')) {
      terms.push(...query.split(' '));
    }
    
    return terms;
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
      'mcdonald\'s', 'burger king', 'kfc', 'subway', 'taco bell',
      'ben jerry', 'haagen dazs', 'cheerios', 'frosted flakes'
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
      // Calculate relevance scores
      let aScore = 0;
      let bScore = 0;
      
      // Exact name match gets highest priority
      if (a.name.toLowerCase() === queryLower) aScore += 100;
      if (b.name.toLowerCase() === queryLower) bScore += 100;
      
      // Name contains query
      if (a.name.toLowerCase().includes(queryLower)) aScore += 50;
      if (b.name.toLowerCase().includes(queryLower)) bScore += 50;
      
      // Brand contains query
      if (a.brand?.toLowerCase().includes(queryLower)) aScore += 30;
      if (b.brand?.toLowerCase().includes(queryLower)) bScore += 30;
      
      // Category contains query
      if (a.category.toLowerCase().includes(queryLower)) aScore += 20;
      if (b.category.toLowerCase().includes(queryLower)) bScore += 20;
      
      // American food boost for American-related queries
      const isAmericanQuery = ['burger', 'pizza', 'fries', 'american', 'fast food', 'soda', 'chips'].some(term => queryLower.includes(term));
      if (isAmericanQuery) {
        const aIsAmerican = a.category.toLowerCase().includes('american') || 
                         ['burger', 'pizza', 'fries', 'mcdonald', 'coca cola', 'pepsi', 'doritos', 'lays'].some(brand => 
                           a.brand?.toLowerCase().includes(brand) || a.name.toLowerCase().includes(brand)
                         );
        const bIsAmerican = b.category.toLowerCase().includes('american') || 
                         ['burger', 'pizza', 'fries', 'mcdonald', 'coca cola', 'pepsi', 'doritos', 'lays'].some(brand => 
                           b.brand?.toLowerCase().includes(brand) || b.name.toLowerCase().includes(brand)
                         );
        
        if (aIsAmerican) aScore += 40;
        if (bIsAmerican) bScore += 40;
      }
      
      // If scores are equal, sort by Vish score
      if (aScore === bScore) {
        return b.vishScore - a.vishScore;
      }
      
      return bScore - aScore;
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
        console.log(`📦 Loaded ${this.cache.size} foods from cache`);
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
      console.log(`💾 Saved ${this.cache.size} foods to cache`);
    } catch (error) {
      console.error('Error saving food cache:', error);
    }
  }

  // Get local foods (fallback database) - POPULAR AMERICAN FOODS DATABASE
  private getLocalFoods(): FoodItem[] {
    return [
      // 🇺🇸 POPULAR AMERICAN FAST FOOD & RESTAURANT CHAINS
      {
        id: 'american_big_mac',
        name: 'Big Mac',
        brand: 'McDonald\'s',
        category: 'American Fast Food',
        nutrition: {
          calories: 563,
          protein: 25,
          carbohydrates: 45,
          fat: 33,
          fiber: 3,
          sugar: 9,
          sodium: 1040,
          saturatedFat: 11,
          transFat: 1,
          cholesterol: 85,
          vitamins: { 'Vitamin A': 4, 'Vitamin C': 2 },
          minerals: { calcium: 200, iron: 4.5 }
        },
        ingredients: ['Sesame seed bun', 'Beef patties', 'Big Mac sauce', 'Lettuce', 'Cheese', 'Pickles', 'Onions'],
        allergens: ['Contains gluten', 'Contains milk', 'Contains eggs', 'Contains sesame'],
        servingSize: '1 sandwich (230g)',
        servingsPerContainer: 1,
        healthScore: 35,
        tasteScore: 88,
        consumerScore: 92,
        vishScore: 72,
        imageUrl: 'https://images.pexels.com/photos/552056/pexels-photo-552056.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'american_whopper',
        name: 'Whopper',
        brand: 'Burger King',
        category: 'American Fast Food',
        nutrition: {
          calories: 657,
          protein: 28,
          carbohydrates: 49,
          fat: 40,
          fiber: 3,
          sugar: 11,
          sodium: 980,
          saturatedFat: 13,
          transFat: 1.5,
          cholesterol: 90,
          vitamins: { 'Vitamin A': 6, 'Vitamin C': 15 },
          minerals: { calcium: 150, iron: 5.2 }
        },
        ingredients: ['Sesame seed bun', '1/4 lb beef patty', 'Tomatoes', 'Lettuce', 'Mayonnaise', 'Ketchup', 'Pickles', 'Onions'],
        allergens: ['Contains gluten', 'Contains eggs', 'Contains sesame'],
        servingSize: '1 sandwich (270g)',
        servingsPerContainer: 1,
        healthScore: 32,
        tasteScore: 85,
        consumerScore: 88,
        vishScore: 68,
        imageUrl: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'american_kfc_chicken',
        name: 'Original Recipe Chicken',
        brand: 'KFC',
        category: 'American Fast Food',
        nutrition: {
          calories: 320,
          protein: 29,
          carbohydrates: 8,
          fat: 20,
          fiber: 1,
          sugar: 0,
          sodium: 540,
          saturatedFat: 6,
          transFat: 0,
          cholesterol: 115,
          vitamins: { 'Vitamin B6': 0.5, 'Niacin': 14 },
          minerals: { phosphorus: 235, selenium: 22 }
        },
        ingredients: ['Chicken', 'Wheat flour', '11 herbs and spices', 'Salt', 'Vegetable oil'],
        allergens: ['Contains gluten'],
        servingSize: '1 piece (85g)',
        servingsPerContainer: 1,
        healthScore: 55,
        tasteScore: 90,
        consumerScore: 85,
        vishScore: 77,
        imageUrl: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // 🍕 AMERICAN PIZZA
      {
        id: 'american_pepperoni_pizza',
        name: 'Pepperoni Pizza',
        brand: 'Domino\'s',
        category: 'American Pizza',
        nutrition: {
          calories: 298,
          protein: 13,
          carbohydrates: 36,
          fat: 11,
          fiber: 2,
          sugar: 4,
          sodium: 760,
          saturatedFat: 5,
          transFat: 0,
          cholesterol: 25,
          vitamins: { 'Vitamin A': 8, 'Vitamin C': 12 },
          minerals: { calcium: 180, iron: 2.8 }
        },
        ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella cheese', 'Pepperoni', 'Italian seasoning'],
        allergens: ['Contains gluten', 'Contains milk'],
        servingSize: '1 slice (107g)',
        servingsPerContainer: 8,
        healthScore: 45,
        tasteScore: 92,
        consumerScore: 90,
        vishScore: 76,
        imageUrl: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // 🥤 AMERICAN BEVERAGES
      {
        id: 'american_coca_cola',
        name: 'Coca-Cola Classic',
        brand: 'Coca-Cola',
        category: 'American Beverages',
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
        imageUrl: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'american_pepsi',
        name: 'Pepsi Cola',
        brand: 'PepsiCo',
        category: 'American Beverages',
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
        tasteScore: 82,
        consumerScore: 90,
        vishScore: 61,
        imageUrl: 'https://images.pexels.com/photos/2775860/pexels-photo-2775860.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // 🍟 AMERICAN SNACKS - DORITOS VARIETIES
      {
        id: 'american_doritos_nacho_cheese',
        name: 'Nacho Cheese Doritos',
        brand: 'Frito-Lay',
        category: 'American Snacks',
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
        ingredients: ['Corn', 'Vegetable oil', 'Cheese seasoning', 'Salt', 'Maltodextrin', 'Natural flavors'],
        allergens: ['Contains milk'],
        servingSize: '1 oz (28g)',
        servingsPerContainer: 9,
        healthScore: 28,
        tasteScore: 90,
        consumerScore: 92,
        vishScore: 70,
        imageUrl: 'https://images.pexels.com/photos/4958792/pexels-photo-4958792.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'american_doritos_cool_ranch',
        name: 'Cool Ranch Doritos',
        brand: 'Frito-Lay',
        category: 'American Snacks',
        nutrition: {
          calories: 140,
          protein: 2,
          carbohydrates: 18,
          fat: 7,
          fiber: 1,
          sugar: 1,
          sodium: 180,
          saturatedFat: 1,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Corn', 'Vegetable oil', 'Buttermilk', 'Salt', 'Tomato powder', 'Onion powder', 'Garlic powder', 'Natural flavors'],
        allergens: ['Contains milk'],
        servingSize: '1 oz (28g)',
        servingsPerContainer: 9,
        healthScore: 30,
        tasteScore: 88,
        consumerScore: 90,
        vishScore: 69,
        imageUrl: 'https://images.pexels.com/photos/4958793/pexels-photo-4958793.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'american_doritos_spicy_nacho',
        name: 'Spicy Nacho Doritos',
        brand: 'Frito-Lay',
        category: 'American Snacks',
        nutrition: {
          calories: 150,
          protein: 2,
          carbohydrates: 17,
          fat: 8,
          fiber: 1,
          sugar: 1,
          sodium: 200,
          saturatedFat: 1,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Corn', 'Vegetable oil', 'Cheese seasoning', 'Spices', 'Salt', 'Maltodextrin', 'Natural flavors', 'Paprika'],
        allergens: ['Contains milk'],
        servingSize: '1 oz (28g)',
        servingsPerContainer: 9,
        healthScore: 28,
        tasteScore: 92,
        consumerScore: 88,
        vishScore: 69,
        imageUrl: 'https://images.pexels.com/photos/4958794/pexels-photo-4958794.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'american_doritos_flamin_hot',
        name: 'Flamin\' Hot Doritos',
        brand: 'Frito-Lay',
        category: 'American Snacks',
        nutrition: {
          calories: 150,
          protein: 2,
          carbohydrates: 17,
          fat: 8,
          fiber: 1,
          sugar: 1,
          sodium: 250,
          saturatedFat: 1,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Corn', 'Vegetable oil', 'Cheese seasoning', 'Chili pepper', 'Salt', 'Maltodextrin', 'Natural flavors', 'Paprika extract'],
        allergens: ['Contains milk'],
        servingSize: '1 oz (28g)',
        servingsPerContainer: 9,
        healthScore: 25,
        tasteScore: 95,
        consumerScore: 85,
        vishScore: 68,
        imageUrl: 'https://images.pexels.com/photos/4958795/pexels-photo-4958795.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'american_doritos_sweet_chili',
        name: 'Sweet Chili Doritos',
        brand: 'Frito-Lay',
        category: 'American Snacks',
        nutrition: {
          calories: 140,
          protein: 2,
          carbohydrates: 18,
          fat: 7,
          fiber: 1,
          sugar: 2,
          sodium: 170,
          saturatedFat: 1,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Corn', 'Vegetable oil', 'Sugar', 'Chili pepper', 'Salt', 'Garlic powder', 'Onion powder', 'Natural flavors'],
        allergens: [],
        servingSize: '1 oz (28g)',
        servingsPerContainer: 9,
        healthScore: 32,
        tasteScore: 85,
        consumerScore: 82,
        vishScore: 66,
        imageUrl: 'https://images.pexels.com/photos/4958796/pexels-photo-4958796.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'american_doritos_blaze',
        name: 'Blaze Doritos',
        brand: 'Frito-Lay',
        category: 'American Snacks',
        nutrition: {
          calories: 150,
          protein: 2,
          carbohydrates: 17,
          fat: 8,
          fiber: 1,
          sugar: 1,
          sodium: 230,
          saturatedFat: 1,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Corn', 'Vegetable oil', 'Cheese seasoning', 'Chili pepper', 'Cayenne pepper', 'Salt', 'Maltodextrin', 'Natural flavors'],
        allergens: ['Contains milk'],
        servingSize: '1 oz (28g)',
        servingsPerContainer: 9,
        healthScore: 26,
        tasteScore: 93,
        consumerScore: 80,
        vishScore: 66,
        imageUrl: 'https://images.pexels.com/photos/4958797/pexels-photo-4958797.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // OTHER SNACKS
      {
        id: 'american_lays_chips',
        name: 'Classic Potato Chips',
        brand: 'Lay\'s',
        category: 'American Snacks',
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
        consumerScore: 88,
        vishScore: 66,
        imageUrl: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'american_cheetos',
        name: 'Crunchy Cheetos',
        brand: 'Frito-Lay',
        category: 'American Snacks',
        nutrition: {
          calories: 160,
          protein: 2,
          carbohydrates: 13,
          fat: 10,
          fiber: 1,
          sugar: 1,
          sodium: 250,
          saturatedFat: 1.5,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Enriched corn meal', 'Vegetable oil', 'Cheese seasoning', 'Salt', 'Whey', 'Monosodium glutamate'],
        allergens: ['Contains milk'],
        servingSize: '1 oz (28g)',
        servingsPerContainer: 8,
        healthScore: 22,
        tasteScore: 88,
        consumerScore: 85,
        vishScore: 65,
        imageUrl: 'https://images.pexels.com/photos/4958798/pexels-photo-4958798.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // 🥣 AMERICAN BREAKFAST CEREALS
      {
        id: 'american_cheerios',
        name: 'Honey Nut Cheerios',
        brand: 'General Mills',
        category: 'American Breakfast',
        nutrition: {
          calories: 110,
          protein: 3,
          carbohydrates: 22,
          fat: 2,
          fiber: 2,
          sugar: 9,
          sodium: 160,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin A': 10, 'Vitamin C': 10, 'Iron': 45 },
          minerals: { calcium: 100, iron: 8.1 }
        },
        ingredients: ['Whole grain oats', 'Sugar', 'Oat bran', 'Corn starch', 'Honey', 'Brown sugar syrup', 'Salt', 'Natural almond flavor'],
        allergens: ['May contain almonds'],
        servingSize: '3/4 cup (28g)',
        servingsPerContainer: 12,
        healthScore: 65,
        tasteScore: 85,
        consumerScore: 90,
        vishScore: 80,
        imageUrl: 'https://images.pexels.com/photos/5946071/pexels-photo-5946071.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'american_frosted_flakes',
        name: 'Frosted Flakes',
        brand: 'Kellogg\'s',
        category: 'American Breakfast',
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
          vitamins: { 'Vitamin A': 10, 'Vitamin C': 10, 'Iron': 25 },
          minerals: { calcium: 0, iron: 4.5 }
        },
        ingredients: ['Milled corn', 'Sugar', 'Malt flavor', 'Salt', 'BHT for freshness'],
        allergens: [],
        servingSize: '3/4 cup (29g)',
        servingsPerContainer: 11,
        healthScore: 35,
        tasteScore: 88,
        consumerScore: 85,
        vishScore: 69,
        imageUrl: 'https://images.pexels.com/photos/5946072/pexels-photo-5946072.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // 🍦 AMERICAN DESSERTS & ICE CREAM
      {
        id: 'american_ben_jerry_vanilla',
        name: 'Vanilla Ice Cream',
        brand: 'Ben & Jerry\'s',
        category: 'American Desserts',
        nutrition: {
          calories: 250,
          protein: 4,
          carbohydrates: 23,
          fat: 16,
          fiber: 0,
          sugar: 21,
          sodium: 50,
          saturatedFat: 10,
          transFat: 0,
          cholesterol: 65,
          vitamins: { 'Vitamin A': 15 },
          minerals: { calcium: 150 }
        },
        ingredients: ['Cream', 'Skim milk', 'Liquid sugar', 'Water', 'Egg yolks', 'Natural vanilla flavor'],
        allergens: ['Contains milk', 'Contains eggs'],
        servingSize: '1/2 cup (104g)',
        servingsPerContainer: 4,
        healthScore: 35,
        tasteScore: 92,
        consumerScore: 88,
        vishScore: 72,
        imageUrl: 'https://images.pexels.com/photos/1362534/pexels-photo-1362534.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'american_oreo_cookies',
        name: 'Oreo Cookies',
        brand: 'Nabisco',
        category: 'American Desserts',
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
          minerals: { iron: 1.1 }
        },
        ingredients: ['Unbleached enriched flour', 'Sugar', 'Palm oil', 'Cocoa', 'High fructose corn syrup', 'Leavening', 'Salt', 'Soy lecithin', 'Vanilla'],
        allergens: ['Contains wheat', 'Contains soy'],
        servingSize: '3 cookies (34g)',
        servingsPerContainer: 15,
        healthScore: 25,
        tasteScore: 95,
        consumerScore: 95,
        vishScore: 72,
        imageUrl: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // 🥪 AMERICAN SANDWICHES & SUBS
      {
        id: 'american_subway_italian_bmt',
        name: 'Italian B.M.T.',
        brand: 'Subway',
        category: 'American Sandwiches',
        nutrition: {
          calories: 410,
          protein: 19,
          carbohydrates: 44,
          fat: 16,
          fiber: 5,
          sugar: 7,
          sodium: 1260,
          saturatedFat: 6,
          transFat: 0,
          cholesterol: 55,
          vitamins: { 'Vitamin A': 20, 'Vitamin C': 25 },
          minerals: { calcium: 260, iron: 4.3 }
        },
        ingredients: ['Italian bread', 'Pepperoni', 'Salami', 'Ham', 'Provolone cheese', 'Lettuce', 'Tomatoes', 'Onions', 'Oil', 'Vinegar'],
        allergens: ['Contains gluten', 'Contains milk'],
        servingSize: '6-inch sub (230g)',
        servingsPerContainer: 1,
        healthScore: 55,
        tasteScore: 85,
        consumerScore: 82,
        vishScore: 74,
        imageUrl: 'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // 🌮 AMERICAN-MEXICAN FUSION
      {
        id: 'american_taco_bell_crunchy_taco',
        name: 'Crunchy Taco',
        brand: 'Taco Bell',
        category: 'American Fast Food',
        nutrition: {
          calories: 170,
          protein: 8,
          carbohydrates: 13,
          fat: 10,
          fiber: 3,
          sugar: 1,
          sodium: 310,
          saturatedFat: 3.5,
          transFat: 0,
          cholesterol: 25,
          vitamins: { 'Vitamin A': 4, 'Vitamin C': 2 },
          minerals: { calcium: 80, iron: 1.4 }
        },
        ingredients: ['Corn taco shell', 'Seasoned beef', 'Lettuce', 'Cheddar cheese'],
        allergens: ['Contains milk'],
        servingSize: '1 taco (78g)',
        servingsPerContainer: 1,
        healthScore: 50,
        tasteScore: 80,
        consumerScore: 85,
        vishScore: 72,
        imageUrl: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // 🍎 HEALTHIER AMERICAN OPTIONS
      {
        id: 'american_greek_yogurt',
        name: 'Greek Yogurt Plain',
        brand: 'Chobani',
        category: 'American Dairy',
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
        consumerScore: 85,
        vishScore: 83,
        imageUrl: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'american_granola_bar',
        name: 'Crunchy Granola Bar',
        brand: 'Nature Valley',
        category: 'American Snacks',
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
        imageUrl: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },

      // 🇮🇳 SOME POPULAR INDIAN FOODS (REDUCED)
      {
        id: 'indian_butter_chicken',
        name: 'Butter Chicken',
        brand: 'Tasty Bite',
        category: 'Indian Ready-to-Eat',
        nutrition: {
          calories: 280,
          protein: 15,
          carbohydrates: 18,
          fat: 18,
          fiber: 2,
          sugar: 12,
          sodium: 680,
          saturatedFat: 8,
          transFat: 0,
          cholesterol: 45,
          vitamins: { 'Vitamin A': 15, 'Vitamin C': 8 },
          minerals: { iron: 2.5, calcium: 120 }
        },
        ingredients: ['Chicken', 'Tomato puree', 'Cream', 'Onions', 'Ginger', 'Garlic', 'Spices', 'Butter'],
        allergens: ['Contains milk'],
        servingSize: '1 package (285g)',
        servingsPerContainer: 1,
        healthScore: 60,
        tasteScore: 90,
        consumerScore: 85,
        vishScore: 78,
        imageUrl: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      },
      {
        id: 'indian_basmati_rice',
        name: 'Basmati Rice',
        brand: 'Tilda',
        category: 'Indian Grains',
        nutrition: {
          calories: 160,
          protein: 3,
          carbohydrates: 36,
          fat: 0,
          fiber: 1,
          sugar: 0,
          sodium: 0,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Thiamin': 0.2 },
          minerals: { iron: 1.2 }
        },
        ingredients: ['Basmati rice'],
        allergens: [],
        servingSize: '1/4 cup dry (45g)',
        servingsPerContainer: 10,
        healthScore: 75,
        tasteScore: 85,
        consumerScore: 80,
        vishScore: 80,
        imageUrl: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database'
      }
    ];
  }

  // Initialize default database - FORCE REFRESH AND DETAILED LOGGING
  private initializeDefaultDatabase(): void {
    console.log('🚀 INITIALIZING FOOD DATABASE...');
    
    // Clear existing cache to ensure fresh data
    this.cache.clear();
    
    const localFoods = this.getLocalFoods();
    console.log(`📦 Generated ${localFoods.length} local foods`);
    
    // Add each food to cache with detailed logging
    localFoods.forEach((food, index) => {
      this.cache.set(food.id, food);
      console.log(`✅ [${index + 1}/${localFoods.length}] Added: ${food.name} (${food.brand}) - Category: ${food.category}`);
    });
    
    // Save to storage
    this.saveCacheToStorage();
    
    // Verify Doritos are properly added
    const doritosFoods = localFoods.filter(food => 
      food.name.toLowerCase().includes('doritos') ||
      food.brand?.toLowerCase().includes('frito-lay')
    );
    
    console.log(`🌶️ DORITOS VERIFICATION:`);
    console.log(`   Total Doritos varieties: ${doritosFoods.length}`);
    doritosFoods.forEach((food, index) => {
      console.log(`   ${index + 1}. ${food.name} (${food.brand}) - ID: ${food.id} - Vish Score: ${food.vishScore}`);
    });
    
    console.log(`🎉 DATABASE INITIALIZATION COMPLETE!`);
    console.log(`   Total foods in cache: ${this.cache.size}`);
    console.log(`   Doritos varieties: ${doritosFoods.length}`);
    console.log(`   Cache saved to localStorage: ✅`);
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

  // Get American foods specifically
  getAmericanFoods(limit: number = 20): FoodItem[] {
    const foods = Array.from(this.cache.values());
    return foods
      .filter(food => 
        food.category.toLowerCase().includes('american') ||
        ['burger', 'pizza', 'fries', 'coca cola', 'pepsi', 'mcdonald', 'kfc', 'subway'].some(brand => 
          food.brand?.toLowerCase().includes(brand) || food.name.toLowerCase().includes(brand)
        )
      )
      .sort((a, b) => b.vishScore - a.vishScore)
      .slice(0, limit);
  }

  // Get Indian foods specifically
  getIndianFoods(limit: number = 10): FoodItem[] {
    const foods = Array.from(this.cache.values());
    return foods
      .filter(food => 
        food.category.toLowerCase().includes('indian') ||
        ['butter chicken', 'basmati', 'curry', 'naan', 'biryani'].some(brand => 
          food.brand?.toLowerCase().includes(brand) || food.name.toLowerCase().includes(brand)
        )
      )
      .sort((a, b) => b.vishScore - a.vishScore)
      .slice(0, limit);
  }

  // Get Doritos specifically
  getDoritosFoods(limit: number = 10): FoodItem[] {
    const foods = Array.from(this.cache.values());
    return foods
      .filter(food => 
        food.name.toLowerCase().includes('doritos') ||
        (food.brand?.toLowerCase().includes('frito-lay') && food.name.toLowerCase().includes('doritos'))
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
    americanFoods: number;
    indianFoods: number;
    doritosFoods: number;
    cacheSize: string;
  } {
    const foods = Array.from(this.cache.values());
    const apiSources = foods.filter(f => f.source === 'api').length;
    const userSources = foods.filter(f => f.source === 'user').length;
    const databaseSources = foods.filter(f => f.source === 'database').length;
    const americanFoods = foods.filter(f => 
      f.category.toLowerCase().includes('american') ||
      ['burger', 'pizza', 'fries', 'coca cola', 'pepsi', 'mcdonald', 'kfc', 'subway'].some(brand => 
        f.brand?.toLowerCase().includes(brand) || f.name.toLowerCase().includes(brand)
      )
    ).length;
    const indianFoods = foods.filter(f => 
      f.category.toLowerCase().includes('indian') ||
      ['butter chicken', 'basmati', 'curry', 'naan', 'biryani'].some(brand => 
        f.brand?.toLowerCase().includes(brand) || f.name.toLowerCase().includes(brand)
      )
    ).length;
    const doritosFoods = foods.filter(f => 
      f.name.toLowerCase().includes('doritos')
    ).length;
    
    const cacheData = localStorage.getItem('foodcheck_food_cache');
    const cacheSize = cacheData ? `${(cacheData.length / 1024).toFixed(2)} KB` : '0 KB';

    return {
      totalFoods: foods.length,
      apiSources,
      userSources,
      databaseSources,
      americanFoods,
      indianFoods,
      doritosFoods,
      cacheSize
    };
  }
}

// Export singleton instance
export const foodDatabaseService = FoodDatabaseService.getInstance();