// Script to run all seeding scripts in sequence
import { execSync } from 'child_process';

console.log('=== BiziShop Database Seeding Tool ===');
console.log('This script will seed your Firebase database with sample data for the inventory system.');
console.log('Make sure you have set up your .env file with the correct Firebase configuration.');
console.log('');

// Function to run a script and handle errors
function runScript(scriptName, description) {
  console.log(`\n=== Running ${description} ===`);
  try {
    execSync(`node --experimental-json-modules ${scriptName}`, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully!`);
    return true;
  } catch (error) {
    console.error(`❌ Error running ${description}:`, error.message);
    return false;
  }
}

// Run all scripts in sequence
async function main() {
  // Step 1: Seed suppliers
  const suppliersSuccess = runScript('scripts/seed-suppliers.js', 'Suppliers Seeding');
  if (!suppliersSuccess) {
    console.error('Failed to seed suppliers. Aborting.');
    process.exit(1);
  }

  // Step 2: Seed inventory items
  const inventorySuccess = runScript('scripts/seed-inventory.js', 'Inventory Items Seeding');
  if (!inventorySuccess) {
    console.error('Failed to seed inventory items. Aborting.');
    process.exit(1);
  }

  // Step 3: Seed stock movements
  const stockMovementsSuccess = runScript('scripts/seed-stock-movements.js', 'Stock Movements Seeding');
  if (!stockMovementsSuccess) {
    console.error('Failed to seed stock movements. Aborting.');
    process.exit(1);
  }

  // Step 4: Seed upcoming deliveries
  const deliveriesSuccess = runScript('scripts/seed-deliveries.js', 'Upcoming Deliveries Seeding');
  if (!deliveriesSuccess) {
    console.error('Failed to seed upcoming deliveries. Aborting.');
    process.exit(1);
  }

  console.log('\n=== All seeding completed successfully! ===');
  console.log('Your Firebase database now has sample data for the inventory system.');
  console.log('You can now use the inventory management features in the BiziShop application.');
}

// Run the main function
main();
