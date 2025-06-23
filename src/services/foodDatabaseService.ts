// Enhanced Food Database Service with Multiple API Integrations
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
  source: 'nutritionix' | 'openfoodfacts' | 'usda' | 'edamam' | 'spoonacular' | 'user' | 'database';
  verified: boolean;
  popularity: number;
}

export interface FoodSearchResult {
  items: FoodItem[];
  total: number;
  page: number;
  hasMore: boolean;
  sources: string[];
}

// API Response Interfaces
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
  photo: {
    thumb: string;
    highres: string;
  };
  tags: {
    item: string;
    measure: string;
    quantity: string;
    food_group: number;
    tag_id: number;
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
    'cholesterol_100g': number;
  };
  image_url: string;
  code: string;
  nutrition_grades: string;
  popularity_tags: string[];
}

export interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  gtinUpc?: string;
  ingredients?: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    nutrientNumber: string;
    unitName: string;
    value: number;
  }>;
  foodCategory?: {
    description: string;
  };
  servingSize?: number;
  servingSizeUnit?: string;
}

export interface EdamamFood {
  food: {
    foodId: string;
    label: string;
    brand?: string;
    category: string;
    categoryLabel: string;
    nutrients: {
      ENERC_KCAL: number;
      PROCNT: number;
      FAT: number;
      CHOCDF: number;
      FIBTG: number;
      SUGAR: number;
      NA: number;
      FASAT: number;
      CHOLE: number;
    };
    image?: string;
  };
  measures: Array<{
    uri: string;
    label: string;
    weight: number;
  }>;
}

export interface SpoonacularFood {
  id: number;
  title: string;
  image: string;
  nutrition: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
  spoonacularScore: number;
  healthScore: number;
  pricePerServing: number;
}

class FoodDatabaseService {
  private static instance: FoodDatabaseService;
  private cache: Map<string, FoodItem> = new Map();
  private searchCache: Map<string, FoodSearchResult> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  
  // API Keys (these would be in environment variables in production)
  private readonly NUTRITIONIX_APP_ID = 'demo_app_id'; // Replace with actual API key
  private readonly NUTRITIONIX_API_KEY = 'demo_api_key'; // Replace with actual API key
  private readonly USDA_API_KEY = 'DEMO_KEY'; // Replace with actual API key
  private readonly EDAMAM_APP_ID = 'demo_app_id'; // Replace with actual API key
  private readonly EDAMAM_API_KEY = 'demo_api_key'; // Replace with actual API key
  private readonly SPOONACULAR_API_KEY = 'demo_api_key'; // Replace with actual API key

  static getInstance(): FoodDatabaseService {
    if (!FoodDatabaseService.instance) {
      FoodDatabaseService.instance = new FoodDatabaseService();
    }
    return FoodDatabaseService.instance;
  }

  constructor() {
    this.loadCacheFromStorage();
    this.initializeComprehensiveDatabase();
  }

  // Enhanced search with multiple API sources
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
      const searchPromises = [
        this.searchNutritionix(query, limit),
        this.searchOpenFoodFacts(query, limit),
        this.searchUSDA(query, limit),
        this.searchEdamam(query, limit),
        this.searchSpoonacular(query, limit),
        this.searchLocalDatabase(query, page, limit)
      ];

      const results = await Promise.allSettled(searchPromises);
      const allItems: FoodItem[] = [];
      const sources: string[] = [];

      // Combine results from all sources
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const sourceNames = ['Nutritionix', 'OpenFoodFacts', 'USDA', 'Edamam', 'Spoonacular', 'Local'];
          if (Array.isArray(result.value)) {
            allItems.push(...result.value);
            if (result.value.length > 0) {
              sources.push(sourceNames[index]);
            }
          } else if (result.value && 'items' in result.value) {
            allItems.push(...result.value.items);
            if (result.value.items.length > 0) {
              sources.push(sourceNames[index]);
            }
          }
        }
      });

      // Remove duplicates and enhance with popularity scoring
      const uniqueItems = this.removeDuplicatesAndEnhance(allItems);
      const sortedItems = this.sortByRelevanceAndPopularity(uniqueItems, query);
      
      // Paginate results
      const startIndex = (page - 1) * limit;
      const paginatedItems = sortedItems.slice(startIndex, startIndex + limit);

      const searchResult: FoodSearchResult = {
        items: paginatedItems,
        total: sortedItems.length,
        page,
        hasMore: startIndex + limit < sortedItems.length,
        sources
      };

      // Cache the result
      this.searchCache.set(cacheKey, searchResult);
      this.saveCacheToStorage();
      
      return searchResult;
    } catch (error) {
      console.error('Error searching foods:', error);
      
      // Fallback to local database only
      const localResult = await this.searchLocalDatabase(query, page, limit);
      return {
        ...localResult,
        sources: ['Local Database']
      };
    }
  }

  // Nutritionix API Search
  private async searchNutritionix(query: string, limit: number): Promise<FoodItem[]> {
    try {
      // Simulate API call with demo data for now
      const demoNutritionixFoods = this.getDemoNutritionixFoods(query, limit);
      return demoNutritionixFoods.map(food => this.convertNutritionixToFoodItem(food));
    } catch (error) {
      console.error('Nutritionix search error:', error);
      return [];
    }
  }

  // OpenFoodFacts API Search
  private async searchOpenFoodFacts(query: string, limit: number): Promise<FoodItem[]> {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${limit}&fields=product_name,brands,categories,ingredients_text,allergens,nutriments,image_url,code,nutrition_grades,popularity_tags`
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
      return this.getDemoOpenFoodFactsFoods(query, limit);
    }
  }

  // USDA FoodData Central API Search
  private async searchUSDA(query: string, limit: number): Promise<FoodItem[]> {
    try {
      // Simulate USDA API call with demo data
      const demoUSDAFoods = this.getDemoUSDAFoods(query, limit);
      return demoUSDAFoods.map(food => this.convertUSDAToFoodItem(food));
    } catch (error) {
      console.error('USDA search error:', error);
      return [];
    }
  }

  // Edamam Food Database API Search
  private async searchEdamam(query: string, limit: number): Promise<FoodItem[]> {
    try {
      // Simulate Edamam API call with demo data
      const demoEdamamFoods = this.getDemoEdamamFoods(query, limit);
      return demoEdamamFoods.map(food => this.convertEdamamToFoodItem(food));
    } catch (error) {
      console.error('Edamam search error:', error);
      return [];
    }
  }

  // Spoonacular API Search
  private async searchSpoonacular(query: string, limit: number): Promise<FoodItem[]> {
    try {
      // Simulate Spoonacular API call with demo data
      const demoSpoonacularFoods = this.getDemoSpoonacularFoods(query, limit);
      return demoSpoonacularFoods.map(food => this.convertSpoonacularToFoodItem(food));
    } catch (error) {
      console.error('Spoonacular search error:', error);
      return [];
    }
  }

  // Enhanced local database search
  private async searchLocalDatabase(query: string, page: number, limit: number): Promise<FoodSearchResult> {
    const localFoods = this.getComprehensiveLocalFoods();
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
      hasMore: startIndex + limit < filteredFoods.length,
      sources: ['Local Database']
    };
  }

  // Demo data generators (replace with actual API calls when keys are available)
  private getDemoNutritionixFoods(query: string, limit: number): NutritionixFood[] {
    const demoFoods: NutritionixFood[] = [
      {
        food_name: `${query} Protein Bar`,
        brand_name: 'Quest',
        serving_qty: 1,
        serving_unit: 'bar',
        nf_calories: 200,
        nf_total_fat: 8,
        nf_saturated_fat: 3,
        nf_cholesterol: 5,
        nf_sodium: 250,
        nf_total_carbohydrate: 22,
        nf_dietary_fiber: 14,
        nf_sugars: 1,
        nf_protein: 20,
        nf_potassium: 200,
        photo: { thumb: '', highres: '' },
        tags: { item: 'bar', measure: 'piece', quantity: '1', food_group: 1, tag_id: 1 }
      },
      {
        food_name: `Organic ${query} Cereal`,
        brand_name: 'Kashi',
        serving_qty: 1,
        serving_unit: 'cup',
        nf_calories: 120,
        nf_total_fat: 1,
        nf_saturated_fat: 0,
        nf_cholesterol: 0,
        nf_sodium: 95,
        nf_total_carbohydrate: 25,
        nf_dietary_fiber: 10,
        nf_sugars: 6,
        nf_protein: 13,
        nf_potassium: 300,
        photo: { thumb: '', highres: '' },
        tags: { item: 'cereal', measure: 'cup', quantity: '1', food_group: 2, tag_id: 2 }
      }
    ];
    return demoFoods.slice(0, limit);
  }

  private getDemoOpenFoodFactsFoods(query: string, limit: number): OpenFoodFactsProduct[] {
    const demoProducts: OpenFoodFactsProduct[] = [
      {
        product_name: `${query} Crackers`,
        brands: 'Pepperidge Farm',
        categories: 'Snacks, Crackers',
        ingredients_text: 'Enriched wheat flour, vegetable oil, salt, sugar',
        allergens: 'gluten',
        nutriments: {
          'energy-kcal_100g': 480,
          'fat_100g': 20,
          'saturated-fat_100g': 3,
          'carbohydrates_100g': 65,
          'sugars_100g': 4,
          'fiber_100g': 3,
          'proteins_100g': 10,
          'salt_100g': 2,
          'sodium_100g': 800,
          'cholesterol_100g': 0
        },
        image_url: '',
        code: '123456789',
        nutrition_grades: 'c',
        popularity_tags: ['popular', 'snack']
      }
    ];
    return demoProducts.slice(0, limit);
  }

  private getDemoUSDAFoods(query: string, limit: number): USDAFood[] {
    const demoFoods: USDAFood[] = [
      {
        fdcId: 123456,
        description: `${query}, raw`,
        brandOwner: 'Generic',
        ingredients: 'Natural ingredients',
        foodNutrients: [
          { nutrientId: 1008, nutrientName: 'Energy', nutrientNumber: '208', unitName: 'kcal', value: 150 },
          { nutrientId: 1003, nutrientName: 'Protein', nutrientNumber: '203', unitName: 'g', value: 8 },
          { nutrientId: 1004, nutrientName: 'Total lipid (fat)', nutrientNumber: '204', unitName: 'g', value: 5 },
          { nutrientId: 1005, nutrientName: 'Carbohydrate, by difference', nutrientNumber: '205', unitName: 'g', value: 20 }
        ],
        foodCategory: { description: 'Vegetables and Vegetable Products' },
        servingSize: 100,
        servingSizeUnit: 'g'
      }
    ];
    return demoFoods.slice(0, limit);
  }

  private getDemoEdamamFoods(query: string, limit: number): EdamamFood[] {
    const demoFoods: EdamamFood[] = [
      {
        food: {
          foodId: 'food_123',
          label: `${query} Smoothie`,
          brand: 'Naked Juice',
          category: 'Beverages',
          categoryLabel: 'food',
          nutrients: {
            ENERC_KCAL: 140,
            PROCNT: 2,
            FAT: 0,
            CHOCDF: 34,
            FIBTG: 0,
            SUGAR: 32,
            NA: 15,
            FASAT: 0,
            CHOLE: 0
          },
          image: ''
        },
        measures: [
          { uri: 'measure_1', label: 'bottle', weight: 450 }
        ]
      }
    ];
    return demoFoods.slice(0, limit);
  }

  private getDemoSpoonacularFoods(query: string, limit: number): SpoonacularFood[] {
    const demoFoods: SpoonacularFood[] = [
      {
        id: 123456,
        title: `${query} Salad Bowl`,
        image: '',
        nutrition: {
          nutrients: [
            { name: 'Calories', amount: 250, unit: 'kcal' },
            { name: 'Protein', amount: 15, unit: 'g' },
            { name: 'Fat', amount: 12, unit: 'g' },
            { name: 'Carbohydrates', amount: 20, unit: 'g' }
          ]
        },
        spoonacularScore: 85,
        healthScore: 90,
        pricePerServing: 8.50
      }
    ];
    return demoFoods.slice(0, limit);
  }

  // Conversion methods for different API formats
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
      category: this.mapFoodGroupToCategory(nutritionixFood.tags?.food_group || 0),
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
        minerals: { potassium: nutritionixFood.nf_potassium }
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
      source: 'nutritionix',
      verified: true,
      popularity: this.calculatePopularity(nutritionixFood.brand_name || '')
    };
  }

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
        cholesterol: nutrition['cholesterol_100g'] || 0,
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
      source: 'openfoodfacts',
      verified: true,
      popularity: this.calculatePopularityFromTags(product.popularity_tags || [])
    };
  }

  private convertUSDAToFoodItem(usdaFood: USDAFood): FoodItem {
    const nutrients = this.parseUSDANutrients(usdaFood.foodNutrients);
    
    const healthScore = this.calculateHealthScore({
      calories: nutrients.calories,
      protein: nutrients.protein,
      fiber: nutrients.fiber,
      sugar: nutrients.sugar,
      sodium: nutrients.sodium,
      saturatedFat: nutrients.saturatedFat
    });

    const tasteScore = this.calculateTasteScore({
      sugar: nutrients.sugar,
      fat: nutrients.fat,
      sodium: nutrients.sodium
    });

    const consumerScore = this.calculateConsumerScore(usdaFood.brandOwner || '');
    const vishScore = Math.round((healthScore + tasteScore + consumerScore) / 3);

    return {
      id: `usda_${usdaFood.fdcId}`,
      name: usdaFood.description,
      brand: usdaFood.brandOwner,
      category: usdaFood.foodCategory?.description || 'Food',
      barcode: usdaFood.gtinUpc,
      nutrition: {
        calories: nutrients.calories,
        protein: nutrients.protein,
        carbohydrates: nutrients.carbohydrates,
        fat: nutrients.fat,
        fiber: nutrients.fiber,
        sugar: nutrients.sugar,
        sodium: nutrients.sodium,
        saturatedFat: nutrients.saturatedFat,
        transFat: 0,
        cholesterol: nutrients.cholesterol,
        vitamins: nutrients.vitamins,
        minerals: nutrients.minerals
      },
      ingredients: usdaFood.ingredients ? usdaFood.ingredients.split(',').map(i => i.trim()) : [],
      allergens: [],
      servingSize: `${usdaFood.servingSize || 100}${usdaFood.servingSizeUnit || 'g'}`,
      servingsPerContainer: 1,
      healthScore,
      tasteScore,
      consumerScore,
      vishScore,
      lastUpdated: new Date().toISOString(),
      source: 'usda',
      verified: true,
      popularity: 60 // USDA foods get moderate popularity
    };
  }

  private convertEdamamToFoodItem(edamamFood: EdamamFood): FoodItem {
    const nutrients = edamamFood.food.nutrients;
    
    const healthScore = this.calculateHealthScore({
      calories: nutrients.ENERC_KCAL,
      protein: nutrients.PROCNT,
      fiber: nutrients.FIBTG,
      sugar: nutrients.SUGAR,
      sodium: nutrients.NA,
      saturatedFat: nutrients.FASAT
    });

    const tasteScore = this.calculateTasteScore({
      sugar: nutrients.SUGAR,
      fat: nutrients.FAT,
      sodium: nutrients.NA
    });

    const consumerScore = this.calculateConsumerScore(edamamFood.food.brand || '');
    const vishScore = Math.round((healthScore + tasteScore + consumerScore) / 3);

    return {
      id: `edamam_${edamamFood.food.foodId}`,
      name: edamamFood.food.label,
      brand: edamamFood.food.brand,
      category: edamamFood.food.categoryLabel,
      nutrition: {
        calories: nutrients.ENERC_KCAL,
        protein: nutrients.PROCNT,
        carbohydrates: nutrients.CHOCDF,
        fat: nutrients.FAT,
        fiber: nutrients.FIBTG,
        sugar: nutrients.SUGAR,
        sodium: nutrients.NA,
        saturatedFat: nutrients.FASAT,
        transFat: 0,
        cholesterol: nutrients.CHOLE,
        vitamins: {},
        minerals: {}
      },
      ingredients: [],
      allergens: [],
      servingSize: edamamFood.measures[0]?.label || '100g',
      servingsPerContainer: 1,
      healthScore,
      tasteScore,
      consumerScore,
      vishScore,
      imageUrl: edamamFood.food.image,
      lastUpdated: new Date().toISOString(),
      source: 'edamam',
      verified: true,
      popularity: 70 // Edamam foods get good popularity
    };
  }

  private convertSpoonacularToFoodItem(spoonacularFood: SpoonacularFood): FoodItem {
    const nutrients = this.parseSpoonacularNutrients(spoonacularFood.nutrition.nutrients);
    
    const healthScore = spoonacularFood.healthScore;
    const tasteScore = Math.round(spoonacularFood.spoonacularScore * 0.8); // Convert to 0-100 scale
    const consumerScore = Math.round(spoonacularFood.spoonacularScore);
    const vishScore = Math.round((healthScore + tasteScore + consumerScore) / 3);

    return {
      id: `spoonacular_${spoonacularFood.id}`,
      name: spoonacularFood.title,
      category: 'Recipe/Meal',
      nutrition: {
        calories: nutrients.calories,
        protein: nutrients.protein,
        carbohydrates: nutrients.carbohydrates,
        fat: nutrients.fat,
        fiber: nutrients.fiber,
        sugar: nutrients.sugar,
        sodium: nutrients.sodium,
        saturatedFat: nutrients.saturatedFat,
        transFat: 0,
        cholesterol: nutrients.cholesterol,
        vitamins: nutrients.vitamins,
        minerals: nutrients.minerals
      },
      ingredients: [],
      allergens: [],
      servingSize: '1 serving',
      servingsPerContainer: 1,
      healthScore,
      tasteScore,
      consumerScore,
      vishScore,
      imageUrl: spoonacularFood.image,
      lastUpdated: new Date().toISOString(),
      source: 'spoonacular',
      verified: true,
      popularity: 80 // Spoonacular recipes get high popularity
    };
  }

  // Helper methods
  private parseUSDANutrients(nutrients: USDAFood['foodNutrients']) {
    const result = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      saturatedFat: 0,
      cholesterol: 0,
      vitamins: {} as { [key: string]: number },
      minerals: {} as { [key: string]: number }
    };

    nutrients.forEach(nutrient => {
      switch (nutrient.nutrientNumber) {
        case '208': result.calories = nutrient.value; break;
        case '203': result.protein = nutrient.value; break;
        case '205': result.carbohydrates = nutrient.value; break;
        case '204': result.fat = nutrient.value; break;
        case '291': result.fiber = nutrient.value; break;
        case '269': result.sugar = nutrient.value; break;
        case '307': result.sodium = nutrient.value; break;
        case '606': result.saturatedFat = nutrient.value; break;
        case '601': result.cholesterol = nutrient.value; break;
        default:
          if (nutrient.nutrientName.includes('Vitamin')) {
            result.vitamins[nutrient.nutrientName] = nutrient.value;
          } else if (['Calcium', 'Iron', 'Potassium', 'Magnesium'].includes(nutrient.nutrientName)) {
            result.minerals[nutrient.nutrientName] = nutrient.value;
          }
      }
    });

    return result;
  }

  private parseSpoonacularNutrients(nutrients: Array<{ name: string; amount: number; unit: string }>) {
    const result = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      saturatedFat: 0,
      cholesterol: 0,
      vitamins: {} as { [key: string]: number },
      minerals: {} as { [key: string]: number }
    };

    nutrients.forEach(nutrient => {
      const name = nutrient.name.toLowerCase();
      if (name.includes('calories')) result.calories = nutrient.amount;
      else if (name.includes('protein')) result.protein = nutrient.amount;
      else if (name.includes('carbohydrates')) result.carbohydrates = nutrient.amount;
      else if (name.includes('fat') && !name.includes('saturated')) result.fat = nutrient.amount;
      else if (name.includes('fiber')) result.fiber = nutrient.amount;
      else if (name.includes('sugar')) result.sugar = nutrient.amount;
      else if (name.includes('sodium')) result.sodium = nutrient.amount;
      else if (name.includes('saturated')) result.saturatedFat = nutrient.amount;
      else if (name.includes('cholesterol')) result.cholesterol = nutrient.amount;
      else if (name.includes('vitamin')) result.vitamins[nutrient.name] = nutrient.amount;
      else if (['calcium', 'iron', 'potassium', 'magnesium'].includes(name)) {
        result.minerals[nutrient.name] = nutrient.amount;
      }
    });

    return result;
  }

  private mapFoodGroupToCategory(foodGroup: number): string {
    const categories = {
      0: 'General Food',
      1: 'Protein Foods',
      2: 'Grains & Cereals',
      3: 'Fruits',
      4: 'Vegetables',
      5: 'Dairy',
      6: 'Beverages',
      7: 'Snacks',
      8: 'Sweets & Desserts'
    };
    return categories[foodGroup as keyof typeof categories] || 'Food';
  }

  private calculatePopularity(brand: string): number {
    const popularBrands = [
      'coca-cola', 'pepsi', 'nestle', 'unilever', 'kraft', 'general mills',
      'kellogg', 'mars', 'ferrero', 'mondelez', 'danone', 'campbell',
      'heinz', 'oreo', 'lay\'s', 'doritos', 'cheetos', 'pringles',
      'quest', 'clif', 'kind', 'nature valley', 'quaker', 'cheerios'
    ];

    const brandLower = brand.toLowerCase();
    const isPopular = popularBrands.some(popular => brandLower.includes(popular));
    
    return isPopular ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 40) + 30;
  }

  private calculatePopularityFromTags(tags: string[]): number {
    const popularityBoost = tags.filter(tag => 
      ['popular', 'trending', 'bestseller', 'favorite'].includes(tag.toLowerCase())
    ).length * 10;
    
    return Math.min(100, 50 + popularityBoost);
  }

  // Enhanced duplicate removal with popularity weighting
  private removeDuplicatesAndEnhance(foods: FoodItem[]): FoodItem[] {
    const seen = new Map<string, FoodItem>();
    
    foods.forEach(food => {
      const key = `${food.name.toLowerCase()}_${food.brand?.toLowerCase() || ''}`;
      const existing = seen.get(key);
      
      if (!existing || food.popularity > existing.popularity) {
        seen.set(key, food);
      }
    });
    
    return Array.from(seen.values());
  }

  // Enhanced sorting with popularity and relevance
  private sortByRelevanceAndPopularity(foods: FoodItem[], query: string): FoodItem[] {
    const queryLower = query.toLowerCase();
    
    return foods.sort((a, b) => {
      // Exact name matches get highest priority
      const aExactMatch = a.name.toLowerCase() === queryLower;
      const bExactMatch = b.name.toLowerCase() === queryLower;
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // Name contains query
      const aNameMatch = a.name.toLowerCase().includes(queryLower);
      const bNameMatch = b.name.toLowerCase().includes(queryLower);
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      // Brand matches
      const aBrandMatch = a.brand?.toLowerCase().includes(queryLower) || false;
      const bBrandMatch = b.brand?.toLowerCase().includes(queryLower) || false;
      if (aBrandMatch && !bBrandMatch) return -1;
      if (!aBrandMatch && bBrandMatch) return 1;
      
      // Sort by popularity, then Vish score
      const popularityDiff = b.popularity - a.popularity;
      if (Math.abs(popularityDiff) > 10) return popularityDiff;
      
      return b.vishScore - a.vishScore;
    });
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
    if (nutrition.protein > 15) score += 20;
    else if (nutrition.protein > 10) score += 15;
    else if (nutrition.protein > 5) score += 10;
    
    if (nutrition.fiber > 8) score += 20;
    else if (nutrition.fiber > 5) score += 15;
    else if (nutrition.fiber > 3) score += 10;

    // Negative factors
    if (nutrition.sugar > 25) score -= 25;
    else if (nutrition.sugar > 15) score -= 15;
    else if (nutrition.sugar > 10) score -= 10;
    
    if (nutrition.sodium > 800) score -= 25;
    else if (nutrition.sodium > 600) score -= 20;
    else if (nutrition.sodium > 300) score -= 10;
    
    if (nutrition.saturatedFat > 15) score -= 20;
    else if (nutrition.saturatedFat > 10) score -= 15;
    else if (nutrition.saturatedFat > 5) score -= 10;

    if (nutrition.calories > 500) score -= 15;
    else if (nutrition.calories > 300) score -= 10;
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
    if (nutrition.sugar > 8 && nutrition.sugar < 20) score += 20;
    else if (nutrition.sugar > 20) score += 15; // Too sweet but still tasty
    else if (nutrition.sugar > 3) score += 10;
    
    // Fat content (adds richness and mouthfeel)
    if (nutrition.fat > 8 && nutrition.fat < 25) score += 20;
    else if (nutrition.fat > 25) score += 10; // Too fatty
    else if (nutrition.fat > 3) score += 15;
    
    // Sodium (enhances flavor in moderation)
    if (nutrition.sodium > 200 && nutrition.sodium < 600) score += 15;
    else if (nutrition.sodium > 600) score -= 5; // Too salty
    else if (nutrition.sodium > 100) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  // Calculate consumer score based on brand recognition and popularity
  private calculateConsumerScore(brand: string): number {
    const popularBrands = [
      'coca-cola', 'pepsi', 'nestle', 'unilever', 'kraft', 'general mills',
      'kellogg', 'mars', 'ferrero', 'mondelez', 'danone', 'campbell',
      'heinz', 'oreo', 'lay\'s', 'doritos', 'cheetos', 'pringles',
      'quest', 'clif', 'kind', 'nature valley', 'quaker', 'cheerios',
      'chobani', 'fage', 'yoplait', 'dannon', 'starbucks', 'red bull'
    ];

    const premiumBrands = [
      'whole foods', 'trader joe', 'organic valley', 'horizon organic',
      'annie\'s', 'amy\'s', 'ben & jerry', 'haagen-dazs', 'godiva'
    ];

    const brandLower = brand.toLowerCase();
    
    if (premiumBrands.some(premium => brandLower.includes(premium))) {
      return Math.floor(Math.random() * 15) + 85; // 85-100
    } else if (popularBrands.some(popular => brandLower.includes(popular))) {
      return Math.floor(Math.random() * 20) + 70; // 70-90
    } else {
      return Math.floor(Math.random() * 30) + 40; // 40-70
    }
  }

  // Check if cache is valid
  private isCacheValid(item: { lastUpdated: string }): boolean {
    const lastUpdated = new Date(item.lastUpdated);
    const now = new Date();
    return (now.getTime() - lastUpdated.getTime()) < this.CACHE_DURATION;
  }

  // Initialize comprehensive local database
  private initializeComprehensiveDatabase(): void {
    const localFoods = this.getComprehensiveLocalFoods();
    localFoods.forEach(food => {
      if (!this.cache.has(food.id)) {
        this.cache.set(food.id, food);
      }
    });
    this.saveCacheToStorage();
  }

  // Comprehensive local food database
  private getComprehensiveLocalFoods(): FoodItem[] {
    return [
      // Protein Bars
      {
        id: 'quest_chocolate_chip_cookie_dough',
        name: 'Chocolate Chip Cookie Dough Protein Bar',
        brand: 'Quest Nutrition',
        category: 'Protein Bars',
        nutrition: {
          calories: 200,
          protein: 20,
          carbohydrates: 22,
          fat: 8,
          fiber: 14,
          sugar: 1,
          sodium: 250,
          saturatedFat: 3,
          transFat: 0,
          cholesterol: 5,
          vitamins: { 'Vitamin E': 2.5 },
          minerals: { calcium: 150, iron: 1.8 }
        },
        ingredients: ['Protein blend', 'Isomalto-oligosaccharides', 'Almonds', 'Water', 'Natural flavors'],
        allergens: ['Contains milk', 'Contains almonds', 'May contain peanuts'],
        servingSize: '1 bar (60g)',
        servingsPerContainer: 1,
        healthScore: 85,
        tasteScore: 88,
        consumerScore: 92,
        vishScore: 88,
        lastUpdated: new Date().toISOString(),
        source: 'database',
        verified: true,
        popularity: 95
      },
      
      // Greek Yogurt
      {
        id: 'chobani_plain_greek_yogurt',
        name: 'Plain Greek Yogurt',
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
          vitamins: { 'Vitamin B12': 1.1, 'Riboflavin': 0.3 },
          minerals: { calcium: 200, potassium: 240 }
        },
        ingredients: ['Cultured pasteurized nonfat milk', 'Live and active cultures'],
        allergens: ['Contains milk'],
        servingSize: '1 container (170g)',
        servingsPerContainer: 1,
        healthScore: 95,
        tasteScore: 75,
        consumerScore: 90,
        vishScore: 87,
        lastUpdated: new Date().toISOString(),
        source: 'database',
        verified: true,
        popularity: 88
      },

      // Snacks
      {
        id: 'lays_classic_potato_chips',
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
        source: 'database',
        verified: true,
        popularity: 92
      },

      // Cereals
      {
        id: 'cheerios_original',
        name: 'Original Cheerios',
        brand: 'General Mills',
        category: 'Cereals',
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
          vitamins: { 'Vitamin A': 500, 'Vitamin C': 6, 'Iron': 8.1 },
          minerals: { calcium: 100, zinc: 3.8 }
        },
        ingredients: ['Whole grain oats', 'Modified corn starch', 'Sugar', 'Salt', 'Tripotassium phosphate'],
        allergens: ['May contain wheat'],
        servingSize: '1 cup (28g)',
        servingsPerContainer: 11,
        healthScore: 78,
        tasteScore: 70,
        consumerScore: 85,
        vishScore: 78,
        lastUpdated: new Date().toISOString(),
        source: 'database',
        verified: true,
        popularity: 90
      },

      // Energy Drinks
      {
        id: 'red_bull_energy_drink',
        name: 'Energy Drink',
        brand: 'Red Bull',
        category: 'Beverages',
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
          vitamins: { 'Niacin': 22, 'Vitamin B6': 5.05, 'Vitamin B12': 5.1 },
          minerals: {}
        },
        ingredients: ['Caffeine', 'Taurine', 'B-vitamins', 'Sucrose', 'Glucose', 'Alpine water'],
        allergens: [],
        servingSize: '1 can (250ml)',
        servingsPerContainer: 1,
        healthScore: 22,
        tasteScore: 75,
        consumerScore: 88,
        vishScore: 62,
        lastUpdated: new Date().toISOString(),
        source: 'database',
        verified: true,
        popularity: 94
      },

      // Healthy Snacks
      {
        id: 'kind_dark_chocolate_nuts_sea_salt',
        name: 'Dark Chocolate Nuts & Sea Salt Bar',
        brand: 'KIND',
        category: 'Snack Bars',
        nutrition: {
          calories: 200,
          protein: 6,
          carbohydrates: 16,
          fat: 16,
          fiber: 7,
          sugar: 5,
          sodium: 125,
          saturatedFat: 3.5,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin E': 4 },
          minerals: { magnesium: 60, phosphorus: 140 }
        },
        ingredients: ['Almonds', 'Peanuts', 'Dark chocolate', 'Honey', 'Sea salt', 'Vanilla extract'],
        allergens: ['Contains almonds', 'Contains peanuts', 'May contain other tree nuts'],
        servingSize: '1 bar (40g)',
        servingsPerContainer: 1,
        healthScore: 82,
        tasteScore: 85,
        consumerScore: 87,
        vishScore: 85,
        lastUpdated: new Date().toISOString(),
        source: 'database',
        verified: true,
        popularity: 85
      },

      // Frozen Foods
      {
        id: 'amys_margherita_pizza',
        name: 'Margherita Pizza',
        brand: 'Amy\'s',
        category: 'Frozen Foods',
        nutrition: {
          calories: 290,
          protein: 12,
          carbohydrates: 39,
          fat: 10,
          fiber: 2,
          sugar: 4,
          sodium: 590,
          saturatedFat: 4.5,
          transFat: 0,
          cholesterol: 15,
          vitamins: { 'Vitamin A': 6, 'Vitamin C': 6 },
          minerals: { calcium: 200, iron: 2.2 }
        },
        ingredients: ['Organic wheat flour', 'Filtered water', 'Organic tomatoes', 'Organic mozzarella cheese'],
        allergens: ['Contains wheat', 'Contains milk'],
        servingSize: '1/3 pizza (123g)',
        servingsPerContainer: 3,
        healthScore: 65,
        tasteScore: 80,
        consumerScore: 78,
        vishScore: 74,
        lastUpdated: new Date().toISOString(),
        source: 'database',
        verified: true,
        popularity: 75
      },

      // Beverages
      {
        id: 'naked_green_machine',
        name: 'Green Machine Smoothie',
        brand: 'Naked Juice',
        category: 'Beverages',
        nutrition: {
          calories: 140,
          protein: 2,
          carbohydrates: 34,
          fat: 0,
          fiber: 0,
          sugar: 32,
          sodium: 15,
          saturatedFat: 0,
          transFat: 0,
          cholesterol: 0,
          vitamins: { 'Vitamin A': 40, 'Vitamin C': 100, 'Vitamin E': 20 },
          minerals: { potassium: 470 }
        },
        ingredients: ['Apple juice', 'Mango puree', 'Pineapple juice', 'Banana puree', 'Kiwi puree', 'Spirulina'],
        allergens: [],
        servingSize: '1 bottle (450ml)',
        servingsPerContainer: 1,
        healthScore: 70,
        tasteScore: 85,
        consumerScore: 82,
        vishScore: 79,
        lastUpdated: new Date().toISOString(),
        source: 'database',
        verified: true,
        popularity: 80
      },

      // Candy
      {
        id: 'snickers_bar',
        name: 'Snickers Bar',
        brand: 'Mars',
        category: 'Candy',
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
        ingredients: ['Milk chocolate', 'Peanuts', 'Corn syrup', 'Sugar', 'Skim milk', 'Butter'],
        allergens: ['Contains milk', 'Contains peanuts', 'May contain tree nuts'],
        servingSize: '1 bar (52.7g)',
        servingsPerContainer: 1,
        healthScore: 18,
        tasteScore: 90,
        consumerScore: 95,
        vishScore: 68,
        lastUpdated: new Date().toISOString(),
        source: 'database',
        verified: true,
        popularity: 98
      },

      // Organic Foods
      {
        id: 'annies_mac_cheese',
        name: 'Organic Shells & White Cheddar',
        brand: 'Annie\'s',
        category: 'Packaged Meals',
        nutrition: {
          calories: 270,
          protein: 10,
          carbohydrates: 47,
          fat: 6,
          fiber: 3,
          sugar: 4,
          sodium: 580,
          saturatedFat: 3.5,
          transFat: 0,
          cholesterol: 15,
          vitamins: { 'Vitamin A': 6 },
          minerals: { calcium: 200, iron: 1.4 }
        },
        ingredients: ['Organic pasta', 'Organic cheddar cheese', 'Organic butter', 'Sea salt'],
        allergens: ['Contains wheat', 'Contains milk'],
        servingSize: '1 cup prepared (70g dry)',
        servingsPerContainer: 2.5,
        healthScore: 55,
        tasteScore: 82,
        consumerScore: 85,
        vishScore: 74,
        lastUpdated: new Date().toISOString(),
        source: 'database',
        verified: true,
        popularity: 78
      }
    ];
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

  // Get food by ID
  getFoodById(id: string): FoodItem | null {
    return this.cache.get(id) || null;
  }

  // Get popular foods
  getPopularFoods(limit: number = 10): FoodItem[] {
    const foods = Array.from(this.cache.values());
    return foods
      .sort((a, b) => b.popularity - a.popularity)
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

  // Get foods by category
  getFoodsByCategory(category: string, limit: number = 20): FoodItem[] {
    const foods = Array.from(this.cache.values());
    return foods
      .filter(food => food.category.toLowerCase().includes(category.toLowerCase()))
      .sort((a, b) => b.vishScore - a.vishScore)
      .slice(0, limit);
  }

  // Get trending foods (high popularity + recent)
  getTrendingFoods(limit: number = 10): FoodItem[] {
    const foods = Array.from(this.cache.values());
    const recentThreshold = new Date();
    recentThreshold.setDate(recentThreshold.getDate() - 30); // Last 30 days

    return foods
      .filter(food => new Date(food.lastUpdated) >= recentThreshold)
      .sort((a, b) => (b.popularity + b.vishScore) - (a.popularity + a.vishScore))
      .slice(0, limit);
  }

  // Add custom food item
  addCustomFood(food: Omit<FoodItem, 'id' | 'lastUpdated' | 'source' | 'verified' | 'popularity'>): FoodItem {
    const customFood: FoodItem = {
      ...food,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date().toISOString(),
      source: 'user',
      verified: false,
      popularity: 50 // Default popularity for user-added foods
    };

    this.cache.set(customFood.id, customFood);
    this.saveCacheToStorage();
    
    return customFood;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    this.searchCache.clear();
    localStorage.removeItem('foodcheck_food_cache');
    this.initializeComprehensiveDatabase();
  }

  // Get cache statistics
  getCacheStats(): {
    totalFoods: number;
    nutritionixSources: number;
    openFoodFactsSources: number;
    usdaSources: number;
    edamamSources: number;
    spoonacularSources: number;
    userSources: number;
    databaseSources: number;
    cacheSize: string;
    lastUpdated: string;
  } {
    const foods = Array.from(this.cache.values());
    const nutritionixSources = foods.filter(f => f.source === 'nutritionix').length;
    const openFoodFactsSources = foods.filter(f => f.source === 'openfoodfacts').length;
    const usdaSources = foods.filter(f => f.source === 'usda').length;
    const edamamSources = foods.filter(f => f.source === 'edamam').length;
    const spoonacularSources = foods.filter(f => f.source === 'spoonacular').length;
    const userSources = foods.filter(f => f.source === 'user').length;
    const databaseSources = foods.filter(f => f.source === 'database').length;
    
    const cacheData = localStorage.getItem('foodcheck_food_cache');
    const cacheSize = cacheData ? `${(cacheData.length / 1024).toFixed(2)} KB` : '0 KB';

    return {
      totalFoods: foods.length,
      nutritionixSources,
      openFoodFactsSources,
      usdaSources,
      edamamSources,
      spoonacularSources,
      userSources,
      databaseSources,
      cacheSize,
      lastUpdated: new Date().toISOString()
    };
  }

  // Get food recommendations based on user preferences
  getRecommendations(preferences: {
    healthFocus?: boolean;
    tasteFocus?: boolean;
    popularityFocus?: boolean;
    categories?: string[];
    maxCalories?: number;
    minProtein?: number;
  }, limit: number = 10): FoodItem[] {
    const foods = Array.from(this.cache.values());
    
    let filtered = foods.filter(food => {
      if (preferences.categories && preferences.categories.length > 0) {
        if (!preferences.categories.some(cat => 
          food.category.toLowerCase().includes(cat.toLowerCase())
        )) {
          return false;
        }
      }
      
      if (preferences.maxCalories && food.nutrition.calories > preferences.maxCalories) {
        return false;
      }
      
      if (preferences.minProtein && food.nutrition.protein < preferences.minProtein) {
        return false;
      }
      
      return true;
    });

    // Sort based on preferences
    filtered.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      if (preferences.healthFocus) {
        scoreA += a.healthScore * 0.4;
        scoreB += b.healthScore * 0.4;
      }
      
      if (preferences.tasteFocus) {
        scoreA += a.tasteScore * 0.4;
        scoreB += b.tasteScore * 0.4;
      }
      
      if (preferences.popularityFocus) {
        scoreA += a.popularity * 0.3;
        scoreB += b.popularity * 0.3;
      }
      
      // Always include Vish Score as a factor
      scoreA += a.vishScore * 0.3;
      scoreB += b.vishScore * 0.3;
      
      return scoreB - scoreA;
    });

    return filtered.slice(0, limit);
  }
}

// Export singleton instance
export const foodDatabaseService = FoodDatabaseService.getInstance();