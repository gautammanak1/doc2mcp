import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({
  path: ".env.local",
});

const PLACEHOLDER_PATTERN = /^\*{2,}$|\[YOUR-|\[PASSWORD\]|REPLACE_WITH/i;

function validatePostgresUrl(url: string): void {
  if (PLACEHOLDER_PATTERN.test(url)) {
    throw new Error(
      "POSTGRES_URL is still a placeholder. Set your Supabase database password:\n" +
        "  Dashboard → Project Settings → Database → Connection string → URI (pooler, port 6543)\n" +
        "  https://supabase.com/dashboard/project/ilibxowyivxhdujeguaw/settings/database"
    );
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
      throw new Error("POSTGRES_URL must start with postgresql://");
    }
    if (!parsed.password || parsed.password.length < 4) {
      throw new Error(
        "POSTGRES_URL is missing the database password. Use the password from Supabase Database settings."
      );
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `POSTGRES_URL is not a valid connection string: ${url.slice(0, 40)}...\n` +
          "Use the URI from Supabase (pooler mode, port 6543), e.g.:\n" +
          "postgresql://postgres:YOUR_PASSWORD@db.ilibxowyivxhdujeguaw.supabase.co:5432/postgres"
      );
    }
    throw error;
  }
}

const runMigrate = async () => {
  const postgresUrl = process.env.POSTGRES_URL;
  if (!postgresUrl) {
    console.log("POSTGRES_URL not defined, skipping migrations");
    process.exit(0);
  }

  validatePostgresUrl(postgresUrl);

  const connection = postgres(postgresUrl, { max: 1 });
  const db = drizzle(connection);

  console.log("Running migrations...");

  const start = Date.now();
  await migrate(db, { migrationsFolder: "./lib/db/migrations" });
  const end = Date.now();

  console.log("Migrations completed in", end - start, "ms");
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error("Migration failed");
  console.error(err);
  process.exit(1);
});
