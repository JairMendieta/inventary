import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("inventary.db");

// ─── Init / Migrations ────────────────────────────────────────────────────────

export function initDB(): void {
  // Sales table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sales (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      date       TEXT    NOT NULL,
      amount     REAL    NOT NULL,
      title      TEXT,
      note       TEXT,
      created_at INTEGER NOT NULL
    );
  `);
  try { db.execSync("ALTER TABLE sales ADD COLUMN title TEXT;"); } catch (_) {}
  try { db.execSync("ALTER TABLE sales ADD COLUMN note TEXT;"); } catch (_) {}

  // Expenses table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      date       TEXT    NOT NULL,
      amount     REAL    NOT NULL,
      title      TEXT,
      note       TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  // Sale types table (new)
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sale_types (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Sale {
  id: string;
  date: string;
  amount: number;
  title?: string;
  note?: string;
  created_at: number;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  title?: string;
  note?: string;
  created_at: number;
}

export interface SaleType {
  id: string;
  name: string;
  created_at: number;
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export function insertSale(
  date: string,
  amount: number,
  title?: string,
  note?: string
): Sale {
  const created_at = Date.now();
  const result = db.runSync(
    "INSERT INTO sales (date, amount, title, note, created_at) VALUES (?, ?, ?, ?, ?);",
    [date, amount, title ?? null, note ?? null, created_at]
  );
  return { id: result.lastInsertRowId.toString(), date, amount, title, note, created_at };
}

export function getSales(): Sale[] {
  const rows = db.getAllSync<{
    id: number; date: string; amount: number;
    title: string | null; note: string | null; created_at: number;
  }>("SELECT id, date, amount, title, note, created_at FROM sales ORDER BY created_at DESC;");

  return rows.map((r) => ({
    id: r.id.toString(), date: r.date, amount: r.amount,
    title: r.title ?? undefined, note: r.note ?? undefined, created_at: r.created_at,
  }));
}

export function deleteSale(id: string): void {
  db.runSync("DELETE FROM sales WHERE id = ?;", [id]);
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export function insertExpense(
  date: string,
  amount: number,
  title?: string,
  note?: string
): Expense {
  const created_at = Date.now();
  const result = db.runSync(
    "INSERT INTO expenses (date, amount, title, note, created_at) VALUES (?, ?, ?, ?, ?);",
    [date, amount, title ?? null, note ?? null, created_at]
  );
  return { id: result.lastInsertRowId.toString(), date, amount, title, note, created_at };
}

export function getExpenses(): Expense[] {
  const rows = db.getAllSync<{
    id: number; date: string; amount: number;
    title: string | null; note: string | null; created_at: number;
  }>("SELECT id, date, amount, title, note, created_at FROM expenses ORDER BY created_at DESC;");

  return rows.map((r) => ({
    id: r.id.toString(), date: r.date, amount: r.amount,
    title: r.title ?? undefined, note: r.note ?? undefined, created_at: r.created_at,
  }));
}

export function deleteExpense(id: string): void {
  db.runSync("DELETE FROM expenses WHERE id = ?;", [id]);
}

// ─── Sale Types ───────────────────────────────────────────────────────────────

export function insertSaleType(name: string): SaleType {
  const created_at = Date.now();
  const result = db.runSync(
    "INSERT INTO sale_types (name, created_at) VALUES (?, ?);",
    [name.trim(), created_at]
  );
  return { id: result.lastInsertRowId.toString(), name: name.trim(), created_at };
}

export function getSaleTypes(): SaleType[] {
  const rows = db.getAllSync<{ id: number; name: string; created_at: number }>(
    "SELECT id, name, created_at FROM sale_types ORDER BY created_at ASC;"
  );
  return rows.map((r) => ({ id: r.id.toString(), name: r.name, created_at: r.created_at }));
}

export function deleteSaleType(id: string): void {
  db.runSync("DELETE FROM sale_types WHERE id = ?;", [id]);
}
