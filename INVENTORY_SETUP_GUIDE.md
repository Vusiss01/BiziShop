# BiziShop Inventory Management System Setup Guide

This guide will help you set up the inventory management system for BiziShop by creating the necessary collections in Firebase.

## Required Collections

Based on your Firebase database structure, we need to add the following collections:

1. `inventory` - For tracking inventory items
2. `suppliers` - For managing supplier information
3. `deliveries` - For tracking upcoming deliveries
4. `stockMovements` - For tracking inventory changes

## Setting Up Collections in Firebase Console

### 1. Inventory Collection

1. Go to your Firebase console: https://console.firebase.google.com/
2. Select your project (bizibase)
3. Navigate to Firestore Database
4. Click "Start collection" or "Add collection"
5. Enter collection ID: `inventory`
6. Add the following documents (repeat for each item):

**Document ID**: Auto-generate
**Fields**:
- `id` (string): [auto-generated document ID]
- `productId` (string): [ID of a product from your products collection]
- `currentStock` (number): [current quantity, e.g., 50]
- `minStock` (number): [minimum stock level, e.g., 10]
- `maxStock` (number): [maximum stock level, e.g., 100]
- `unit` (string): [unit of measurement, e.g., "pieces", "lbs", "bottles"]
- `lastRestocked` (string): [ISO date string, e.g., "2023-06-10T00:00:00.000Z"]
- `supplier` (string): [supplier ID, e.g., "supplier-mexican-foods"]
- `cost` (number): [cost per unit, e.g., 2.50]
- `status` (string): ["ok", "low", or "out"]
- `location` (string): [storage location, e.g., "Main Storage"]
- `restaurant_id` (string): [ID of the restaurant, e.g., "2N5qPTzUasAPyjTpDSUY"]
- `updatedAt` (string): [ISO date string, e.g., "2023-06-10T00:00:00.000Z"]

### 2. Suppliers Collection

1. Click "Start collection" or "Add collection"
2. Enter collection ID: `suppliers`
3. Add the following documents (repeat for each supplier):

**Document ID**: [supplier-id, e.g., "supplier-mexican-foods"]
**Fields**:
- `id` (string): [same as document ID]
- `name` (string): [supplier name, e.g., "Mexican Foods Inc."]
- `contactPerson` (string): [contact person name, e.g., "John Rodriguez"]
- `email` (string): [contact email, e.g., "orders@mexicanfoodsinc.com"]
- `phone` (string): [contact phone, e.g., "(555) 123-4567"]
- `address` (string): [supplier address, e.g., "123 Food Supplier St, Austin, TX"]
- `notes` (string): [additional notes, e.g., "Specializes in authentic Mexican food ingredients"]
- `itemsSupplied` (array): [array of strings, e.g., ["Corn Tortillas", "Flour Tortillas", "Salsa", "Chips"]]
- `restaurant_id` (string): [ID of the restaurant, e.g., "2N5qPTzUasAPyjTpDSUY"]
- `createdAt` (string): [ISO date string, e.g., "2023-06-10T00:00:00.000Z"]
- `updatedAt` (string): [ISO date string, e.g., "2023-06-10T00:00:00.000Z"]

### 3. Deliveries Collection

1. Click "Start collection" or "Add collection"
2. Enter collection ID: `deliveries`
3. Add the following documents (repeat for each delivery):

**Document ID**: Auto-generate
**Fields**:
- `id` (string): [auto-generated document ID]
- `supplierId` (string): [supplier ID, e.g., "supplier-mexican-foods"]
- `supplierName` (string): [supplier name, e.g., "Mexican Foods Inc."]
- `orderDate` (string): [ISO date string, e.g., "2023-06-10T00:00:00.000Z"]
- `expectedDeliveryDate` (string): [ISO date string, e.g., "2023-06-15T00:00:00.000Z"]
- `status` (string): ["pending", "confirmed", or "shipped"]
- `items` (array): [array of objects with the following structure:
  ```
  {
    "inventoryItemId": "[inventory item ID]",
    "productId": "[product ID]",
    "quantity": 10,
    "unit": "pieces",
    "cost": 2.50,
    "totalCost": 25.00
  }
  ```
]
- `totalCost` (number): [total cost of the delivery, e.g., 100.00]
- `notes` (string): [additional notes, e.g., "Regular delivery from Mexican Foods Inc."]
- `restaurant_id` (string): [ID of the restaurant, e.g., "2N5qPTzUasAPyjTpDSUY"]
- `createdAt` (string): [ISO date string, e.g., "2023-06-10T00:00:00.000Z"]
- `updatedAt` (string): [ISO date string, e.g., "2023-06-10T00:00:00.000Z"]

### 4. Stock Movements Collection

1. Click "Start collection" or "Add collection"
2. Enter collection ID: `stockMovements`
3. Add the following documents (repeat for each stock movement):

**Document ID**: Auto-generate
**Fields**:
- `id` (string): [auto-generated document ID]
- `inventoryItemId` (string): [inventory item ID]
- `type` (string): ["in", "out", or "adjustment"]
- `quantity` (number): [quantity changed, e.g., 10]
- `reason` (string): [reason for the movement, e.g., "Regular restock", "Used in production"]
- `date` (string): [ISO date string, e.g., "2023-06-10T00:00:00.000Z"]
- `performedBy` (string): [user ID who performed the movement]
- `performedByName` (string): [name of the user who performed the movement]
- `notes` (string): [additional notes, e.g., "Added 10 pieces of inventory"]
- `restaurant_id` (string): [ID of the restaurant, e.g., "2N5qPTzUasAPyjTpDSUY"]
- `createdAt` (string): [ISO date string, e.g., "2023-06-10T00:00:00.000Z"]

## Sample Data

### Sample Inventory Items

Here are some sample inventory items you can add:

1. **Corn Tortillas**
   - `productId`: [ID of corn tortillas product]
   - `currentStock`: 120
   - `minStock`: 50
   - `unit`: "pieces"
   - `supplier`: "supplier-mexican-foods"
   - `cost`: 0.15
   - `status`: "ok"

2. **Ground Beef**
   - `productId`: [ID of ground beef product]
   - `currentStock`: 8
   - `minStock`: 10
   - `unit`: "lbs"
   - `supplier`: "supplier-local-meats"
   - `cost`: 4.50
   - `status`: "low"

3. **Shredded Cheese**
   - `productId`: [ID of shredded cheese product]
   - `currentStock`: 5
   - `minStock`: 5
   - `unit`: "lbs"
   - `supplier`: "supplier-dairy-distributors"
   - `cost`: 3.75
   - `status`: "low"

4. **Tomatoes**
   - `productId`: [ID of tomatoes product]
   - `currentStock`: 15
   - `minStock`: 10
   - `unit`: "lbs"
   - `supplier`: "supplier-fresh-farms"
   - `cost`: 2.25
   - `status`: "ok"

5. **Lettuce**
   - `productId`: [ID of lettuce product]
   - `currentStock`: 6
   - `minStock`: 5
   - `unit`: "heads"
   - `supplier`: "supplier-fresh-farms"
   - `cost`: 1.50
   - `status`: "ok"

### Sample Suppliers

1. **Mexican Foods Inc.**
   - Document ID: "supplier-mexican-foods"
   - `name`: "Mexican Foods Inc."
   - `contactPerson`: "John Rodriguez"
   - `itemsSupplied`: ["Corn Tortillas", "Flour Tortillas", "Salsa", "Chips"]

2. **Local Meats**
   - Document ID: "supplier-local-meats"
   - `name`: "Local Meats"
   - `contactPerson`: "Sarah Johnson"
   - `itemsSupplied`: ["Ground Beef", "Chicken Breast", "Steak"]

3. **Fresh Farms**
   - Document ID: "supplier-fresh-farms"
   - `name`: "Fresh Farms"
   - `contactPerson`: "Mike Williams"
   - `itemsSupplied`: ["Tomatoes", "Lettuce", "Onions", "Avocados"]

4. **Dairy Distributors**
   - Document ID: "supplier-dairy-distributors"
   - `name`: "Dairy Distributors"
   - `contactPerson`: "Lisa Chen"
   - `itemsSupplied`: ["Shredded Cheese", "Sour Cream", "Butter"]

## Next Steps

After setting up these collections, the inventory management system in BiziShop will be able to:

1. Display inventory items with their current stock levels
2. Show low stock alerts
3. Display supplier information
4. Track upcoming deliveries

You can then use the application to manage your inventory, suppliers, and deliveries.
