import { useCallback, useEffect, useState } from "react";
import { deleteOrder, getOrders, initDB, insertOrder, Order, updateOrderPaid } from "../database/db";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  const refreshOrders = useCallback(() => {
    setOrders(getOrders());
  }, []);

  useEffect(() => {
    initDB();
    refreshOrders();
  }, [refreshOrders]);

  const addOrder = useCallback(
    (customerName: string, saleTypeId: string, quantity: number, note?: string): boolean => {
      if (!customerName.trim() || !saleTypeId || quantity < 1) return false;
      const newOrder = insertOrder(customerName, saleTypeId, quantity, note);
      setOrders((prev) => [newOrder, ...prev]);
      return true;
    },
    []
  );

  const togglePaid = useCallback((id: string, paid: boolean) => {
    const newSaleId = updateOrderPaid(id, paid);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, paid, sale_id: paid ? newSaleId : undefined } : o
      )
    );
  }, []);

  const removeOrder = useCallback((id: string) => {
    deleteOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  return { orders, addOrder, togglePaid, removeOrder, refreshOrders };
}
