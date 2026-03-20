import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("inventary.db");

export function initDB(): void {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
}

export interface Sale {
  id: string;
  date: string;
  amount: number;
}

export function insertSale(date: string, amount: number): Sale {
  const created_at = Date.now();
  const result = db.runSync(
    "INSERT INTO sales (date, amount, created_at) VALUES (?, ?, ?);",
    [date, amount, created_at]
  );
  return { id: result.lastInsertRowId.toString(), date, amount };
}

export function getSales(): Sale[] {
  const rows = db.getAllSync<{
    id: number;
    date: string;
    amount: number;
  }>("SELECT id, date, amount FROM sales ORDER BY created_at DESC;");

  return rows.map((row) => ({
    id: row.id.toString(),
    date: row.date,
    amount: row.amount,
  }));
}

export function deleteSale(id: string): void {
  db.runSync("DELETE FROM sales WHERE id = ?;", [id]);
}
