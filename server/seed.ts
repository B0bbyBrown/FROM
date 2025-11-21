import { storage } from "./storage";
import { hashPassword } from "./lib/auth";
import { db } from "./db";
import {
  cashSessions,
  sales,
  saleItems,
  expenses,
  purchases,
  purchaseItems,
  inventoryLots,
  stockMovements,
  sessionInventorySnapshots,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function seed() {
  console.log("🌱 Starting seed process...");

  try {
    // Create admin user (idempotent) - this is the only required seed data
    const adminUser = await storage.getUserByEmail("admin@pizzatruck.com");
    if (!adminUser) {
      const hashedPassword = hashPassword("password");
      await storage.createUser({
        email: "admin@pizzatruck.com",
        password: hashedPassword,
        name: "John Smith",
        role: "ADMIN",
      });
    }
    const secondAdminUser = await storage.getUserByEmail(
      "6obbybrown@gmail.com"
    );
    if (!secondAdminUser) {
      const hashedPassword = hashPassword("Bobby2004brown");
      await storage.createUser({
        email: "6obbybrown@gmail.com",
        password: hashedPassword,
        name: "Bobby Brown",
        role: "ADMIN",
      });
    }

    // Create cashier user
    const cashierUser = await storage.getUserByEmail("cashier@pizzatruck.com");
    if (!cashierUser) {
      const hashedPassword = hashPassword("password");
      await storage.createUser({
        email: "cashier@pizzatruck.com",
        password: hashedPassword,
        name: "Jane Doe",
        role: "CASHIER",
      });
    }

    // Create kitchen user
    const kitchenUser = await storage.getUserByEmail("kitchen@pizzatruck.com");
    if (!kitchenUser) {
      const hashedPassword = hashPassword("password");
      await storage.createUser({
        email: "kitchen@pizzatruck.com",
        password: hashedPassword,
        name: "Mike Chef",
        role: "KITCHEN",
      });
    }

    // Create dev user
    const devUser = await storage.getUserByEmail("dev@pizzatruck.com");
    if (!devUser) {
      const hashedPassword = hashPassword("dev");
      await storage.createUser({
        email: "dev@pizzatruck.com",
        password: hashedPassword,
        name: "Dev User",
        role: "DEV",
      });
    }

    console.log("Seeding items and recipes...");

    // Seed Items
    const itemData = [
      // Raw Materials
      { name: "Pizza Base", type: "RAW", unit: "kg", lowStockLevel: 10 },
      { name: "Pepperoni", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Cheese", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Tomatoes", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Onions", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Garlic", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Basil", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Oregano", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Salt", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Pepper", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Olive Oil", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Pizza Sauce", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Tomato Sauce", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Mozzarella Cheese", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Pineapple", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Mushrooms", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Bell Peppers", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Olives", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Anchovies", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Chicken", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Beef", type: "RAW", unit: "g", lowStockLevel: 100 },
      { name: "Pork", type: "RAW", unit: "g", lowStockLevel: 100 },

      // Pizza Menu
      {
        name: "Margherita Pizza",
        type: "SELLABLE",
        unit: "unit",
        price: 12.0,
        sku: "PIZ-MAR",
      },
      {
        name: "Pepperoni Pizza",
        type: "SELLABLE",
        unit: "unit",
        price: 14.0,
        sku: "PIZ-PEP",
      },
      {
        name: "Hawaiian Pizza",
        type: "SELLABLE",
        unit: "unit",
        price: 16.0,
        sku: "PIZ-HAW",
      },
      {
        name: "Veggie Pizza",
        type: "SELLABLE",
        unit: "unit",
        price: 18.0,
        sku: "PIZ-VEG",
      },
      {
        name: "Meat Lovers Pizza",
        type: "SELLABLE",
        unit: "unit",
        price: 20.0,
        sku: "PIZ-ML",
      },
      {
        name: "Cheese Pizza",
        type: "SELLABLE",
        unit: "unit",
        price: 12.0,
        sku: "PIZ-CHE",
      },
    ];

    //Other Menu Items
    const otherItemData = [
      {
        name: "Coca-Cola",
        type: "SELLABLE",
        unit: "can",
        price: 2.5,
      },
      {
        name: "Pepsi",
        type: "SELLABLE",
        unit: "can",
        price: 2.5,
      },
      {
        name: "Sprite",
        type: "SELLABLE",
        unit: "can",
        price: 2.5,
      },
      {
        name: "Fanta",
        type: "SELLABLE",
        unit: "can",
        price: 2.5,
      },
      {
        name: "7Up",
        type: "SELLABLE",
        unit: "can",
        price: 2.5,
      },
    ];

    const itemIds: { [key: string]: string } = {};
    for (const item of itemData) {
      let existing = await storage.getItemByName(item.name);
      if (existing) {
        itemIds[item.name] = existing.id;
        continue;
      }
      const newItem = await storage.createItem(item as any);
      itemIds[item.name] = newItem.id;
    }

    const otherItemIds: { [key: string]: string } = {};
    for (const item of otherItemData) {
      let existing = await storage.getItemByName(item.name);
      if (existing) {
        otherItemIds[item.name] = existing.id;
        continue;
      }
      const newItem = await storage.createItem(item as any);

      otherItemIds[item.name] = newItem.id;
    }

    // Seed Recipes
    const recipeData = [
      {
        parent: "Margherita Pizza",
        children: [
          { child: "Pizza Base", quantity: 1 },
          { child: "Tomato Sauce", quantity: 0.2 },
          { child: "Mozzarella Cheese", quantity: 0.15 },
        ],
      },
      {
        parent: "Pepperoni Pizza",
        children: [
          { child: "Pizza Base", quantity: 1 },
          { child: "Tomato Sauce", quantity: 0.2 },
          { child: "Mozzarella Cheese", quantity: 0.15 },
          { child: "Pepperoni", quantity: 0.1 },
        ],
      },
      {
        parent: "Hawaiian Pizza",
        children: [
          { child: "Pizza Base", quantity: 1 },
          { child: "Tomato Sauce", quantity: 0.2 },
          { child: "Mozzarella Cheese", quantity: 0.15 },
          { child: "Pineapple", quantity: 0.1 },
        ],
      },
      {
        parent: "Veggie Pizza",
        children: [
          { child: "Pizza Base", quantity: 1 },
          { child: "Tomato Sauce", quantity: 0.2 },
          { child: "Mozzarella Cheese", quantity: 0.15 },
          { child: "Mushrooms", quantity: 0.1 },
        ],
      },
      {
        parent: "Meat Lovers Pizza",
        children: [
          { child: "Pizza Base", quantity: 1 },
          { child: "Tomato Sauce", quantity: 0.2 },
          { child: "Mozzarella Cheese", quantity: 0.15 },
          { child: "Pepperoni", quantity: 0.1 },
        ],
      },
    ];

    for (const recipe of recipeData) {
      const parentId = itemIds[recipe.parent];
      // Clear existing recipe items to ensure idempotency
      await storage.deleteRecipeItems(parentId);
      for (const child of recipe.children) {
        await storage.createRecipeItem({
          parentItemId: parentId,
          childItemId: itemIds[child.child],
          quantity: child.quantity,
        });
      }
      // Add initial stock for manufactured items
      await storage.createInventoryLot({
        itemId: parentId,
        quantity: 100,
        unitCost: 0.5,
      });
    }

    console.log("Seeding suppliers...");

    const supplierData = [
      {
        name: "General Supplier",
        phone: "123-456-7890",
        email: "info@generalsupplier.com",
      },
      {
        name: "Dairy Supplier",
        phone: "987-654-3210",
        email: "sales@dairysupplier.com",
      },
    ];

    const supplierIds: { [key: string]: string } = {};
    for (const supplier of supplierData) {
      let existing = await storage.getSupplierByName(supplier.name);
      if (existing) {
        supplierIds[supplier.name] = existing.id;
        continue;
      }
      const newSupplier = await storage.createSupplier(supplier);
      supplierIds[supplier.name] = newSupplier.id;
    }

    console.log("Seeding purchase orders for raw materials...");

    const purchaseData = [
      {
        supplier: "General Supplier",
        items: [
          { item: "Pizza Base", quantity: 50, totalCost: 100 },
          { item: "Tomato Sauce", quantity: 50, totalCost: 150 },
          { item: "Mozzarella Cheese", quantity: 20, totalCost: 200 },
          { item: "Pepperoni", quantity: 10, totalCost: 100 },
        ],
        notes: "Initial stock purchase for basics",
      },
      {
        supplier: "Dairy Supplier",
        items: [
          { item: "Pizza Base", quantity: 50, totalCost: 100 },
          { item: "Tomato Sauce", quantity: 50, totalCost: 150 },
          { item: "Mozzarella Cheese", quantity: 20, totalCost: 200 },
          { item: "Pepperoni", quantity: 10, totalCost: 100 },
        ],
        notes: "Dairy and sauce purchase",
      },
    ];

    for (const purchase of purchaseData) {
      const supplierId = supplierIds[purchase.supplier];

      // Check if purchase already exists
      const existingPurchases = await storage.getPurchases({ supplierId });
      if (existingPurchases.some((p) => p.notes === purchase.notes)) {
        console.log(`Skipping existing purchase: ${purchase.notes}`);
        continue;
      }

      // Prepare items array with itemIds
      const purchaseItems = purchase.items.map((pi) => ({
        itemId: itemIds[pi.item],
        quantity: pi.quantity,
        totalCost: pi.totalCost,
      }));

      // Call createPurchase with full data
      const newPurchase = await storage.createPurchase({
        supplierId,
        notes: purchase.notes,
        items: purchaseItems,
      });

      // No need for separate createPurchaseItem calls, as it's handled in createPurchase
    }

    console.log("Database fully seeded with purchases");

    // Get user IDs for historical data
    const admin = await storage.getUserByEmail("admin@pizzatruck.com");
    const cashier = await storage.getUserByEmail("cashier@pizzatruck.com");

    if (!admin || !cashier) {
      throw new Error("Required users not found for seeding test data");
    }

    // Get all sellable item IDs
    const allSellableItems = [
      "Margherita Pizza",
      "Pepperoni Pizza",
      "Hawaiian Pizza",
      "Veggie Pizza",
      "Meat Lovers Pizza",
      "Cheese Pizza",
      "Coca-Cola",
      "Pepsi",
      "Sprite",
      "Fanta",
      "7Up",
    ];
    const sellableItemIds: string[] = [];
    for (const itemName of allSellableItems) {
      const id = itemIds[itemName] || otherItemIds[itemName];
      if (id) sellableItemIds.push(id);
    }

    // Get raw material IDs for inventory snapshots
    const rawMaterialNames = [
      "Pizza Base",
      "Pepperoni",
      "Mozzarella Cheese",
      "Tomato Sauce",
      "Pineapple",
      "Mushrooms",
    ];
    const rawMaterialIds: string[] = [];
    for (const name of rawMaterialNames) {
      if (itemIds[name]) rawMaterialIds.push(itemIds[name]);
    }

    console.log("Seeding sample orders - one per product...");

    // Clear existing sales, sale items, and sessions first
    console.log("Clearing existing orders and sessions...");
    db.delete(saleItems).run();
    db.delete(sales).run();
    db.delete(cashSessions).run();
    db.delete(sessionInventorySnapshots).run();
    // Note: We keep stock movements and other data, only clearing sales/sessions

    // Create one active session for testing
    const activeSessionId = randomUUID();
    const sessionTime = new Date();
    sessionTime.setHours(8, 0, 0, 0);

    db.insert(cashSessions)
      .values({
        id: activeSessionId,
        openedAt: sessionTime,
        openedBy: cashier.id,
        openingFloat: 100,
        notes: "Active test session",
      })
      .run();

    // Create opening inventory snapshot for the session
    const openingInventory = rawMaterialIds.map((itemId) => ({
      sessionId: activeSessionId,
      itemId,
      quantity: 50,
      type: "OPENING" as const,
      createdAt: sessionTime,
    }));

    if (openingInventory.length > 0) {
      db.insert(sessionInventorySnapshots)
        .values(openingInventory)
        .run();
    }

    // Payment types and statuses to cycle through
    const paymentTypes: ("CASH" | "CARD" | "OTHER")[] = ["CASH", "CARD", "OTHER"];
    const saleItemStatuses: ("PENDING" | "RECEIVED" | "PREPPING" | "DONE")[] = [
      "PENDING",
      "RECEIVED",
      "PREPPING",
      "DONE",
    ];

    // Create one order per product with different variables
    let paymentTypeIndex = 0;
    let statusIndex = 0;
    let useSession = true; // Alternate between session and no session

    for (let i = 0; i < sellableItemIds.length; i++) {
      const itemId = sellableItemIds[i];
      const item = await storage.getItem(itemId);
      if (!item || !item.price) continue;

      const saleTime = new Date();
      saleTime.setMinutes(saleTime.getMinutes() - (sellableItemIds.length - i));

      const paymentType = paymentTypes[paymentTypeIndex % paymentTypes.length];
      const status = saleItemStatuses[statusIndex % saleItemStatuses.length];
      const sessionIdForSale = useSession ? activeSessionId : undefined;

      // Calculate totals
      const qty = 1;
      const unitPrice = item.price;
      const lineTotal = unitPrice * qty;
      const cogs = lineTotal * 0.4; // 40% COGS

      // Create the sale
      const saleId = randomUUID();
      db.insert(sales)
        .values({
          id: saleId,
          sessionId: sessionIdForSale || null,
          userId: cashier.id,
          total: lineTotal,
          cogs: cogs,
          paymentType: paymentType,
          createdAt: saleTime,
        })
        .run();

      // Create the sale item with the specific status
      db.insert(saleItems)
        .values({
          id: randomUUID(),
          saleId: saleId,
          itemId: itemId,
          qty: qty,
          unitPrice: unitPrice,
          lineTotal: lineTotal,
          status: status,
        })
        .run();

      // Cycle through variables
      paymentTypeIndex++;
      statusIndex++;
      useSession = !useSession;
    }

    console.log("✅ Database seeded successfully with sample orders");
  } catch (error) {
    console.error("❌ Seed process failed:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error; // Re-throw instead of process.exit so caller can handle it
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed();
}
