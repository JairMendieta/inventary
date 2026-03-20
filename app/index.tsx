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
import { useRouter } from "expo-router";
import { useSales } from "../hooks/useSales";

export default function App() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sales, totalSales, removeSale } = useSales();

  const handleDeleteSale = (id: string) => {
    Alert.alert("Eliminar registro", "¿Estás seguro de eliminar este registro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => removeSale(id) },
    ]);
  };

  const renderSaleItem = ({
    item,
  }: {
    item: { id: string; date: string; amount: number };
  }) => (
    <View style={styles.saleRow}>
      <View style={styles.saleInfo}>
        <View style={styles.iconContainer}>
          <Feather name="arrow-up-right" size={20} color="#10B981" />
        </View>
        <Text style={styles.saleDate}>{item.date}</Text>
      </View>
      <View style={styles.saleRight}>
        <Text style={styles.saleAmount}>${item.amount.toFixed(2)}</Text>
        <TouchableOpacity
          onPress={() => handleDeleteSale(item.id)}
          style={styles.deleteButton}
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <View
        style={[
          styles.mainContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        {/* Encabezado / Balance */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>Balance de Ventas</Text>
          <Text style={styles.headerTitle}>
            $
            {totalSales.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        {/* Botones de Acción Rápida */}
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

        {/* Lista de Historial */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>
            Historial reciente{" "}
            <Text style={styles.listCount}>({sales.length})</Text>
          </Text>
          
          {sales.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBackground}>
                <Feather name="inbox" size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyText}>No hay movimientos registrados</Text>
            </View>
          ) : (
            <FlatList
              data={sales}
              keyExtractor={(item) => item.id}
              renderItem={renderSaleItem}
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

  // Header Styles
  header: {
    marginTop: 40,
    marginBottom: 32,
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 14,
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
  },

  // Action Buttons Styles
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  saleButton: {
    backgroundColor: "#111827", // Oscuro elegante
  },
  expenseButton: {
    backgroundColor: "#EF4444", // Rojo para gastos
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },

  // List Styles
  listContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  listCount: {
    fontSize: 16,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  flatListContent: {
    paddingBottom: 20,
  },
  saleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  saleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    backgroundColor: "#ECFDF5", // Verde claro de fondo
    padding: 8,
    borderRadius: 12,
  },
  saleRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  saleDate: {
    fontSize: 16,
    color: "#4B5563",
    fontWeight: "600",
  },
  saleAmount: {
    fontSize: 18,
    color: "#111827",
    fontWeight: "700",
  },
  deleteButton: {
    padding: 4,
  },

  // Empty State Styles
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
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
});