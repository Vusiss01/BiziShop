// Script to seed inventory items in Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Function to get all products from the database
async function getProducts() {
  try {
    const productsRef = collection(firestore, 'products');
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}

// Function to get all restaurants from the database
async function getRestaurants() {
  try {
    const restaurantsRef = collection(firestore, 'restaurants');
    const snapshot = await getDocs(restaurantsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting restaurants:', error);
    return [];
  }
}

// Function to create inventory items
async function createInventoryItems(products, restaurants) {
  if (products.length === 0) {
    console.log('No products found. Please add products first.');
    return;
  }

  if (restaurants.length === 0) {
    console.log('No restaurants found. Please add restaurants first.');
    return;
  }

  // Get the first restaurant to link inventory items to
  const restaurant = restaurants[0];
  console.log(`Using restaurant: ${restaurant.name} (${restaurant.id})`);

  // Check if inventory collection already has items
  const inventoryRef = collection(firestore, 'inventory');
  const inventorySnapshot = await getDocs(inventoryRef);
  
  if (inventorySnapshot.docs.length > 0) {
    console.log(`Inventory collection already has ${inventorySnapshot.docs.length} items.`);
    const proceed = await promptYesNo('Do you want to add more inventory items?');
    if (!proceed) {
      console.log('Operation cancelled.');
      return;
    }
  }

  // Sample inventory items based on products
  for (const product of products) {
    // Skip if product doesn't belong to the selected restaurant
    if (product.restaurant_id !== restaurant.id) {
      console.log(`Skipping product ${product.name} as it belongs to a different restaurant.`);
      continue;
    }

    // Generate random stock levels
    const minStock = Math.floor(Math.random() * 10) + 5; // 5-15
    const currentStock = Math.floor(Math.random() * 30) + 1; // 1-30
    
    // Determine status based on stock levels
    let status = 'ok';
    if (currentStock === 0) {
      status = 'out';
    } else if (currentStock < minStock) {
      status = 'low';
    }

    // Create inventory item
    const inventoryItem = {
      productId: product.id,
      currentStock: currentStock,
      minStock: minStock,
      maxStock: minStock * 4,
      unit: getUnitForProduct(product),
      lastRestocked: new Date().toISOString(),
      supplier: getSupplierForProduct(product),
      cost: product.cost || Math.floor(product.price * 0.6), // Estimate cost as 60% of price if not provided
      status: status,
      location: 'Main Storage',
      restaurant_id: restaurant.id, // Link to restaurant
      updatedAt: new Date().toISOString()
    };

    // Add to Firestore
    try {
      const inventoryItemRef = doc(collection(firestore, 'inventory'));
      await setDoc(inventoryItemRef, {
        id: inventoryItemRef.id,
        ...inventoryItem
      });
      console.log(`Created inventory item for ${product.name}`);
    } catch (error) {
      console.error(`Error creating inventory item for ${product.name}:`, error);
    }
  }

  console.log('Inventory items created successfully!');
}

// Helper function to determine unit based on product
function getUnitForProduct(product) {
  // Map categories to units
  const categoryUnitMap = {
    'Fruits': 'lbs',
    'Vegetables': 'lbs',
    'Grains & Cereals': 'lbs',
    'Meat & Poultry': 'lbs',
    'Seafood': 'lbs',
    'Dairy Products': 'units',
    'Legumes & Pulses': 'lbs',
    'Nuts & Seeds': 'lbs',
    'Breads & Bakery Items': 'pieces',
    'Beverages': 'bottles',
    'Alcoholic Drinks': 'bottles',
    'Fats & Oils': 'bottles',
    'Snacks & Sweets': 'pieces',
    'Spices & Herbs': 'oz',
    'Condiments & Sauces': 'bottles'
  };

  // Default units based on product name patterns
  if (product.name.toLowerCase().includes('tortilla')) return 'pieces';
  if (product.name.toLowerCase().includes('cheese')) return 'lbs';
  if (product.name.toLowerCase().includes('beef')) return 'lbs';
  if (product.name.toLowerCase().includes('chicken')) return 'lbs';
  if (product.name.toLowerCase().includes('tomato')) return 'lbs';
  if (product.name.toLowerCase().includes('lettuce')) return 'heads';
  if (product.name.toLowerCase().includes('onion')) return 'lbs';

  // Use category mapping if available
  if (product.category && categoryUnitMap[product.category]) {
    return categoryUnitMap[product.category];
  }

  // Default unit
  return 'units';
}

// Helper function to assign a supplier based on product
function getSupplierForProduct(product) {
  // Map categories to supplier IDs (these will be created in the suppliers collection)
  const categorySupplierMap = {
    'Fruits': 'supplier-fresh-farms',
    'Vegetables': 'supplier-fresh-farms',
    'Grains & Cereals': 'supplier-wholesale-grains',
    'Meat & Poultry': 'supplier-local-meats',
    'Seafood': 'supplier-ocean-catch',
    'Dairy Products': 'supplier-dairy-distributors',
    'Breads & Bakery Items': 'supplier-artisan-bakery',
    'Beverages': 'supplier-beverage-dist',
    'Alcoholic Drinks': 'supplier-liquor-wholesale',
    'Snacks & Sweets': 'supplier-snack-supply',
    'Condiments & Sauces': 'supplier-gourmet-sauces'
  };

  // Product name based mapping
  if (product.name.toLowerCase().includes('tortilla')) return 'supplier-mexican-foods';
  if (product.name.toLowerCase().includes('beef')) return 'supplier-local-meats';
  if (product.name.toLowerCase().includes('chicken')) return 'supplier-local-meats';
  if (product.name.toLowerCase().includes('cheese')) return 'supplier-dairy-distributors';
  if (product.name.toLowerCase().includes('tomato')) return 'supplier-fresh-farms';
  if (product.name.toLowerCase().includes('lettuce')) return 'supplier-fresh-farms';
  if (product.name.toLowerCase().includes('onion')) return 'supplier-fresh-farms';

  // Use category mapping if available
  if (product.category && categorySupplierMap[product.category]) {
    return categorySupplierMap[product.category];
  }

  // Default supplier
  return 'supplier-general-foods';
}

// Helper function for yes/no prompts
async function promptYesNo(question) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    readline.question(`${question} (y/n): `, (answer) => {
      readline.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Main function
async function main() {
  try {
    const products = await getProducts();
    console.log(`Found ${products.length} products`);
    
    const restaurants = await getRestaurants();
    console.log(`Found ${restaurants.length} restaurants`);
    
    await createInventoryItems(products, restaurants);
    
    console.log('Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running script:', error);
    process.exit(1);
  }
}

// Run the script
main();
