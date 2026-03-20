import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, StatusBar, Alert, KeyboardAvoidingView, Platform,
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
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isOrder, setIsOrder] = useState(false);

  const isValid = name.trim().length > 0 && (!isOrder || parseFloat(price) > 0);

  const handleAdd = () => {
    if (!isValid) return;
    const success = addSaleType(name, isOrder ? parseFloat(price) : 0, isOrder);
    if (success) { setName(""); setPrice(""); setIsOrder(false); }
  };

  const handleDelete = (item: SaleType) => {
    Alert.alert("Eliminar tipo", `¿Eliminar "${item.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => removeSaleType(item.id) },
    ]);
  };

  const renderItem = ({ item }: { item: SaleType }) => (
    <View style={styles.typeRow}>
      {/* Icon */}
      <View style={[styles.typeIconWrap, item.is_order && styles.typeIconWrapOrder]}>
        <Feather
          name={item.is_order ? "clipboard" : "tag"}
          size={16}
          color={item.is_order ? "#6366F1" : "#111827"}
        />
      </View>

      {/* Info */}
      <View style={styles.typeInfo}>
        <Text style={styles.typeName}>{item.name}</Text>
        <View style={styles.typeMeta}>
          {item.is_order && (
            <Text style={styles.typePrice}>${item.price.toFixed(2)} c/u</Text>
          )}
          {item.is_order && (
            <View style={styles.encargoBadge}>
              <Text style={styles.encargoBadgeText}>Encargo</Text>
            </View>
          )}
        </View>
      </View>

      {/* Delete */}
      <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn} activeOpacity={0.7}>
        <Feather name="trash-2" size={16} color="#D1D5DB" />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
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
          Define tus productos, su precio y si son de encargo.
        </Text>

        {/* Add Form Card */}
        <View style={styles.addCard}>
          {/* Name */}
          <View style={styles.addField}>
            <Feather name="tag" size={15} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.addInput}
              placeholder="Nombre del producto"
              placeholderTextColor="#C4C9D4"
              value={name}
              onChangeText={setName}
              maxLength={50}
              returnKeyType="next"
            />
          </View>

          <View style={styles.addDivider} />

          {/* Price — only when is encargo */}
          {isOrder && (
            <>
              <View style={styles.addField}>
                <Text style={styles.priceSymbol}>$</Text>
                <TextInput
                  style={styles.addInput}
                  placeholder="Precio por unidad"
                  placeholderTextColor="#C4C9D4"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  onSubmitEditing={handleAdd}
                />
              </View>
              <View style={styles.addDivider} />
            </>
          )}

          {/* is_order toggle */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setIsOrder((v) => !v)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, isOrder && styles.checkboxChecked]}>
              {isOrder && <Feather name="check" size={13} color="#FFFFFF" />}
            </View>
            <View style={styles.checkboxLabelWrap}>
              <Text style={styles.checkboxLabel}>Es de encargo</Text>
              <Text style={styles.checkboxSubLabel}>
                Aparecerá disponible en la sección de Encargos
              </Text>
            </View>
          </TouchableOpacity>

          {/* Add button */}
          <TouchableOpacity
            style={[styles.addBtn, !isValid && styles.addBtnDisabled]}
            onPress={handleAdd}
            disabled={!isValid}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.addBtnText}>Agregar Producto</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        {saleTypes.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Feather name="tag" size={32} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>Sin productos</Text>
            <Text style={styles.emptySubtitle}>Agrega tu primer producto arriba</Text>
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
                {saleTypes.length} producto{saleTypes.length !== 1 ? "s" : ""} — {saleTypes.filter(t => t.is_order).length} de encargo
              </Text>
            }
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingHorizontal: 24 },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginTop: 16, marginBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 13, color: "#9CA3AF", marginBottom: 20, lineHeight: 20 },

  // Add card
  addCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, marginBottom: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, gap: 4,
  },
  addField: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  addDivider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 6 },
  priceSymbol: { fontSize: 16, fontWeight: "700", color: "#6B7280", marginRight: 8, width: 15 },
  addInput: { flex: 1, fontSize: 15, color: "#111827", paddingVertical: 8 },

  // Checkbox row
  checkboxRow: {
    flexDirection: "row", alignItems: "center",
    gap: 12, paddingVertical: 12,
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 7, borderWidth: 2,
    borderColor: "#D1D5DB", alignItems: "center", justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#6366F1", borderColor: "#6366F1" },
  checkboxLabelWrap: { flex: 1 },
  checkboxLabel: { fontSize: 15, fontWeight: "600", color: "#111827" },
  checkboxSubLabel: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },

  addBtn: {
    flexDirection: "row", backgroundColor: "#111827", borderRadius: 14,
    paddingVertical: 12, alignItems: "center", justifyContent: "center", marginTop: 8,
  },
  addBtnDisabled: { backgroundColor: "#D1D5DB" },
  addBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },

  // List
  listHeader: {
    fontSize: 12, fontWeight: "600", color: "#9CA3AF",
    textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12,
  },
  typeRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF",
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 10, gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  typeIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center",
  },
  typeIconWrapOrder: { backgroundColor: "#EEF2FF" },
  typeInfo: { flex: 1 },
  typeName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  typeMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3 },
  typePrice: { fontSize: 13, color: "#6B7280" },
  encargoBadge: {
    backgroundColor: "#EEF2FF", borderRadius: 100,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  encargoBadgeText: { fontSize: 11, fontWeight: "700", color: "#6366F1" },
  deleteBtn: { padding: 6 },

  // Empty
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyIconBg: {
    width: 72, height: 72, borderRadius: 100,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#374151" },
  emptySubtitle: { fontSize: 13, color: "#9CA3AF", textAlign: "center" },
});
