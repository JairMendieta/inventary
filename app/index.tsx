import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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

export default function App() {
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState("");

  const [sales, setSales] = useState([
    { id: "1", date: "20/03/2026", amount: 50.0 },
    { id: "2", date: "19/03/2026", amount: 120.5 },
    { id: "3", date: "18/03/2026", amount: 85.0 },
  ]);

  const totalSales = sales.reduce((sum, item) => sum + item.amount, 120.0);

  const handleSaveSale = () => {
    if (!inputValue || isNaN(Number(inputValue))) return;

    const newSale = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      amount: parseFloat(inputValue),
    };

    setSales([newSale, ...sales]);
    setInputValue("");
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
      <Text style={styles.saleAmount}>${item.amount.toFixed(2)}</Text>
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
          <Text style={styles.listTitle}>Historial reciente</Text>
          <FlatList
            data={sales}
            keyExtractor={(item) => item.id}
            renderItem={renderSaleItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    height: 70,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  saleInfo: {
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
});
