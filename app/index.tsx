import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useSales } from "../hooks/useSales";
import { useExpenses } from "../hooks/useExpenses";

// Combined item type for the unified list
type ListItem = {
  id: string;
  kind: "sale" | "expense";
  date: string;
  amount: number;
  title?: string;
  note?: string;
  created_at: number;
};

export default function App() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sales, totalSales, removeSale, refreshSales } = useSales();
  const { expenses, totalExpenses, removeExpense, refreshExpenses } = useExpenses();

  // Reload on focus (after returning from add screens)
  useFocusEffect(
    React.useCallback(() => {
      refreshSales();
      refreshExpenses();
    }, [refreshSales, refreshExpenses])
  );

  // Net balance: total sales minus total expenses
  const netBalance = totalSales - totalExpenses;

  // Merge and sort by created_at descending
  const listItems: ListItem[] = [
    ...sales.map((s) => ({ ...s, kind: "sale" as const })),
    ...expenses.map((e) => ({ ...e, kind: "expense" as const })),
  ].sort((a, b) => b.created_at - a.created_at);

  const handleDelete = (item: ListItem) => {
    const label = item.kind === "sale" ? "venta" : "gasto";
    Alert.alert(
      `Eliminar ${label}`,
      `¿Estás seguro de eliminar este registro?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            if (item.kind === "sale") removeSale(item.id);
            else removeExpense(item.id);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ListItem }) => {
    const isSale = item.kind === "sale";
    return (
      <View style={styles.row}>
        {/* Icon */}
        <View style={[styles.iconContainer, isSale ? styles.saleIcon : styles.expenseIcon]}>
          <Feather
            name={isSale ? "arrow-up-right" : "arrow-down-left"}
            size={18}
            color={isSale ? "#10B981" : "#EF4444"}
          />
        </View>

        {/* Info */}
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.title || (isSale ? "Venta" : "Gasto")}
          </Text>
          {item.note ? (
            <Text style={styles.rowNote} numberOfLines={1}>
              {item.note}
            </Text>
          ) : (
            <Text style={styles.rowDate}>{item.date}</Text>
          )}
          {item.note ? (
            <Text style={styles.rowDateSmall}>{item.date}</Text>
          ) : null}
        </View>

        {/* Amount + delete */}
        <View style={styles.rowRight}>
          <Text style={[styles.rowAmount, isSale ? styles.saleAmount : styles.expenseAmount]}>
            {isSale ? "+" : "-"}${Math.abs(item.amount).toFixed(2)}
          </Text>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={styles.deleteBtn}
            activeOpacity={0.7}
          >
            <Feather name="trash-2" size={16} color="#D1D5DB" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <View
        style={[
          styles.mainContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        {/* ── Balance Header ── */}
        <View style={styles.header}>
          {/* Top row: title + settings button */}
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => router.push("/settings")}
              activeOpacity={0.7}
            >
              <Feather name="settings" size={18} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.headerSubtitle}>Balance Neto</Text>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => router.push("/sale-types")}
              activeOpacity={0.7}
            >
              <Feather name="tag" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Text
            style={[
              styles.headerTitle,
              netBalance < 0 && styles.headerTitleNegative,
            ]}
          >
            {netBalance < 0 ? "-" : ""}$
            {Math.abs(netBalance).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>

          {/* Sub-stats */}
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Feather name="trending-up" size={13} color="#10B981" />
              <Text style={styles.statText}>
                +$
                {totalSales.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View style={[styles.statPill, styles.statPillRed]}>
              <Feather name="trending-down" size={13} color="#EF4444" />
              <Text style={[styles.statText, styles.statTextRed]}>
                -$
                {totalExpenses.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Action Buttons ── */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.saleButton]}
            activeOpacity={0.8}
            onPress={() => router.push("/add-sale")}
          >
            <Feather name="plus-circle" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Agregar Venta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.expenseButton]}
            activeOpacity={0.8}
            onPress={() => router.push("/add-expense")}
          >
            <Feather name="minus-circle" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Agregar Gasto</Text>
          </TouchableOpacity>
        </View>

        {/* ── Encargos Shortcut ── */}
        <TouchableOpacity
          style={styles.ordersButton}
          activeOpacity={0.8}
          onPress={() => router.push("/orders")}
        >
          <View style={styles.ordersButtonLeft}>
            <Feather name="clipboard" size={20} color="#6366F1" />
            <Text style={styles.ordersButtonText}>Ver Encargos</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#6366F1" />
        </TouchableOpacity>

        {/* ── Unified List ── */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>
            Historial{" "}
            <Text style={styles.listCount}>({listItems.length})</Text>
          </Text>

          {listItems.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBackground}>
                <Feather name="inbox" size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyText}>No hay movimientos registrados</Text>
            </View>
          ) : (
            <FlatList
              data={listItems}
              keyExtractor={(item) => `${item.kind}-${item.id}`}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Header
  header: {
    marginTop: 40,
    marginBottom: 28,
    alignItems: "center",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 48,
    color: "#111827",
    fontWeight: "800",
    letterSpacing: -1,
    marginBottom: 14,
  },
  headerTitleNegative: {
    color: "#EF4444",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ECFDF5",
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statPillRed: {
    backgroundColor: "#FEF2F2",
  },
  statText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10B981",
  },
  statTextRed: {
    color: "#EF4444",
  },

  // Action buttons
  actionContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    height: 100,
    borderRadius: 20,
    padding: 16,
    justifyContent: "space-between",
  },
  saleButton: {
    backgroundColor: "#111827",
  },
  expenseButton: {
    backgroundColor: "#EF4444",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  ordersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EEF2FF",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 24,
  },
  ordersButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ordersButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6366F1",
  },

  // List
  listContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },
  listCount: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  flatListContent: {
    paddingBottom: 20,
  },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 20,
    marginBottom: 10,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saleIcon: {
    backgroundColor: "#ECFDF5",
  },
  expenseIcon: {
    backgroundColor: "#FEF2F2",
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  rowNote: {
    fontSize: 12,
    color: "#6B7280",
  },
  rowDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  rowDateSmall: {
    fontSize: 11,
    color: "#C4C9D4",
  },
  rowRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  rowAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  saleAmount: {
    color: "#10B981",
  },
  expenseAmount: {
    color: "#EF4444",
  },
  deleteBtn: {
    padding: 4,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    gap: 16,
  },
  emptyIconBackground: {
    backgroundColor: "#F3F4F6",
    padding: 20,
    borderRadius: 100,
  },
  emptyText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
});