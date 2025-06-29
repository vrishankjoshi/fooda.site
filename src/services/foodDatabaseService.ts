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
        console.log(`✅ MATCH: ${food.name} (${food.brand}) - Nutrition: ${food.healthScore}, Taste: ${food.tasteScore}, Consumer: ${food.consumerScore}, Vish: ${food.vishScore}`);
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
      console.log(`  📄 ${item.name} (${item.brand}) - Nutrition: ${item.healthScore}, Taste: ${item.tasteScore}, Consumer: ${item.consumerScore}, Vish: ${item.vishScore}`);
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
      'doritos': ['nacho cheese', 'cool ranch', 'spicy nacho', 'flamin hot', 'sweet chili', 'blaze'],
      'deritors': ['doritos', 'nacho cheese', 'cool ranch', 'spicy nacho', 'flamin hot'],
      'candy': ['chocolate', 'gummy', 'lollipop', 'hard candy', 'caramel'],
      'unhealthy': ['junk food', 'processed', 'high sugar', 'high sodium', 'fried'],
      'healthy': ['organic', 'natural', 'low fat', 'high fiber', 'whole grain']
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

  // ENHANCED NUTRITION SCORE CALCULATION
  private calculateNutritionScore(nutrition: {
    calories: number;
    protein: number;
    fiber: number;
    sugar: number;
    sodium: number;
    saturatedFat: number;
    carbohydrates?: number;
    fat?: number;
  }): number {
    let score = 50; // Base score

    console.log(`🧮 Calculating nutrition score for:`, nutrition);

    // POSITIVE FACTORS (add points)
    // High protein is good
    if (nutrition.protein >= 20) score += 20;
    else if (nutrition.protein >= 15) score += 15;
    else if (nutrition.protein >= 10) score += 10;
    else if (nutrition.protein >= 5) score += 5;
    
    // High fiber is excellent
    if (nutrition.fiber >= 10) score += 20;
    else if (nutrition.fiber >= 5) score += 15;
    else if (nutrition.fiber >= 3) score += 10;
    else if (nutrition.fiber >= 1) score += 5;

    // Moderate calories are good
    if (nutrition.calories <= 100) score += 10;
    else if (nutrition.calories <= 200) score += 5;

    // NEGATIVE FACTORS (subtract points)
    // High sugar is bad
    if (nutrition.sugar >= 30) score -= 25;
    else if (nutrition.sugar >= 20) score -= 20;
    else if (nutrition.sugar >= 15) score -= 15;
    else if (nutrition.sugar >= 10) score -= 10;
    else if (nutrition.sugar >= 5) score -= 5;
    
    // High sodium is bad
    if (nutrition.sodium >= 1000) score -= 25;
    else if (nutrition.sodium >= 800) score -= 20;
    else if (nutrition.sodium >= 600) score -= 15;
    else if (nutrition.sodium >= 400) score -= 10;
    else if (nutrition.sodium >= 200) score -= 5;
    
    // High saturated fat is bad
    if (nutrition.saturatedFat >= 15) score -= 20;
    else if (nutrition.saturatedFat >= 10) score -= 15;
    else if (nutrition.saturatedFat >= 7) score -= 10;
    else if (nutrition.saturatedFat >= 5) score -= 5;

    // Very high calories are bad
    if (nutrition.calories >= 500) score -= 15;
    else if (nutrition.calories >= 400) score -= 10;
    else if (nutrition.calories >= 300) score -= 5;

    const finalScore = Math.max(0, Math.min(100, score));
    console.log(`🧮 Nutrition score calculated: ${finalScore}`);
    return finalScore;
  }

  // ENHANCED TASTE SCORE CALCULATION
  private calculateTasteScore(nutrition: {
    sugar: number;
    fat: number;
    sodium: number;
    protein?: number;
  }, brand?: string, category?: string): number {
    let score = 50; // Base score

    console.log(`👅 Calculating taste score for:`, nutrition, brand, category);

    // TASTE ENHANCING FACTORS
    // Moderate sugar enhances taste (but too much is cloying)
    if (nutrition.sugar >= 5 && nutrition.sugar <= 15) score += 20;
    else if (nutrition.sugar >= 15 && nutrition.sugar <= 25) score += 15;
    else if (nutrition.sugar >= 25) score += 10; // Still tasty but too sweet
    
    // Fat adds richness and mouthfeel
    if (nutrition.fat >= 8 && nutrition.fat <= 20) score += 20;
    else if (nutrition.fat >= 20 && nutrition.fat <= 30) score += 15;
    else if (nutrition.fat >= 5 && nutrition.fat < 8) score += 10;
    else if (nutrition.fat >= 30) score += 5; // Too greasy
    
    // Sodium enhances flavor (in moderation)
    if (nutrition.sodium >= 200 && nutrition.sodium <= 600) score += 15;
    else if (nutrition.sodium >= 600 && nutrition.sodium <= 1000) score += 10;
    else if (nutrition.sodium >= 100 && nutrition.sodium < 200) score += 5;
    else if (nutrition.sodium >= 1000) score -= 5; // Too salty

    // Protein can add umami and satisfaction
    if (nutrition.protein && nutrition.protein >= 10) score += 10;
    else if (nutrition.protein && nutrition.protein >= 5) score += 5;

    // BRAND AND CATEGORY BONUSES
    const popularTasteBrands = [
      'doritos', 'lay\'s', 'cheetos', 'oreo', 'coca-cola', 'pepsi',
      'mcdonald\'s', 'kfc', 'burger king', 'ben jerry', 'haagen dazs',
      'kit kat', 'snickers', 'reese\'s', 'hershey\'s', 'twix', 'mars',
      'skittles', 'starburst', 'haribo', 'ferrero rocher'
    ];
    
    if (brand && popularTasteBrands.some(b => brand.toLowerCase().includes(b))) {
      score += 15; // Popular brands are popular for a reason
    }

    // Category-specific taste bonuses
    if (category) {
      const categoryLower = category.toLowerCase();
      if (categoryLower.includes('dessert') || categoryLower.includes('ice cream') || categoryLower.includes('candy')) {
        score += 10; // Desserts are designed to taste good
      } else if (categoryLower.includes('snack') || categoryLower.includes('chip')) {
        score += 8; // Snacks are engineered for taste
      } else if (categoryLower.includes('beverage') || categoryLower.includes('soda')) {
        score += 5; // Beverages focus on taste
      }
    }

    const finalScore = Math.max(0, Math.min(100, score));
    console.log(`👅 Taste score calculated: ${finalScore}`);
    return finalScore;
  }

  // ENHANCED CONSUMER SCORE CALCULATION
  private calculateConsumerScore(brand?: string, category?: string, name?: string): number {
    let score = 50; // Base score

    console.log(`👥 Calculating consumer score for:`, brand, category, name);

    // BRAND RECOGNITION AND POPULARITY
    const megaBrands = [
      'coca-cola', 'pepsi', 'mcdonald\'s', 'kfc', 'burger king', 'subway',
      'doritos', 'lay\'s', 'cheetos', 'pringles', 'oreo', 'kit kat'
    ];
    
    const popularBrands = [
      'nestle', 'unilever', 'kraft', 'general mills', 'kellogg', 'mars',
      'ferrero', 'mondelez', 'danone', 'campbell', 'heinz', 'frito-lay',
      'nabisco', 'ben jerry', 'haagen dazs', 'cheerios', 'frosted flakes',
      'taco bell', 'domino\'s', 'pizza hut', 'starbucks', 'dunkin',
      'hershey\'s', 'snickers', 'reese\'s', 'twix', 'skittles', 'haribo'
    ];

    if (brand) {
      const brandLower = brand.toLowerCase();
      if (megaBrands.some(b => brandLower.includes(b))) {
        score += 25; // Mega brands have highest consumer recognition
      } else if (popularBrands.some(b => brandLower.includes(b))) {
        score += 15; // Popular brands have good recognition
      } else {
        score += 5; // Any brand is better than generic
      }
    }

    // PRODUCT NAME RECOGNITION
    const iconicProducts = [
      'big mac', 'whopper', 'coca-cola', 'pepsi', 'oreo', 'doritos',
      'cheerios', 'frosted flakes', 'kit kat', 'snickers', 'reese\'s',
      'twix', 'skittles', 'starburst', 'haribo', 'ferrero rocher'
    ];

    if (name) {
      const nameLower = name.toLowerCase();
      if (iconicProducts.some(p => nameLower.includes(p))) {
        score += 20; // Iconic products have massive consumer appeal
      }
    }

    // CATEGORY CONSUMER PREFERENCES
    if (category) {
      const categoryLower = category.toLowerCase();
      
      // Categories consumers love
      if (categoryLower.includes('fast food') || categoryLower.includes('pizza')) {
        score += 15; // Fast food has high consumer satisfaction
      } else if (categoryLower.includes('snack') || categoryLower.includes('chip')) {
        score += 12; // Snacks are impulse purchases with high satisfaction
      } else if (categoryLower.includes('dessert') || categoryLower.includes('ice cream') || categoryLower.includes('candy')) {
        score += 10; // Desserts make people happy
      } else if (categoryLower.includes('beverage') || categoryLower.includes('soda')) {
        score += 8; // Beverages have loyal followings
      } else if (categoryLower.includes('breakfast') || categoryLower.includes('cereal')) {
        score += 6; // Breakfast foods have routine satisfaction
      }
    }

    // RANDOM VARIATION FOR REALISM (consumer preferences vary)
    const variation = Math.floor(Math.random() * 11) - 5; // -5 to +5
    score += variation;

    const finalScore = Math.max(0, Math.min(100, score));
    console.log(`👥 Consumer score calculated: ${finalScore}`);
    return finalScore;
  }

  // CALCULATE VISH SCORE (AVERAGE OF ALL THREE)
  private calculateVishScore(nutritionScore: number, tasteScore: number, consumerScore: number): number {
    const vishScore = Math.round((nutritionScore + tasteScore + consumerScore) / 3);
    console.log(`⭐ Vish Score calculated: (${nutritionScore} + ${tasteScore} + ${consumerScore}) / 3 = ${vishScore}`);
    return vishScore;
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
    const nutritionScore = this.calculateNutritionScore({
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
      sodium: nutritionixFood.nf_sodium,
      protein: nutritionixFood.nf_protein
    }, nutritionixFood.brand_name, 'Packaged Food');

    const consumerScore = this.calculateConsumerScore(nutritionixFood.brand_name, 'Packaged Food', nutritionixFood.food_name);
    const vishScore = this.calculateVishScore(nutritionScore, tasteScore, consumerScore);

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
      healthScore: nutritionScore,
      tasteScore: tasteScore,
      consumerScore: consumerScore,
      vishScore: vishScore,
      imageUrl: nutritionixFood.photo?.thumb,
      lastUpdated: new Date().toISOString(),
      source: 'api'
    };
  }

  // Convert OpenFoodFacts data to FoodItem
  private convertOpenFoodFactsToFoodItem(product: OpenFoodFactsProduct): FoodItem {
    const nutrition = product.nutriments || {};
    
    const nutritionScore = this.calculateNutritionScore({
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
      sodium: nutrition['sodium_100g'] || 0,
      protein: nutrition['proteins_100g'] || 0
    }, product.brands, product.categories?.split(',')[0]);

    const consumerScore = this.calculateConsumerScore(product.brands, product.categories?.split(',')[0], product.product_name);
    const vishScore = this.calculateVishScore(nutritionScore, tasteScore, consumerScore);

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
      healthScore: nutritionScore,
      tasteScore: tasteScore,
      consumerScore: consumerScore,
      vishScore: vishScore,
      imageUrl: product.image_url,
      lastUpdated: new Date().toISOString(),
      source: 'api'
    };
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

  // Get local foods (fallback database) - MASSIVELY EXPANDED WITH UNHEALTHY OPTIONS
  private getLocalFoods(): FoodItem[] {
    const foods = [
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
        imageUrl: 'https://images.pexels.com/photos/552056/pexels-photo-552056.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
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
        imageUrl: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },

      // 🌶️ DORITOS VARIETIES WITH PROPER IMAGES
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
        imageUrl: 'https://images.pexels.com/photos/4958792/pexels-photo-4958792.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
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
        ingredients: ['Corn', 'Vegetable oil', 'Ranch seasoning', 'Salt', 'Buttermilk', 'Onion powder', 'Garlic powder'],
        allergens: ['Contains milk'],
        servingSize: '1 oz (28g)',
        servingsPerContainer: 9,
        imageUrl: 'https://images.pexels.com/photos/4958794/pexels-photo-4958794.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
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
        imageUrl: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },

      // 🍟 MORE AMERICAN SNACKS
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
        imageUrl: 'https://images.pexels.com/photos/4958799/pexels-photo-4958799.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },

      // 🍭 UNHEALTHY CANDY & SWEETS SECTION
      {
        id: 'unhealthy_snickers_bar',
        name: 'Snickers Bar',
        brand: 'Mars',
        category: 'Unhealthy Candy',
        nutrition: {
          calories: 250,
          protein: 4,
          carbohydrates: 33,
          fat: 12,
          fiber: 1,
          sugar: 27,
          sodium: 120,
          saturatedFat: 4.5,
          transFat: 0,
          cholesterol: 5,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Milk chocolate', 'Peanuts', 'Corn syrup', 'Sugar', 'Skim milk', 'Butter', 'Lactose', 'Salt', 'Egg whites'],
        allergens: ['Contains milk', 'Contains peanuts', 'Contains eggs', 'May contain tree nuts'],
        servingSize: '1 bar (52.7g)',
        servingsPerContainer: 1,
        imageUrl: 'https://images.pexels.com/photos/4958800/pexels-photo-4958800.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },
      {
        id: 'unhealthy_kit_kat',
        name: 'Kit Kat Bar',
        brand: 'Hershey\'s',
        category: 'Unhealthy Candy',
        nutrition: {
          calories: 210,
          protein: 3,
          carbohydrates: 27,
          fat: 11,
          fiber: 1,
          sugar: 22,
          sodium: 16,
          saturatedFat: 7,
          transFat: 0,
          cholesterol: 5,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Sugar', 'Wheat flour', 'Cocoa butter', 'Nonfat milk', 'Chocolate', 'Refined palm kernel oil', 'Lactose'],
        allergens: ['Contains milk', 'Contains wheat', 'Contains soy'],
        servingSize: '1 package (42g)',
        servingsPerContainer: 1,
        imageUrl: 'https://images.pexels.com/photos/4958801/pexels-photo-4958801.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },
      {
        id: 'unhealthy_skittles',
        name: 'Skittles Original',
        brand: 'Mars Wrigley',
        category: 'Unhealthy Candy',
        nutrition: {
          calories: 230,
          protein: 0,
          carbohydrates: 56,
          fat: 2.5,
          fiber: 0,
          sugar: 47,
          sodium: 15,
          saturatedFat: 2.5,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Sugar', 'Corn syrup', 'Hydrogenated palm kernel oil', 'Citric acid', 'Tapioca dextrin', 'Modified corn starch', 'Natural and artificial flavors'],
        allergens: [],
        servingSize: '1 package (61.5g)',
        servingsPerContainer: 1,
        imageUrl: 'https://images.pexels.com/photos/4958802/pexels-photo-4958802.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },
      {
        id: 'unhealthy_twix',
        name: 'Twix Caramel Cookie Bars',
        brand: 'Mars',
        category: 'Unhealthy Candy',
        nutrition: {
          calories: 250,
          protein: 2,
          carbohydrates: 37,
          fat: 12,
          fiber: 1,
          sugar: 27,
          sodium: 115,
          saturatedFat: 6,
          transFat: 0,
          cholesterol: 5,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Milk chocolate', 'Corn syrup', 'Sugar', 'Palm oil', 'Skim milk', 'Lactose', 'Salt', 'Cocoa powder'],
        allergens: ['Contains milk', 'Contains wheat', 'Contains soy'],
        servingSize: '1 package (50.7g)',
        servingsPerContainer: 1,
        imageUrl: 'https://images.pexels.com/photos/4958803/pexels-photo-4958803.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },
      {
        id: 'unhealthy_reeses_cups',
        name: 'Reese\'s Peanut Butter Cups',
        brand: 'Hershey\'s',
        category: 'Unhealthy Candy',
        nutrition: {
          calories: 210,
          protein: 5,
          carbohydrates: 24,
          fat: 13,
          fiber: 2,
          sugar: 21,
          sodium: 160,
          saturatedFat: 5,
          transFat: 0,
          cholesterol: 5,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Milk chocolate', 'Peanuts', 'Sugar', 'Dextrose', 'Cocoa butter', 'Skim milk', 'Salt', 'Soy lecithin'],
        allergens: ['Contains milk', 'Contains peanuts', 'Contains soy'],
        servingSize: '1 package (42g)',
        servingsPerContainer: 1,
        imageUrl: 'https://images.pexels.com/photos/4958804/pexels-photo-4958804.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },

      // 🍰 UNHEALTHY DESSERTS & BAKED GOODS
      {
        id: 'unhealthy_oreo_cookies',
        name: 'Oreo Original Cookies',
        brand: 'Nabisco',
        category: 'Unhealthy Desserts',
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
          minerals: {}
        },
        ingredients: ['Unbleached enriched flour', 'Sugar', 'Palm oil', 'Cocoa', 'High fructose corn syrup', 'Leavening', 'Salt', 'Soy lecithin'],
        allergens: ['Contains wheat', 'Contains soy'],
        servingSize: '3 cookies (34g)',
        servingsPerContainer: 15,
        imageUrl: 'https://images.pexels.com/photos/4958805/pexels-photo-4958805.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },
      {
        id: 'unhealthy_chips_ahoy',
        name: 'Chips Ahoy! Original Cookies',
        brand: 'Nabisco',
        category: 'Unhealthy Desserts',
        nutrition: {
          calories: 160,
          protein: 2,
          carbohydrates: 22,
          fat: 8,
          fiber: 1,
          sugar: 11,
          sodium: 105,
          saturatedFat: 2.5,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Unbleached enriched flour', 'Sugar', 'Vegetable oil', 'Chocolate chips', 'High fructose corn syrup', 'Leavening', 'Salt'],
        allergens: ['Contains wheat', 'Contains soy'],
        servingSize: '3 cookies (32g)',
        servingsPerContainer: 18,
        imageUrl: 'https://images.pexels.com/photos/4958806/pexels-photo-4958806.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },
      {
        id: 'unhealthy_pop_tarts',
        name: 'Pop-Tarts Strawberry',
        brand: 'Kellogg\'s',
        category: 'Unhealthy Breakfast',
        nutrition: {
          calories: 400,
          protein: 4,
          carbohydrates: 76,
          fat: 10,
          fiber: 1,
          sugar: 30,
          sodium: 370,
          saturatedFat: 3,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin A': 10, 'Thiamin': 10, 'Riboflavin': 10, 'Niacin': 10 },
          minerals: { iron: 10 }
        },
        ingredients: ['Enriched flour', 'Corn syrup', 'High fructose corn syrup', 'Sugar', 'Soybean oil', 'Strawberry puree', 'Salt', 'Citric acid'],
        allergens: ['Contains wheat', 'Contains soy'],
        servingSize: '1 pastry (104g)',
        servingsPerContainer: 8,
        imageUrl: 'https://images.pexels.com/photos/4958807/pexels-photo-4958807.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },

      // 🍕 UNHEALTHY FROZEN FOODS
      {
        id: 'unhealthy_hot_pockets',
        name: 'Hot Pockets Pepperoni Pizza',
        brand: 'Nestle',
        category: 'Unhealthy Frozen Food',
        nutrition: {
          calories: 300,
          protein: 11,
          carbohydrates: 39,
          fat: 11,
          fiber: 2,
          sugar: 5,
          sodium: 700,
          saturatedFat: 4.5,
          transFat: 0,
          cholesterol: 25,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Enriched flour', 'Water', 'Pepperoni', 'Mozzarella cheese', 'Tomato paste', 'Vegetable oil', 'Salt', 'Yeast'],
        allergens: ['Contains wheat', 'Contains milk'],
        servingSize: '1 piece (127g)',
        servingsPerContainer: 2,
        imageUrl: 'https://images.pexels.com/photos/4958808/pexels-photo-4958808.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },
      {
        id: 'unhealthy_bagel_bites',
        name: 'Bagel Bites Cheese & Pepperoni',
        brand: 'Kraft Heinz',
        category: 'Unhealthy Frozen Food',
        nutrition: {
          calories: 190,
          protein: 7,
          carbohydrates: 27,
          fat: 6,
          fiber: 1,
          sugar: 2,
          sodium: 380,
          saturatedFat: 2.5,
          transFat: 0,
          cholesterol: 10,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Enriched flour', 'Water', 'Mozzarella cheese', 'Pepperoni', 'Tomato paste', 'Yeast', 'Salt', 'Sugar'],
        allergens: ['Contains wheat', 'Contains milk'],
        servingSize: '4 pieces (88g)',
        servingsPerContainer: 5,
        imageUrl: 'https://images.pexels.com/photos/4958809/pexels-photo-4958809.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },

      // 🥤 UNHEALTHY BEVERAGES
      {
        id: 'unhealthy_mountain_dew',
        name: 'Mountain Dew',
        brand: 'PepsiCo',
        category: 'Unhealthy Beverages',
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
        ingredients: ['Carbonated water', 'High fructose corn syrup', 'Concentrated orange juice', 'Citric acid', 'Natural flavor', 'Sodium benzoate', 'Caffeine'],
        allergens: [],
        servingSize: '12 fl oz (355ml)',
        servingsPerContainer: 1,
        imageUrl: 'https://images.pexels.com/photos/4958810/pexels-photo-4958810.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },
      {
        id: 'unhealthy_energy_drink',
        name: 'Red Bull Energy Drink',
        brand: 'Red Bull',
        category: 'Unhealthy Beverages',
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
        ingredients: ['Carbonated water', 'Sucrose', 'Glucose', 'Citric acid', 'Taurine', 'Sodium bicarbonate', 'Magnesium carbonate', 'Caffeine'],
        allergens: [],
        servingSize: '8.4 fl oz (248ml)',
        servingsPerContainer: 1,
        imageUrl: 'https://images.pexels.com/photos/4958811/pexels-photo-4958811.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },

      // 🍟 MORE UNHEALTHY SNACKS
      {
        id: 'unhealthy_cheetos',
        name: 'Cheetos Crunchy',
        brand: 'Frito-Lay',
        category: 'Unhealthy Snacks',
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
        ingredients: ['Enriched corn meal', 'Vegetable oil', 'Cheese seasoning', 'Salt', 'Monosodium glutamate', 'Artificial color'],
        allergens: ['Contains milk'],
        servingSize: '1 oz (28g)',
        servingsPerContainer: 9,
        imageUrl: 'https://images.pexels.com/photos/4958812/pexels-photo-4958812.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },
      {
        id: 'unhealthy_pringles',
        name: 'Pringles Original',
        brand: 'Kellogg\'s',
        category: 'Unhealthy Snacks',
        nutrition: {
          calories: 150,
          protein: 1,
          carbohydrates: 15,
          fat: 9,
          fiber: 1,
          sugar: 0,
          sodium: 135,
          saturatedFat: 2.5,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Dehydrated potatoes', 'Vegetable oil', 'Degerminated yellow corn flour', 'Cornstarch', 'Rice flour', 'Maltodextrin', 'Salt'],
        allergens: ['Contains wheat'],
        servingSize: '1 oz (28g)',
        servingsPerContainer: 5,
        imageUrl: 'https://images.pexels.com/photos/4958813/pexels-photo-4958813.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },

      // 🍦 UNHEALTHY ICE CREAM
      {
        id: 'unhealthy_ben_jerry_chunky_monkey',
        name: 'Chunky Monkey Ice Cream',
        brand: 'Ben & Jerry\'s',
        category: 'Unhealthy Desserts',
        nutrition: {
          calories: 300,
          protein: 5,
          carbohydrates: 32,
          fat: 17,
          fiber: 2,
          sugar: 26,
          sodium: 65,
          saturatedFat: 11,
          transFat: 0,
          cholesterol: 65,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Cream', 'Skim milk', 'Liquid sugar', 'Water', 'Banana puree', 'Walnuts', 'Fudge chunks', 'Egg yolks'],
        allergens: ['Contains milk', 'Contains eggs', 'Contains tree nuts'],
        servingSize: '1/2 cup (104g)',
        servingsPerContainer: 4,
        imageUrl: 'https://images.pexels.com/photos/4958814/pexels-photo-4958814.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },

      // 🥓 UNHEALTHY PROCESSED MEATS
      {
        id: 'unhealthy_spam',
        name: 'SPAM Classic',
        brand: 'Hormel',
        category: 'Unhealthy Processed Meat',
        nutrition: {
          calories: 180,
          protein: 7,
          carbohydrates: 2,
          fat: 16,
          fiber: 0,
          sugar: 1,
          sodium: 790,
          saturatedFat: 6,
          transFat: 0,
          cholesterol: 40,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Pork with ham', 'Salt', 'Water', 'Potato starch', 'Sugar', 'Sodium nitrite'],
        allergens: [],
        servingSize: '2 oz (56g)',
        servingsPerContainer: 6,
        imageUrl: 'https://images.pexels.com/photos/4958815/pexels-photo-4958815.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },

      // 🥤 FAIRLIFE CHOCOLATE MILK (HEALTHIER OPTION)
      {
        id: 'healthy_fairlife_chocolate_milk',
        name: 'Core Power Chocolate Protein Shake',
        brand: 'Fairlife',
        category: 'Healthy Beverages',
        nutrition: {
          calories: 170,
          protein: 26,
          carbohydrates: 9,
          fat: 4.5,
          fiber: 0,
          sugar: 8,
          sodium: 380,
          saturatedFat: 3,
          transFat: 0,
          cholesterol: 25,
          vitamins: { 'Vitamin A': 10, 'Vitamin D': 25, 'Vitamin B12': 25 },
          minerals: { calcium: 350, potassium: 490 }
        },
        ingredients: ['Fairlife ultrafiltered milk', 'Natural flavors', 'Cocoa', 'Stevia leaf extract', 'Monk fruit extract'],
        allergens: ['Contains milk'],
        servingSize: '1 bottle (414ml)',
        servingsPerContainer: 1,
        imageUrl: 'https://images.pexels.com/photos/4958798/pexels-photo-4958798.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },

      // 🥗 HEALTHY OPTIONS FOR BALANCE
      {
        id: 'healthy_greek_yogurt',
        name: 'Greek Yogurt Plain',
        brand: 'Chobani',
        category: 'Healthy Dairy',
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
          vitamins: { 'Vitamin A': 0, 'Vitamin C': 0 },
          minerals: { calcium: 200 }
        },
        ingredients: ['Cultured pasteurized nonfat milk', 'Live and active cultures'],
        allergens: ['Contains milk'],
        servingSize: '3/4 cup (170g)',
        servingsPerContainer: 1,
        imageUrl: 'https://images.pexels.com/photos/4958816/pexels-photo-4958816.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },
      {
        id: 'healthy_almonds',
        name: 'Raw Almonds',
        brand: 'Blue Diamond',
        category: 'Healthy Nuts',
        nutrition: {
          calories: 170,
          protein: 6,
          carbohydrates: 6,
          fat: 15,
          fiber: 4,
          sugar: 1,
          sodium: 0,
          saturatedFat: 1,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin E': 35 },
          minerals: { magnesium: 20, calcium: 8 }
        },
        ingredients: ['Almonds'],
        allergens: ['Contains tree nuts'],
        servingSize: '1 oz (28g)',
        servingsPerContainer: 16,
        imageUrl: 'https://images.pexels.com/photos/4958817/pexels-photo-4958817.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },
      {
        id: 'healthy_quinoa',
        name: 'Organic Quinoa',
        brand: 'Ancient Harvest',
        category: 'Healthy Grains',
        nutrition: {
          calories: 170,
          protein: 6,
          carbohydrates: 30,
          fat: 2.5,
          fiber: 3,
          sugar: 1,
          sodium: 0,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: {},
          minerals: { iron: 8, magnesium: 15 }
        },
        ingredients: ['Organic quinoa'],
        allergens: [],
        servingSize: '1/4 cup dry (43g)',
        servingsPerContainer: 11,
        imageUrl: 'https://images.pexels.com/photos/4958818/pexels-photo-4958818.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },

      // 🍞 MORE UNHEALTHY PROCESSED FOODS
      {
        id: 'unhealthy_wonder_bread',
        name: 'Wonder Bread Classic White',
        brand: 'Wonder',
        category: 'Unhealthy Bread',
        nutrition: {
          calories: 80,
          protein: 2,
          carbohydrates: 15,
          fat: 1,
          fiber: 1,
          sugar: 2,
          sodium: 135,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Thiamin': 10, 'Riboflavin': 6, 'Niacin': 8, 'Folic acid': 10 },
          minerals: { iron: 6 }
        },
        ingredients: ['Enriched wheat flour', 'Water', 'High fructose corn syrup', 'Yeast', 'Salt', 'Soybean oil'],
        allergens: ['Contains wheat', 'Contains soy'],
        servingSize: '1 slice (28g)',
        servingsPerContainer: 20,
        imageUrl: 'https://images.pexels.com/photos/4958819/pexels-photo-4958819.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },
      {
        id: 'unhealthy_velveeta_cheese',
        name: 'Velveeta Original Cheese',
        brand: 'Kraft',
        category: 'Unhealthy Processed Cheese',
        nutrition: {
          calories: 80,
          protein: 5,
          carbohydrates: 3,
          fat: 6,
          fiber: 0,
          sugar: 3,
          sodium: 410,
          saturatedFat: 4,
          transFat: 0,
          cholesterol: 20,
          vitamins: { 'Vitamin A': 6 },
          minerals: { calcium: 15 }
        },
        ingredients: ['Milk', 'Water', 'Milkfat', 'Milk protein concentrate', 'Salt', 'Calcium phosphate', 'Sodium phosphate'],
        allergens: ['Contains milk'],
        servingSize: '1 oz (28g)',
        servingsPerContainer: 32,
        imageUrl: 'https://images.pexels.com/photos/4958820/pexels-photo-4958820.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      },

      // 🥫 UNHEALTHY CANNED FOODS
      {
        id: 'unhealthy_chef_boyardee',
        name: 'Chef Boyardee Beefaroni',
        brand: 'ConAgra',
        category: 'Unhealthy Canned Food',
        nutrition: {
          calories: 250,
          protein: 9,
          carbohydrates: 33,
          fat: 9,
          fiber: 3,
          sugar: 6,
          sodium: 900,
          saturatedFat: 4,
          transFat: 0,
          cholesterol: 20,
          vitamins: {},
          minerals: {}
        },
        ingredients: ['Tomatoes', 'Water', 'Enriched pasta', 'Beef', 'Crackermeal', 'High fructose corn syrup', 'Salt'],
        allergens: ['Contains wheat'],
        servingSize: '1 cup (252g)',
        servingsPerContainer: 1,
        imageUrl: 'https://images.pexels.com/photos/4958821/pexels-photo-4958821.jpeg',
        lastUpdated: new Date().toISOString(),
        source: 'database' as const
      }
    ];

    // Calculate scores for each food item
    return foods.map(food => {
      const nutritionScore = this.calculateNutritionScore({
        calories: food.nutrition.calories,
        protein: food.nutrition.protein,
        fiber: food.nutrition.fiber,
        sugar: food.nutrition.sugar,
        sodium: food.nutrition.sodium,
        saturatedFat: food.nutrition.saturatedFat,
        carbohydrates: food.nutrition.carbohydrates,
        fat: food.nutrition.fat
      });

      const tasteScore = this.calculateTasteScore({
        sugar: food.nutrition.sugar,
        fat: food.nutrition.fat,
        sodium: food.nutrition.sodium,
        protein: food.nutrition.protein
      }, food.brand, food.category);

      const consumerScore = this.calculateConsumerScore(food.brand, food.category, food.name);
      const vishScore = this.calculateVishScore(nutritionScore, tasteScore, consumerScore);

      return {
        ...food,
        healthScore: nutritionScore,
        tasteScore: tasteScore,
        consumerScore: consumerScore,
        vishScore: vishScore
      };
    });
  }

  // Initialize default database - FORCE REFRESH AND DETAILED LOGGING
  private initializeDefaultDatabase(): void {
    console.log('🚀 INITIALIZING EXPANDED FOOD DATABASE WITH UNHEALTHY OPTIONS...');
    
    // Clear existing cache to ensure fresh data
    this.cache.clear();
    
    const localFoods = this.getLocalFoods();
    console.log(`📦 Generated ${localFoods.length} local foods with calculated scores`);
    
    // Add each food to cache with detailed logging
    localFoods.forEach((food, index) => {
      this.cache.set(food.id, food);
      console.log(`✅ [${index + 1}/${localFoods.length}] Added: ${food.name} (${food.brand})`);
      console.log(`   📊 Nutrition: ${food.healthScore}, 👅 Taste: ${food.tasteScore}, 👥 Consumer: ${food.consumerScore}, ⭐ Vish: ${food.vishScore}`);
    });
    
    // Save to storage
    this.saveCacheToStorage();
    
    // Verify categories are properly distributed
    const healthyFoods = localFoods.filter(food => food.vishScore >= 70);
    const moderateFoods = localFoods.filter(food => food.vishScore >= 50 && food.vishScore < 70);
    const unhealthyFoods = localFoods.filter(food => food.vishScore < 50);
    
    console.log(`🍎 FOOD DISTRIBUTION:`);
    console.log(`   Healthy (70+): ${healthyFoods.length} foods`);
    console.log(`   Moderate (50-69): ${moderateFoods.length} foods`);
    console.log(`   Unhealthy (<50): ${unhealthyFoods.length} foods`);
    
    // Log unhealthy foods specifically
    console.log(`🚫 UNHEALTHY FOODS ADDED:`);
    unhealthyFoods.forEach((food, index) => {
      console.log(`   ${index + 1}. ${food.name} (${food.brand}) - Vish: ${food.vishScore}`);
    });
    
    console.log(`🎉 EXPANDED DATABASE INITIALIZATION COMPLETE!`);
    console.log(`   Total foods in cache: ${this.cache.size}`);
    console.log(`   Includes healthy, moderate, and unhealthy options: ✅`);
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

  // Get unhealthy foods
  getUnhealthyFoods(limit: number = 10): FoodItem[] {
    const foods = Array.from(this.cache.values());
    return foods
      .filter(food => food.vishScore < 50)
      .sort((a, b) => a.vishScore - b.vishScore)
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

  // Get foods by category
  getFoodsByCategory(category: 'healthy' | 'moderate' | 'unhealthy', limit: number = 20): FoodItem[] {
    const foods = Array.from(this.cache.values());
    return foods
      .filter(food => {
        if (category === 'healthy') return food.vishScore >= 70;
        if (category === 'moderate') return food.vishScore >= 50 && food.vishScore < 70;
        if (category === 'unhealthy') return food.vishScore < 50;
        return false;
      })
      .sort((a, b) => category === 'unhealthy' ? a.vishScore - b.vishScore : b.vishScore - a.vishScore)
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
    healthyFoods: number;
    unhealthyFoods: number;
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
    const healthyFoods = foods.filter(f => f.vishScore >= 70).length;
    const unhealthyFoods = foods.filter(f => f.vishScore < 50).length;
    
    const cacheData = localStorage.getItem('foodcheck_food_cache');
    const cacheSize = cacheData ? `${(cacheData.length / 1024).toFixed(2)} KB` : '0 KB';

    return {
      totalFoods: foods.length,
      apiSources,
      userSources,
      databaseSources,
      americanFoods,
      healthyFoods,
      unhealthyFoods,
      cacheSize
    };
  }
}

// Export singleton instance
export const foodDatabaseService = FoodDatabaseService.getInstance();