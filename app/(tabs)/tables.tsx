import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";

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
  const [startNumber, setStartNumber] = useState(0);
  const [inputVal, setInputVal] = useState("0");

  const tableData = useMemo(() => {
    const start = parseInt(inputVal) || 0;
    return Array.from({ length: 51 }, (_, i) => {
      const val = start + i;
      return {
        decimal: val,
        binary: toBase(val, "binary"),
        octal: toBase(val, "octal"),
        hexadecimal: toBase(val, "hexadecimal"),
      };
    });
  }, [inputVal]);

  const selectedConfig = BASE_CONFIGS.find((b) => b.key === selectedBase)!;

  const renderAllColumns = ({ item, index }: { item: TableRow; index: number }) => {
    const isEven = index % 2 === 0;
    return (
      <Animated.View entering={FadeInDown.delay(index * 20).duration(400)}>
        <View 
          style={[
            styles.tableRow, 
            { 
              backgroundColor: isEven ? colors.surface + '40' : 'transparent',
              borderBottomWidth: 1,
              borderBottomColor: colors.border + '20'
            }
          ]}
        >
          <Text style={[styles.cellDec, { color: colors.foreground, fontWeight: "900" }]}>
            {item.decimal}
          </Text>
          <Text style={[styles.cellBin, { color: colors.primary, fontFamily: "monospace", fontWeight: 'bold' }]}>
            {item.binary}
          </Text>
          <Text style={[styles.cellOct, { color: colors.accent, fontFamily: "monospace", fontWeight: 'bold' }]}>
            {item.octal}
          </Text>
          <Text style={[styles.cellHex, { color: colors.error, fontFamily: "monospace", fontWeight: '900' }]}>
            {item.hexadecimal}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderSingleColumn = ({ item, index }: { item: TableRow; index: number }) => {
    const isEven = index % 2 === 0;
    const value = selectedBase === "decimal" ? item.decimal.toString() : toBase(item.decimal, selectedBase);
    return (
      <Animated.View entering={FadeInUp.delay(index * 20).duration(400)}>
        <View style={[styles.singleRow, { backgroundColor: isEven ? colors.surface + '40' : 'transparent' }]}>
          <Text style={[styles.singleDecimal, { color: colors.muted }]}>{item.decimal}</Text>
          <View className="mx-6">
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </View>
          <Text style={[styles.singleValue, { color: selectedConfig.color, fontSize: 22 }]}>
            {value}
          </Text>
          <View className="px-3 py-1 rounded-lg glass-extreme-dark">
            <Text style={[styles.singleLabel, { color: colors.foreground, width: 'auto' }]}>{selectedConfig.shortLabel}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };  return (
    <ScreenContainer scrollable={false}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(800)}>
        <View style={[styles.header, { backgroundColor: 'transparent', borderBottomColor: colors.border + '40' }]}>
          <View className="flex-row items-center gap-4 mb-4">
            <View className="p-3 rounded-2xl glass-extreme shadow-lg">
              <Ionicons name="grid-outline" size={28} color={colors.primary} />
            </View>
            <View>
              <Text className="text-3xl font-black tracking-tighter" style={{ color: colors.foreground }}>Matrizes Numéricas</Text>
              <Text className="text-xs font-bold opacity-60 uppercase tracking-[2px]" style={{ color: colors.foreground }}>
                Sistemas de Conversão Computacional
              </Text>
            </View>
          </View>

          <Animated.View entering={FadeInDown.delay(200)} className="mb-6 flex-row items-center gap-4 p-4 rounded-3xl glass-extreme border" style={{ borderColor: colors.border }}>
            <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '900', textTransform: 'uppercase' }}>Offset:</Text>
            <TextInput
              className="flex-1 bg-surface/50 rounded-2xl px-6 py-3 text-lg font-black"
              style={{ 
                backgroundColor: colors.surface + '80',
                color: colors.foreground
              }}
              keyboardType="numeric"
              value={inputVal}
              onChangeText={setInputVal}
              placeholder="0"
              placeholderTextColor={colors.muted}
            />
          </Animated.View>

          {/* Base Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            <View className="flex-row gap-3">
              {BASE_CONFIGS.map((config) => (
                <TouchableOpacity
                  key={config.key}
                  className="px-6 py-4 rounded-[20px] border-2 items-center min-w-[100px]"
                  style={{
                    backgroundColor: selectedBase === config.key ? config.color : colors.surface + '60',
                    borderColor: selectedBase === config.key ? config.color : colors.border,
                  }}
                  onPress={() => setSelectedBase(config.key)}
                >
                  <Text className="font-black text-xs uppercase tracking-widest" style={{ color: selectedBase === config.key ? "#fff" : colors.foreground }}>
                    {config.shortLabel}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* View Mode Toggle */}
          <View className="flex-row rounded-[24px] overflow-hidden glass-extreme-dark p-1 border" style={{ borderColor: colors.border + '20' }}>
            <TouchableOpacity
              className="flex-1 py-4 items-center rounded-[20px]"
              style={[{ backgroundColor: viewMode === "all" ? colors.primary : 'transparent' }]}
              onPress={() => setViewMode("all")}
            >
              <Text className="font-black text-[10px] uppercase tracking-[2px]" style={{ color: viewMode === "all" ? "#fff" : colors.muted }}>
                Nexus View
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-4 items-center rounded-[20px]"
              style={[{ backgroundColor: viewMode === "single" ? selectedConfig.color : 'transparent' }]}
              onPress={() => setViewMode("single")}
            >
              <Text className="font-black text-[10px] uppercase tracking-[2px]" style={{ color: viewMode === "single" ? "#fff" : colors.muted }}>
                Focus: {selectedConfig.shortLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View> </View>

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
            data={tableData}
            keyExtractor={(item) => item.decimal.toString()}
            renderItem={renderAllColumns}
            showsVerticalScrollIndicator={false}
            getItemLayout={(_, index) => ({ length: 44, offset: 44 * index, index })}
          />
        </>
      ) : (
        <>
          {/* Single Base Header */}
          <View className="px-6 py-3 glass-extreme-dark items-center">
            <Text className="font-black text-xs uppercase tracking-[4px]" style={{ color: selectedConfig.color }}>
              Decimal → {selectedConfig.label}
            </Text>
          </View>
          <FlatList
            data={tableData}
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
