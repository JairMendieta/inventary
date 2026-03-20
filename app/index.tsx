import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSales } from "../hooks/useSales";

export default function App() {
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState("");
  const { sales, totalSales, addSale, removeSale } = useSales();

  const handleSaveSale = () => {
    const success = addSale(inputValue);
    if (success) {
      setInputValue("");
    }
  };

  const handleDeleteSale = (id: string) => {
    Alert.alert("Eliminar venta", "¿Estás seguro de eliminar esta venta?", [
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
        <Feather name="check-circle" size={20} color="#10B981" />
        <Text style={styles.saleDate}>{item.date}</Text>
      </View>
      <View style={styles.saleRight}>
        <Text style={styles.saleAmount}>${item.amount.toFixed(2)}</Text>
        <TouchableOpacity
          onPress={() => handleDeleteSale(item.id)}
          style={styles.deleteButton}
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[
          styles.keyboardView,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>Ventas de hoy</Text>
          <Text style={styles.headerTitle}>
            $
            {totalSales.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View style={styles.inputCard}>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              value={inputValue}
              onChangeText={setInputValue}
              maxLength={8}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, !inputValue && styles.buttonDisabled]}
            activeOpacity={0.8}
            onPress={handleSaveSale}
            disabled={!inputValue}
          >
            <Text style={styles.buttonText}>Guardar venta</Text>
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>
            Historial reciente{" "}
            <Text style={styles.listCount}>({sales.length})</Text>
          </Text>
          {sales.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>No hay ventas registradas</Text>
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
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 24,
  },

  header: {
    marginTop: 40,
    marginBottom: 32,
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 48,
    color: "#111827",
    fontWeight: "800",
    letterSpacing: -1,
  },

  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    height: 70,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  currencySymbol: {
    fontSize: 28,
    color: "#374151",
    fontWeight: "600",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
  },
  button: {
    backgroundColor: "#111827",
    borderRadius: 16,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },

  listContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 16,
  },
  listCount: {
    fontSize: 14,
    fontWeight: "400",
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
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  saleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  saleRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  saleDate: {
    fontSize: 16,
    color: "#4B5563",
    fontWeight: "500",
  },
  saleAmount: {
    fontSize: 18,
    color: "#111827",
    fontWeight: "700",
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: "#9CA3AF",
    fontWeight: "400",
  },
});