import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertSupplierSchema,
  newPurchaseSchema,
  newSaleSchema,
  stockAdjustmentSchema,
  insertCashSessionSchema,
  insertExpenseSchema,
  openSessionSchema,
  closeSessionSchema,
  insertUserSchema,
  newItemSchema,
  newRecipeSchema,
} from "@shared/schema";
import session from "express-session";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { log } from "./vite";

declare module "express-session" {
  interface SessionData {
    userId: string;
    role: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session Middleware (add this before routes)
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      }, // 24 hours
    })
  );

  // Auth Middleware (to protect routes)
  const authMiddleware =
    (requiredRoles?: string | string[]) =>
    (req: Request, res: Response, next: NextFunction) => {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const allowed = Array.isArray(requiredRoles)
        ? requiredRoles
        : requiredRoles
        ? [requiredRoles]
        : [];
      if (
        allowed.length > 0 &&
        !allowed.includes(req.session.role!) &&
        req.session.role !== "DEV"
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }
      next();
    };

  // Auth Routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const user = await storage.loginUser(email, password);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      req.session.userId = user.id;
      req.session.role = user.role;
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      res.json({ message: "Logged out" });
    });
  });

  app.get(
    "/api/auth/me",
    authMiddleware(),
    async (req: Request, res: Response) => {
      try {
        const user = await storage.getUser(req.session.userId!);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        res.json({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        });
      } catch (error) {
        console.error("Error in /api/auth/me:", error);
        res.status(500).json({ error: "Internal server error", details: (error as Error).message });
      }
    }
  );

  // User Management (Admin only)
  app.post(
    "/api/users",
    authMiddleware("ADMIN"),
    async (req: Request, res: Response) => {
      try {
        const data = insertUserSchema.parse(req.body);
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await storage.createUser({
          ...data,
          password: hashedPassword,
        });
        // Return safe user object (without password)
        res.json(user);
      } catch (error) {
        res.status(400).json({ error: "Invalid user data" });
      }
    }
  );

  app.get(
    "/api/users",
    authMiddleware("ADMIN"),
    async (req: Request, res: Response) => {
      const users = await storage.getUsers();
      res.json(users);
    }
  );

  // Items (replaces Ingredients and Products)
  app.get(
    "/api/raw-materials",
    authMiddleware(["ADMIN", "CASHIER", "DEV"]),
    async (req: Request, res: Response) => {
      try {
        const rawType = req.query.type;
        const type =
          rawType === "RAW" || rawType === "PRODUCT"
            ? rawType
            : undefined; // Ignore unexpected values so we still return all items
        console.log("Requested item type:", rawType); // Debug log
        const items = await storage.getItems(type);
        res.json(items);
      } catch (error) {
        console.error("Failed to fetch items:", error);
        res.status(500).json({ error: "Failed to fetch items", details: (error as Error).message });
        }
    }
  );

  app.post(
    "/api/raw-materials",
    authMiddleware("ADMIN"),
    async (req: Request, res: Response) => {
      try {
        const data = newItemSchema.parse(req.body);  // Schema should include new fields
        const item = await storage.createItem(data);
        res.json(item);
      } catch (error: any) {
        console.error("Failed to create item:", error);
        res.status(400).json({
          error: "Failed to create item",
          details: error.errors || error.issues || error.message,
        });
      }
    }
  );

  app.put(
    "/api/raw-materials/:id",
    authMiddleware("ADMIN"),
    async (req: Request, res: Response) => {
      try {
        const id = req.params.id;
        const data = req.body;  // Validate if needed with updated schema
        const updatedItem = await storage.updateItem(id, data);
        res.json(updatedItem);
      } catch (error) {
        res.status(500).json({ error: "Failed to update item" });
      }
    }
  );

  app.delete(
    "/api/raw-materials/:id",
    authMiddleware("ADMIN"),
    async (req: Request, res: Response) => {
      try {
        const id = req.params.id;
        await storage.deleteItem(id);
        res.json({ success: true });
      } catch (error: any) {
        console.error("Failed to delete item:", error);
        const msg = error?.message || "Failed to delete item";
        // Surface potential FK/constraint hints to client
        res.status(400).json({
          error: "Failed to delete item",
          details: msg,
        });
      }
    }
  );

  app.get(
    "/api/raw-materials/:id/recipe",
    authMiddleware(["ADMIN", "CASHIER"]),
    async (req: Request, res: Response) => {
      try {
        const recipeItems = await storage.getRecipeItems(req.params.id);
        res.json(recipeItems);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch recipe" });
      }
    }
  );

  app.put(
    "/api/raw-materials/:id/recipe",
    authMiddleware("ADMIN"),
    async (req: Request, res: Response) => {
      try {
        const itemId = req.params.id;
        const recipe = req.body.recipe; // Expect array of { childItemId, quantity }
        await storage.updateRecipe(itemId, recipe);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: "Failed to update recipe" });
      }
    }
  );

  // Recipes
  app.get("/api/recipes", authMiddleware(["ADMIN", "DEV"]), async (req: Request, res: Response) => {
    try {
      const recipes = await storage.getRecipes();
      res.json(recipes);
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
      res.status(500).json({ error: "Failed to fetch recipes" });
    }
  });

  app.post("/api/recipes", authMiddleware("ADMIN"), async (req: Request, res: Response) => {
    try {
      const data = newRecipeSchema.parse(req.body);
      const recipe = await storage.createRecipe(data);
      res.json(recipe);
    } catch (error: any) {
      res.status(400).json({ error: "Invalid recipe data", details: error.errors || error.message });
    }
  });

  app.put("/api/recipes/:id", authMiddleware("ADMIN"), async (req: Request, res: Response) => {
    try {
      const data = newRecipeSchema.parse(req.body);
      const recipe = await storage.updateRecipe(req.params.id, data);
      res.json(recipe);
    } catch (error: any) {
      res.status(400).json({ error: "Invalid recipe data", details: error.errors || error.message });
    }
  });

  app.delete("/api/recipes/:id", authMiddleware("ADMIN"), async (req: Request, res: Response) => {
    try {
      await storage.deleteItem(req.params.id); // Assuming deleteItem is the correct method for recipes
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete recipe" });
    }
  });

  // Suppliers
  app.get("/api/suppliers", async (req: Request, res: Response) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", async (req: Request, res: Response) => {
    try {
      const data = insertSupplierSchema.parse(req.body);
      console.log("Creating supplier with payload:", data);
      const supplier = await storage.createSupplier(data);
      console.log("Created supplier:", supplier);
      res.json(supplier);
    } catch (error: any) {
      console.error("Failed to create supplier:", error);
      const message = error?.message || "Invalid supplier data";
      // Handle unique constraint (duplicate name) explicitly
      if (message.includes("UNIQUE") || message.includes("constraint")) {
        return res
          .status(409)
          .json({ error: "Supplier name must be unique", details: message });
      }
      // Surface Zod issues if present
      const details = (error.errors || error.issues || []).map((e: any) => e.message).join(", ");
      res
        .status(400)
        .json({ error: "Invalid supplier data", details: details || message });
    }
  });

  // Purchases
  app.get("/api/purchases", async (req: Request, res: Response) => {
    try {
      const purchases = await storage.getPurchases();
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchases" });
    }
  });

  app.post("/api/purchases", async (req: Request, res: Response) => {
    try {
      const data = newPurchaseSchema.parse(req.body);
      const purchase = await storage.createPurchase(data);
      res.json(purchase);
    } catch (error) {
      res.status(400).json({ error: "Invalid purchase data" });
    }
  });

  // Stock management
  app.get("/api/stock/current", async (req: Request, res: Response) => {
    try {
      const stock = await storage.getCurrentStock();
      res.json(stock);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch current stock" });
    }
  });

  app.get(
    "/api/stock/low",
    authMiddleware(["ADMIN", "KITCHEN", "CASHIER"]), // Add KITCHEN role
    async (req: Request, res: Response) => {
      try {
        const lowStock = await storage.getLowStockItems();
        res.json(lowStock);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch low stock items" });
      }
    }
  );

  app.post("/api/stock/adjust", async (req: Request, res: Response) => {
    try {
      const data = stockAdjustmentSchema.parse(req.body);
      await storage.adjustStock(data);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Stock adjustment failed" });
    }
  });

  app.get("/api/stock/movements", async (req: Request, res: Response) => {
    try {
      const itemId = req.query.itemId as string;
      const movements = await storage.getStockMovements(itemId);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock movements" });
    }
  });

  // Sales
  app.get("/api/sales", async (req: Request, res: Response) => {
    try {
      const from = req.query.from
        ? new Date(req.query.from as string)
        : undefined;
      const to = req.query.to ? new Date(req.query.to as string) : undefined;
      const sales = await storage.getSales(from, to);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales", async (req: Request, res: Response) => {
    try {
      const data = newSaleSchema.parse(req.body);
      const sale = await storage.createSale(data, req.session.userId!);
      res.json(sale);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Sale creation failed" });
    }
  });

  app.get("/api/sales/:id/items", async (req: Request, res: Response) => {
    try {
      const items = await storage.getSaleItems(req.params.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sale items" });
    }
  });
  // Kitchen
  app.get(
    "/api/kitchen/orders",
    authMiddleware("KITCHEN"),
    async (req: Request, res: Response) => {
      try {
        const orders = await storage.getPendingOrders();
        res.json(orders);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch pending orders" });
      }
    }
  );
  app.patch(
    "/api/sale-items/:id/status",
    authMiddleware("KITCHEN"),
    async (req: Request, res: Response) => {
      try {
        const { status } = req.body;
        if (!status) {
          return res.status(400).json({ error: "Status is required" });
        }
        const updated = await storage.updateSaleItemStatus(
          req.params.id,
          status
        );
        res.json(updated);
      } catch (error: any) {
        res
          .status(400)
          .json({ error: error.message || "Failed to update status" });
      }
    }
  );
  // Cash sessions
  app.get("/api/sessions", async (req: Request, res: Response) => {
    try {
      console.log("📝 Fetching cash sessions from SQLite...");
      const sessions = await storage.getCashSessions();
      console.log(`✅ Found ${sessions.length} cash sessions`);
      res.json(sessions);
    } catch (error) {
      console.error("❌ Failed to fetch cash sessions:", error);
      res.status(500).json({ error: "Failed to fetch cash sessions" });
    }
  });

  app.get("/api/sessions/active", async (req: Request, res: Response) => {
    try {
      console.log("📝 Checking for active cash session in SQLite...");
      const session = await storage.getActiveCashSession();
      console.log(
        "✅ Active session status:",
        session ? "Found" : "None active"
      );
      res.json(session || null);
    } catch (error) {
      console.error("❌ Failed to fetch active session:", error);
      res.status(500).json({ error: "Failed to fetch active session" });
    }
  });

  app.post("/api/sessions/open", async (req: Request, res: Response) => {
    try {
      log(
        `[cash-session] open requested by user=${req.session.userId || "unknown"} role=${req.session.role || "unknown"} inventoryCount=${req.body?.inventory?.length ?? 0} raw=${JSON.stringify(req.body)}`
      );

      // Check for active session
      const activeSession = await storage.getActiveCashSession();
      if (activeSession) {
        log(
          `[cash-session] active session detected id=${activeSession.id}, blocking new open`
        );
        return res.status(400).json({
          error: "Cannot open a new session while another session is active",
        });
      }

      const body = openSessionSchema.parse(req.body);
      log(
        `[cash-session] parsed payload openingFloat=${body.openingFloat} notesLength=${body.notes?.length ?? 0} inventoryItems=${body.inventory.length}`
      );
      if (body.inventory.length > 0) {
        const sample = body.inventory.slice(0, 10);
        log(
          `[cash-session] inventory sample (first ${sample.length}): ${JSON.stringify(
            sample
          )}`
        );
      }

      const session = await storage.openSessionAndMoveStock(
        body,
        req.session.userId!
      );

      log(
        `[cash-session] session created id=${session.id} openedBy=${session.openedBy} openingFloat=${session.openingFloat} openedAt=${session.openedAt}`
      );

      res.json(session);
    } catch (error: any) {
      console.error("Failed to open cash session:", error);
      log(
        `[cash-session] open failed message=${error?.message || "unknown"} stack=${error?.stack ? error.stack.split("\n")[0] : "n/a"}`
      );
      if (error.errors || error.issues) {
        // Zod validation error
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors || error.issues,
        });
      }

      // Handle specific inventory error
      if (error.message?.includes("Insufficient inventory")) {
        return res.status(400).json({
          error: "Insufficient Inventory",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Failed to open cash session",
        details: error.message || "An internal server error occurred",
      });
    }
  });

  app.post("/api/sessions/:id/close", async (req: Request, res: Response) => {
    try {
      const body = closeSessionSchema.parse(req.body);

      const session = await storage.closeCashSession(
        req.params.id,
        body.closingFloat.toString(),
        body.notes,
        req.session.userId!
      );

      await storage.updateStockForSession(
        session.id,
        body.inventory,
        "CLOSING"
      );
      await storage.createInventorySnapshots(
        session.id,
        body.inventory,
        "CLOSING"
      );

      res.json(session);
    } catch (error) {
      console.error("Failed to close cash session:", error);
      res
        .status(400)
        .json({ error: "Failed to close cash session", details: error });
    }
  });

  // Expenses
  app.get("/api/expenses", async (req: Request, res: Response) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req: Request, res: Response) => {
    try {
      const data = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(data);
      res.json(expense);
    } catch (error) {
      res.status(400).json({ error: "Invalid expense data" });
    }
  });

  // Reports
  app.get("/api/reports/overview", async (req: Request, res: Response) => {
    try {
      const kpis = await storage.getTodayKPIs();
      res.json(kpis);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch overview" });
    }
  });

  app.get("/api/reports/top-products", async (req: Request, res: Response) => {
    try {
      const from = req.query.from
        ? new Date(req.query.from as string)
        : new Date();
      const to = req.query.to ? new Date(req.query.to as string) : new Date();

      if (!req.query.from && !req.query.to) {
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
      }

      const topProducts = await storage.getTopProducts(from, to);
      res.json(topProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top products" });
    }
  });

  app.get("/api/reports/activity", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activity = await storage.getRecentActivity(limit);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent activity" });
    }
  });

  app.get(
    "/api/db-schema",
    authMiddleware("DEV"),
    async (req: Request, res: Response) => {
      try {
        const tables = db.all(sql`SELECT name FROM sqlite_master WHERE type='table'`) as { name: string }[];
        const schema: Record<string, { name: string; type: string; notnull: number; pk: number }[]> = {};
        for (const table of tables) {
          const columns = db.all(sql`PRAGMA table_info(${sql.raw(table.name)})`) as { name: string; type: string; notnull: number; pk: number }[];
          schema[table.name] = columns;
        }
        res.json(schema);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch schema" });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
