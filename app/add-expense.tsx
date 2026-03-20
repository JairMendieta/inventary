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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useExpenses } from "../hooks/useExpenses";
import { NumericKeypad } from "../components/NumericKeypad";

export default function AddExpenseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addExpense } = useExpenses();

  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  const displayAmount = amount === "" ? "0" : amount;
  const isReady = parseFloat(amount) > 0;

  const handleSave = () => {
    if (!isReady) return;
    const success = addExpense(amount, title, note);
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
          <Text style={styles.title}>Agregar Gasto</Text>
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

        <Text style={styles.hint}>Ingresa el monto del gasto</Text>

        <View style={styles.divider} />

        {/* Keypad */}
        <NumericKeypad value={amount} onChange={setAmount} />

        {/* Optional fields */}
        <View style={styles.optionalSection}>
          <Text style={styles.optionalLabel}>Detalles opcionales</Text>

          <View style={styles.inputWrapper}>
            <Feather name="tag" size={16} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Título (ej. Compra de materiales)"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              maxLength={60}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Feather name="file-text" size={16} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, styles.noteInput]}
              placeholder="Nota (ej. Pagado con tarjeta)"
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
          <Text style={styles.saveButtonText}>Guardar Gasto</Text>
        </TouchableOpacity>
      </ScrollView>
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
  amountSection: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 6,
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: "700",
    color: "#EF4444",
    paddingBottom: 6,
  },
  amountDisplay: {
    fontSize: 64,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -2,
  },
  amountPlaceholder: {
    color: "#D1D5DB",
  },
  hint: {
    textAlign: "center",
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 20,
    marginHorizontal: -8,
  },
  optionalSection: {
    marginTop: 24,
    gap: 12,
  },
  optionalLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1.5, borderColor: "#E5E7EB",
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    paddingVertical: 14,
  },
  noteInput: {
    minHeight: 52,
    textAlignVertical: "top",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#EF4444",
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  saveButtonDisabled: {
    backgroundColor: "#FCA5A5",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
