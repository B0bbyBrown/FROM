import { seed } from "./seed.ts";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "./storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function resetAndSeed() {
  console.log("🔄 Resetting and seeding database for E2E tests...");

  // Set environment variables so db.ts uses test database and resets
  process.env.RESET_DB = "true";
  process.env.CYPRESS_TEST = "true";

  // Import db to trigger table creation and reset (db.ts will handle file deletion)
  await import("./db");
  console.log("✅ Database initialized");

  // Then seed it
  try {
    console.log("🌱 Starting seed...");
    await seed();
    console.log("✅ Database reset and seeded successfully");
    console.log("📝 To run tests:");
    console.log("   1. Start server in another terminal: npm run dev:test");
    console.log("   2. Then run: npm run test:e2e");

    // Give the database a moment to ensure all writes are flushed
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    console.error("❌ Seed failed:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}

// Check if this file is being run directly (not imported)
// With tsx, the import.meta.url check might not work, so we check process.argv
const isMainModule =
  process.argv[1]?.endsWith("reset-and-seed.ts") ||
  process.argv[1]?.includes("reset-and-seed") ||
  import.meta.url.endsWith("reset-and-seed.ts");

if (isMainModule) {
  resetAndSeed()
    .then(() => {
      console.log("✅ Reset and seed complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Reset and seed failed:", error);
      process.exit(1);
    });
}

export { resetAndSeed };
