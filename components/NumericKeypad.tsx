import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "⌫"],
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  accentColor?: string;
}

export function NumericKeypad({ value, onChange, accentColor = "#111827" }: Props) {
  const handlePress = (key: string) => {
    if (key === "⌫") {
      onChange(value.slice(0, -1));
      return;
    }

    // Prevent multiple dots
    if (key === "." && value.includes(".")) return;

    // Prevent leading zeros like "00"
    if (key === "0" && value === "0") return;

    // Limit to 2 decimal places
    const dotIndex = value.indexOf(".");
    if (dotIndex !== -1 && value.length - dotIndex > 2) return;

    // Max value guard: 9,999,999.99
    const next = value + key;
    if (parseFloat(next) > 9_999_999.99) return;

    onChange(next);
  };

  return (
    <View style={styles.keypad}>
      {KEYS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => {
            const isBackspace = key === "⌫";
            const isDot = key === ".";
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.key,
                  isBackspace && styles.backspaceKey,
                ]}
                onPress={() => handlePress(key)}
                activeOpacity={0.6}
              >
                {isBackspace ? (
                  <Feather name="delete" size={22} color="#6B7280" />
                ) : (
                  <Text style={[styles.keyText, isDot && styles.dotText]}>
                    {key}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  keypad: {
    gap: 8,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  key: {
    flex: 1,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  backspaceKey: {
    backgroundColor: "#F3F4F6",
  },
  keyText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
  },
  dotText: {
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "700",
  },
});
