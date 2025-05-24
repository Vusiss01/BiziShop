import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  Product,
  Category,
  InventoryItem,
  Order,
  ShopSettings,
  Notification,
} from "../types/models";
import { firestoreDB, menuDB, inventoryDB, orderDB } from "../lib/firebase-db";
import { useAuth } from "./AuthContext";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { firestore } from "../lib/firebase";

interface ShopContextType {
  // Products and categories
  products: Product[];
  categories: Category[];
  loadingProducts: boolean;
  loadingCategories: boolean;

  // Inventory
  inventoryItems: InventoryItem[];
  loadingInventory: boolean;

  // Orders
  activeOrders: Order[];
  completedOrders: Order[];
  loadingOrders: boolean;

  // Notifications
  notifications: Notification[];
  unreadNotificationsCount: number;
  loadingNotifications: boolean;

  // Shop settings
  shopSettings: ShopSettings | null;
  loadingSettings: boolean;

  // Functions
  refreshProducts: () => Promise<void>;
  refreshInventory: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  updateShopSettings: (settings: Partial<ShopSettings>) => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
};

interface ShopProviderProps {
  children: ReactNode;
}

export const ShopProvider = ({ children }: ShopProviderProps) => {
  const { currentUser, userRole, userRestaurant } = useAuth(); // Added userRestaurant

  // State for products and categories
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // State for inventory
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);

  // State for orders
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // State for notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // State for shop settings
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Calculate unread notifications count
  const unreadNotificationsCount = notifications.filter(
    (n) => !n.isRead,
  ).length;

  // Load products and categories
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribeProducts: (() => void) | undefined;
    let unsubscribeCategories: (() => void) | undefined;

    const loadProductsAndCategories = async () => {
      try {
        setLoadingProducts(true);
        setLoadingCategories(true);

        // Set up real-time listener for products
        let productsQuery;
        if (userRestaurant && userRestaurant.id) {
          console.log(`ShopContext: Fetching products for restaurant ID: ${userRestaurant.id}`);
          productsQuery = query(
            collection(firestore, "products"),
            where("restaurant_id", "==", userRestaurant.id),
            where("isAvailable", "==", true),
            orderBy("name"),
          );
        } else {
          console.log("ShopContext: userRestaurant or userRestaurant.id is not available. Fetching all available products.");
          // Fallback or behavior if no specific restaurant context (might need adjustment based on app logic)
          // For now, this will fetch all products if no restaurant is set, which might be too broad.
          // Consider if this fallback is appropriate or if it should prevent loading products.
          productsQuery = query(
            collection(firestore, "products"),
            where("isAvailable", "==", true),
            orderBy("name"),
          );
        }

        unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
          const productsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[];
          
          console.log(`ShopContext: Fetched ${productsData.length} products. First product (if any):`, productsData[0]);
          if (productsData.length > 0) {
            console.log(`ShopContext: Details of first product: ID=${productsData[0].id}, Name=${productsData[0].name}, Category=${productsData[0].category}, RestaurantID=${(productsData[0] as any).restaurant_id}`);
          }
          
          setProducts(productsData);
          setLoadingProducts(false);
        }, (error) => {
          console.error("Error in products snapshot listener:", error);
          setLoadingProducts(false);
        });

        // Set up real-time listener for categories
        const categoriesQuery = query(
          collection(firestore, "categories"),
          orderBy("order"),
        );

        unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
          const categoriesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Category[];

          setCategories(categoriesData);
          setLoadingCategories(false);
        }, (error) => {
          console.error("Error in categories snapshot listener:", error);
          setLoadingCategories(false);
        });
      } catch (error) {
        console.error("Error loading products and categories:", error);
        setLoadingProducts(false);
        setLoadingCategories(false);
      }
    };

    loadProductsAndCategories();

    return () => {
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeCategories) unsubscribeCategories();
    };
  }, [currentUser, userRestaurant]); // Added userRestaurant to dependency array

  // Load inventory items
  useEffect(() => {
    if (!currentUser || (userRole !== "manager" && userRole !== "owner"))
      return;

    let unsubscribeInventory: (() => void) | undefined;

    const loadInventory = async () => {
      try {
        setLoadingInventory(true);

        // Set up real-time listener for inventory
        const inventoryQuery = query(
          collection(firestore, "inventory"),
          orderBy("productId"),
        );

        unsubscribeInventory = onSnapshot(inventoryQuery, (snapshot) => {
          const inventoryData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as InventoryItem[];

          setInventoryItems(inventoryData);
          setLoadingInventory(false);
        });
      } catch (error) {
        console.error("Error loading inventory:", error);
        setLoadingInventory(false);
      }
    };

    loadInventory();

    return () => {
      if (unsubscribeInventory) unsubscribeInventory();
    };
  }, [currentUser, userRole]);

  // Load orders
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribeActive: (() => void) | undefined;
    let unsubscribeCompleted: (() => void) | undefined;

    const loadOrders = async () => {
      try {
        setLoadingOrders(true);

        // Set up real-time listener for active orders
        // Get the restaurant ID from the current user's profile
        const userProfile = await firestoreDB.getDocument(
          "users",
          currentUser.uid,
        );
        const restaurantId =
          userProfile?.restaurantId || "2N5qPT2UasAPyjTpDSUY"; // Fallback to the ID we saw in Firebase

        console.log(`Fetching orders for restaurant: ${restaurantId}`);
        console.log(
          `Current user ID: ${currentUser.uid}, Restaurant ID from profile: ${userProfile?.restaurantId}`,
        );

        // Debug: Check Firestore directly for orders
        try {
          const ordersRef = collection(firestore, "orders");
          const ordersSnapshot = await getDocs(ordersRef);
          console.log(`Found ${ordersSnapshot.size} total orders in Firestore`);

          // Check for completed orders specifically
          const completedOrdersRef = query(
            collection(firestore, "orders"),
            where("status", "in", ["completed", "cancelled"]),
          );
          const completedSnapshot = await getDocs(completedOrdersRef);
          console.log(
            `Found ${completedSnapshot.size} total completed/cancelled orders in Firestore`,
          );

          // Check for restaurant-specific completed orders
          const restaurantCompletedRef = query(
            collection(firestore, "orders"),
            where("restaurant_id", "==", `/restaurants/${restaurantId}`),
            where("status", "in", ["completed", "cancelled"]),
          );
          const restaurantCompletedSnapshot = await getDocs(
            restaurantCompletedRef,
          );
          console.log(
            `Found ${restaurantCompletedSnapshot.size} completed/cancelled orders for restaurant ${restaurantId}`,
          );

          // Log a few completed orders for debugging
          let count = 0;
          restaurantCompletedSnapshot.forEach((doc) => {
            if (count < 3) {
              // Limit to 3 orders to avoid console spam
              console.log(`Restaurant completed order ${doc.id}:`, doc.data());
              count++;
            }
          });
        } catch (error) {
          console.error("Error in direct Firestore check:", error);
        }

        const activeOrdersQuery = query(
          collection(firestore, "orders"),
          where("restaurant_id", "==", `/restaurants/${restaurantId}`),
          where("status", "in", ["pending", "preparing", "ready"]),
          orderBy("createdAt", "desc"),
        );

        unsubscribeActive = onSnapshot(activeOrdersQuery, (snapshot) => {
          const activeOrdersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Order[];

          console.log(
            `Active orders snapshot received: ${snapshot.docs.length} orders`,
          );
          setActiveOrders(activeOrdersData);
        });

        // Set up real-time listener for completed orders (last 50)
        const completedOrdersQuery = query(
          collection(firestore, "orders"),
          where("restaurant_id", "==", `/restaurants/${restaurantId}`),
          where("status", "in", ["completed", "cancelled"]),
          orderBy("createdAt", "desc"),
          limit(50),
        );

        unsubscribeCompleted = onSnapshot(
          completedOrdersQuery,
          (snapshot) => {
            const completedOrdersData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Order[];

            console.log(
              `Completed orders snapshot received: ${snapshot.docs.length} orders`,
            );
            setCompletedOrders(completedOrdersData);
            setLoadingOrders(false);
          },
          (error) => {
            console.error("Error in completed orders snapshot:", error);
            setLoadingOrders(false);
          },
        );
      } catch (error) {
        console.error("Error loading orders:", error);
        setLoadingOrders(false);
      }
    };

    loadOrders();

    return () => {
      if (unsubscribeActive) unsubscribeActive();
      if (unsubscribeCompleted) unsubscribeCompleted();
    };
  }, [currentUser]);

  // Load notifications
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribeNotifications: (() => void) | undefined;

    const loadNotifications = async () => {
      try {
        setLoadingNotifications(true);

        // Set up real-time listener for notifications
        const notificationsQuery = query(
          collection(firestore, "notifications"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc"),
          limit(20),
        );

        unsubscribeNotifications = onSnapshot(
          notificationsQuery,
          (snapshot) => {
            const notificationsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Notification[];

            setNotifications(notificationsData);
            setLoadingNotifications(false);
          },
        );
      } catch (error) {
        console.error("Error loading notifications:", error);
        setLoadingNotifications(false);
      }
    };

    loadNotifications();

    return () => {
      if (unsubscribeNotifications) unsubscribeNotifications();
    };
  }, [currentUser]);

  // Load shop settings
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribeSettings: (() => void) | undefined;

    const loadShopSettings = async () => {
      try {
        setLoadingSettings(true);

        // Set up real-time listener for shop settings
        const settingsQuery = query(
          collection(firestore, "settings"),
          limit(1),
        );

        unsubscribeSettings = onSnapshot(settingsQuery, (snapshot) => {
          if (!snapshot.empty) {
            const settingsData = {
              id: snapshot.docs[0].id,
              ...snapshot.docs[0].data(),
            } as ShopSettings;

            setShopSettings(settingsData);
          } else {
            // Create default settings if none exist
            const defaultSettings: ShopSettings = {
              id: "default",
              name: "BiziShop",
              currency: "USD",
              taxRate: 0.08,
            };

            firestoreDB.setDocument("settings", "default", defaultSettings);
            setShopSettings(defaultSettings);
          }

          setLoadingSettings(false);
        });
      } catch (error) {
        console.error("Error loading shop settings:", error);
        setLoadingSettings(false);
      }
    };

    loadShopSettings();

    return () => {
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, [currentUser]);

  // Function to refresh products
  const refreshProducts = async () => {
    try {
      setLoadingProducts(true);
      let productsQuery;
      if (userRestaurant && userRestaurant.id) {
        productsQuery = query(
          collection(firestore, "products"),
          where("restaurant_id", "==", userRestaurant.id),
          where("isAvailable", "==", true),
          orderBy("name"),
        );
      } else {
        // Fallback if no restaurant context, adjust as needed
        productsQuery = query(
          collection(firestore, "products"),
          where("isAvailable", "==", true),
          orderBy("name"),
        );
      }
      const snapshot = await getDocs(productsQuery);
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error("Error refreshing products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Function to refresh inventory
  const refreshInventory = async () => {
    try {
      setLoadingInventory(true);
      const inventoryData = await inventoryDB.getAllInventoryItems();
      setInventoryItems(inventoryData as InventoryItem[]);
    } catch (error) {
      console.error("Error refreshing inventory:", error);
    } finally {
      setLoadingInventory(false);
    }
  };

  // Function to refresh orders
  const refreshOrders = async () => {
    if (!currentUser) return;

    try {
      setLoadingOrders(true);

      // Get the restaurant ID from the current user's profile
      const userProfile = await firestoreDB.getDocument(
        "users",
        currentUser.uid,
      );
      const restaurantId = userProfile?.restaurantId || "2N5qPT2UasAPyjTpDSUY"; // Fallback to the ID we saw in Firebase

      console.log(`Refreshing orders for restaurant: ${restaurantId}`);

      // Get all orders
      const ordersData = await orderDB.getAllOrders();
      console.log("All orders from database:", ordersData);

      // Filter orders by restaurant ID - with more detailed logging
      const restaurantOrders = ordersData.filter((order) => {
        const matches = order.restaurant_id === `/restaurants/${restaurantId}`;
        if (!matches) {
          console.log(
            `Order ${order.id} has restaurant_id ${order.restaurant_id}, which doesn't match /restaurants/${restaurantId}`,
          );
        }
        return matches;
      });

      console.log("Restaurant orders after filtering:", restaurantOrders);

      const active = restaurantOrders.filter((order) => {
        const isActive = ["pending", "preparing", "ready"].includes(
          order.status,
        );
        console.log(
          `Order ${order.id} status: ${order.status}, isActive: ${isActive}`,
        );
        return isActive;
      }) as Order[];

      const completed = restaurantOrders.filter((order) => {
        const isCompleted = ["completed", "cancelled"].includes(order.status);
        console.log(
          `Order ${order.id} status: ${order.status}, isCompleted: ${isCompleted}`,
        );
        return isCompleted;
      }) as Order[];

      console.log(
        `Found ${active.length} active orders and ${completed.length} completed orders`,
      );

      setActiveOrders(active);
      setCompletedOrders(completed);
    } catch (error) {
      console.error("Error refreshing orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Function to refresh notifications
  const refreshNotifications = async () => {
    if (!currentUser) return;

    try {
      setLoadingNotifications(true);
      const notificationsQuery = query(
        collection(firestore, "notifications"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc"),
        limit(20),
      );

      const snapshot = await firestoreDB.getCollection("notifications");
      const notificationsData = snapshot.filter(
        (notification) => notification.userId === currentUser.uid,
      ) as Notification[];

      setNotifications(notificationsData);
    } catch (error) {
      console.error("Error refreshing notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Function to mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await firestoreDB.updateDocument("notifications", notificationId, {
        isRead: true,
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Function to update shop settings
  const updateShopSettings = async (settings: Partial<ShopSettings>) => {
    // Ensure shopSettings and its id are available
    if (!shopSettings || !shopSettings.id) {
      console.error("Attempted to update shop settings when shopSettings is null or has no ID.");
      return;
    }

    // shopSettings is guaranteed non-null and has an id here.
    const currentShopSettings = shopSettings as ShopSettings; // Assert type after guard

    try {
      setLoadingSettings(true);
      const updatedSettings: ShopSettings = {
        ...currentShopSettings, // Spread existing non-null settings
        ...settings,             // Spread partial updates
        id: currentShopSettings.id, // Ensure id is preserved from original
        updatedAt: new Date().toISOString(), // Set new updatedAt
      };

      await firestoreDB.setDocument(
        "settings",
        currentShopSettings.id,
        updatedSettings,
      );
      setShopSettings(updatedSettings);
    } catch (error) {
      console.error("Error updating shop settings:", error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const value = {
    // Products and categories
    products,
    categories,
    loadingProducts,
    loadingCategories,

    // Inventory
    inventoryItems,
    loadingInventory,

    // Orders
    activeOrders,
    completedOrders,
    loadingOrders,

    // Notifications
    notifications,
    unreadNotificationsCount,
    loadingNotifications,

    // Shop settings
    shopSettings,
    loadingSettings,

    // Functions
    refreshProducts,
    refreshInventory,
    refreshOrders,
    refreshNotifications,
    markNotificationAsRead,
    updateShopSettings,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
