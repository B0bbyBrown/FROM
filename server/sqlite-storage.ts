import {
  type User,
  type InsertUser,
  type Item,
  type InsertItem,
  type Supplier,
  type InsertSupplier,
  type Purchase,
  type InsertPurchase,
  type PurchaseItem,
  type InsertPurchaseItem,
  type InventoryLot,
  type InsertInventoryLot,
  type CashSession,
  type InsertCashSession,
  type Sale,
  type InsertSale,
  type SaleItem,
  type InsertSaleItem,
  type StockMovement,
  type InsertStockMovement,
  type Expense,
  type InsertExpense,
  type NewPurchase,
  type NewSale,
  type StockAdjustment,
  type OpenSessionRequest,
  type NewItem,
  users,
  items,
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
  type NewRecipe,
  recipes,
  recipeItems,
  RecipeItem,
  InsertRecipeItem,
} from "@shared/schema";
import { IStorage, SafeUser } from "./storage";
import { db, sqlite } from "./db";
import { eq, and, desc, asc, sum, sql, isNull, inArray, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Utility functions for type conversion
const toNum = (value: string | number | null): number => {
  if (value === null || value === undefined) return 0;
  return typeof value === "string" ? parseFloat(value) : value;
};

const toStr = (value: number | null): string => value?.toString() || "";

const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export interface Recipe {
  id: string;
  name: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  items: { childItemId: string; quantity: number }[];
}

export class SqliteStorage implements IStorage {
  db;

  constructor() {
    this.db = db;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .all();
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).all();
    return user;
  }

  async createUser(user: InsertUser): Promise<SafeUser> {
    const [created] = await db.insert(users).values(user).returning().all();
    return {
      id: created.id,
      email: created.email,
      name: created.name,
      role: created.role,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<SafeUser> {
    const [updated] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning()
      .all();
    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id)).run();
  }

  async getUsers(): Promise<SafeUser[]> {
    return await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .all();
  }

  async getSafeUserByEmail(email: string): Promise<SafeUser | undefined> {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .all();
    return user;
  }

  async getSafeUserById(id: string): Promise<SafeUser | undefined> {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .all();
    return user;
  }

  async getUser(id: string): Promise<SafeUser | undefined> {
    return await this.getSafeUserById(id);
  }

  async verifyPassword(email: string, password: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.password) return false;
    return bcrypt.compareSync(password, user.password);
  }

  async loginUser(email: string, password: string): Promise<SafeUser | null> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        console.log(`Login failed: No user found for ${email}`);
        return null;
      }
      const isValid = await this.verifyPassword(email, password);
      if (!isValid) {
        console.log(`Login failed: Invalid password for ${email}`);
        return null;
      }
      // Return safe user without password
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error(`Error in loginUser for ${email}:`, error);
      throw error; // Propagate to route handler
    }
  }

  // Items
  async getItems(type?: "RAW" | "PRODUCT"): Promise<Item[]> {
    let query = db.select().from(items);
    if (type) {
      query = query.where(eq(items.type, type));
    }
    return await query.all();
  }

  async getItemById(id: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id)).all();
    return item;
  }

  async getItemByName(name: string): Promise<Item | undefined> {
    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.name, name))
      .all();
    return item;
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [created] = await db.insert(items).values(item).returning().all();
    return created;
  }

  async updateItem(id: string, item: Partial<InsertItem>): Promise<Item> {
    const [updated] = await db
      .update(items)
      .set(item)
      .where(eq(items.id, id))
      .returning()
      .all();
    return updated;
  }

  async deleteItem(id: string): Promise<void> {
    await db.delete(items).where(eq(items.id, id)).run();
  }

  // Recipes
  async getRecipes(): Promise<Recipe[]> {
    const allRecipes = await db.select().from(recipes).all();

    return allRecipes.map((r) => ({
      ...r,
      items: db
        .select()
        .from(recipeItems)
        .where(eq(recipeItems.recipeId, r.id))
        .all(),
    }));
  }

  async getRecipeById(id: string): Promise<Recipe | undefined> {
    const [recipe] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, id))
      .all();
    if (!recipe) return undefined;

    const recipeItemsList = await db
      .select()
      .from(recipeItems)
      .where(eq(recipeItems.recipeId, id))
      .all();

    return {
      ...recipe,
      items: recipeItemsList,
    };
  }

  async getRecipeByName(name: string): Promise<Recipe | undefined> {
    const [recipe] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.name, name))
      .all();
    if (!recipe) return undefined;

    const recipeItemsList = await db
      .select()
      .from(recipeItems)
      .where(eq(recipeItems.recipeId, recipe.id))
      .all();

    return {
      ...recipe,
      items: recipeItemsList,
    };
  }

  async createRecipe(recipe: NewRecipe): Promise<Recipe> {
    const [createdRecipe] = await db
      .insert(recipes)
      .values({ name: recipe.name })
      .returning()
      .all();

    for (const item of recipe.items) {
      await db
        .insert(recipeItems)
        .values({
          recipeId: createdRecipe.id,
          childItemId: item.childItemId,
          quantity: item.quantity,
        })
        .run();
    }

    return {
      ...createdRecipe,
      items: recipe.items,
    };
  }

  async updateRecipe(id: string, recipe: Partial<NewRecipe>): Promise<Recipe> {
    if (recipe.name) {
      await db
        .update(recipes)
        .set({ name: recipe.name })
        .where(eq(recipes.id, id))
        .run();
    }

    if (recipe.items) {
      await db.delete(recipeItems).where(eq(recipeItems.recipeId, id)).run();
      for (const item of recipe.items) {
        await db
          .insert(recipeItems)
          .values({
            recipeId: id,
            childItemId: item.childItemId,
            quantity: item.quantity,
          })
          .run();
      }
    }

    return (await this.getRecipeById(id)) as Recipe;
  }

  async deleteRecipe(id: string): Promise<void> {
    await db.delete(recipeItems).where(eq(recipeItems.recipeId, id)).run();
    await db.delete(recipes).where(eq(recipes.id, id)).run();
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(asc(suppliers.name)).all();
  }

  async getSupplierById(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .all();
    return supplier;
  }

  async getSupplierByName(name: string): Promise<Supplier | undefined> {
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.name, name))
      .all();
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [created] = await db
      .insert(suppliers)
      .values(supplier)
      .returning()
      .all();
    return created;
  }

  async updateSupplier(
    id: string,
    supplier: Partial<InsertSupplier>
  ): Promise<Supplier> {
    const [updated] = await db
      .update(suppliers)
      .set(supplier)
      .where(eq(suppliers.id, id))
      .returning()
      .all();
    return updated;
  }

  async deleteSupplier(id: string): Promise<void> {
    await db.delete(suppliers).where(eq(suppliers.id, id)).run();
  }

  // Purchases (transaction)
  async createPurchase(purchase: NewPurchase): Promise<Purchase> {
    return new Promise((resolve, reject) => {
      try {
        const createdPurchase = sqlite.transaction(() => {
          const created = db
            .insert(purchases)
            .values({
              supplierId: purchase.supplierId || null,
              notes: purchase.notes || null,
            })
            .returning()
            .get();

          if (!created) {
            throw new Error("Failed to create purchase");
          }

          for (const item of purchase.items) {
            const quantity = toNum(item.quantity);
            const totalCost = toNum(item.totalCost);
            const unitCost = totalCost / quantity;

            db.insert(purchaseItems)
              .values({
                purchaseId: created.id,
                itemId: item.itemId,
                quantity,
                totalCost: totalCost,
              })
              .run();

            db.insert(inventoryLots)
              .values({
                itemId: item.itemId,
                quantity,
                unitCost: unitCost,
              })
              .run();

            db.insert(stockMovements)
              .values({
                kind: "PURCHASE",
                itemId: item.itemId,
                quantity,
                reference: created.id,
              })
              .run();
          }

          const purchaseItemsResult = db
            .select()
            .from(purchaseItems)
            .where(eq(purchaseItems.purchaseId, created.id))
            .all();

          return { ...created, items: purchaseItemsResult };
        })();
        resolve(createdPurchase);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getPurchases(): Promise<Purchase[]> {
    const allPurchases = await db
      .select()
      .from(purchases)
      .orderBy(desc(purchases.createdAt))
      .all();

    return allPurchases.map((p) => ({
      ...p,
      items: db
        .select()
        .from(purchaseItems)
        .where(eq(purchaseItems.purchaseId, p.id))
        .all(),
    }));
  }

  // Inventory Lots
  async getInventoryLots(itemId: string): Promise<InventoryLot[]> {
    return await db
      .select()
      .from(inventoryLots)
      .where(eq(inventoryLots.itemId, itemId))
      .all();
  }

  async getInventoryLotById(id: string): Promise<InventoryLot | undefined> {
    const [lot] = await db
      .select()
      .from(inventoryLots)
      .where(eq(inventoryLots.id, id))
      .all();
    return lot;
  }

  async createInventoryLot(lot: InsertInventoryLot): Promise<InventoryLot> {
    const [created] = await db
      .insert(inventoryLots)
      .values(lot)
      .returning()
      .all();
    return created;
  }

  async updateInventoryLot(
    id: string,
    lot: Partial<InsertInventoryLot>
  ): Promise<InventoryLot> {
    const [updated] = await db
      .update(inventoryLots)
      .set(lot)
      .where(eq(inventoryLots.id, id))
      .returning()
      .all();
    return updated;
  }

  async deleteInventoryLot(id: string): Promise<void> {
    await db.delete(inventoryLots).where(eq(inventoryLots.id, id)).run();
  }

  // Cash Sessions
  async getCashSessions(): Promise<CashSession[]> {
    return await db
      .select()
      .from(cashSessions)
      .orderBy(desc(cashSessions.openedAt))
      .all();
  }

  async getCashSessionById(id: string): Promise<CashSession | undefined> {
    const [session] = await db
      .select()
      .from(cashSessions)
      .where(eq(cashSessions.id, id))
      .all();
    return session;
  }

  async getActiveCashSession(): Promise<CashSession | undefined> {
    const [session] = await db
      .select()
      .from(cashSessions)
      .where(isNull(cashSessions.closedAt))
      .all();
    return session;
  }

  async openCashSession(session: InsertCashSession): Promise<CashSession> {
    const [created] = await db
      .insert(cashSessions)
      .values({
        ...session,
        openingFloat: session.openingFloat ? toNum(session.openingFloat) : 0,
      })
      .returning()
      .all();
    return created;
  }

  async closeCashSession(
    sessionId: string,
    closingFloat: string,
    notes?: string,
    closedBy?: string
  ): Promise<CashSession> {
    const [updated] = await db
      .update(cashSessions)
      .set({
        closedAt: new Date(),
        closingFloat: toNum(closingFloat),
        notes,
        closedBy,
      })
      .where(eq(cashSessions.id, sessionId))
      .returning()
      .all();
    return updated;
  }

  async openSessionAndMoveStock(
    sessionData: OpenSessionRequest,
    userId: string
  ): Promise<CashSession> {
    return new Promise((resolve) => {
      const session = sqlite.transaction(() => {
        const [newSession] = db
          .insert(cashSessions)
          .values({
            openedBy: userId,
            notes: sessionData.notes,
            openingFloat: toNum(sessionData.openingFloat),
          })
          .returning()
          .all();

        if (!newSession) throw new Error("Failed to create session");

        const snapshotItems = db
          .select({
            itemId: inventoryLots.itemId,
            quantity: sum(inventoryLots.quantity).as("quantity"),
          })
          .from(inventoryLots)
          .groupBy(inventoryLots.itemId)
          .all();

        for (const item of snapshotItems) {
          db.insert(sessionInventorySnapshots)
            .values({
              sessionId: newSession.id,
              itemId: item.itemId,
              quantity: toNum(item.quantity),
              type: "OPENING",
            })
            .run();
        }

        return newSession;
      })();
      resolve(session);
    });
  }

  // Sales (synchronous transaction wrapped in Promise)
  async createSale(sale: NewSale, userId: string): Promise<Sale> {
    return new Promise((resolve, reject) => {
      try {
        const createdSale = sqlite.transaction(() => {
          let totalRevenue = 0;
          let totalCogs = 0;
          const saleItemsData: InsertSaleItem[] = [];
          const stockMovementsToCreate: InsertStockMovement[] = [];

          const consumeItemRecursive = (
            itemId: string,
            qtyNeeded: number
          ): number => {
            let calculatedCost = 0;
            let remaining = qtyNeeded;

            const lots = db
              .select()
              .from(inventoryLots)
              .where(
                and(
                  eq(inventoryLots.itemId, itemId),
                  ne(inventoryLots.quantity, 0)
                )
              )
              .orderBy(asc(inventoryLots.createdAt))
              .all();

            for (const lot of lots) {
              if (remaining <= 0) break;

              const consume = Math.min(remaining, lot.quantity);
              calculatedCost += consume * lot.unitCost;

              db.update(inventoryLots)
                .set({ quantity: lot.quantity - consume })
                .where(eq(inventoryLots.id, lot.id))
                .run();

              stockMovementsToCreate.push({
                kind: "SALE_CONSUME", // Fixed to valid kind
                itemId: itemId,
                quantity: -consume,
              });

              remaining -= consume;
            }

            if (remaining > 0) {
              throw new Error(`Insufficient stock for item ${itemId}`);
            }
            return calculatedCost;
          };

          for (const item of sale.items) {
            const product = db
              .select()
              .from(items)
              .where(eq(items.id, item.itemId))
              .get();
            if (!product || product.type !== "PRODUCT" || !product.price) {
              throw new Error(`Item not found or not sellable: ${item.itemId}`);
            }

            const unitPrice = product.price;
            const lineTotal = unitPrice * item.qty;
            totalRevenue += lineTotal;

            saleItemsData.push({
              saleId: "temp",
              itemId: item.itemId,
              qty: item.qty,
              unitPrice: unitPrice,
              lineTotal: lineTotal,
            });

            totalCogs += consumeItemRecursive(item.itemId, item.qty);
          }

          const activeSession = db
            .select()
            .from(cashSessions)
            .where(isNull(cashSessions.closedAt))
            .get();

          const [newSale] = db
            .insert(sales)
            .values({
              sessionId: activeSession?.id || null,
              userId: userId,
              total: totalRevenue,
              cogs: totalCogs,
              paymentType: sale.paymentType,
            })
            .returning()
            .all();

          if (!newSale) {
            throw new Error("Failed to create sale");
          }

          for (const itemData of saleItemsData) {
            db.insert(saleItems)
              .values({
                ...itemData,
                saleId: newSale.id,
              })
              .run();
          }

          for (const movement of stockMovementsToCreate) {
            db.insert(stockMovements)
              .values({
                ...movement,
                reference: newSale.id,
              })
              .run();
          }

          return { ...newSale, items: saleItemsData };
        })();
        resolve(createdSale);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getSales(from?: Date, to?: Date): Promise<Sale[]> {
    try {
      const allSales = await db
        .select()
        .from(sales)
        .where(
          from && to
            ? sql`created_at BETWEEN ${from.getTime()} AND ${to.getTime()}`
            : undefined
        )
        .orderBy(desc(sales.createdAt))
        .all();
      return allSales.map((s) => ({
        ...s,
        items: db
          .select()
          .from(saleItems)
          .where(eq(saleItems.saleId, s.id))
          .all(),
      }));
    } catch (error) {
      console.error("Error in getSales:", error);
      return [];
    }
  }

  // Stock Movements
  async getStockMovements(
    itemId?: string,
    from?: number,
    to?: number
  ): Promise<StockMovement[]> {
    return (await db.query.stockMovements.findMany({
      where: and(
        itemId ? eq(stockMovements.itemId, itemId) : undefined,
        from && to ? sql`created_at BETWEEN ${from} AND ${to}` : undefined
      ),
      orderBy: desc(stockMovements.createdAt),
    })) as StockMovement[]; // Assert type
  }

  async createStockMovement(
    movement: InsertStockMovement
  ): Promise<StockMovement> {
    const [created] = await db
      .insert(stockMovements)
      .values(movement)
      .returning()
      .all();
    return created;
  }

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    try {
      return await db
        .select()
        .from(expenses)
        .orderBy(desc(expenses.createdAt))
        .all();
    } catch (error) {
      console.error("Error in getExpenses:", error);
      return [];
    }
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [created] = await db
      .insert(expenses)
      .values(expense)
      .returning()
      .all();
    return created;
  }

  async updateExpense(
    id: string,
    expense: Partial<InsertExpense>
  ): Promise<Expense> {
    const [updated] = await db
      .update(expenses)
      .set(expense)
      .where(eq(expenses.id, id))
      .returning()
      .all();
    return updated;
  }

  async deleteExpense(id: string): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id)).run();
  }

  // Reports
  async getSalesReport(
    from: Date,
    to: Date
  ): Promise<{
    totalSales: number;
    totalCogs: number;
    totalProfit: number;
    salesCount: number;
    avgSale: number;
  }> {
    try {
      const result = await db
        .select({
          totalSales: sum(sales.total).as("totalSales"),
          totalCogs: sum(sales.cogs).as("totalCogs"),
          salesCount: sql<number>`count(*)`.as("salesCount"),
        })
        .from(sales)
        .where(
          and(sql`created_at BETWEEN ${from.getTime()} AND ${to.getTime()}`)
        )
        .all()[0];

      const totalSales = toNum(result.totalSales);
      const totalCogs = toNum(result.totalCogs);
      const salesCount = result.salesCount || 0;
      const totalProfit = totalSales - totalCogs;
      const avgSale = salesCount > 0 ? totalSales / salesCount : 0;

      return { totalSales, totalCogs, totalProfit, salesCount, avgSale };
    } catch (error) {
      console.error("Error in getSalesReport:", error);
      return {
        totalSales: 0,
        totalCogs: 0,
        totalProfit: 0,
        salesCount: 0,
        avgSale: 0,
      };
    }
  }

  async getExpensesReport(
    from: Date,
    to: Date
  ): Promise<{
    totalExpenses: number;
    expensesCount: number;
    avgExpense: number;
  }> {
    try {
      const result = await db
        .select({
          totalExpenses: sum(expenses.amount).as("totalExpenses"),
          expensesCount: sql<number>`count(*)`.as("expensesCount"),
        })
        .from(expenses)
        .where(
          and(sql`created_at BETWEEN ${from.getTime()} AND ${to.getTime()}`)
        )
        .all()[0];

      const totalExpenses = toNum(result.totalExpenses);
      const expensesCount = result.expensesCount || 0;
      const avgExpense = expensesCount > 0 ? totalExpenses / expensesCount : 0;

      return { totalExpenses, expensesCount, avgExpense };
    } catch (error) {
      console.error("Error in getExpensesReport:", error);
      return { totalExpenses: 0, expensesCount: 0, avgExpense: 0 };
    }
  }

  async getTopProducts(
    from: Date,
    to: Date
  ): Promise<
    {
      itemId: string;
      itemName: string;
      sku: string;
      totalQty: number;
      totalRevenue: string;
    }[]
  > {
    try {
      const results = await db
        .select({
          itemId: saleItems.itemId,
          itemName: items.name,
          sku: items.sku,
          totalQty: sum(saleItems.qty).as("totalQty"),
          totalRevenue: sum(saleItems.lineTotal).as("totalRevenue"),
        })
        .from(saleItems)
        .innerJoin(sales, eq(saleItems.saleId, sales.id))
        .innerJoin(items, eq(saleItems.itemId, items.id))
        .where(
          and(
            sql`sales.created_at BETWEEN ${from.getTime()} AND ${to.getTime()}`
          )
        )
        .groupBy(saleItems.itemId, items.name, items.sku)
        .orderBy(desc(sql`totalRevenue`))
        .limit(10)
        .all();

      return results.map((r) => ({
        itemId: r.itemId,
        itemName: r.itemName || "",
        sku: r.sku || "",
        totalQty: Number(r.totalQty) || 0, // Explicit number
        totalRevenue: String(r.totalRevenue) || "0", // Explicit string
      }));
    } catch (error) {
      console.error("Error in getTopProducts:", error);
      return [];
    }
  }

  async getLowStockItems(threshold: number = 5): Promise<
    {
      itemId: string;
      itemName: string;
      totalQuantity: string;
      unit: string;
      lowStockLevel: string;
    }[]
  > {
    try {
      const results = await db
        .select({
          itemId: items.id,
          itemName: items.name,
          totalQuantity: sum(inventoryLots.quantity).as("totalQuantity"),
          unit: items.unit,
          lowStockLevel: items.low_stock_level,
        })
        .from(items)
        .leftJoin(inventoryLots, eq(items.id, inventoryLots.itemId))
        .groupBy(items.id)
        .having(
          sql`totalQuantity < ${threshold} OR totalQuantity < items.low_stock_level`
        )
        .all();

      return results.map((r) => ({
        itemId: r.itemId,
        itemName: r.itemName || "",
        totalQuantity: String(r.totalQuantity) || "0",
        unit: r.unit || "",
        lowStockLevel: String(r.lowStockLevel) || "0",
      }));
    } catch (error) {
      console.error("Error in getLowStockItems:", error);
      return [];
    }
  }

  async getStockMovementsReport(
    from: Date,
    to: Date
  ): Promise<StockMovement[]> {
    return await this.getStockMovements(
      undefined,
      from.getTime(),
      to.getTime()
    );
  }

  async getCurrentStockLevels(): Promise<
    {
      itemId: string;
      name: string;
      currentStock: number;
    }[]
  > {
    return await db
      .select({
        itemId: items.id,
        name: items.name,
        currentStock: sum(inventoryLots.quantity).as("currentStock"),
      })
      .from(items)
      .leftJoin(inventoryLots, eq(items.id, inventoryLots.itemId))
      .groupBy(items.id)
      .all()
      .map((r) => ({
        itemId: r.itemId,
        name: r.name,
        currentStock: toNum(r.currentStock),
      }));
  }

  async adjustStock(adjustment: {
    quantity: string;
    itemId: string;
    note?: string;
  }): Promise<void> {
    // Adjusted type
    const [created] = await db
      .insert(stockMovements)
      .values({
        quantity: Number(adjustment.quantity), // toNum -> Number
        itemId: adjustment.itemId,
        kind: "ADJUSTMENT",
        reference: adjustment.note || null,
        note: adjustment.note || null,
      })
      .returning()
      .all();

    if (Number(adjustment.quantity) > 0) {
      await db
        .insert(inventoryLots)
        .values({
          quantity: Number(adjustment.quantity),
          itemId: adjustment.itemId,
          unitCost: 0,
        })
        .run();
    } else {
      let remaining = Math.abs(Number(adjustment.quantity));
      const lots = await db
        .select()
        .from(inventoryLots)
        .where(
          and(
            eq(inventoryLots.itemId, adjustment.itemId),
            ne(inventoryLots.quantity, 0)
          )
        )
        .orderBy(asc(inventoryLots.createdAt))
        .all();

      for (const lot of lots) {
        if (remaining <= 0) break;
        const consume = Math.min(remaining, lot.quantity);
        await db
          .update(inventoryLots)
          .set({ quantity: lot.quantity - consume })
          .where(eq(inventoryLots.id, lot.id))
          .run();
        remaining -= consume;
      }
    }
  }

  async getSessionInventorySnapshot(sessionId: string): Promise<
    {
      itemId: string;
      quantity: number;
    }[]
  > {
    return await db
      .select()
      .from(sessionInventorySnapshots)
      .where(eq(sessionInventorySnapshots.sessionId, sessionId))
      .all();
  }

  // Missing methods from IStorage - adding implementations

  async getItem(id: string): Promise<Item | undefined> {
    return await this.getItemById(id);
  }

  async getItemBySku(sku: string): Promise<Item | undefined> {
    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.sku, sku))
      .all();
    return item;
  }

  async getRecipeItems(parentItemId: string): Promise<RecipeItem[]> {
    return await db
      .select()
      .from(recipeItems)
      .where(eq(recipeItems.recipeId, parentItemId))
      .all();
  }

  async createRecipeItem(recipeItem: InsertRecipeItem): Promise<RecipeItem> {
    const [created] = await db
      .insert(recipeItems)
      .values(recipeItem)
      .returning()
      .all();
    return created;
  }

  async deleteRecipeItems(parentItemId: string): Promise<void> {
    await db
      .delete(recipeItems)
      .where(eq(recipeItems.recipeId, parentItemId))
      .run();
  }

  async getSaleItems(saleId: string): Promise<SaleItem[]> {
    return await db
      .select()
      .from(saleItems)
      .where(eq(saleItems.saleId, saleId))
      .all();
  }

  async createInventorySnapshots(
    sessionId: string,
    snapshots: { itemId: string; quantity: string }[],
    type: "OPENING" | "CLOSING"
  ): Promise<void> {
    for (const snap of snapshots) {
      await db
        .insert(sessionInventorySnapshots)
        .values({
          sessionId,
          itemId: snap.itemId,
          quantity: toNum(snap.quantity),
          type,
        })
        .run();
    }
  }

  async updateStockForSession(
    sessionId: string,
    snapshots: { itemId: string; quantity: string }[],
    type: "OPENING" | "CLOSING"
  ): Promise<void> {
    // Implementation for updating stock based on snapshots - stub for now
    console.log(`Updating stock for session ${sessionId} with type ${type}`);
    // Add actual logic if needed
  }

  async getCurrentStock(): Promise<
    {
      itemId: string;
      itemName: string;
      totalQuantity: string;
      unit: string;
      lowStockLevel: string | null;
    }[]
  > {
    return await db
      .select({
        itemId: items.id,
        itemName: items.name,
        totalQuantity:
          sql<string>`COALESCE(SUM(${inventoryLots.quantity}), '0')`.as(
            "totalQuantity"
          ),
        unit: items.unit,
        lowStockLevel: sql<
          string | null
        >`CAST(${items.low_stock_level} AS TEXT)`.as("lowStockLevel"),
      })
      .from(items)
      .leftJoin(inventoryLots, eq(items.id, inventoryLots.itemId))
      .groupBy(items.id)
      .all();
  }

  async getTodayKPIs(): Promise<{
    revenue: string;
    cogs: string;
    grossMargin: string;
    orderCount: number;
  }> {
    const { start, end } = todayRange();
    const report = await this.getSalesReport(start, end);
    return {
      revenue: report.totalSales.toString(),
      cogs: report.totalCogs.toString(),
      grossMargin: (report.totalSales - report.totalCogs).toString(),
      orderCount: report.salesCount,
    };
  }

  async getRecentActivity(limit: number): Promise<any[]> {
    // Stub: Return recent stock movements or sales
    return await db
      .select()
      .from(stockMovements)
      .orderBy(desc(stockMovements.createdAt))
      .limit(limit)
      .all();
  }

  async getPendingOrders(): Promise<
    { sale: Sale; items: (SaleItem & { itemName: string })[] }[]
  > {
    try {
      const pendingSaleIds = await db
        .selectDistinct({ id: saleItems.saleId })
        .from(saleItems)
        .where(eq(saleItems.status, "PENDING"))
        .all()
        .map((s) => s.id);

      const pendingSales = await db
        .select()
        .from(sales)
        .where(inArray(sales.id, pendingSaleIds))
        .all();

      return pendingSales.map((sale) => ({
        sale,
        items: db
          .select({
            id: saleItems.id,
            saleId: saleItems.saleId,
            itemId: saleItems.itemId,
            qty: saleItems.qty,
            unitPrice: saleItems.unitPrice,
            lineTotal: saleItems.lineTotal,
            status: saleItems.status,
            itemName: items.name,
          })
          .from(saleItems)
          .innerJoin(items, eq(saleItems.itemId, items.id))
          .where(eq(saleItems.saleId, sale.id))
          .all(),
      }));
    } catch (error) {
      console.error("Error in getPendingOrders:", error);
      return [];
    }
  }

  async updateSaleItemStatus(id: string, status: string): Promise<SaleItem> {
    const [updated] = await db
      .update(saleItems)
      .set({ status })
      .where(eq(saleItems.id, id))
      .returning()
      .all();
    return updated;
  }
}
