import { storage } from "./storage";
import { hashPassword } from "./lib/auth";
import { NewItem, NewRecipe } from "@shared/schema";

export async function seed() {
  console.log("🌱 Starting seed process...");

  try {
    // Create admin user
    let adminUser = await storage.getUserByEmail("admin@from.com");
    if (!adminUser) {
      const hashedPassword = hashPassword("password");
      adminUser = await storage.createUser({
        email: "admin@from.com",
        password: hashedPassword as unknown as string,
        name: "Admin User",
        role: "ADMIN",
      });
    }

    // Create cashier user
    let cashierUser = await storage.getUserByEmail("cashier@from.com");
    if (!cashierUser) {
      const hashedPassword = hashPassword("password");
      cashierUser = await storage.createUser({
        email: "cashier@from.com",
        password: hashedPassword as unknown as string,
        name: "Cashier User",
        role: "CASHIER",
      });
    }

    // Create kitchen user
    let kitchenUser = await storage.getUserByEmail("kitchen@from.com");
    if (!kitchenUser) {
      const hashedPassword = hashPassword("password");
      kitchenUser = await storage.createUser({
        email: "kitchen@from.com",
        password: hashedPassword as unknown as string,
        name: "Kitchen User",
        role: "KITCHEN",
      });
    }

    // Create dev user
    let devUser = await storage.getUserByEmail("dev@from.com");
    if (!devUser) {
      const hashedPassword = hashPassword("dev");
      devUser = await storage.createUser({
        email: "dev@from.com",
        password: hashedPassword as unknown as string,
        name: "Dev User",
        role: "DEV",
      });
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

    console.log("✅ Database seeded with users, items, and recipes");
  } catch (error) {
    console.error("❌ Seed process failed:", error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed();
}
