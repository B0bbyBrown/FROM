import { storage } from "./storage";
import { hashPassword } from "./lib/auth";

async function seedUsers() {
  console.log("🌱 Seeding users only...");

  const usersToSeed = [
    {
      email: "admin@from.com",
      password: "password",
      name: "Admin User",
      role: "ADMIN",
    },
    {
      email: "cashier@from.com",
      password: "password",
      name: "Cashier User",
      role: "CASHIER",
    },
    {
      email: "kitchen@from.com",
      password: "password",
      name: "Kitchen User",
      role: "KITCHEN",
    },
    { email: "dev@from.com", password: "dev", name: "Dev User", role: "DEV" },
  ];

  for (const user of usersToSeed) {
    const existing = await storage.getUserByEmail(user.email);
    if (!existing) {
      await storage.createUser({
        name: user.name,
        email: user.email,
        role: user.role as "ADMIN" | "CASHIER" | "KITCHEN" | "DEV",
        password: hashPassword(user.password),
      });
      console.log(`✅ Created user ${user.email}`);
    } else {
      console.log(`ℹ️ User ${user.email} already exists`);
    }
  }

  console.log("✅ User seeding completed");
}

const isMainModule =
  process.argv[1]?.endsWith("seed-users.ts") ||
  process.argv[1]?.includes("seed-users") ||
  import.meta.url.endsWith("seed-users.ts");

if (isMainModule) {
  seedUsers().catch((err) => {
    console.error("❌ User seeding failed:", err);
    process.exit(1);
  });
}
