export interface Allergen {
    id?: string; 
    name: string;
    description?: string;
  }
  
 /**
 * Top 20 common allergens or frequently avoided items worldwide.
 * (Blend of US “Big 9,” EU “Big 14,” plus some globally reported items.)
 */
export const COMMON_ALLERGENS: Allergen[] = [
    { name: 'Peanuts', description: 'Allergy or intolerance to peanuts' },
    { name: 'Tree Nuts', description: 'Allergy to tree nuts (almonds, walnuts, hazelnuts, etc.)' },
    { name: 'Dairy', description: 'Allergy or intolerance to milk and dairy products' },
    { name: 'Eggs', description: 'Allergy or intolerance to eggs' },
    { name: 'Wheat', description: 'Allergy or intolerance to wheat (may include gluten)' },
    { name: 'Gluten', description: 'Allergy or intolerance to gluten-containing grains (e.g., barley, rye)' },
    { name: 'Soy', description: 'Allergy or intolerance to soy products' },
    { name: 'Fish', description: 'Allergy or intolerance to finned fish (salmon, tuna, cod, etc.)' },
    { name: 'Shellfish', description: 'Allergy to crustacean shellfish (shrimp, crab, lobster)' },
    { name: 'Mollusks', description: 'Allergy to mollusks (clams, mussels, oysters, scallops, etc.)' },
    { name: 'Sesame', description: 'Allergy or intolerance to sesame seeds/oil' },
    { name: 'Mustard', description: 'Allergy to mustard seeds or mustard products' },
    { name: 'Celery', description: 'Allergy to celery and/or celeriac root' },
    { name: 'Lupin', description: 'Allergy or intolerance to lupin flour or lupin seeds' },
    { name: 'Corn', description: 'Allergy or intolerance to corn/maize' },
    { name: 'Banana', description: 'Allergy or intolerance to bananas' },
    { name: 'Avocado', description: 'Allergy or intolerance to avocados' },
    { name: 'Kiwi', description: 'Allergy or intolerance to kiwifruit' },
    { name: 'Pineapple', description: 'Allergy or intolerance to pineapple' },
    { name: 'Cocoa/Chocolate', description: 'Allergy or intolerance to cocoa beans or chocolate products' },
  ];
  