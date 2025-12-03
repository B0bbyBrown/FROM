import { db } from "./db";
import {
  users,
  recipes,
  items,
  recipeItems,
  suppliers,
  purchases,
  purchaseItems,
  inventoryLots,
  cashSessions,
  sales,
  saleItems,
  stockMovements,
  expenses,
  sessionInventorySnapshots,
} from "@shared/schema";

async function clearSeed() {
  console.log("🗑️ Clearing seeded data...");

  try {
    await db.transaction(async (tx) => {
      // Drop seeded data from all tables (in reverse dependency order to avoid foreign key issues)
      await tx.delete(sessionInventorySnapshots).run();
      await tx.delete(expenses).run();
      await tx.delete(stockMovements).run();
      await tx.delete(saleItems).run();
      await tx.delete(sales).run();
      await tx.delete(cashSessions).run();
      await tx.delete(inventoryLots).run();
      await tx.delete(purchaseItems).run();
      await tx.delete(purchases).run();
      await tx.delete(suppliers).run();
      await tx.delete(recipeItems).run();
      await tx.delete(recipes).run();
      await tx.delete(items).run(); // Unified table for ingredients and products
      await tx.delete(users).run();
    });

    console.log("✅ Seeded data cleared successfully");
  } catch (error) {
    console.error("❌ Failed to clear seeded data:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  clearSeed();
}
