// Script to seed stock movements in Firebase
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

// Function to get all users from the database
async function getUsers() {
  try {
    const usersRef = collection(firestore, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

// Function to create stock movements
async function createStockMovements(inventoryItems, users) {
  if (inventoryItems.length === 0) {
    console.log('No inventory items found. Please add inventory items first.');
    return;
  }

  if (users.length === 0) {
    console.log('No users found. Please add users first.');
    return;
  }

  // Filter users to get managers and owners
  const managers = users.filter(user => 
    user.role === 'manager' || user.role === 'owner'
  );

  if (managers.length === 0) {
    console.log('No managers or owners found. Using any available user.');
    // If no managers, use any user
    managers.push(users[0]);
  }

  // Check if stockMovements collection already has items
  const stockMovementsRef = collection(firestore, 'stockMovements');
  const stockMovementsSnapshot = await getDocs(stockMovementsRef);
  
  if (stockMovementsSnapshot.docs.length > 0) {
    console.log(`StockMovements collection already has ${stockMovementsSnapshot.docs.length} items.`);
    const proceed = await promptYesNo('Do you want to add more stock movements?');
    if (!proceed) {
      console.log('Operation cancelled.');
      return;
    }
  }

  // Generate stock movements for each inventory item
  for (const item of inventoryItems) {
    // Generate 1-5 stock movements per item
    const numMovements = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < numMovements; i++) {
      // Randomly select a manager
      const manager = managers[Math.floor(Math.random() * managers.length)];
      
      // Generate a date within the last 30 days
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      // Determine movement type (more likely to be 'in' than 'out')
      const type = Math.random() < 0.7 ? 'in' : 'out';
      
      // Generate quantity
      const quantity = Math.floor(Math.random() * 10) + 1;
      
      // Generate reason based on type
      let reason = '';
      if (type === 'in') {
        reason = ['Regular restock', 'Emergency restock', 'Initial stock', 'Returned items'][Math.floor(Math.random() * 4)];
      } else {
        reason = ['Used in production', 'Damaged', 'Expired', 'Inventory correction'][Math.floor(Math.random() * 4)];
      }
      
      // Create stock movement
      const stockMovement = {
        inventoryItemId: item.id,
        type: type,
        quantity: quantity,
        reason: reason,
        date: date.toISOString(),
        performedBy: manager.id,
        performedByName: manager.name || 'Unknown User',
        notes: `${type === 'in' ? 'Added' : 'Removed'} ${quantity} ${item.unit} of inventory`,
        restaurant_id: item.restaurant_id,
        createdAt: new Date().toISOString()
      };
      
      // Add to Firestore
      try {
        const stockMovementRef = doc(collection(firestore, 'stockMovements'));
        await setDoc(stockMovementRef, {
          id: stockMovementRef.id,
          ...stockMovement
        });
        console.log(`Created stock movement for item ${item.id}: ${type} ${quantity} ${item.unit}`);
      } catch (error) {
        console.error(`Error creating stock movement for item ${item.id}:`, error);
      }
    }
  }

  console.log('Stock movements created successfully!');
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
    const inventoryItems = await getInventoryItems();
    console.log(`Found ${inventoryItems.length} inventory items`);
    
    const users = await getUsers();
    console.log(`Found ${users.length} users`);
    
    await createStockMovements(inventoryItems, users);
    
    console.log('Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running script:', error);
    process.exit(1);
  }
}

// Run the script
main();
