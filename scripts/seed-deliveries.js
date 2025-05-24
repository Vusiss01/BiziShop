// Script to seed upcoming deliveries in Firebase
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

// Function to get all suppliers from the database
async function getSuppliers() {
  try {
    const suppliersRef = collection(firestore, 'suppliers');
    const snapshot = await getDocs(suppliersRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting suppliers:', error);
    return [];
  }
}

// Function to get all inventory items from the database
async function getInventoryItems() {
  try {
    const inventoryRef = collection(firestore, 'inventory');
    const snapshot = await getDocs(inventoryRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting inventory items:', error);
    return [];
  }
}

// Function to create upcoming deliveries
async function createUpcomingDeliveries(suppliers, inventoryItems) {
  if (suppliers.length === 0) {
    console.log('No suppliers found. Please add suppliers first.');
    return;
  }

  if (inventoryItems.length === 0) {
    console.log('No inventory items found. Please add inventory items first.');
    return;
  }

  // Check if deliveries collection already has items
  const deliveriesRef = collection(firestore, 'deliveries');
  const deliveriesSnapshot = await getDocs(deliveriesRef);
  
  if (deliveriesSnapshot.docs.length > 0) {
    console.log(`Deliveries collection already has ${deliveriesSnapshot.docs.length} items.`);
    const proceed = await promptYesNo('Do you want to add more deliveries?');
    if (!proceed) {
      console.log('Operation cancelled.');
      return;
    }
  }

  // Group inventory items by supplier
  const itemsBySupplier = {};
  for (const item of inventoryItems) {
    if (item.supplier) {
      if (!itemsBySupplier[item.supplier]) {
        itemsBySupplier[item.supplier] = [];
      }
      itemsBySupplier[item.supplier].push(item);
    }
  }

  // Create upcoming deliveries for each supplier
  for (const supplier of suppliers) {
    // Skip if no items for this supplier
    if (!itemsBySupplier[supplier.id] || itemsBySupplier[supplier.id].length === 0) {
      console.log(`No items found for supplier ${supplier.name}. Skipping.`);
      continue;
    }

    // Generate 1-3 upcoming deliveries per supplier
    const numDeliveries = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numDeliveries; i++) {
      // Generate a date in the future (1-14 days)
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 14) + 1);
      
      // Generate order date (1-7 days before delivery)
      const orderDate = new Date(deliveryDate);
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 7) - 1);
      
      // Select 1-5 items from this supplier's inventory
      const supplierItems = itemsBySupplier[supplier.id];
      const numItems = Math.min(Math.floor(Math.random() * 5) + 1, supplierItems.length);
      const selectedItems = [];
      
      // Randomly select items without duplicates
      const availableItems = [...supplierItems];
      for (let j = 0; j < numItems; j++) {
        if (availableItems.length === 0) break;
        
        const randomIndex = Math.floor(Math.random() * availableItems.length);
        const selectedItem = availableItems.splice(randomIndex, 1)[0];
        
        // Generate quantity to order
        const quantityToOrder = Math.floor(Math.random() * 20) + 5;
        
        selectedItems.push({
          inventoryItemId: selectedItem.id,
          productId: selectedItem.productId,
          quantity: quantityToOrder,
          unit: selectedItem.unit,
          cost: selectedItem.cost,
          totalCost: selectedItem.cost * quantityToOrder
        });
      }
      
      // Calculate total cost
      const totalCost = selectedItems.reduce((sum, item) => sum + item.totalCost, 0);
      
      // Generate status
      const status = ['pending', 'confirmed', 'shipped'][Math.floor(Math.random() * 3)];
      
      // Create delivery
      const delivery = {
        supplierId: supplier.id,
        supplierName: supplier.name,
        orderDate: orderDate.toISOString(),
        expectedDeliveryDate: deliveryDate.toISOString(),
        status: status,
        items: selectedItems,
        totalCost: totalCost,
        notes: `Regular delivery from ${supplier.name}`,
        restaurant_id: supplier.restaurant_id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to Firestore
      try {
        const deliveryRef = doc(collection(firestore, 'deliveries'));
        await setDoc(deliveryRef, {
          id: deliveryRef.id,
          ...delivery
        });
        console.log(`Created upcoming delivery for ${supplier.name} on ${deliveryDate.toISOString().split('T')[0]}`);
      } catch (error) {
        console.error(`Error creating delivery for ${supplier.name}:`, error);
      }
    }
  }

  console.log('Upcoming deliveries created successfully!');
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
    const suppliers = await getSuppliers();
    console.log(`Found ${suppliers.length} suppliers`);
    
    const inventoryItems = await getInventoryItems();
    console.log(`Found ${inventoryItems.length} inventory items`);
    
    await createUpcomingDeliveries(suppliers, inventoryItems);
    
    console.log('Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running script:', error);
    process.exit(1);
  }
}

// Run the script
main();
