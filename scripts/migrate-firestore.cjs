const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

// Firestore Schema Definition
const firestoreSchema = {
  users: {
    fields: {
      name:           { type: 'string' },
      email:          { type: 'string' },
      role:           { type: 'string', allowed: ['owner','manager','cashier','driver','admin','customer'] },
      restaurant_ids: { type: 'array',  items: 'string' },
      createdAt:      { type: 'timestamp' },
    }
  },

  user_settings: {
    fields: {
      appearance:    { type: 'map' },
      notifications: { type: 'map' },
      privacy:       { type: 'map' },
      timezone:      { type: 'string' },
    }
  },

  restaurants: {
    fields: {
      name:         { type: 'string' },
      address:      { type: 'map',  schema: ['street','city','state','country','zipCode'] },
      contact:      { type: 'map' },
      cuisine:      { type: 'array', items: 'string' },
      working_hours:{ type: 'array', items: 'map' },
      owner_id:     { type: 'string' },
      status:       { type: 'string' },
      updated_at:   { type: 'timestamp' },
    }
  },

  shopMembers: {
    fields: {
      shopId: { type: 'string' },
      userId: { type: 'string' },
      role:   { type: 'string', allowed: ['manager','cashier'] },
    }
  },

  products: {
    fields: {
      name:          { type: 'string' },
      description:   { type: 'string' },
      price:         { type: 'number' },
      isAvailable:   { type: 'boolean' },
      category:      { type: 'string' },
      imageUrl:      { type: 'string' },
      restaurant_id: { type: 'string' },
    }
  },

  inventory: {
    fields: {
      productId: { type: 'string' },
      quantity:  { type: 'number' },
      unit:      { type: 'string' },
      status:    { type: 'string', allowed: ['ok','low','out'] },
    }
  },

  suppliers: {
    fields: {
      name:          { type: 'string' },
      contactPerson: { type: 'string' },
      email:         { type: 'string' },
      phone:         { type: 'string' },
      address:       { type: 'string' },
      itemsSupplied: { type: 'array', items: 'string' },
      lastOrder:     { type: 'string' },
    }
  },

  deliveries: {
    fields: {
      supplierId:           { type: 'string' },
      supplierName:         { type: 'string' },
      orderDate:            { type: 'timestamp' },
      expectedDeliveryDate: { type: 'timestamp' },
      status:               { type: 'string' },
      items:                { type: 'array', items: 'map' },
      totalCost:            { type: 'number' },
      notes:                { type: 'string' },
    }
  },

  orders: {
    fields: {
      user_id:       { type: 'string' },
      restaurant_id: { type: 'string' },
      driver_id:     { type: 'string' },
      createdAt:     { type: 'timestamp' },
      updatedAt:     { type: 'timestamp' },
      status:        { type: 'string' },
      customer:      { type: 'map' },
      items:         { type: 'array', items: 'map' },
      total:         { type: 'number' },
    }
  },

  categories: {
    fields: {
      name:        { type: 'string' },
      description: { type: 'string' },
      order:       { type: 'number' },
    }
  },

  settings: {
    fields: {
      currency: { type: 'string' },
      taxRate:  { type: 'number' },
      name:     { type: 'string' },
    }
  },

  // Chats & Messages
  chats: {
    fields: {
      participants:       { type: 'array',  items: 'string' }, // list of user UIDs
      createdAt:          { type: 'timestamp' },
      lastMessageText:    { type: 'string' },
      lastMessageTimestamp: { type: 'timestamp' },
    },
    subcollections: {
      messages: {
        fields: {
          userId:    { type: 'string' },
          text:      { type: 'string' },
          timestamp: { type: 'timestamp' },
        }
      }
    }
  }
};

async function migrateSchema() {
  for (const collectionName in firestoreSchema) {
    console.log(`Processing collection: ${collectionName}`);

    // 1. Ensure root collection exists and 2. Write schema stub document
    const collectionRef = db.collection(collectionName);
    const schemaDocRef = collectionRef.doc('_schema');

    // Check if the schema document already exists
    const schemaDoc = await schemaDocRef.get();
    if (!schemaDoc.exists) {
      console.log(`Creating schema document for ${collectionName}`);
      await schemaDocRef.set({
        fields: firestoreSchema[collectionName].fields,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      console.log(`Schema document already exists for ${collectionName}`);
    }

    // 3. Handle subcollections (e.g., messages in chats)
    if (firestoreSchema[collectionName].subcollections) {
      for (const subcollectionName in firestoreSchema[collectionName].subcollections) {
        const subcollectionSchema = firestoreSchema[collectionName].subcollections[subcollectionName];
        const subcollectionRef = collectionRef.doc('dummy').collection(subcollectionName); // Need a dummy doc to create subcollection
        const subcollectionSchemaDocRef = subcollectionRef.doc('_schema');

        // Check if the subcollection schema document already exists
        const subcollectionSchemaDoc = await subcollectionSchemaDocRef.get();
        if (!subcollectionSchemaDoc.exists) {
          console.log(`Creating subcollection schema document for ${collectionName}/${subcollectionName}`);
          await subcollectionSchemaDocRef.set({
            fields: subcollectionSchema.fields,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        } else {
          console.log(`Subcollection schema document already exists for ${collectionName}/${subcollectionName}`);
        }
      }
    }

    // 4. Migrate or update existing documents
    console.log(`Migrating existing documents for ${collectionName}`);
    await migrateDocuments(collectionName, firestoreSchema[collectionName].fields);
  }

  // 5. Verify and create composite indexes
  console.log('Creating composite indexes...');
  try {
    await createCompositeIndex('orders', [{ fieldPath: 'restaurant_id', order: 'ASCENDING' }, { fieldPath: 'createdAt', order: 'DESCENDING' }]);
    await createCompositeIndex('products', [{ fieldPath: 'isAvailable', order: 'ASCENDING' }, { fieldPath: 'restaurant_id', order: 'ASCENDING' }, { fieldPath: 'name', order: 'ASCENDING' }]);
  } catch (error) {
    console.error('Error creating composite indexes:', error);
  }

  // 6. Apply security rules (implementation needed)
  console.log('Applying security rules needs implementation. Please update firestore.rules manually.');
}

// Helper function to create composite indexes
async function createCompositeIndex(collectionName, fields) {
  const indexName = `composite_index_${collectionName}_${fields.map(f => f.fieldPath).join('_')}`;
  try {
    // Composite indexes can only be created via the Firebase console or CLI
    console.log(`Please create composite index ${indexName} manually via the Firebase console or CLI`);
  } catch (error) {
    console.error(`Error creating composite index ${indexName}:`, error);
  }
}

async function migrateDocuments(collectionName, schemaFields) {
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();

  snapshot.forEach(async doc => {
    const docData = doc.data();
    let updated = false;
    const updates = {};

    // Remove extra fields
    for (const field in docData) {
      if (!schemaFields[field]) {
        console.log(`Removing extra field ${field} from document ${doc.id}`);
        updates[field] = admin.firestore.FieldValue.delete();
        updated = true;
      }
    }

    // Add missing fields
    for (const field in schemaFields) {
      if (docData[field] === undefined) {
        console.log(`Adding missing field ${field} to document ${doc.id}`);
        updates[field] = null;
        updated = true;
      }
    }

    if (updated) {
      await collectionRef.doc(doc.id).update(updates);
      console.log(`Updated document ${doc.id} in collection ${collectionName}`);
    }
  });
}

migrateSchema()
  .then(() => {
    console.log('Schema migration completed!');
  })
  .catch(error => {
    console.error('Schema migration failed:', error);
  });
