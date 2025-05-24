# BiziShop Inventory Management System

This document provides instructions on how to set up and use the inventory management system in BiziShop.

## Overview

The inventory management system allows shop owners and managers to:

- Track inventory levels for all products
- Receive alerts for low stock items
- Manage suppliers
- Track upcoming deliveries
- View inventory reports

## Setup Instructions

### 1. Prerequisites

- Make sure you have Node.js installed
- Ensure you have Firebase configured with the project ID 'bizibase'
- Verify that your `.env` file contains the correct Firebase configuration

### 2. Seeding the Database

The inventory system requires several collections in Firebase:

- `inventory`: Stores inventory items and stock levels
- `suppliers`: Stores supplier information
- `deliveries`: Tracks upcoming deliveries
- `stockMovements`: Tracks inventory changes

To seed these collections with sample data, run:

```bash
npm run seed-all
```

This will run all the seeding scripts in the correct order. If you want to run individual scripts:

```bash
# Seed suppliers
npm run seed-suppliers

# Seed inventory items
npm run seed-inventory

# Seed stock movements
npm run seed-stock-movements

# Seed upcoming deliveries
npm run seed-deliveries
```

### 3. Accessing the Inventory Management System

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Log in to the application as an owner or manager

3. Navigate to the Inventory page from the sidebar

## Using the Inventory System

### Inventory Tab

The main inventory tab displays all inventory items with their current stock levels. You can:

- Search for specific items
- Filter to show only low stock items
- Add new inventory items
- Edit existing items
- Update stock levels

### Low Stock Tab

This tab shows items that are below their minimum stock level. You can:

- View all low stock and out-of-stock items
- Quickly reorder items
- Add items to orders

### Suppliers Tab

The suppliers tab displays all your suppliers with their contact information. You can:

- View supplier details
- Edit supplier information
- Place orders with suppliers
- Add new suppliers

### Deliveries Tab

The deliveries tab shows upcoming deliveries from suppliers. You can:

- View scheduled deliveries
- See delivery details including items and costs
- Confirm or cancel deliveries
- Schedule new deliveries

### Reports Tab

The reports tab provides analytics on your inventory. This is a placeholder for future functionality.

## Data Structure

### Inventory Items

Each inventory item includes:

- `id`: Unique identifier
- `productId`: Reference to a product in the products collection
- `currentStock`: Current quantity in stock
- `minStock`: Minimum stock level before alert
- `maxStock`: Maximum stock level (optional)
- `unit`: Unit of measurement (e.g., lbs, pieces)
- `lastRestocked`: Date of last restock
- `supplier`: Reference to a supplier
- `cost`: Cost per unit
- `status`: Stock status (ok, low, out)
- `location`: Storage location (optional)
- `expiryDate`: Expiration date (optional)
- `restaurant_id`: Reference to the restaurant/shop

### Suppliers

Each supplier includes:

- `id`: Unique identifier
- `name`: Supplier name
- `contactPerson`: Contact person's name
- `email`: Contact email
- `phone`: Contact phone number
- `address`: Supplier address
- `notes`: Additional notes
- `itemsSupplied`: List of items supplied
- `restaurant_id`: Reference to the restaurant/shop

### Deliveries

Each delivery includes:

- `id`: Unique identifier
- `supplierId`: Reference to a supplier
- `supplierName`: Supplier name
- `orderDate`: Date the order was placed
- `expectedDeliveryDate`: Expected delivery date
- `status`: Delivery status (pending, confirmed, shipped)
- `items`: Array of items in the delivery
- `totalCost`: Total cost of the delivery
- `notes`: Additional notes
- `restaurant_id`: Reference to the restaurant/shop

### Stock Movements

Each stock movement includes:

- `id`: Unique identifier
- `inventoryItemId`: Reference to an inventory item
- `type`: Movement type (in, out, adjustment)
- `quantity`: Quantity changed
- `reason`: Reason for the movement
- `date`: Date of the movement
- `performedBy`: User who performed the movement
- `notes`: Additional notes
- `restaurant_id`: Reference to the restaurant/shop

## Troubleshooting

If you encounter issues:

1. Check that Firebase is properly configured
2. Verify that all required collections exist
3. Check the browser console for errors
4. Ensure you have the correct permissions (owner or manager role)

## Future Enhancements

- Barcode scanning for inventory management
- Automatic reordering when stock is low
- Integration with POS system for automatic stock updates
- Advanced inventory analytics and reporting
- Mobile app for inventory management on the go
