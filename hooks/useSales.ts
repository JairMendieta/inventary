import { useCallback, useEffect, useState } from "react";
import { deleteSale, getSales, initDB, insertSale, Sale } from "../database/db";

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);

  const refreshSales = useCallback(() => {
    setSales(getSales());
  }, []);

  useEffect(() => {
    initDB();
    refreshSales();
  }, [refreshSales]);

  const totalSales = sales.reduce((sum, item) => sum + item.amount, 0);

  const addSale = useCallback(
    (amountStr: string, title?: string, note?: string): boolean => {
      const amount = parseFloat(amountStr);
      if (!amountStr || isNaN(amount) || amount <= 0) return false;

      const date = new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const newSale = insertSale(date, amount, title?.trim() || undefined, note?.trim() || undefined);
      setSales((prev) => [newSale, ...prev]);
      return true;
    },
    []
  );

  const removeSale = useCallback((id: string) => {
    deleteSale(id);
    setSales((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { sales, totalSales, addSale, removeSale, refreshSales };
}
