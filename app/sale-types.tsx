import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSaleTypes } from "../hooks/useSaleTypes";
import { SaleType } from "../database/db";

export default function SaleTypesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { saleTypes, addSaleType, removeSaleType } = useSaleTypes();
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const success = addSaleType(trimmed);
    if (success) setInputValue("");
  };

  const handleDelete = (item: SaleType) => {
    Alert.alert(
      "Eliminar tipo",
      `¿Eliminar "${item.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => removeSaleType(item.id),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: SaleType }) => (
    <View style={styles.typeRow}>
      <View style={styles.typeIconWrap}>
        <Feather name="tag" size={16} color="#111827" />
      </View>
      <Text style={styles.typeName}>{item.name}</Text>
      <TouchableOpacity
        onPress={() => handleDelete(item)}
        style={styles.deleteBtn}
        activeOpacity={0.7}
      >
        <Feather name="trash-2" size={16} color="#D1D5DB" />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 16 },
        ]}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Tipos de Venta</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.subtitle}>
          Crea los tipos de venta que ofreces. Los usarás al registrar una venta.
        </Text>

        {/* Add input */}
        <View style={styles.addRow}>
          <View style={styles.inputWrapper}>
            <Feather name="tag" size={16} color="#9CA3AF" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="ej. Ensalada de mango"
              placeholderTextColor="#C4C9D4"
              value={inputValue}
              onChangeText={setInputValue}
              maxLength={50}
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />
          </View>
          <TouchableOpacity
            style={[styles.addBtn, !inputValue.trim() && styles.addBtnDisabled]}
            onPress={handleAdd}
            disabled={!inputValue.trim()}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* List */}
        {saleTypes.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Feather name="tag" size={32} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>Sin tipos de venta</Text>
            <Text style={styles.emptySubtitle}>
              Agrega tu primer tipo de venta arriba
            </Text>
          </View>
        ) : (
          <FlatList
            data={saleTypes}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListHeaderComponent={
              <Text style={styles.listHeader}>
                {saleTypes.length} tipo{saleTypes.length !== 1 ? "s" : ""} registrado{saleTypes.length !== 1 ? "s" : ""}
              </Text>
            }
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 24,
    lineHeight: 20,
  },

  // Add Row
  addRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    paddingVertical: 14,
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  addBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },

  // List
  listHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  typeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  typeName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  deleteBtn: {
    padding: 6,
  },

  // Empty
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 100,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#374151",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
