/**
 * MySQL credential helpers for local dev/debug scripts.
 *
 * Credentials are NEVER hardcoded here or anywhere else in the repo. Read them
 * from the environment (put them in .env.local, which is gitignored) so that
 * production secrets cannot be committed by accident.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        `Set it in .env.local (gitignored) — never hardcode DB credentials.`
    );
  }
  return value;
}

export const mysqlPass = (): string => requireEnv('MYSQL_PASS');
export const mysqlUser = (): string => process.env.MYSQL_USER || 'root';
export const mysqlDb = (): string => process.env.MYSQL_DB || 'perfume_db';