import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Alert, ScrollView, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

async function dirSizeAsync(uri: string): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(uri, { size: true } as any);
    if (!info.exists) return 0;
    if (!info.isDirectory) return (info as any).size ?? 0;
    const children = await FileSystem.readDirectoryAsync(uri);
    let total = 0;
    for (const child of children) {
      total += await dirSizeAsync(`${uri.endsWith("/") ? uri : uri + "/"}${child}`);
    }
    return total;
  } catch { return 0; }
}

// ─── Stacked progress bar ─────────────────────────────────────────────────────

function StackedBar({ segments }: { segments: { value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return <View style={styles.barTrack} />;
  return (
    <View style={styles.barTrack}>
      {segments.map((seg, i) => {
        const pct = Math.max((seg.value / total) * 100, seg.value > 0 ? 1 : 0);
        const isFirst = i === 0;
        const isLast = i === segments.length - 1;
        return (
          <View
            key={i}
            style={{
              width: `${pct}%` as any,
              height: "100%",
              backgroundColor: seg.color,
              borderTopLeftRadius: isFirst ? 100 : 0,
              borderBottomLeftRadius: isFirst ? 100 : 0,
              borderTopRightRadius: isLast ? 100 : 0,
              borderBottomRightRadius: isLast ? 100 : 0,
            }}
          />
        );
      })}
    </View>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <View>
        <Text style={styles.legendLabel}>{label}</Text>
        <Text style={styles.legendValue}>{value}</Text>
      </View>
    </View>
  );
}

function ActionRow({
  icon, label, subtitle, onPress, danger,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.actionIcon, danger && styles.actionIconDanger]}>
        <Feather name={icon} size={18} color={danger ? "#EF4444" : "#6B7280"} />
      </View>
      <View style={styles.actionText}>
        <Text style={[styles.actionLabel, danger && styles.actionLabelDanger]}>{label}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={16} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface StorageInfo {
  deviceTotal: number;
  deviceFree: number;
  appSize: number;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState<"cache" | "data" | null>(null);

  const loadStorage = useCallback(async () => {
    setLoading(true);
    try {
      const [deviceFree, deviceTotal, appDocs, appCache] = await Promise.all([
        FileSystem.getFreeDiskStorageAsync(),
        FileSystem.getTotalDiskCapacityAsync(),
        dirSizeAsync(FileSystem.documentDirectory ?? ""),
        dirSizeAsync(FileSystem.cacheDirectory ?? ""),
      ]);
      setStorage({ deviceTotal, deviceFree, appSize: appDocs + appCache });
    } catch (e) {
      console.error("Storage error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStorage(); }, [loadStorage]);

  const handleClearCache = () => {
    Alert.alert(
      "Limpiar Caché",
      "Se eliminarán los archivos temporales. Tus datos se conservan.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpiar",
          onPress: async () => {
            setClearing("cache");
            try {
              const cacheDir = FileSystem.cacheDirectory;
              if (cacheDir) {
                await FileSystem.deleteAsync(cacheDir, { idempotent: true });
                await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
              }
              await loadStorage();
              Alert.alert("✓ Listo", "Caché eliminado correctamente.");
            } catch { Alert.alert("Error", "No se pudo limpiar el caché."); }
            finally { setClearing(null); }
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      "⚠️ Borrar Todos los Datos",
      "Se eliminarán TODAS las ventas, gastos, encargos y tipos de venta. No se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar todo",
          style: "destructive",
          onPress: () =>
            Alert.alert("Confirmación final", "Esta acción es irreversible.", [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Sí, borrar definitivamente",
                style: "destructive",
                onPress: async () => {
                  setClearing("data");
                  try {
                    const docDir = FileSystem.documentDirectory;
                    const cacheDir = FileSystem.cacheDirectory;
                    if (docDir) {
                      const children = await FileSystem.readDirectoryAsync(docDir);
                      for (const child of children)
                        await FileSystem.deleteAsync(`${docDir}${child}`, { idempotent: true });
                    }
                    if (cacheDir) {
                      await FileSystem.deleteAsync(cacheDir, { idempotent: true });
                      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
                    }
                    await loadStorage();
                    Alert.alert("Datos eliminados", "Cierra y vuelve a abrir la app.", [
                      { text: "OK", onPress: () => router.replace("/") },
                    ]);
                  } catch { Alert.alert("Error", "No se pudo borrar el almacenamiento."); }
                  finally { setClearing(null); }
                },
              },
            ]),
        },
      ]
    );
  };

  // ── Derived segments ──────────────────────────────────────────────────────────
  const deviceUsed = storage ? Math.max(storage.deviceTotal - storage.deviceFree - (storage.appSize), 0) : 0;
  const appSize = storage?.appSize ?? 0;
  const freeSpace = storage?.deviceFree ?? 0;
  const totalSpace = storage?.deviceTotal ?? 1;
  const usedPct = Math.round(((deviceUsed + appSize) / totalSpace) * 100);

  const segments = [
    { value: deviceUsed, color: "#6366F1" },   // system/other apps
    { value: appSize,    color: "#F59E0B" },   // this app
    { value: freeSpace,  color: "#E5E7EB" },   // free
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Configuración</Text>
        <TouchableOpacity onPress={loadStorage} style={styles.iconBtn} activeOpacity={0.7}>
          <Feather name="refresh-cw" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Storage card ── */}
        <Text style={styles.sectionTitle}>Almacenamiento</Text>
        <View style={styles.card}>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color="#6366F1" />
              <Text style={styles.loadingText}>Calculando...</Text>
            </View>
          ) : storage ? (
            <>
              {/* Top: icon + headline */}
              <View style={styles.storageTop}>
                <View style={styles.storageIconWrap}>
                  <Feather name="hard-drive" size={20} color="#6366F1" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.storageTitle}>
                    {formatBytes(deviceUsed + appSize)} de {formatBytes(totalSpace)} usados
                  </Text>
                  <Text style={styles.storageSub}>{usedPct}% del almacenamiento ocupado</Text>
                </View>
              </View>

              {/* Stacked progress bar */}
              <StackedBar segments={segments} />

              <View style={styles.legendRow}>
                <LegendItem color="#6366F1" label="Sistema y apps" value={formatBytes(deviceUsed)} />
                <LegendItem color="#F59E0B" label="Esta app" value={formatBytes(appSize)} />
                <LegendItem color="#D1D5DB" label="Libre" value={formatBytes(freeSpace)} />
              </View>
            </>
          ) : (
            <Text style={styles.errorText}>No se pudo obtener la información</Text>
          )}
        </View>

        {/* ── Actions ── */}
        <Text style={styles.sectionTitle}>Mantenimiento</Text>
        <View style={styles.card}>
          <ActionRow
            icon="wind"
            label="Limpiar Caché"
            subtitle="Elimina archivos temporales. Tus datos se conservan."
            onPress={handleClearCache}
          />
          {clearing === "cache" && (
            <View style={styles.clearingRow}>
              <ActivityIndicator size="small" color="#6B7280" />
              <Text style={styles.clearingText}>Limpiando caché...</Text>
            </View>
          )}

          <View style={styles.separator} />

          <ActionRow
            icon="trash-2"
            label="Borrar Todos los Datos"
            subtitle="Elimina ventas, gastos, encargos. Acción irreversible."
            onPress={handleClearData}
            danger
          />
          {clearing === "data" && (
            <View style={styles.clearingRow}>
              <ActivityIndicator size="small" color="#EF4444" />
              <Text style={[styles.clearingText, { color: "#EF4444" }]}>Borrando datos...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 24,
    marginTop: 16, marginBottom: 20,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },

  sectionTitle: {
    fontSize: 11, fontWeight: "700", color: "#9CA3AF",
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, marginTop: 8,
  },
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 18, marginBottom: 2 },

  loadingWrap: {
    flexDirection: "row", alignItems: "center",
    gap: 10, paddingVertical: 20, justifyContent: "center",
  },
  loadingText: { color: "#9CA3AF", fontSize: 13 },
  errorText: { color: "#9CA3AF", fontSize: 13, textAlign: "center", paddingVertical: 12 },

  // Storage
  storageTop: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  storageIconWrap: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center",
  },
  storageTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  storageSub: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },

  // Stacked bar
  barTrack: {
    height: 14, backgroundColor: "#F3F4F6", borderRadius: 100,
    overflow: "hidden", flexDirection: "row",
  },

  // Legend
  legendRow: { flexDirection: "column", marginTop: 18, gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 100 },
  legendLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "500" },
  legendValue: { fontSize: 13, color: "#111827", fontWeight: "700", marginTop: 1 },

  noteBubble: {
    flexDirection: "row", gap: 8, alignItems: "flex-start",
    backgroundColor: "#F9FAFB", borderRadius: 12, padding: 12, marginTop: 16,
  },
  noteText: { flex: 1, fontSize: 11, color: "#9CA3AF", lineHeight: 17 },

  separator: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 14 },

  // Actions
  actionRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  actionIcon: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center",
  },
  actionIconDanger: { backgroundColor: "#FEF2F2" },
  actionText: { flex: 1 },
  actionLabel: { fontSize: 15, fontWeight: "600", color: "#111827" },
  actionLabelDanger: { color: "#EF4444" },
  actionSubtitle: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },

  clearingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 12 },
  clearingText: { fontSize: 13, color: "#6B7280" },
});
