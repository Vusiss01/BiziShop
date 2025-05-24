// Script to seed suppliers in Firebase
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

// Function to create suppliers
async function createSuppliers(restaurants) {
  if (restaurants.length === 0) {
    console.log('No restaurants found. Please add restaurants first.');
    return;
  }

  // Get the first restaurant to link suppliers to
  const restaurant = restaurants[0];
  console.log(`Using restaurant: ${restaurant.name} (${restaurant.id})`);

  // Check if suppliers collection already has items
  const suppliersRef = collection(firestore, 'suppliers');
  const suppliersSnapshot = await getDocs(suppliersRef);
  
  if (suppliersSnapshot.docs.length > 0) {
    console.log(`Suppliers collection already has ${suppliersSnapshot.docs.length} items.`);
    const proceed = await promptYesNo('Do you want to add more suppliers?');
    if (!proceed) {
      console.log('Operation cancelled.');
      return;
    }
  }

  // Sample suppliers data
  const suppliers = [
    {
      id: 'supplier-mexican-foods',
      name: 'Mexican Foods Inc.',
      contactPerson: 'John Rodriguez',
      email: 'orders@mexicanfoodsinc.com',
      phone: '(555) 123-4567',
      address: '123 Food Supplier St, Austin, TX',
      notes: 'Specializes in authentic Mexican food ingredients',
      itemsSupplied: ['Corn Tortillas', 'Flour Tortillas', 'Salsa', 'Chips'],
      restaurant_id: restaurant.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'supplier-local-meats',
      name: 'Local Meats',
      contactPerson: 'Sarah Johnson',
      email: 'orders@localmeats.com',
      phone: '(555) 987-6543',
      address: '456 Butcher Ave, Austin, TX',
      notes: 'Local farm-to-table meat supplier',
      itemsSupplied: ['Ground Beef', 'Chicken Breast', 'Steak'],
      restaurant_id: restaurant.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'supplier-fresh-farms',
      name: 'Fresh Farms',
      contactPerson: 'Mike Williams',
      email: 'orders@freshfarms.com',
      phone: '(555) 456-7890',
      address: '789 Produce Lane, Austin, TX',
      notes: 'Organic produce supplier',
      itemsSupplied: ['Tomatoes', 'Lettuce', 'Onions', 'Avocados'],
      restaurant_id: restaurant.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'supplier-dairy-distributors',
      name: 'Dairy Distributors',
      contactPerson: 'Lisa Chen',
      email: 'orders@dairydist.com',
      phone: '(555) 234-5678',
      address: '321 Milk Road, Austin, TX',
      notes: 'Premium dairy products',
      itemsSupplied: ['Shredded Cheese', 'Sour Cream', 'Butter'],
      restaurant_id: restaurant.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'supplier-wholesale-grains',
      name: 'Wholesale Grains',
      contactPerson: 'David Smith',
      email: 'orders@wholesalegrains.com',
      phone: '(555) 345-6789',
      address: '567 Grain Blvd, Austin, TX',
      notes: 'Bulk grain supplier',
      itemsSupplied: ['Rice', 'Flour', 'Corn Meal', 'Oats'],
      restaurant_id: restaurant.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'supplier-ocean-catch',
      name: 'Ocean Catch Seafood',
      contactPerson: 'Maria Garcia',
      email: 'orders@oceancatch.com',
      phone: '(555) 456-7890',
      address: '789 Harbor Dr, Austin, TX',
      notes: 'Fresh seafood delivered daily',
      itemsSupplied: ['Shrimp', 'Fish', 'Crab', 'Lobster'],
      restaurant_id: restaurant.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'supplier-artisan-bakery',
      name: 'Artisan Bakery',
      contactPerson: 'Paul Brown',
      email: 'orders@artisanbakery.com',
      phone: '(555) 567-8901',
      address: '890 Bread St, Austin, TX',
      notes: 'Handcrafted breads and pastries',
      itemsSupplied: ['Bread', 'Rolls', 'Pastries', 'Cakes'],
      restaurant_id: restaurant.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'supplier-beverage-dist',
      name: 'Beverage Distributors',
      contactPerson: 'James Wilson',
      email: 'orders@beveragedist.com',
      phone: '(555) 678-9012',
      address: '901 Drink Ave, Austin, TX',
      notes: 'Non-alcoholic beverage supplier',
      itemsSupplied: ['Soda', 'Juice', 'Water', 'Coffee'],
      restaurant_id: restaurant.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'supplier-liquor-wholesale',
      name: 'Liquor Wholesale',
      contactPerson: 'Emma Davis',
      email: 'orders@liquorwholesale.com',
      phone: '(555) 789-0123',
      address: '123 Spirit Rd, Austin, TX',
      notes: 'Licensed alcoholic beverage distributor',
      itemsSupplied: ['Beer', 'Wine', 'Spirits'],
      restaurant_id: restaurant.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'supplier-snack-supply',
      name: 'Snack Supply Co.',
      contactPerson: 'Alex Thompson',
      email: 'orders@snacksupply.com',
      phone: '(555) 890-1234',
      address: '234 Snack Blvd, Austin, TX',
      notes: 'Variety of snack foods',
      itemsSupplied: ['Chips', 'Pretzels', 'Nuts', 'Candy'],
      restaurant_id: restaurant.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'supplier-gourmet-sauces',
      name: 'Gourmet Sauces',
      contactPerson: 'Olivia Martinez',
      email: 'orders@gourmetsauces.com',
      phone: '(555) 901-2345',
      address: '345 Sauce Lane, Austin, TX',
      notes: 'Specialty sauces and condiments',
      itemsSupplied: ['Hot Sauce', 'BBQ Sauce', 'Salad Dressing', 'Marinades'],
      restaurant_id: restaurant.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'supplier-general-foods',
      name: 'General Foods Supply',
      contactPerson: 'Robert Johnson',
      email: 'orders@generalfoods.com',
      phone: '(555) 012-3456',
      address: '456 Food St, Austin, TX',
      notes: 'General food supplier for all categories',
      itemsSupplied: ['Various Food Items', 'Pantry Staples', 'Canned Goods'],
      restaurant_id: restaurant.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Add suppliers to Firestore
  for (const supplier of suppliers) {
    try {
      // Use the predefined ID for the document
      const supplierRef = doc(firestore, 'suppliers', supplier.id);
      await setDoc(supplierRef, supplier);
      console.log(`Created supplier: ${supplier.name}`);
    } catch (error) {
      console.error(`Error creating supplier ${supplier.name}:`, error);
    }
  }

  console.log('Suppliers created successfully!');
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
    const restaurants = await getRestaurants();
    console.log(`Found ${restaurants.length} restaurants`);
    
    await createSuppliers(restaurants);
    
    console.log('Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running script:', error);
    process.exit(1);
  }
}

// Run the script
main();
