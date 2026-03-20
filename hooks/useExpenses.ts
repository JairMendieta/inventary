import { useCallback, useEffect, useState } from "react";
import { deleteExpense, getExpenses, initDB, insertExpense, Expense } from "../database/db";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const refreshExpenses = useCallback(() => {
    setExpenses(getExpenses());
  }, []);

  useEffect(() => {
    initDB();
    refreshExpenses();
  }, [refreshExpenses]);

  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

  const addExpense = useCallback(
    (amountStr: string, title?: string, note?: string): boolean => {
      const amount = parseFloat(amountStr);
      if (!amountStr || isNaN(amount) || amount <= 0) return false;

      const date = new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const newExpense = insertExpense(date, amount, title?.trim() || undefined, note?.trim() || undefined);
      setExpenses((prev) => [newExpense, ...prev]);
      return true;
    },
    []
  );

  const removeExpense = useCallback((id: string) => {
    deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { expenses, totalExpenses, addExpense, removeExpense, refreshExpenses };
}
