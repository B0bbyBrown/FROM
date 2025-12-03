import { storage } from "./storage";
import { hashPassword } from "./lib/auth";
import { NewItem, NewRecipe } from "@shared/schema";
import { randomUUID } from "crypto";

export async function seed() {
  console.log("🌱 Starting seed process...");

  try {
    // Admin user
    let adminUser = await storage.getUserByEmail("admin@from.com");
    if (!adminUser) {
      const hashedPassword = hashPassword("password");
      await storage.createUser({
        email: "admin@from.com",
        password: hashedPassword,
        name: "Admin User",
        role: "ADMIN",
      });
      adminUser = await storage.getUserByEmail("admin@from.com")!;
    }

    // Cashier user
    let cashierUser = await storage.getUserByEmail("cashier@from.com");
    if (!cashierUser) {
      const hashedPassword = hashPassword("password");
      await storage.createUser({
        email: "cashier@from.com",
        password: hashedPassword,
        name: "Cashier User",
        role: "CASHIER",
      });
      cashierUser = await storage.getUserByEmail("cashier@from.com")!;
    }

    // Kitchen user
    let kitchenUser = await storage.getUserByEmail("kitchen@from.com");
    if (!kitchenUser) {
      const hashedPassword = hashPassword("password");
      await storage.createUser({
        email: "kitchen@from.com",
        password: hashedPassword,
        name: "Kitchen User",
        role: "KITCHEN",
      });
      kitchenUser = await storage.getUserByEmail("kitchen@from.com")!;
    }

    // Dev user
    let devUser = await storage.getUserByEmail("dev@from.com");
    if (!devUser) {
      const hashedPassword = hashPassword("dev");
      await storage.createUser({
        email: "dev@from.com",
        password: hashedPassword,
        name: "Dev User",
        role: "DEV",
      });
      devUser = await storage.getUserByEmail("dev@from.com")!;
    }

    // Seed raw materials (no flour; bases are treated as a raw material)
    let bases = await storage.getItemByName("Bases");
    if (!bases) {
      bases = await storage.createItem({
        name: "Bases",
        type: "RAW",
        unit: "unit",
        price: 2.5,
        low_stock_level: 20,
      } as unknown as NewItem);
    }

    let sauce = await storage.getItemByName("Tomato Sauce");
    if (!sauce) {
      sauce = await storage.createItem({
        name: "Tomato Sauce",
        type: "RAW",
        unit: "L",
        price: 2.0,
        low_stock_level: 5,
      } as unknown as NewItem);
    }

    // Seed a simple pizza recipe using bases as a raw material
    let pizzaRecipe = await storage.getRecipeByName("Pizza Recipe");
    if (!pizzaRecipe) {
      pizzaRecipe = await storage.createRecipe({
        name: "Pizza Recipe",
        items: [
          { childItemId: bases.id, quantity: 1 }, // One base per pizza
          { childItemId: sauce.id, quantity: 0.1 },
        ],
      } as unknown as NewRecipe);
    }

    // Seed a product that uses the pizza recipe
    let pizza = await storage.getItemByName("Margherita Pizza");
    if (!pizza) {
      pizza = await storage.createItem({
        name: "Margherita Pizza",
        type: "PRODUCT",
        unit: "unit",
        price: 12.0,
        low_stock_level: 5,
        recipeId: pizzaRecipe.id,
      });
    } else if (!pizza.recipeId) {
      await storage.updateItem(pizza.id, { recipeId: pizzaRecipe.id });
    }

    // Seed a test supplier
    let testSupplier = await storage.getSupplierByName("Test Supplier");
    if (!testSupplier) {
      testSupplier = await storage.createSupplier({
        name: "Test Supplier",
        email: "test@supplier.com",
      });
    }

    // Seed a sample purchase using the test supplier and an existing item (e.g., Bases) - this adds stock
    bases = await storage.getItemByName("Bases");
    if (bases && testSupplier) {
      await storage.createPurchase({
        supplierId: testSupplier.id,
        notes: "Sample purchase",
        items: [{ itemId: bases.id, quantity: 100, totalCost: 250.0 }], // Add enough stock for sales
      });
    }

    pizza = await storage.getItemByName("Margherita Pizza");
    if (pizza && testSupplier) {
      await storage.createPurchase({
        supplierId: testSupplier.id,
        notes: "Sample product purchase",
        items: [{ itemId: pizza.id, quantity: 50, totalCost: 600.0 }],
      });
    }

    // Seed a sample cash session
    if (cashierUser) {
      const session = await storage.openCashSession({
        openedBy: cashierUser.id,
        openingFloat: 100.0,
      });

      // Seed sample sales for the session (now that stock exists)
      pizza = await storage.getItemByName("Margherita Pizza");
      if (pizza && session) {
        await storage.createSale(
          {
            sessionId: session.id,
            items: [{ itemId: pizza.id, qty: 2 }],
            paymentType: "CASH",
          },
          cashierUser.id
        );
      }

      // Close the session for history
      await storage.closeCashSession(session.id, "150.0");
    }

    // Seed sample pending orders for kitchen
    // Reuse existing cashierUser from earlier
    if (cashierUser) {
      // Create a new open session for pending sales
      const pendingSession = await storage.openCashSession({
        openedBy: cashierUser.id,
        openingFloat: 100.0,
      });

      // Reuse existing pizza from earlier
      pizza = await storage.getItemByName("Margherita Pizza");
      // Reuse existing bases from earlier (if needed for additional items)
      if (pizza && pendingSession) {
        await storage.createSale(
          {
            sessionId: pendingSession.id,
            items: [{ itemId: pizza.id, qty: 1 }],
            paymentType: "CASH",
          },
          cashierUser.id
        );
        await storage.createSale(
          {
            sessionId: pendingSession.id,
            items: [{ itemId: pizza.id, qty: 2 }],
            paymentType: "CASH",
          },
          cashierUser.id
        );
        // Seed pending order for kitchen test
        await storage.createSale(
          {
            sessionId: pendingSession.id,
            items: [{ itemId: pizza.id, qty: 1 }],
            paymentType: "CASH",
          },
          cashierUser.id
        );
        // Leave uncompleted to keep pending
      }
      // Don't close this session to keep orders pending
    }

    console.log(
      "✅ Database seeded with users, items, recipes, purchases, sessions, and sales"
    );
  } catch (error) {
    console.error("❌ Seed process failed:", error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed();
}
