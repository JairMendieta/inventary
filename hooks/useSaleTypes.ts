import { useCallback, useEffect, useState } from "react";
import { deleteSaleType, getSaleTypes, initDB, insertSaleType, SaleType } from "../database/db";

export function useSaleTypes() {
  const [saleTypes, setSaleTypes] = useState<SaleType[]>([]);

  const refreshSaleTypes = useCallback(() => {
    setSaleTypes(getSaleTypes());
  }, []);

  useEffect(() => {
    initDB();
    refreshSaleTypes();
  }, [refreshSaleTypes]);

  const addSaleType = useCallback((name: string): boolean => {
    if (!name.trim()) return false;
    const newType = insertSaleType(name);
    setSaleTypes((prev) => [...prev, newType]);
    return true;
  }, []);

  const removeSaleType = useCallback((id: string) => {
    deleteSaleType(id);
    setSaleTypes((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { saleTypes, addSaleType, removeSaleType, refreshSaleTypes };
}
