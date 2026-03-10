import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

type Base = "binary" | "octal" | "decimal" | "hexadecimal";

interface BaseConfig {
  key: Base;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
}

const BASE_CONFIGS: BaseConfig[] = [
  { key: "binary", label: "Binário", shortLabel: "BIN", description: "Base 2", color: "#1565C0" },
  { key: "octal", label: "Octal", shortLabel: "OCT", description: "Base 8", color: "#6A1B9A" },
  { key: "decimal", label: "Decimal", shortLabel: "DEC", description: "Base 10", color: "#1B5E20" },
  { key: "hexadecimal", label: "Hexadecimal", shortLabel: "HEX", description: "Base 16", color: "#B71C1C" },
];

function toBase(n: number, base: Base): string {
  switch (base) {
    case "binary": return n.toString(2).padStart(6, "0");
    case "octal": return n.toString(8);
    case "decimal": return n.toString(10);
    case "hexadecimal": return n.toString(16).toUpperCase();
  }
}

interface TableRow {
  decimal: number;
  binary: string;
  octal: string;
  hexadecimal: string;
}

const TABLE_DATA: TableRow[] = Array.from({ length: 51 }, (_, i) => ({
  decimal: i,
  binary: toBase(i, "binary"),
  octal: toBase(i, "octal"),
  hexadecimal: toBase(i, "hexadecimal"),
}));

export default function TablesScreen() {
  const colors = useColors();
  const [selectedBase, setSelectedBase] = useState<Base>("decimal");
  const [viewMode, setViewMode] = useState<"all" | "single">("all");

  const selectedConfig = BASE_CONFIGS.find((b) => b.key === selectedBase)!;

  const renderAllColumns = ({ item, index }: { item: TableRow; index: number }) => {
    const isEven = index % 2 === 0;
    return (
      <View style={[styles.tableRow, { backgroundColor: isEven ? colors.surface : colors.background }]}>
        <Text style={[styles.cellDec, { color: colors.foreground, fontWeight: "700" }]}>
          {item.decimal}
        </Text>
        <Text style={[styles.cellBin, { color: "#1565C0", fontFamily: "monospace" }]}>
          {item.binary}
        </Text>
        <Text style={[styles.cellOct, { color: "#6A1B9A", fontFamily: "monospace" }]}>
          {item.octal}
        </Text>
        <Text style={[styles.cellHex, { color: "#B71C1C", fontFamily: "monospace" }]}>
          {item.hexadecimal}
        </Text>
      </View>
    );
  };

  const renderSingleColumn = ({ item, index }: { item: TableRow; index: number }) => {
    const isEven = index % 2 === 0;
    const value = selectedBase === "decimal" ? item.decimal.toString() : toBase(item.decimal, selectedBase);
    return (
      <View style={[styles.singleRow, { backgroundColor: isEven ? colors.surface : colors.background }]}>
        <Text style={[styles.singleDecimal, { color: colors.muted }]}>{item.decimal}</Text>
        <View style={styles.singleArrow}>
          <Text style={{ color: colors.muted }}>→</Text>
        </View>
        <Text style={[styles.singleValue, { color: selectedConfig.color }]}>
          {value}
        </Text>
        <Text style={[styles.singleLabel, { color: colors.muted }]}>{selectedConfig.shortLabel}</Text>
      </View>
    );
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <IconSymbol name="number" size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Tabelas Numéricas</Text>
        </View>
        <Text style={[styles.headerSub, { color: colors.muted }]}>
          Conversão de 0 a 50 em todas as bases
        </Text>

        {/* Base Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.baseSelectorScroll}>
          {BASE_CONFIGS.map((config) => (
            <TouchableOpacity
              key={config.key}
              style={[
                styles.baseChip,
                {
                  backgroundColor: selectedBase === config.key ? config.color : colors.background,
                  borderColor: config.color,
                },
              ]}
              onPress={() => setSelectedBase(config.key)}
            >
              <Text style={[styles.baseChipLabel, { color: selectedBase === config.key ? "#fff" : config.color }]}>
                {config.shortLabel}
              </Text>
              <Text style={[styles.baseChipDesc, { color: selectedBase === config.key ? "#ffffff99" : colors.muted }]}>
                {config.description}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* View Mode Toggle */}
        <View style={[styles.viewToggle, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === "all" && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode("all")}
          >
            <Text style={[styles.toggleText, { color: viewMode === "all" ? "#fff" : colors.muted }]}>
              Todas as Bases
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === "single" && { backgroundColor: selectedConfig.color }]}
            onPress={() => setViewMode("single")}
          >
            <Text style={[styles.toggleText, { color: viewMode === "single" ? "#fff" : colors.muted }]}>
              {selectedConfig.label}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table */}
      {viewMode === "all" ? (
        <>
          {/* Column Headers */}
          <View style={[styles.tableHeader, { backgroundColor: colors.primary }]}>
            <Text style={[styles.headerCellDec, { color: "#fff" }]}>DEC</Text>
            <Text style={[styles.headerCellBin, { color: "#fff" }]}>BINÁRIO</Text>
            <Text style={[styles.headerCellOct, { color: "#fff" }]}>OCTAL</Text>
            <Text style={[styles.headerCellHex, { color: "#fff" }]}>HEX</Text>
          </View>
          <FlatList
            data={TABLE_DATA}
            keyExtractor={(item) => item.decimal.toString()}
            renderItem={renderAllColumns}
            showsVerticalScrollIndicator={false}
            getItemLayout={(_, index) => ({ length: 44, offset: 44 * index, index })}
          />
        </>
      ) : (
        <>
          {/* Single Base Header */}
          <View style={[styles.singleHeader, { backgroundColor: selectedConfig.color }]}>
            <Text style={styles.singleHeaderText}>Decimal → {selectedConfig.label}</Text>
          </View>
          <FlatList
            data={TABLE_DATA}
            keyExtractor={(item) => item.decimal.toString()}
            renderItem={renderSingleColumn}
            showsVerticalScrollIndicator={false}
            getItemLayout={(_, index) => ({ length: 52, offset: 52 * index, index })}
          />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerSub: {
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 32,
  },
  baseSelectorScroll: {
    marginBottom: 10,
  },
  baseChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    marginRight: 8,
    alignItems: "center",
    minWidth: 70,
  },
  baseChipLabel: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  baseChipDesc: {
    fontSize: 10,
    marginTop: 1,
  },
  viewToggle: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "600",
  },
  // All columns view
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  headerCellDec: {
    width: 44,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  headerCellBin: {
    flex: 2,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  headerCellOct: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  headerCellHex: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 11,
    paddingHorizontal: 12,
    alignItems: "center",
    height: 44,
  },
  cellDec: {
    width: 44,
    fontSize: 15,
    textAlign: "center",
  },
  cellBin: {
    flex: 2,
    fontSize: 13,
    textAlign: "center",
    letterSpacing: 1,
  },
  cellOct: {
    flex: 1,
    fontSize: 15,
    textAlign: "center",
  },
  cellHex: {
    flex: 1,
    fontSize: 15,
    textAlign: "center",
    fontWeight: "700",
  },
  // Single column view
  singleHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  singleHeaderText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  singleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 24,
    height: 52,
  },
  singleDecimal: {
    width: 50,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },
  singleArrow: {
    width: 36,
    alignItems: "center",
  },
  singleValue: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  singleLabel: {
    fontSize: 12,
    fontWeight: "600",
    width: 40,
    textAlign: "right",
  },
});
