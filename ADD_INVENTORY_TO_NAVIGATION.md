# Adding Inventory to Navigation

This guide will help you add the inventory page to your application's navigation menu.

## Step 1: Locate the Navigation Component

First, you need to find the component that handles the navigation menu. This is typically in a file like `src/components/Sidebar.tsx`, `src/components/Navigation.tsx`, or similar.

## Step 2: Add Inventory to the Navigation Menu

Once you've found the navigation component, add the inventory link to the menu. Here's an example of how to do this:

```jsx
// Example navigation component
import { Package } from "lucide-react"; // Import the Package icon

// Inside your navigation items array or JSX
const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Orders",
    href: "/orders",
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    title: "Menu",
    href: "/menu",
    icon: <Menu className="h-5 w-5" />,
  },
  // Add this item
  {
    title: "Inventory",
    href: "/inventory",
    icon: <Package className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];
```

## Step 3: Update the Router

Make sure the inventory page is properly configured in your router. Find your router configuration (typically in `src/App.tsx` or a dedicated router file) and add the inventory route:

```jsx
// Example router configuration
import Inventory from "./components/inventory";

// Inside your router configuration
<Routes>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/orders" element={<Orders />} />
  <Route path="/menu" element={<Menu />} />
  {/* Add this route */}
  <Route path="/inventory" element={<Inventory />} />
  <Route path="/settings" element={<Settings />} />
</Routes>
```

## Step 4: Update Role-Based Access Control

If your application uses role-based access control, make sure to update the permissions to allow access to the inventory page. This is typically in a file like `src/lib/firebase.ts` or a dedicated permissions file.

```javascript
// Example role-based access control
export const roleAccess = {
  owner: [
    "/dashboard",
    "/orders",
    "/menu",
    "/inventory", // Add this
    "/settings",
  ],
  manager: [
    "/dashboard",
    "/orders",
    "/menu",
    "/inventory", // Add this
    "/settings",
  ],
  cashier: [
    "/dashboard",
    "/orders",
    "/menu",
    // Cashiers might not need access to inventory
  ],
};
```

## Step 5: Test the Navigation

After making these changes, test the navigation to ensure the inventory page is accessible:

1. Start the development server: `npm run dev`
2. Log in to the application
3. Click on the inventory link in the navigation menu
4. Verify that the inventory page loads correctly

## Troubleshooting

If you encounter any issues:

1. Check the browser console for errors
2. Verify that the inventory component is properly exported and imported
3. Make sure the route path matches the href in the navigation menu
4. Check that the user has permission to access the inventory page

## Next Steps

After adding the inventory page to the navigation, you should:

1. Set up the Firebase collections as described in the setup guide
2. Add sample data to test the functionality
3. Configure the Firebase security rules to secure the inventory data
