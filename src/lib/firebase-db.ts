import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData
} from 'firebase/firestore';
import {
  ref,
  set,
  get,
  update,
  remove,
  push,
  child,
  query as dbQuery,
  orderByChild,
  limitToLast
} from 'firebase/database';
import { firestore, database } from './firebase';
import { UserRole } from './firebase';
import { Review, Order, InventoryItem, Product, User, Restaurant } from '../types/models'; // Added User and Restaurant imports

// Firestore Operations
export const firestoreDB = {
  // Create or update a document
  setDocument: async (collectionName: string, docId: string, data: DocumentData): Promise<void> => {
    try {
      const docRef = doc(firestore, collectionName, docId);
      // Ensure data is an object before passing to setDoc, though DocumentData type should guarantee this.
      // The { merge: true } option is good for updates.
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      console.error(`Error setting document in ${collectionName}:`, error);
      throw error;
    }
  },

  // Get a document by ID
  getDocument: async (collectionName: string, docId: string): Promise<DocumentData | null> => {
    try {
      const docRef = doc(firestore, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Ensure docSnap.data() is an object before spreading
        const data = docSnap.data();
        return { id: docSnap.id, ...(data || {}) }; 
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  },

  // Get all documents from a collection
  getCollection: async (collectionName: string): Promise<DocumentData[]> => {
    try {
      console.log(`Attempting to get collection: ${collectionName}`);
      const collectionRef = collection(firestore, collectionName);
      const querySnapshot = await getDocs(collectionRef);

      console.log(`Collection ${collectionName} query returned ${querySnapshot.docs.length} documents`);

      // Log each document ID for debugging
      querySnapshot.docs.forEach(doc => {
        console.log(`Document ID in ${collectionName}: ${doc.id}`);
      });

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`Document data for ${doc.id}:`, data);
        // Ensure data is an object before spreading
        return {
          id: doc.id,
          ...(data || {}) 
        };
      });
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error);
      throw error;
    }
  },

  // Query documents in a collection
  queryCollection: async (
    collectionName: string,
    fieldPath: string,
    operator: any,
    value: any
  ): Promise<DocumentData[]> => {
    try {
      const collectionRef = collection(firestore, collectionName);
      const q = query(collectionRef, where(fieldPath, operator, value));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...(data || {}) // Ensure data is an object before spreading
        };
      });
    } catch (error) {
      console.error(`Error querying collection ${collectionName}:`, error);
      throw error;
    }
  },

  // Update a document
  updateDocument: async (collectionName: string, docId: string, data: any): Promise<void> => {
    try {
      const docRef = doc(firestore, collectionName, docId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  },

  // Delete a document
  deleteDocument: async (collectionName: string, docId: string): Promise<void> => {
    try {
      const docRef = doc(firestore, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }
};

// Review-related database operations
export const reviewDB = {
  // Get all reviews for a specific restaurant
  getReviewsByRestaurantId: async (restaurantId: string): Promise<DocumentData[]> => {
    try {
      // Assuming reviews are stored in a 'reviews' collection
      // and each review document has a 'restaurantId' field.
      return firestoreDB.queryCollection('reviews', 'restaurantId', '==', restaurantId);
    } catch (error) {
      console.error(`Error fetching reviews for restaurant ${restaurantId}:`, error);
      throw error;
    }
  },

  // Add a new review
  addReview: async (reviewData: Partial<Review>): Promise<string> => {
    try {
      const reviewId = doc(collection(firestore, 'reviews')).id; // Generate a new ID
      
      // Construct the data object for Firestore more explicitly
      const dataToSet: any = { // Using 'any' temporarily for dataToSet to bypass strict checks during construction
        id: reviewId,
        createdAt: reviewData?.createdAt || new Date().toISOString(),
      };

      // Manually assign properties from reviewData to avoid spread issues
      if (reviewData && typeof reviewData === 'object') {
        for (const key in reviewData) {
          if (Object.prototype.hasOwnProperty.call(reviewData, key)) {
            // Ensure not to overwrite id and createdAt if they were part of reviewData
            // and we want our generated/default ones to take precedence.
            // However, the Review interface has id and createdAt as optional or specific,
            // so this merging strategy should be fine.
            if (key !== 'id' && key !== 'createdAt') {
              dataToSet[key] = (reviewData as any)[key];
            } else if (key === 'createdAt' && reviewData.createdAt) { 
              // If reviewData specifically provides createdAt, use it.
              dataToSet[key] = reviewData.createdAt;
            }
            // The 'id' from reviewData is ignored as we generate a new one.
          }
        }
      }
      
      await firestoreDB.setDocument('reviews', reviewId, dataToSet as Review); // Cast to Review before sending
      return reviewId;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }
  // Potentially add functions to get reviews by user, etc.
};

// Realtime Database Operations
export const realtimeDB = {
  // Create or update data
  setData: async (path: string, data: any): Promise<void> => {
    try {
      const dbRef = ref(database, path);
      await set(dbRef, data);
    } catch (error) {
      console.error(`Error setting data at ${path}:`, error);
      throw error;
    }
  },

  // Get data
  getData: async (path: string): Promise<any> => {
    try {
      const dbRef = ref(database, path);
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error getting data from ${path}:`, error);
      throw error;
    }
  },

  // Update data
  updateData: async (path: string, data: any): Promise<void> => {
    try {
      const dbRef = ref(database, path);
      await update(dbRef, data);
    } catch (error) {
      console.error(`Error updating data at ${path}:`, error);
      throw error;
    }
  },

  // Delete data
  deleteData: async (path: string): Promise<void> => {
    try {
      const dbRef = ref(database, path);
      await remove(dbRef);
    } catch (error) {
      console.error(`Error deleting data at ${path}:`, error);
      throw error;
    }
  },

  // Push new data with auto-generated key
  pushData: async (path: string, data: any): Promise<string> => {
    try {
      const dbRef = ref(database, path);
      const newRef = push(dbRef);
      await set(newRef, data);
      return newRef.key || '';
    } catch (error) {
      console.error(`Error pushing data to ${path}:`, error);
      throw error;
    }
  }
};

// User-related database operations
export const userDB = {
  // Create or update a user profile in Firestore
  setUserProfile: async (userId: string, userData: Partial<User>): Promise<void> => {
    const timestamp = new Date().toISOString();
    const dataToSet: any = {
      updatedAt: userData?.updatedAt || timestamp,
      createdAt: userData?.createdAt || timestamp, // Assuming createdAt might be set on initial profile creation
      // Initialize other User fields as needed
      name: userData?.name || '',
      email: userData?.email || '', // Email is likely required
      role: userData?.role || 'cashier', // Default role
    };

    if (userData && typeof userData === 'object') {
      for (const key in userData) {
        if (Object.prototype.hasOwnProperty.call(userData, key)) {
          if (!['updatedAt', 'createdAt'].includes(key) ||
              (key === 'updatedAt' && userData.updatedAt) ||
              (key === 'createdAt' && userData.createdAt) ) {
            dataToSet[key] = (userData as any)[key];
          }
        }
      }
    }
    // If 'id' field is part of User model and should store the userId:
    // dataToSet.id = userId;
    
    return firestoreDB.setDocument('users', userId, dataToSet as User);
  },

  // Get a user profile from Firestore
  getUserProfile: async (userId: string): Promise<DocumentData | null> => {
    return firestoreDB.getDocument('users', userId);
  },

  // Set user role in Firestore
  setUserRole: async (userId: string, role: UserRole): Promise<void> => {
    return firestoreDB.updateDocument('users', userId, { role });
  },

  // Get user role from Firestore
  getUserRole: async (userId: string): Promise<UserRole | null> => {
    const userData = await firestoreDB.getDocument('users', userId);
    return userData?.role || null;
  }
};

// Order-related database operations
export const orderDB = {
  // Create a new order
  createOrder: async (orderData: Partial<Order>): Promise<string> => {
    try {
      const timestamp = new Date().toISOString();
      
      // Construct data for Realtime Database explicitly
      const realtimeDataToSet: any = {
        // id is typically generated by pushData, but if Order type requires it, provide a placeholder or manage accordingly
        // For now, we assume pushData handles ID generation and we don't strictly need to set it here
        // If orderData contains an 'id', it might be overwritten by Firebase push key or cause issues.
        // Best practice is often to let Firebase generate the key for new entries.
        createdAt: orderData?.createdAt || timestamp,
        status: orderData?.status || 'pending',
        items: orderData?.items || [],
        subtotal: orderData?.subtotal || 0,
        tax: orderData?.tax || 0,
        total: orderData?.total || 0,
        paymentMethod: orderData?.paymentMethod || '',
        paymentStatus: orderData?.paymentStatus || 'pending',
        cashierId: orderData?.cashierId || '',
      };

      if (orderData && typeof orderData === 'object') {
        for (const key in orderData) {
          if (Object.prototype.hasOwnProperty.call(orderData, key)) {
            // Avoid overwriting properties we've explicitly set with defaults/fallbacks
            // unless orderData provides a specific value for them.
            if (!['createdAt', 'status', 'id'].includes(key)) { // 'id' is handled by Firebase push
              realtimeDataToSet[key] = (orderData as any)[key];
            } else if (key === 'createdAt' && orderData.createdAt) {
              realtimeDataToSet.createdAt = orderData.createdAt;
            } else if (key === 'status' && orderData.status) {
              realtimeDataToSet.status = orderData.status;
            }
            // any 'id' in orderData is ignored for pushData
          }
        }
      }
      
      const orderId = await realtimeDB.pushData('orders', realtimeDataToSet);

      // Also store in Firestore for better querying
      // Ensure orderId from pushData is used if it's the definitive ID
      const firestoreOrderId = orderId; 
      
      const firestoreDataToSet: any = {
        id: firestoreOrderId,
        createdAt: orderData?.createdAt || timestamp,
        status: orderData?.status || 'pending',
        // Initialize other Order fields as needed or copy them over
        items: orderData?.items || [],
        subtotal: orderData?.subtotal || 0,
        tax: orderData?.tax || 0,
        total: orderData?.total || 0,
        paymentMethod: orderData?.paymentMethod || '',
        paymentStatus: orderData?.paymentStatus || 'pending',
        cashierId: orderData?.cashierId || '', // Ensure all required fields from Order are handled
      };
      
      // Manually assign other properties from orderData if they exist
      if (orderData && typeof orderData === 'object') {
        for (const key in orderData) {
          if (Object.prototype.hasOwnProperty.call(orderData, key)) {
            if (!['id', 'createdAt', 'status'].includes(key)) { // Avoid overwriting already set properties
              firestoreDataToSet[key] = (orderData as any)[key];
            }
          }
        }
      }

      await firestoreDB.setDocument('orders', firestoreOrderId, firestoreDataToSet as Order);

      return firestoreOrderId;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string): Promise<void> => {
    try {
      // Update in both databases
      await realtimeDB.updateData(`orders/${orderId}`, { status, updatedAt: new Date().toISOString() });
      await firestoreDB.updateDocument('orders', orderId, { status, updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error(`Error updating order status for ${orderId}:`, error);
      throw error;
    }
  },

  // Get all orders
  getAllOrders: async (): Promise<DocumentData[]> => {
    return firestoreDB.getCollection('orders');
  },

  // Get orders by status
  getOrdersByStatus: async (status: string): Promise<DocumentData[]> => {
    return firestoreDB.queryCollection('orders', 'status', '==', status);
  }
};

// Inventory-related database operations
export const inventoryDB = {
  // Add or update inventory item
  setInventoryItem: async (itemId: string, itemData: Partial<InventoryItem>): Promise<void> => {
    const timestamp = new Date().toISOString();
    const dataToSet: any = {
      updatedAt: itemData?.updatedAt || timestamp,
      // Initialize other InventoryItem fields as needed or copy them over
      productId: itemData?.productId || '',
      currentStock: itemData?.currentStock || 0,
      minStock: itemData?.minStock || 0,
      unit: itemData?.unit || '',
      cost: itemData?.cost || 0,
      status: itemData?.status || 'ok',
    };

    if (itemData && typeof itemData === 'object') {
      for (const key in itemData) {
        if (Object.prototype.hasOwnProperty.call(itemData, key)) {
          if (key !== 'updatedAt') { // Avoid overwriting updatedAt if already set by itemData
            dataToSet[key] = (itemData as any)[key];
          }
        }
      }
    }
    // Ensure itemId is part of the document if your model expects it (it's usually the doc ID)
    // If 'id' field is part of InventoryItem model and should store the itemId:
    // dataToSet.id = itemId; 

    return firestoreDB.setDocument('inventory', itemId, dataToSet as InventoryItem);
  },

  // Get all inventory items
  getAllInventoryItems: async (): Promise<DocumentData[]> => {
    return firestoreDB.getCollection('inventory');
  },

  // Get inventory items by category
  getInventoryItemsByCategory: async (category: string): Promise<DocumentData[]> => {
    return firestoreDB.queryCollection('inventory', 'category', '==', category);
  },

  // Update inventory item stock
  updateItemStock: async (itemId: string, newStock: number): Promise<void> => {
    return firestoreDB.updateDocument('inventory', itemId, {
      currentStock: newStock,
      updatedAt: new Date().toISOString()
    });
  }
};

// Menu-related database operations
export const menuDB = {
  // Add or update menu item
  setMenuItem: async (itemId: string, itemData: Partial<Product>): Promise<void> => { // Assuming MenuItem is a Product
    const timestamp = new Date().toISOString();
    const dataToSet: any = {
      updatedAt: itemData?.updatedAt || timestamp,
      // Initialize other Product fields as needed or copy them over
      name: itemData?.name || '',
      description: itemData?.description || '',
      price: itemData?.price || 0,
      category: itemData?.category || '',
      isAvailable: itemData?.isAvailable === undefined ? true : itemData.isAvailable, // Default to true if not specified
      createdAt: itemData?.createdAt || timestamp, // Use provided or new
    };

    if (itemData && typeof itemData === 'object') {
      for (const key in itemData) {
        if (Object.prototype.hasOwnProperty.call(itemData, key)) {
          // Avoid overwriting properties explicitly set above unless itemData provides them
          if (!['updatedAt', 'createdAt'].includes(key) || 
              (key === 'updatedAt' && itemData.updatedAt) || 
              (key === 'createdAt' && itemData.createdAt) ) {
            dataToSet[key] = (itemData as any)[key];
          }
        }
      }
    }
    // If 'id' field is part of Product model and should store the itemId:
    // dataToSet.id = itemId;

    return firestoreDB.setDocument('products', itemId, dataToSet as Product); // Changed 'menu' to 'products'
  },

  // Get all menu items
  getAllMenuItems: async (): Promise<DocumentData[]> => {
    return firestoreDB.getCollection('products'); // Changed 'menu' to 'products'
  },

  // Get menu items by category
  getMenuItemsByCategory: async (category: string): Promise<DocumentData[]> => {
    return firestoreDB.queryCollection('products', 'category', '==', category); // Changed 'menu' to 'products'
  },

  // Delete menu item
  deleteMenuItem: async (itemId: string): Promise<void> => {
    return firestoreDB.deleteDocument('products', itemId); // Changed 'menu' to 'products'
  }
};

// Shop-related database operations
export const shopDB = {
  // Add or update shop
  setShop: async (shopId: string, shopData: Partial<Restaurant>): Promise<void> => {
    const timestamp = new Date().toISOString();
    const dataToSet: any = {
      updatedAt: shopData?.updatedAt || timestamp,
      // Initialize other Restaurant fields as needed or copy them over
      name: shopData?.name || '', // Assuming name is a required or common field
      // Add other fields from Restaurant model with defaults if necessary
    };

    if (shopData && typeof shopData === 'object') {
      for (const key in shopData) {
        if (Object.prototype.hasOwnProperty.call(shopData, key)) {
          if (key !== 'updatedAt' || (key === 'updatedAt' && shopData.updatedAt)) {
             dataToSet[key] = (shopData as any)[key];
          }
        }
      }
    }
    // If 'id' field is part of Restaurant model and should store the shopId:
    // dataToSet.id = shopId;

    return firestoreDB.setDocument('restaurants', shopId, dataToSet as Restaurant);
  },

  // Get all restaurants directly from the restaurants collection
  getAllRestaurants: async (): Promise<DocumentData[]> => {
    console.log("Getting all restaurants directly from restaurants collection");
    try {
      const restaurants = await firestoreDB.getCollection('restaurants');
      console.log(`Found ${restaurants.length} restaurants in collection`);
      return restaurants;
    } catch (error) {
      console.error("Error fetching restaurants collection:", error);
      return [];
    }
  },

  // Get all shops
  getAllShops: async (): Promise<DocumentData[]> => {
    const results: DocumentData[] = [];

    // First try to get from 'restaurants' collection (as seen in your Firestore)
    try {
      console.log("Fetching shops from 'restaurants' collection");

      // Try to get the specific restaurant we saw in Firebase
      try {
        console.log("Trying to get specific restaurant: 2N5qPT2UasAPyjTpDSUY");
        const specificRestaurant = await firestoreDB.getDocument('restaurants', '2N5qPT2UasAPyjTpDSUY');
        if (specificRestaurant) {
          console.log("Found specific restaurant:", specificRestaurant);
          results.push(specificRestaurant);
        }
      } catch (specificError) {
        console.error("Error fetching specific restaurant:", specificError);
      }

      // Also try to get all restaurants from the collection
      const restaurants = await firestoreDB.getCollection('restaurants');
      if (restaurants && restaurants.length > 0) {
        console.log(`Found ${restaurants.length} restaurants from collection query`);

        // Only add restaurants that aren't already in our results
        for (const restaurant of restaurants) {
          if (!results.some(r => r.id === restaurant.id)) {
            results.push(restaurant);
          }
        }
      }

      if (results.length > 0) {
        console.log(`Returning ${results.length} total restaurants`);
        return results;
      }
    } catch (error) {
      console.error("Error fetching from restaurants collection:", error);
    }

    // Fallback to 'shops' collection if no restaurants found
    try {
      console.log("Fallback: Fetching from 'shops' collection");
      const shops = await firestoreDB.getCollection('shops');
      return [...results, ...shops];
    } catch (error) {
      console.error("Error fetching from shops collection:", error);
      return results;
    }
  },

  // Get shop by ID
  getShopById: async (shopId: string): Promise<DocumentData | null> => {
    // Try restaurants collection first
    try {
      const restaurant = await firestoreDB.getDocument('restaurants', shopId);
      if (restaurant) return restaurant;
    } catch (error) {
      console.error(`Error fetching restaurant with ID ${shopId}:`, error);
    }

    // Fallback to shops collection
    return firestoreDB.getDocument('shops', shopId);
  },

  // Get shops by owner ID
  getShopsByOwnerId: async (ownerId: string): Promise<DocumentData[]> => {
    // Try restaurants collection first
    try {
      const restaurants = await firestoreDB.queryCollection('restaurants', 'ownerId', '==', ownerId);
      if (restaurants && restaurants.length > 0) return restaurants;
    } catch (error) {
      console.error(`Error fetching restaurants for owner ${ownerId}:`, error);
    }

    // Fallback to shops collection
    return firestoreDB.queryCollection('shops', 'ownerId', '==', ownerId);
  },

  // Get restaurant by reference
  getRestaurantByReference: async (restaurantRef: any): Promise<DocumentData | null> => {
    try {
      console.log("getRestaurantByReference called with:", restaurantRef);

      // If restaurantRef is a string (document path), convert it to a reference
      if (typeof restaurantRef === 'string') {
        console.log("Restaurant reference is a string");

        // Remove leading slash if present
        const cleanRef = restaurantRef.startsWith('/') ? restaurantRef.substring(1) : restaurantRef;
        console.log("Cleaned reference:", cleanRef);

        // If it's a full path like 'restaurants/123'
        if (cleanRef.includes('/')) {
          console.log("Restaurant reference is a path with /");
          const parts = cleanRef.split('/');
          const collectionName = parts[0];
          const docId = parts[1];
          console.log(`Fetching from collection: ${collectionName}, docId: ${docId}`);

          // Try to get the document
          try {
            const result = await firestoreDB.getDocument(collectionName, docId);
            console.log("Result from path lookup:", result);
            return result;
          } catch (error) {
            console.error(`Error fetching from ${collectionName}/${docId}:`, error);

            // If the collection name is not 'restaurants', try with 'restaurants'
            if (collectionName !== 'restaurants') {
              console.log(`Trying fallback to restaurants collection with ID: ${docId}`);
              const fallbackResult = await firestoreDB.getDocument('restaurants', docId);
              console.log("Result from fallback lookup:", fallbackResult);
              return fallbackResult;
            }
          }
        }

        // If it's just an ID, assume it's in the restaurants collection
        console.log(`Fetching from restaurants collection with ID: ${cleanRef}`);
        const result = await firestoreDB.getDocument('restaurants', cleanRef);
        console.log("Result from ID lookup:", result);
        return result;
      }

      // If it's already a reference, get the document
      console.log("Restaurant reference is a document reference object");
      const docSnap = await getDoc(restaurantRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const result = { id: docSnap.id, ...(data || {}) };
        console.log("Result from reference lookup:", result);
        return result;
      }

      console.log("No document exists at the reference");
      return null;
    } catch (error) {
      console.error('Error fetching restaurant by reference:', error);
      return null;
    }
  }
};
