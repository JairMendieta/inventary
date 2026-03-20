import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSales } from "../hooks/useSales";
import { useSaleTypes } from "../hooks/useSaleTypes";
import { NumericKeypad } from "../components/NumericKeypad";
import { SaleType } from "../database/db";

export default function AddSaleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addSale } = useSales();
  const { saleTypes, refreshSaleTypes } = useSaleTypes();

  const [amount, setAmount] = useState("");
  const [selectedType, setSelectedType] = useState<SaleType | null>(null);
  const [note, setNote] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);

  // Refresh types when screen gains focus (in case user created new types)
  useFocusEffect(
    React.useCallback(() => {
      refreshSaleTypes();
    }, [refreshSaleTypes])
  );

  const displayAmount = amount === "" ? "0" : amount;
  const isReady = parseFloat(amount) > 0 && selectedType !== null;

  const handleSave = () => {
    if (!isReady || !selectedType) return;
    const success = addSale(amount, selectedType.name, note);
    if (success) router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Agregar Venta</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Amount Display */}
        <View style={styles.amountSection}>
          <Text style={styles.currencySymbol}>$</Text>
          <Text
            style={[styles.amountDisplay, !amount && styles.amountPlaceholder]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {displayAmount}
          </Text>
        </View>

        <Text style={styles.hint}>Ingresa el monto de la venta</Text>
        <View style={styles.divider} />

        {/* Keypad */}
        <NumericKeypad value={amount} onChange={setAmount} />

        {/* ── Sale Type Selector ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tipo de Venta</Text>

          <TouchableOpacity
            style={[styles.typeSelector, selectedType && styles.typeSelectorActive]}
            onPress={() => setPickerVisible(true)}
            activeOpacity={0.7}
          >
            <Feather
              name="tag"
              size={16}
              color={selectedType ? "#111827" : "#9CA3AF"}
              style={{ marginRight: 10 }}
            />
            <Text style={[styles.typeSelectorText, selectedType && styles.typeSelectorTextActive]}>
              {selectedType ? selectedType.name : "Selecciona un tipo de venta"}
            </Text>
            <Feather name="chevron-down" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {saleTypes.length === 0 && (
            <TouchableOpacity
              onPress={() => router.push("/sale-types")}
              style={styles.createTypeHint}
            >
              <Feather name="plus-circle" size={14} color="#6B7280" />
              <Text style={styles.createTypeHintText}>
                Crea tipos de venta primero
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Note ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Nota (opcional)</Text>
          <View style={styles.inputWrapper}>
            <Feather name="file-text" size={16} color="#9CA3AF" style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.textInput, styles.noteInput]}
              placeholder="ej. Pagado en efectivo"
              placeholderTextColor="#9CA3AF"
              value={note}
              onChangeText={setNote}
              maxLength={120}
              multiline
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, !isReady && styles.saveButtonDisabled]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={!isReady}
        >
          <Feather name="check" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>Guardar Venta</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Type Picker Modal */}
      <Modal
        visible={pickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tipo de Venta</Text>
              <TouchableOpacity onPress={() => router.push("/sale-types")} style={styles.manageBtn}>
                <Feather name="settings" size={16} color="#6B7280" />
                <Text style={styles.manageBtnText}>Gestionar</Text>
              </TouchableOpacity>
            </View>

            {saleTypes.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Feather name="tag" size={28} color="#D1D5DB" />
                <Text style={styles.modalEmptyText}>
                  No tienes tipos de venta.{"\n"}Crea uno en "Gestionar".
                </Text>
              </View>
            ) : (
              <FlatList
                data={saleTypes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      selectedType?.id === item.id && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedType(item);
                      setPickerVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        selectedType?.id === item.id && styles.modalItemTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {selectedType?.id === item.id && (
                      <Feather name="check" size={18} color="#10B981" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  amountSection: {
    flexDirection: "row", alignItems: "flex-end",
    justifyContent: "center", paddingVertical: 24, gap: 6,
  },
  currencySymbol: { fontSize: 36, fontWeight: "700", color: "#10B981", paddingBottom: 6 },
  amountDisplay: { fontSize: 64, fontWeight: "800", color: "#111827", letterSpacing: -2 },
  amountPlaceholder: { color: "#D1D5DB" },
  hint: { textAlign: "center", fontSize: 13, color: "#9CA3AF", marginBottom: 20 },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginBottom: 20, marginHorizontal: -8 },

  section: { marginTop: 22, gap: 10 },
  sectionLabel: {
    fontSize: 12, fontWeight: "600", color: "#9CA3AF",
    textTransform: "uppercase", letterSpacing: 0.8,
  },

  // Type selector
  typeSelector: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 16,
    borderWidth: 1.5, borderColor: "#E5E7EB",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  typeSelectorActive: { borderColor: "#111827" },
  typeSelectorText: { flex: 1, fontSize: 15, color: "#9CA3AF" },
  typeSelectorTextActive: { color: "#111827", fontWeight: "600" },
  createTypeHint: {
    flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: 4,
  },
  createTypeHintText: { fontSize: 13, color: "#6B7280" },

  // Note input
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  textInput: { flex: 1, fontSize: 15, color: "#111827", paddingVertical: 14 },
  noteInput: { minHeight: 52, textAlignVertical: "top" },

  // Save button
  saveButton: {
    flexDirection: "row", backgroundColor: "#111827",
    borderRadius: 20, paddingVertical: 18,
    alignItems: "center", justifyContent: "center", marginTop: 24,
  },
  saveButtonDisabled: { backgroundColor: "#D1D5DB" },
  saveButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingTop: 12, paddingHorizontal: 24,
    maxHeight: "70%",
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  manageBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#F3F4F6", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  manageBtnText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  modalItem: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 16, borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6", justifyContent: "space-between",
  },
  modalItemSelected: { opacity: 1 },
  modalItemText: { fontSize: 16, color: "#374151", fontWeight: "500" },
  modalItemTextSelected: { color: "#111827", fontWeight: "700" },
  modalEmpty: {
    alignItems: "center", gap: 12, paddingVertical: 40,
  },
  modalEmptyText: {
    fontSize: 14, color: "#9CA3AF", textAlign: "center", lineHeight: 22,
  },
});
