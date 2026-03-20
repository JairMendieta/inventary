import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, StatusBar, Alert, Modal, ScrollView,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useOrders } from "../hooks/useOrders";
import { useSaleTypes } from "../hooks/useSaleTypes";
import { Order, SaleType } from "../database/db";

// ─── Filter chip component ────────────────────────────────────────────────────
function FilterChip({
  label, active, onPress,
}: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Order row component ──────────────────────────────────────────────────────
function OrderRow({
  item, onTogglePaid, onDelete,
}: { item: Order; onTogglePaid: () => void; onDelete: () => void }) {
  return (
    <View style={[styles.orderRow, item.paid && styles.orderRowPaid]}>
      {/* Info */}
      <View style={styles.orderInfo}>
        <Text style={[styles.customerName, item.paid && styles.paidText]}>
          {item.customer_name}
        </Text>
        <Text style={styles.orderDetail}>
          {item.quantity} × ${item.price_per_unit.toFixed(2)} — {item.sale_type_name}
        </Text>
        {item.note ? <Text style={styles.orderNote}>{item.note}</Text> : null}

        {/* Paid: undo link */}
        {item.paid && (
          <TouchableOpacity onPress={onTogglePaid} style={styles.undoBtn} activeOpacity={0.7}>
            <Feather name="rotate-ccw" size={11} color="#9CA3AF" />
            <Text style={styles.undoBtnText}>Deshacer cobro</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Right side */}
      <View style={styles.orderRight}>
        {item.paid ? (
          // Already paid — show green badge
          <View style={styles.cobradoBadge}>
            <Feather name="check-circle" size={14} color="#10B981" />
            <Text style={styles.cobradoBadgeText}>Cobrado</Text>
          </View>
        ) : (
          // Pending — big Cobrar button
          <TouchableOpacity style={styles.cobrarBtn} onPress={onTogglePaid} activeOpacity={0.8}>
            <Feather name="dollar-sign" size={14} color="#FFFFFF" />
            <Text style={styles.cobrarBtnText}>Cobrar ${item.total.toFixed(2)}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} activeOpacity={0.7}>
          <Feather name="trash-2" size={14} color="#D1D5DB" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { orders, addOrder, togglePaid, removeOrder, refreshOrders } = useOrders();
  const { saleTypes, refreshSaleTypes } = useSaleTypes();

  // Only products flagged as encargo
  const orderTypes = saleTypes.filter((t) => t.is_order);

  const [filterTypeId, setFilterTypeId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Add order form state
  const [customerName, setCustomerName] = useState("");
  const [selectedType, setSelectedType] = useState<SaleType | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [typePickerVisible, setTypePickerVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      refreshOrders();
      refreshSaleTypes();
    }, [refreshOrders, refreshSaleTypes])
  );

  // Filtered list
  const filtered = filterTypeId
    ? orders.filter((o) => o.sale_type_id === filterTypeId)
    : orders;

  // Totals for the filtered list
  const totalOrders = filtered.length;
  const totalAmount = filtered.reduce((s, o) => s + o.total, 0);
  const totalCollected = filtered.filter((o) => o.paid).reduce((s, o) => s + o.total, 0);
  const totalPending = totalAmount - totalCollected;

  const handleDelete = (item: Order) => {
    Alert.alert("Eliminar encargo", `¿Eliminar el encargo de ${item.customer_name}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => removeOrder(item.id) },
    ]);
  };

  const handleAddOrder = () => {
    if (!customerName.trim() || !selectedType || parseInt(quantity) < 1) return;
    const ok = addOrder(customerName, selectedType.id, parseInt(quantity), note);
    if (ok) {
      setCustomerName("");
      setQuantity("1");
      setNote("");
      setSelectedType(null);
      setModalVisible(false);
    }
  };

  const formValid = customerName.trim().length > 0 && selectedType !== null && parseInt(quantity) >= 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Encargos</Text>
        <TouchableOpacity
          style={styles.addHeaderBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryAmount}>${totalAmount.toFixed(2)}</Text>
          <Text style={styles.summaryCount}>{totalOrders} encargo{totalOrders !== 1 ? "s" : ""}</Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardGreen]}>
          <Text style={styles.summaryLabel}>Cobrado</Text>
          <Text style={[styles.summaryAmount, styles.summaryGreen]}>${totalCollected.toFixed(2)}</Text>
          <Text style={styles.summaryCount}>{filtered.filter((o) => o.paid).length} pagado{filtered.filter(o => o.paid).length !== 1 ? "s" : ""}</Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardOrange]}>
          <Text style={styles.summaryLabel}>Pendiente</Text>
          <Text style={[styles.summaryAmount, styles.summaryOrange]}>${totalPending.toFixed(2)}</Text>
          <Text style={styles.summaryCount}>{filtered.filter((o) => !o.paid).length} pendiente{filtered.filter(o => !o.paid).length !== 1 ? "s" : ""}</Text>
        </View>
      </View>

      {/* Filter chips — only show order-types */}
      {orderTypes.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 24, paddingVertical: 4 }}
        >
          <FilterChip label="Todos" active={filterTypeId === null} onPress={() => setFilterTypeId(null)} />
          {orderTypes.map((t) => (
            <FilterChip
              key={t.id}
              label={t.name}
              active={filterTypeId === t.id}
              onPress={() => setFilterTypeId(filterTypeId === t.id ? null : t.id)}
            />
          ))}
        </ScrollView>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBg}>
            <Feather name="clipboard" size={32} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>Sin encargos</Text>
          <Text style={styles.emptySubtitle}>
            Toca el botón + para agregar{"\n"}un nuevo encargo
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderRow
              item={item}
              onTogglePaid={() => togglePaid(item.id, !item.paid)}
              onDelete={() => handleDelete(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24, paddingTop: 8 }}
        />
      )}

      {/* Add Order Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Nuevo Encargo</Text>

              {/* Customer name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Cliente</Text>
                <View style={styles.formInput}>
                  <Feather name="user" size={15} color="#9CA3AF" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.formText}
                    placeholder="Nombre del cliente"
                    placeholderTextColor="#C4C9D4"
                    value={customerName}
                    onChangeText={setCustomerName}
                    maxLength={50}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Sale type */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Producto</Text>
                <TouchableOpacity
                  style={[styles.formInput, styles.formSelector, selectedType && styles.formSelectorActive]}
                  onPress={() => setTypePickerVisible(true)}
                  activeOpacity={0.7}
                >
                  <Feather name="tag" size={15} color={selectedType ? "#111827" : "#9CA3AF"} style={{ marginRight: 8 }} />
                  <Text style={[styles.formText, !selectedType && { color: "#C4C9D4" }]}>
                    {selectedType
                      ? `${selectedType.name} — $${selectedType.price.toFixed(2)} c/u`
                      : "Selecciona un producto"}
                  </Text>
                  <Feather name="chevron-down" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Quantity */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Cantidad</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity((q) => String(Math.max(1, parseInt(q) - 1)))}
                    activeOpacity={0.7}
                  >
                    <Feather name="minus" size={18} color="#111827" />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity((q) => String(parseInt(q) + 1))}
                    activeOpacity={0.7}
                  >
                    <Feather name="plus" size={18} color="#111827" />
                  </TouchableOpacity>
                  {selectedType && (
                    <Text style={styles.qtyTotal}>
                      = ${(selectedType.price * parseInt(quantity)).toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Note */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nota (opcional)</Text>
                <View style={styles.formInput}>
                  <Feather name="file-text" size={15} color="#9CA3AF" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.formText}
                    placeholder="Observación..."
                    placeholderTextColor="#C4C9D4"
                    value={note}
                    onChangeText={setNote}
                    maxLength={100}
                    returnKeyType="done"
                  />
                </View>
              </View>

              {/* Save */}
              <TouchableOpacity
                style={[styles.saveBtn, !formValid && styles.saveBtnDisabled]}
                onPress={handleAddOrder}
                disabled={!formValid}
                activeOpacity={0.8}
              >
                <Feather name="check" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.saveBtnText}>Guardar Encargo</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Type mini-picker modal */}
      <Modal
        visible={typePickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTypePickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTypePickerVisible(false)}
        >
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Selecciona un producto</Text>
            {orderTypes.length === 0 ? (
              <View style={{ alignItems: "center", padding: 32, gap: 12 }}>
                <Feather name="clipboard" size={28} color="#D1D5DB" />
                <Text style={{ color: "#9CA3AF", textAlign: "center" }}>
                  No hay productos de encargo.{"\n"}Ve a Tipos de Venta y activa{"\n"}"Es de encargo" en un producto.
                </Text>
                <TouchableOpacity
                  onPress={() => { setTypePickerVisible(false); setModalVisible(false); router.push("/sale-types"); }}
                  style={styles.saveBtn}
                >
                  <Text style={styles.saveBtnText}>Ir a Tipos de Venta</Text>
                </TouchableOpacity>
              </View>
            ) : (
              orderTypes.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.pickerItem, selectedType?.id === t.id && styles.pickerItemActive]}
                  onPress={() => { setSelectedType(t); setTypePickerVisible(false); }}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pickerItemName, selectedType?.id === t.id && { color: "#111827" }]}>
                      {t.name}
                    </Text>
                    <Text style={styles.pickerItemPrice}>${t.price.toFixed(2)} por unidad</Text>
                  </View>
                  {selectedType?.id === t.id && <Feather name="check" size={18} color="#10B981" />}
                </TouchableOpacity>
              ))
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 24,
    marginTop: 16, marginBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  addHeaderBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#111827", alignItems: "center", justifyContent: "center",
  },

  // Summary
  summaryRow: {
    flexDirection: "row", gap: 10, paddingHorizontal: 24, marginBottom: 16,
  },
  summaryCard: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 18,
    padding: 14, alignItems: "center",
  },
  summaryCardGreen: { backgroundColor: "#ECFDF5" },
  summaryCardOrange: { backgroundColor: "#FFF7ED" },
  summaryLabel: { fontSize: 11, fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5 },
  summaryAmount: { fontSize: 18, fontWeight: "800", color: "#111827", marginTop: 4 },
  summaryGreen: { color: "#10B981" },
  summaryOrange: { color: "#F59E0B" },
  summaryCount: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },

  // Chips
  chipScroll: { maxHeight: 48, marginBottom: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100,
    backgroundColor: "#F3F4F6",
  },
  chipActive: { backgroundColor: "#111827" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  chipTextActive: { color: "#FFFFFF" },

  // Order row
  orderRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 14,
    marginBottom: 10, gap: 12,
  },
  orderRowPaid: { opacity: 0.65 },
  checkbox: { padding: 4 },
  checkboxBox: {
    width: 24, height: 24, borderRadius: 8, borderWidth: 2,
    borderColor: "#D1D5DB", alignItems: "center", justifyContent: "center",
  },
  checkboxBoxChecked: { backgroundColor: "#10B981", borderColor: "#10B981" },
  orderInfo: { flex: 1 },
  customerName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  orderDetail: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  orderNote: { fontSize: 11, color: "#9CA3AF", marginTop: 2, fontStyle: "italic" },
  paidText: { textDecorationLine: "line-through", color: "#9CA3AF" },
  orderRight: { alignItems: "flex-end", gap: 4 },
  orderTotal: { fontSize: 16, fontWeight: "700", color: "#111827" },
  paidBadge: {
    fontSize: 10, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 100, textTransform: "uppercase", letterSpacing: 0.5,
  },
  paidBadgeGreen: { backgroundColor: "#ECFDF5", color: "#10B981" },
  paidBadgeOrange: { backgroundColor: "#FFF7ED", color: "#F59E0B" },
  deleteBtn: { padding: 4, marginTop: 4 },

  // Cobrar button (pending orders)
  cobrarBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#10B981", borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  cobrarBtnText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },

  // Cobrado badge (paid orders)
  cobradoBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#ECFDF5", borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  cobradoBadgeText: { fontSize: 13, fontWeight: "700", color: "#10B981" },

  // Undo link
  undoBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  undoBtnText: { fontSize: 11, color: "#9CA3AF" },


  // Empty
  emptyState: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 72, height: 72, borderRadius: 100,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#374151" },
  emptySubtitle: { fontSize: 13, color: "#9CA3AF", textAlign: "center", lineHeight: 20 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: "#FFFFFF", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingTop: 12, paddingHorizontal: 24, maxHeight: "92%",
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 20 },

  // Form
  formGroup: { marginBottom: 16 },
  formLabel: {
    fontSize: 12, fontWeight: "600", color: "#9CA3AF",
    textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8,
  },
  formInput: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F9FAFB", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  formSelector: { justifyContent: "space-between" },
  formSelectorActive: { borderColor: "#111827" },
  formText: { flex: 1, fontSize: 15, color: "#111827" },

  // Quantity
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center",
  },
  qtyValue: { fontSize: 22, fontWeight: "700", color: "#111827", minWidth: 32, textAlign: "center" },
  qtyTotal: { flex: 1, fontSize: 17, fontWeight: "700", color: "#10B981", textAlign: "right" },

  // Save
  saveBtn: {
    flexDirection: "row", backgroundColor: "#111827", borderRadius: 18,
    paddingVertical: 16, alignItems: "center", justifyContent: "center", marginTop: 12,
  },
  saveBtnDisabled: { backgroundColor: "#D1D5DB" },
  saveBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },

  // Type picker
  pickerItem: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  pickerItemActive: { opacity: 1 },
  pickerItemName: { fontSize: 15, fontWeight: "600", color: "#374151" },
  pickerItemPrice: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
});
