# Firebase Security Rules for Inventory Management

This document provides the security rules you should add to your Firebase project to secure the inventory management system.

## Firestore Security Rules

Add these rules to your Firestore security rules in the Firebase console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner() {
      return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner';
    }
    
    function isManager() {
      return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manager';
    }
    
    function isCashier() {
      return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'cashier';
    }
    
    function isOwnerOrManager() {
      return isOwner() || isManager();
    }
    
    function belongsToUserRestaurant(restaurantId) {
      return isSignedIn() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.restaurant_id == restaurantId;
    }
    
    // Existing collections
    match /users/{userId} {
      allow read: if isSignedIn() && (request.auth.uid == userId || isOwnerOrManager());
      allow write: if isSignedIn() && (request.auth.uid == userId || isOwner());
    }
    
    match /restaurants/{restaurantId} {
      allow read: if isSignedIn();
      allow write: if isOwner();
    }
    
    match /products/{productId} {
      allow read: if isSignedIn();
      allow write: if isOwnerOrManager() && belongsToUserRestaurant(resource.data.restaurant_id);
    }
    
    match /orders/{orderId} {
      allow read: if isSignedIn() && belongsToUserRestaurant(resource.data.restaurant_id);
      allow write: if isSignedIn() && belongsToUserRestaurant(resource.data.restaurant_id);
    }
    
    // Inventory-related collections
    match /inventory/{itemId} {
      allow read: if isSignedIn() && belongsToUserRestaurant(resource.data.restaurant_id);
      allow create: if isOwnerOrManager() && belongsToUserRestaurant(request.resource.data.restaurant_id);
      allow update: if isOwnerOrManager() && belongsToUserRestaurant(resource.data.restaurant_id);
      allow delete: if isOwner() && belongsToUserRestaurant(resource.data.restaurant_id);
    }
    
    match /suppliers/{supplierId} {
      allow read: if isSignedIn() && belongsToUserRestaurant(resource.data.restaurant_id);
      allow create: if isOwnerOrManager() && belongsToUserRestaurant(request.resource.data.restaurant_id);
      allow update: if isOwnerOrManager() && belongsToUserRestaurant(resource.data.restaurant_id);
      allow delete: if isOwner() && belongsToUserRestaurant(resource.data.restaurant_id);
    }
    
    match /deliveries/{deliveryId} {
      allow read: if isSignedIn() && belongsToUserRestaurant(resource.data.restaurant_id);
      allow create: if isOwnerOrManager() && belongsToUserRestaurant(request.resource.data.restaurant_id);
      allow update: if isOwnerOrManager() && belongsToUserRestaurant(resource.data.restaurant_id);
      allow delete: if isOwner() && belongsToUserRestaurant(resource.data.restaurant_id);
    }
    
    match /stockMovements/{movementId} {
      allow read: if isSignedIn() && belongsToUserRestaurant(resource.data.restaurant_id);
      allow create: if isOwnerOrManager() && belongsToUserRestaurant(request.resource.data.restaurant_id);
      allow update: if false; // Stock movements should not be updated, only created
      allow delete: if isOwner() && belongsToUserRestaurant(resource.data.restaurant_id);
    }
  }
}
```

## How to Apply These Rules

1. Go to your Firebase console: https://console.firebase.google.com/
2. Select your project (bizibase)
3. Navigate to Firestore Database
4. Click on the "Rules" tab
5. Replace the existing rules with the rules above
6. Click "Publish"

## Explanation of Rules

These security rules implement the following permissions:

- **Inventory Items**:
  - Owners and managers can create, read, and update inventory items for their restaurant
  - Only owners can delete inventory items
  - Cashiers can only read inventory items

- **Suppliers**:
  - Owners and managers can create, read, and update suppliers for their restaurant
  - Only owners can delete suppliers
  - Cashiers can only read suppliers

- **Deliveries**:
  - Owners and managers can create, read, and update deliveries for their restaurant
  - Only owners can delete deliveries
  - Cashiers can only read deliveries

- **Stock Movements**:
  - Owners and managers can create and read stock movements for their restaurant
  - Stock movements cannot be updated (only created)
  - Only owners can delete stock movements
  - Cashiers can only read stock movements

## Testing the Rules

After applying these rules, you should test them to ensure they work as expected:

1. Log in as an owner and verify you can perform all operations
2. Log in as a manager and verify you can perform all operations except deletion
3. Log in as a cashier and verify you can only read data

If you encounter any issues, check the Firebase console for error messages and adjust the rules accordingly.
