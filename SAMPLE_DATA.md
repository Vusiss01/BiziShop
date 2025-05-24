# Sample Data for Inventory Management

This document provides sample data that you can manually add to your Firebase database to test the inventory management system.

## Inventory Items

Here are some sample inventory items you can add to the `inventory` collection:

### Item 1: Corn Tortillas

```json
{
  "id": "[auto-generated]",
  "productId": "[ID of a corn tortillas product from your products collection]",
  "currentStock": 120,
  "minStock": 50,
  "maxStock": 200,
  "unit": "pieces",
  "lastRestocked": "2023-06-10T00:00:00.000Z",
  "supplier": "supplier-mexican-foods",
  "cost": 0.15,
  "status": "ok",
  "location": "Main Storage",
  "restaurant_id": "[Your restaurant ID]",
  "updatedAt": "2023-06-10T00:00:00.000Z"
}
```

### Item 2: Ground Beef

```json
{
  "id": "[auto-generated]",
  "productId": "[ID of a ground beef product from your products collection]",
  "currentStock": 8,
  "minStock": 10,
  "maxStock": 40,
  "unit": "lbs",
  "lastRestocked": "2023-06-20T00:00:00.000Z",
  "supplier": "supplier-local-meats",
  "cost": 4.50,
  "status": "low",
  "location": "Refrigerator",
  "restaurant_id": "[Your restaurant ID]",
  "updatedAt": "2023-06-20T00:00:00.000Z"
}
```

### Item 3: Shredded Cheese

```json
{
  "id": "[auto-generated]",
  "productId": "[ID of a shredded cheese product from your products collection]",
  "currentStock": 5,
  "minStock": 5,
  "maxStock": 20,
  "unit": "lbs",
  "lastRestocked": "2023-06-19T00:00:00.000Z",
  "supplier": "supplier-dairy-distributors",
  "cost": 3.75,
  "status": "low",
  "location": "Refrigerator",
  "restaurant_id": "[Your restaurant ID]",
  "updatedAt": "2023-06-19T00:00:00.000Z"
}
```

### Item 4: Tomatoes

```json
{
  "id": "[auto-generated]",
  "productId": "[ID of a tomatoes product from your products collection]",
  "currentStock": 15,
  "minStock": 10,
  "maxStock": 40,
  "unit": "lbs",
  "lastRestocked": "2023-06-21T00:00:00.000Z",
  "supplier": "supplier-fresh-farms",
  "cost": 2.25,
  "status": "ok",
  "location": "Refrigerator",
  "restaurant_id": "[Your restaurant ID]",
  "updatedAt": "2023-06-21T00:00:00.000Z"
}
```

### Item 5: Lettuce

```json
{
  "id": "[auto-generated]",
  "productId": "[ID of a lettuce product from your products collection]",
  "currentStock": 6,
  "minStock": 5,
  "maxStock": 20,
  "unit": "heads",
  "lastRestocked": "2023-06-21T00:00:00.000Z",
  "supplier": "supplier-fresh-farms",
  "cost": 1.50,
  "status": "ok",
  "location": "Refrigerator",
  "restaurant_id": "[Your restaurant ID]",
  "updatedAt": "2023-06-21T00:00:00.000Z"
}
```

## Suppliers

Here are some sample suppliers you can add to the `suppliers` collection:

### Supplier 1: Mexican Foods Inc.

```json
{
  "id": "supplier-mexican-foods",
  "name": "Mexican Foods Inc.",
  "contactPerson": "John Rodriguez",
  "email": "orders@mexicanfoodsinc.com",
  "phone": "(555) 123-4567",
  "address": "123 Food Supplier St, Austin, TX",
  "notes": "Specializes in authentic Mexican food ingredients",
  "itemsSupplied": ["Corn Tortillas", "Flour Tortillas", "Salsa", "Chips"],
  "restaurant_id": "[Your restaurant ID]",
  "createdAt": "2023-06-01T00:00:00.000Z",
  "updatedAt": "2023-06-01T00:00:00.000Z"
}
```

### Supplier 2: Local Meats

```json
{
  "id": "supplier-local-meats",
  "name": "Local Meats",
  "contactPerson": "Sarah Johnson",
  "email": "orders@localmeats.com",
  "phone": "(555) 987-6543",
  "address": "456 Butcher Ave, Austin, TX",
  "notes": "Local farm-to-table meat supplier",
  "itemsSupplied": ["Ground Beef", "Chicken Breast", "Steak"],
  "restaurant_id": "[Your restaurant ID]",
  "createdAt": "2023-06-01T00:00:00.000Z",
  "updatedAt": "2023-06-01T00:00:00.000Z"
}
```

### Supplier 3: Fresh Farms

```json
{
  "id": "supplier-fresh-farms",
  "name": "Fresh Farms",
  "contactPerson": "Mike Williams",
  "email": "orders@freshfarms.com",
  "phone": "(555) 456-7890",
  "address": "789 Produce Lane, Austin, TX",
  "notes": "Organic produce supplier",
  "itemsSupplied": ["Tomatoes", "Lettuce", "Onions", "Avocados"],
  "restaurant_id": "[Your restaurant ID]",
  "createdAt": "2023-06-01T00:00:00.000Z",
  "updatedAt": "2023-06-01T00:00:00.000Z"
}
```

### Supplier 4: Dairy Distributors

```json
{
  "id": "supplier-dairy-distributors",
  "name": "Dairy Distributors",
  "contactPerson": "Lisa Chen",
  "email": "orders@dairydist.com",
  "phone": "(555) 234-5678",
  "address": "321 Milk Road, Austin, TX",
  "notes": "Premium dairy products",
  "itemsSupplied": ["Shredded Cheese", "Sour Cream", "Butter"],
  "restaurant_id": "[Your restaurant ID]",
  "createdAt": "2023-06-01T00:00:00.000Z",
  "updatedAt": "2023-06-01T00:00:00.000Z"
}
```

## Deliveries

Here are some sample deliveries you can add to the `deliveries` collection:

### Delivery 1: Mexican Foods Inc.

```json
{
  "id": "[auto-generated]",
  "supplierId": "supplier-mexican-foods",
  "supplierName": "Mexican Foods Inc.",
  "orderDate": "2023-06-20T00:00:00.000Z",
  "expectedDeliveryDate": "2023-06-23T10:00:00.000Z",
  "status": "pending",
  "items": [
    {
      "inventoryItemId": "[ID of corn tortillas inventory item]",
      "productId": "[ID of corn tortillas product]",
      "quantity": 200,
      "unit": "pieces",
      "cost": 0.15,
      "totalCost": 30.00
    },
    {
      "inventoryItemId": "[ID of flour tortillas inventory item]",
      "productId": "[ID of flour tortillas product]",
      "quantity": 150,
      "unit": "pieces",
      "cost": 0.20,
      "totalCost": 30.00
    }
  ],
  "totalCost": 60.00,
  "notes": "Regular delivery from Mexican Foods Inc.",
  "restaurant_id": "[Your restaurant ID]",
  "createdAt": "2023-06-20T00:00:00.000Z",
  "updatedAt": "2023-06-20T00:00:00.000Z",
  "supplier": "Mexican Foods Inc.",
  "date": "2023-06-23",
  "time": "10:00 AM"
}
```

### Delivery 2: Local Meats

```json
{
  "id": "[auto-generated]",
  "supplierId": "supplier-local-meats",
  "supplierName": "Local Meats",
  "orderDate": "2023-06-21T00:00:00.000Z",
  "expectedDeliveryDate": "2023-06-24T08:30:00.000Z",
  "status": "confirmed",
  "items": [
    {
      "inventoryItemId": "[ID of ground beef inventory item]",
      "productId": "[ID of ground beef product]",
      "quantity": 15,
      "unit": "lbs",
      "cost": 4.50,
      "totalCost": 67.50
    },
    {
      "inventoryItemId": "[ID of chicken breast inventory item]",
      "productId": "[ID of chicken breast product]",
      "quantity": 20,
      "unit": "lbs",
      "cost": 3.75,
      "totalCost": 75.00
    }
  ],
  "totalCost": 142.50,
  "notes": "Weekly meat delivery",
  "restaurant_id": "[Your restaurant ID]",
  "createdAt": "2023-06-21T00:00:00.000Z",
  "updatedAt": "2023-06-21T00:00:00.000Z",
  "supplier": "Local Meats",
  "date": "2023-06-24",
  "time": "8:30 AM"
}
```

## Stock Movements

Here are some sample stock movements you can add to the `stockMovements` collection:

### Stock Movement 1: Corn Tortillas Restock

```json
{
  "id": "[auto-generated]",
  "inventoryItemId": "[ID of corn tortillas inventory item]",
  "type": "in",
  "quantity": 100,
  "reason": "Regular restock",
  "date": "2023-06-10T00:00:00.000Z",
  "performedBy": "[ID of a manager or owner user]",
  "performedByName": "[Name of the manager or owner]",
  "notes": "Added 100 pieces of corn tortillas",
  "restaurant_id": "[Your restaurant ID]",
  "createdAt": "2023-06-10T00:00:00.000Z"
}
```

### Stock Movement 2: Ground Beef Usage

```json
{
  "id": "[auto-generated]",
  "inventoryItemId": "[ID of ground beef inventory item]",
  "type": "out",
  "quantity": 5,
  "reason": "Used in production",
  "date": "2023-06-15T00:00:00.000Z",
  "performedBy": "[ID of a manager or owner user]",
  "performedByName": "[Name of the manager or owner]",
  "notes": "Used 5 lbs of ground beef for daily production",
  "restaurant_id": "[Your restaurant ID]",
  "createdAt": "2023-06-15T00:00:00.000Z"
}
```

## How to Add This Data

1. Go to your Firebase console: https://console.firebase.google.com/
2. Select your project (bizibase)
3. Navigate to Firestore Database
4. For each collection, click "Start collection" or "Add collection" if it doesn't exist
5. Add each document using the data provided above
6. Replace placeholder values (like `[Your restaurant ID]`) with actual values from your database

After adding this data, you should be able to see it in the inventory management system in your application.
