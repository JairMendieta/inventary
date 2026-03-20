import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("inventary.db");

// ─── Init / Migrations ────────────────────────────────────────────────────────

// Singleton guard: only run DDL once per app session
let _initialized = false;

export function initDB(): void {
  if (_initialized) return;
  _initialized = true;

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

  // Sale types table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sale_types (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      price      REAL    NOT NULL DEFAULT 0,
      is_order   INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);
  // Migrate existing sale_types: add price and is_order if missing
  try { db.execSync("ALTER TABLE sale_types ADD COLUMN price REAL NOT NULL DEFAULT 0;"); } catch (_) {}
  try { db.execSync("ALTER TABLE sale_types ADD COLUMN is_order INTEGER NOT NULL DEFAULT 0;"); } catch (_) {}

  // Orders (Encargos) table — NEW
  db.execSync(`
    CREATE TABLE IF NOT EXISTS orders (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT    NOT NULL,
      sale_type_id  INTEGER NOT NULL,
      quantity      INTEGER NOT NULL DEFAULT 1,
      note          TEXT,
      paid          INTEGER NOT NULL DEFAULT 0,
      sale_id       INTEGER,
      created_at    INTEGER NOT NULL,
      FOREIGN KEY (sale_type_id) REFERENCES sale_types(id)
    );
  `);
  // Migrate: add sale_id if missing
  try { db.execSync("ALTER TABLE orders ADD COLUMN sale_id INTEGER;"); } catch (_) {}
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
  price: number;
  is_order: boolean;
  created_at: number;
}

export interface Order {
  id: string;
  customer_name: string;
  sale_type_id: string;
  sale_type_name: string;
  price_per_unit: number;
  quantity: number;
  total: number;
  note?: string;
  paid: boolean;
  sale_id?: string;  // ID of the linked sale entry when paid
  created_at: number;
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export function insertSale(date: string, amount: number, title?: string, note?: string): Sale {
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

export function insertExpense(date: string, amount: number, title?: string, note?: string): Expense {
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

export function insertSaleType(name: string, price: number, is_order: boolean): SaleType {
  const created_at = Date.now();
  const result = db.runSync(
    "INSERT INTO sale_types (name, price, is_order, created_at) VALUES (?, ?, ?, ?);",
    [name.trim(), price, is_order ? 1 : 0, created_at]
  );
  return { id: result.lastInsertRowId.toString(), name: name.trim(), price, is_order, created_at };
}

export function getSaleTypes(): SaleType[] {
  const rows = db.getAllSync<{ id: number; name: string; price: number; is_order: number; created_at: number }>(
    "SELECT id, name, price, is_order, created_at FROM sale_types ORDER BY created_at ASC;"
  );
  return rows.map((r) => ({ id: r.id.toString(), name: r.name, price: r.price, is_order: r.is_order === 1, created_at: r.created_at }));
}

export function deleteSaleType(id: string): void {
  db.runSync("DELETE FROM sale_types WHERE id = ?;", [id]);
}

// ─── Orders (Encargos) ────────────────────────────────────────────────────────

export function insertOrder(
  customer_name: string,
  sale_type_id: string,
  quantity: number,
  note?: string
): Order {
  const created_at = Date.now();
  const result = db.runSync(
    "INSERT INTO orders (customer_name, sale_type_id, quantity, note, paid, created_at) VALUES (?, ?, ?, ?, 0, ?);",
    [customer_name.trim(), parseInt(sale_type_id), quantity, note?.trim() ?? null, created_at]
  );

  // Fetch the sale type for name and price
  const st = db.getFirstSync<{ name: string; price: number }>(
    "SELECT name, price FROM sale_types WHERE id = ?;",
    [parseInt(sale_type_id)]
  );
  const name = st?.name ?? "";
  const price = st?.price ?? 0;

  return {
    id: result.lastInsertRowId.toString(),
    customer_name: customer_name.trim(),
    sale_type_id,
    sale_type_name: name,
    price_per_unit: price,
    quantity,
    total: price * quantity,
    note: note?.trim() || undefined,
    paid: false,
    created_at,
  };
}

export function getOrders(): Order[] {
  const rows = db.getAllSync<{
    id: number;
    customer_name: string;
    sale_type_id: number;
    sale_type_name: string;
    price: number;
    quantity: number;
    note: string | null;
    paid: number;
    sale_id: number | null;
    created_at: number;
  }>(`
    SELECT
      o.id, o.customer_name, o.sale_type_id,
      st.name AS sale_type_name, st.price,
      o.quantity, o.note, o.paid, o.sale_id, o.created_at
    FROM orders o
    JOIN sale_types st ON st.id = o.sale_type_id
    ORDER BY o.created_at DESC;
  `);

  return rows.map((r) => ({
    id: r.id.toString(),
    customer_name: r.customer_name,
    sale_type_id: r.sale_type_id.toString(),
    sale_type_name: r.sale_type_name,
    price_per_unit: r.price,
    quantity: r.quantity,
    total: r.price * r.quantity,
    note: r.note ?? undefined,
    paid: r.paid === 1,
    sale_id: r.sale_id != null ? r.sale_id.toString() : undefined,
    created_at: r.created_at,
  }));
}

/**
 * Toggle paid status on an order.
 * - Paying: inserts a sale entry and stores its ID in sale_id.
 * - Unpaying: deletes the linked sale entry and clears sale_id.
 * Returns the updated sale_id (or undefined when unpaid).
 */
export function updateOrderPaid(orderId: string, paid: boolean): string | undefined {
  if (paid) {
    // Fetch order info
    const order = db.getFirstSync<{
      customer_name: string;
      sale_type_id: number;
      quantity: number;
    }>("SELECT customer_name, sale_type_id, quantity FROM orders WHERE id = ?;", [parseInt(orderId)]);
    if (!order) return undefined;

    // Fetch sale type info
    const st = db.getFirstSync<{ name: string; price: number }>(
      "SELECT name, price FROM sale_types WHERE id = ?;",
      [order.sale_type_id]
    );
    const typeName = st?.name ?? "Encargo";
    const total = (st?.price ?? 0) * order.quantity;

    // Create the linked sale
    const today = new Date().toISOString().split("T")[0];
    const saleNote = `Cobro de encargo — ${order.customer_name}`;
    const created_at = Date.now();
    const saleResult = db.runSync(
      "INSERT INTO sales (date, amount, title, note, created_at) VALUES (?, ?, ?, ?, ?);",
      [today, total, typeName, saleNote, created_at]
    );
    const saleId = saleResult.lastInsertRowId;

    // Mark paid + store sale_id
    db.runSync(
      "UPDATE orders SET paid = 1, sale_id = ? WHERE id = ?;",
      [saleId, parseInt(orderId)]
    );
    return saleId.toString();
  } else {
    // Fetch the linked sale_id
    const row = db.getFirstSync<{ sale_id: number | null }>(
      "SELECT sale_id FROM orders WHERE id = ?;",
      [parseInt(orderId)]
    );
    if (row?.sale_id) {
      db.runSync("DELETE FROM sales WHERE id = ?;", [row.sale_id]);
    }
    db.runSync("UPDATE orders SET paid = 0, sale_id = NULL WHERE id = ?;", [parseInt(orderId)]);
    return undefined;
  }
}

export function deleteOrder(id: string): void {
  // Also delete linked sale if exists
  const row = db.getFirstSync<{ sale_id: number | null }>(
    "SELECT sale_id FROM orders WHERE id = ?;",
    [parseInt(id)]
  );
  if (row?.sale_id) {
    db.runSync("DELETE FROM sales WHERE id = ?;", [row.sale_id]);
  }
  db.runSync("DELETE FROM orders WHERE id = ?;", [parseInt(id)]);
}
