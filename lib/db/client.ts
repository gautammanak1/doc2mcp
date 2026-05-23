import postgres from "postgres";
import { resolvePostgresUrl } from "./postgres-url";

const globalForPostgres = globalThis as unknown as {
  postgresClient?: ReturnType<typeof postgres>;
};

export function getPostgresClient() {
  if (!globalForPostgres.postgresClient) {
    globalForPostgres.postgresClient = postgres(resolvePostgresUrl(), {
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }

  return globalForPostgres.postgresClient;
}
