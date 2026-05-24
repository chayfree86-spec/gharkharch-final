export interface CategoryInfo {
  name: string;
  icon: string;
  color: string;
  bg: string;
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  Ration: {
    name: 'Ration',
    icon: 'ShoppingCart',
    color: '#D97706', // amber-600
    bg: '#FEF3C7',    // amber-100
  },
  Utilities: {
    name: 'Utilities',
    icon: 'Lightbulb',
    color: '#2563EB', // blue-600
    bg: '#DBEAFE',    // blue-100
  },
  Travel: {
    name: 'Travel',
    icon: 'Car',
    color: '#059669', // emerald-600
    bg: '#D1FAE5',    // emerald-100
  },
  Education: {
    name: 'Education',
    icon: 'BookOpen',
    color: '#4F46E5', // indigo-600
    bg: '#E0E7FF',    // indigo-100
  },
  Health: {
    name: 'Health',
    icon: 'HeartPulse',
    color: '#E11D48', // rose-600
    bg: '#FFE4E6',    // rose-100
  },
  'Dining Out': {
    name: 'Dining Out',
    icon: 'Utensils',
    color: '#EA580C', // orange-600
    bg: '#FFEDD5',    // orange-100
  },
  Entertainment: {
    name: 'Entertainment',
    icon: 'Tv',
    color: '#7C3AED', // purple-600
    bg: '#EDE9FE',    // purple-100
  },
  Others: {
    name: 'Others',
    icon: 'FileText',
    color: '#4B5563', // gray-600
    bg: '#F3F4F6',    // gray-100
  },
};

// Popular Indian brands-to-category mapping for zero-error instant matches
const BRAND_MAP: Record<string, string> = {
  // Ration/Groceries
  blinkit: 'Ration', zepto: 'Ration', instamart: 'Ration', bigbasket: 'Ration', 
  dmart: 'Ration', amul: 'Ration', motherdairy: 'Ration', reliancefresh: 'Ration',
  safal: 'Ration', countrydelight: 'Ration', amazonfresh: 'Ration', spencers: 'Ration',
  grofers: 'Ration', licious: 'Ration', freshtohome: 'Ration',
  
  // Utilities
  airtel: 'Utilities', jio: 'Utilities', vodafone: 'Utilities', idea: 'Utilities', vi: 'Utilities',
  tataplay: 'Utilities', tatasky: 'Utilities', dishtv: 'Utilities', bescom: 'Utilities', 
  bses: 'Utilities', adani: 'Utilities', actfiber: 'Utilities', jiofiber: 'Utilities',
  excitel: 'Utilities', hathway: 'Utilities', indane: 'Utilities', hpgas: 'Utilities', 
  bharatgas: 'Utilities', gascylinder: 'Utilities',
  
  // Travel
  uber: 'Travel', ola: 'Travel', rapido: 'Travel', indrive: 'Travel', irctc: 'Travel',
  redbus: 'Travel', makemytrip: 'Travel', yatra: 'Travel', zoomcar: 'Travel',
  easemytrip: 'Travel', abhibus: 'Travel', goibibo: 'Travel',
  
  // Education
  byjus: 'Education', unacademy: 'Education', physicswallah: 'Education', udemy: 'Education',
  coursera: 'Education', edx: 'Education', simplilearn: 'Education', upgrad: 'Education',
  
  // Health
  apollo: 'Health', netmeds: 'Health', pharmeasy: 'Health', lalpath: 'Health', metropolis: 'Health',
  medibuddy: 'Health', tata1mg: 'Health', '1mg': 'Health', practo: 'Health',
  
  // Dining Out
  swiggy: 'Dining Out', zomato: 'Dining Out', dominos: 'Dining Out', kfc: 'Dining Out',
  starbucks: 'Dining Out', mcdonalds: 'Dining Out', mcd: 'Dining Out', pizzahut: 'Dining Out',
  burgerking: 'Dining Out', haldiram: 'Dining Out', haldirams: 'Dining Out', barbequenation: 'Dining Out',
  bikanervala: 'Dining Out', chaipoint: 'Dining Out', chaayos: 'Dining Out', subway: 'Dining Out',
  dunkin: 'Dining Out', ccd: 'Dining Out', cafecoffeeday: 'Dining Out',
  
  // Entertainment
  netflix: 'Entertainment', spotify: 'Entertainment', hotstar: 'Entertainment', disney: 'Entertainment',
  bookmyshow: 'Entertainment', bms: 'Entertainment', primevideo: 'Entertainment', youtube: 'Entertainment',
  wynk: 'Entertainment', gaana: 'Entertainment', jiosaavn: 'Entertainment'
};

// Rich English and Hinglish keyword map
const KEYWORD_MAP: Record<string, string[]> = {
  Ration: [
    // English
    'milk', 'paneer', 'curd', 'vegetable', 'vegetables', 'fruit', 'fruits', 
    'grocery', 'groceries', 'ration', 'bread', 'egg', 'eggs', 'butter', 
    'sugar', 'tea', 'coffee', 'snack', 'snacks', 'biscuit', 'biscuits', 
    'wheat', 'salt', 'onion', 'potato', 'water bottle', 'water can', 'flour', 
    'cheese', 'chicken', 'meat', 'fish', 'rice', 'oil', 'refined', 'ghee',
    'spices', 'honey', 'jam', 'sauce', 'maggie', 'maggi', 'noodles', 'pasta',
    'ketchup', 'chocolate', 'chocolates', 'chips', 'namkeen', 'toast', 'bun',
    
    // Hinglish / Hindi Transliterated
    'doodh', 'dudh', 'dahi', 'sabzi', 'sabji', 'aata', 'atta', 'chawal', 
    'dal', 'daal', 'tel', 'chini', 'cheeni', 'chai', 'namak', 'masala', 
    'aloo', 'alu', 'pyaz', 'pyaaz', 'tamatar', 'dhaniya', 'adrak', 'lasun',
    'lehsun', 'mirch', 'anda', 'ande', 'maida', 'suji', 'sooji', 'besan',
    'chana', 'rajma', 'dood', 'water'
  ],
  Utilities: [
    // English
    'bill', 'electricity', 'power', 'water bill', 'gas', 'cylinder', 'wifi', 
    'broadband', 'recharge', 'mobile', 'phone', 'net', 'internet', 'tv recharge', 
    'dish', 'cable', 'rent', 'maintenance', 'current bill', 'light bill', 
    'postpaid', 'prepaid', 'society', 'dth', 'tata sky', 'dish tv', 'broadband',
    'fiber', 'piped gas', 'sewer', 'trash', 'garbage', 'house rent',
    
    // Hinglish / Hindi Transliterated
    'bijli', 'kiraya', 'kiraye', 'kirya', 'paani', 'pani', 'bijlee', 'bijli bill',
    'recharge', 'net recharge', 'broadband bill', 'gas cylinder'
  ],
  Travel: [
    // English
    'petrol', 'diesel', 'fuel', 'oil change', 'auto', 'rickshaw', 'travel', 
    'metro', 'train', 'bus', 'cab', 'taxi', 'ride', 'flight', 'ticket', 
    'tickets', 'traveling', 'fare', 'toll', 'parking', 'garage', 'mechanic', 
    'puncture', 'cng', 'car wash', 'bike service', 'scooty service', 'alignment',
    'repair', 'tyre', 'tire', 'puncture', 'helmet', 'fastag', 'challan',
    
    // Hinglish / Hindi Transliterated
    'gaadi', 'gadi', 'bikers', 'safar', 'yatra', 'bhaada', 'bhada', 'auto kiraya'
  ],
  Education: [
    // English
    'school', 'college', 'fees', 'fee', 'tuition', 'tution', 'class', 'course', 
    'book', 'books', 'copy', 'copies', 'notebook', 'pen', 'pencil', 'stationary', 
    'stationery', 'bag', 'exam', 'admission', 'academy', 'coaching', 'library', 
    'uniform', 'classes', 'registration', 'exam fee', 'syllabus', 'backpack',
    
    // Hinglish / Hindi Transliterated
    'padhai', 'kitab', 'kitabein', 'kalam', 'basta', 'skool', 'tusion fee'
  ],
  Health: [
    // English
    'medicine', 'tablet', 'capsule', 'doctor', 'hospital', 'clinic', 'checkup', 
    'test', 'lab', 'dentist', 'medical', 'pharma', 'injection', 'vaccine', 
    'treatment', 'physio', 'syrup', 'pills', 'consultation', 'eye check', 
    'glasses', 'spectacles', 'lens', 'pathology', 'x-ray', 'first aid', 'bandage',
    'ointment', 'cough syrup', 'vitamin', 'multivitamin', 'dental',
    
    // Hinglish / Hindi Transliterated
    'dawa', 'dawae', 'davai', 'davaee', 'chashma', 'ilaaj', 'ilaj', 'bukhar',
    'doctor fees'
  ],
  'Dining Out': [
    // English
    'hotel', 'restaurant', 'dhaba', 'cafe', 'dining', 'dinner', 'lunch', 
    'breakfast', 'party', 'treat', 'sweets', 'bakery', 'pub', 'bar', 'club',
    'pizza', 'burger', 'samosa', 'momo', 'momos', 'biryani', 'cold drink', 
    'coke', 'ice cream', 'dessert', 'mithai', 'street food', 'snacks out',
    'food delivery', 'food order',
    
    // Hinglish / Hindi Transliterated
    'khana', 'khaana', 'tapri', 'chai tapri', 'samosa', 'mithai', 'halwai', 
    'biryani', 'nasta', 'nashta', 'party'
  ],
  Entertainment: [
    // English
    'movie', 'cinema', 'netflix', 'prime', 'hotstar', 'spotify', 'youtube premium', 
    'game', 'gaming', 'ticket', 'multiplex', 'pvr', 'mall', 'concert', 
    'amusement', 'picnic', 'zoo', 'show', 'series', 'subscription', 'recreation',
    'ott', 'theatre', 'museum', 'exhibition', 'circus', 'arcade', 'bowling',
    
    // Hinglish / Hindi Transliterated
    'film', 'picchar', 'picture', 'ghumna', 'masti', 'khilona', 'toy', 'toys'
  ]
};

// Fast local Levenshtein Distance for fuzzy string similarity
function getLevenshteinDistance(a: string, b: string): number {
  const tmp: number[][] = [];
  let i: number, j: number;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
}

/**
 * Automatically detects and categorizes remarks into categories using local natural language keyword analysis.
 * Supports Brand mapping, Hinglish & English parsing, and Fuzzy Typo correction.
 */
export function categorizeExpense(remarks: string): { category: string; matchedKeyword: string; confidence: number } {
  const normalized = remarks.trim().toLowerCase();
  
  if (!normalized) {
    return { category: 'Others', matchedKeyword: '', confidence: 0 };
  }

  // 1. BRAND MATCHING PHASE (Direct 100% confidence match)
  const cleanedForBrand = normalized.replace(/[^a-z0-9]/g, '');
  for (const [brand, cat] of Object.entries(BRAND_MAP)) {
    if (cleanedForBrand.includes(brand)) {
      return {
        category: cat,
        matchedKeyword: brand.charAt(0).toUpperCase() + brand.slice(1),
        confidence: 100
      };
    }
  }

  // Split remarks into clean word tokens
  const words = normalized.split(/[\s,.\-_/]+/).filter(w => w.length > 1);
  
  let bestCategory = 'Others';
  let bestKeyword = '';
  let highestWeight = 0;
  let isFuzzyMatch = false;

  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const keyword of keywords) {
      // 2. EXACT/SUBSTRING MATCHING
      const exactWordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (exactWordRegex.test(normalized)) {
        const weight = keyword.length * 2.0; // Higher weight for longer exact matches
        if (weight > highestWeight) {
          highestWeight = weight;
          bestCategory = category;
          bestKeyword = keyword;
          isFuzzyMatch = false;
        }
      } else if (normalized.includes(keyword)) {
        const weight = keyword.length * 1.0;
        if (weight > highestWeight) {
          highestWeight = weight;
          bestCategory = category;
          bestKeyword = keyword;
          isFuzzyMatch = false;
        }
      }

      // 3. FUZZY MATCHING (LEVENSHTEIN DISTANCE)
      // Check each tokenized word against our keywords
      for (const word of words) {
        if (word.length >= 3 && Math.abs(word.length - keyword.length) <= 1) {
          const distance = getLevenshteinDistance(word, keyword);
          // 1 typo allowed for short words (length <= 5), max 2 typos for longer words
          const maxAllowedDistance = keyword.length <= 5 ? 1 : 2;
          if (distance <= maxAllowedDistance) {
            // Calculate fuzzy weight (inversely proportional to distance)
            const weight = (keyword.length - distance) * 1.5;
            if (weight > highestWeight) {
              highestWeight = weight;
              bestCategory = category;
              bestKeyword = keyword;
              isFuzzyMatch = true;
            }
          }
        }
      }
    }
  }

  if (bestCategory === 'Others') {
    return { category: 'Others', matchedKeyword: '', confidence: 0 };
  }

  // Calculate final confidence score
  let confidence = Math.min(100, Math.round((highestWeight / (normalized.length || 1)) * 100 + 40));
  if (isFuzzyMatch) {
    confidence = Math.max(50, Math.round(confidence * 0.8)); // Reduce confidence slightly for fuzzy typo matches
  }

  return {
    category: bestCategory,
    matchedKeyword: bestKeyword,
    confidence: confidence
  };
}

/**
 * Returns dynamic AI insights based on expenses data.
 * All responses are 100% in English.
 */
export function generateInsights(expenses: Array<{ amount: number; remarks: string; category: string; date: string }>, budget: number): string[] {
  const insights: string[] = [];
  if (expenses.length === 0) {
    return ["Add your first expense to generate smart insights!"];
  }

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  // Budget comparison
  if (budget > 0) {
    const percent = (totalSpent / budget) * 100;
    if (percent > 90) {
      insights.push(`⚠️ Critical Alert: You have spent ${percent.toFixed(0)}% of your monthly budget.`);
    } else if (percent > 70) {
      insights.push(`💡 Budget Warning: You have used ${percent.toFixed(0)}% of your budget. Consider slowing down discretionary spending.`);
    } else {
      insights.push(`🎉 Great job! You have used only ${percent.toFixed(0)}% of your monthly budget so far.`);
    }
  }

  // Highest spending category
  let maxCat = '';
  let maxAmount = 0;
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > maxAmount) {
      maxAmount = amt;
      maxCat = cat;
    }
  }

  if (maxCat) {
    insights.push(`📈 Top spending is on "${maxCat}" which amounts to ₹${maxAmount.toLocaleString('en-IN')}.`);
  }

  // Ration insight
  const rationTotal = categoryTotals['Ration'] || 0;
  if (rationTotal > 0 && rationTotal > totalSpent * 0.4) {
    insights.push(`🍎 Ration & Groceries take up ${(rationTotal / totalSpent * 100).toFixed(0)}% of your total spending. This is typical for Indian households.`);
  }

  // Travel insight
  const travelTotal = categoryTotals['Travel'] || 0;
  if (travelTotal > 2000) {
    insights.push(`🚗 Fuel and rides are increasing. Try pooling trips to save on your Travel category.`);
  }

  // Dining Out insight
  const diningTotal = categoryTotals['Dining Out'] || 0;
  if (diningTotal > totalSpent * 0.25) {
    insights.push(`🍔 Ordering online / Dining out is high this month. Cooking at home could save you some money.`);
  }

  if (insights.length < 2) {
    insights.push("💡 Smart Tip: Keep writing clear remarks like 'doodh' or 'uber ride' for instant auto-categorization.");
  }

  return insights;
}
