import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useHistory, SearchHistoryItem, CalcHistoryItem } from "@/lib/history-context";

type Tab = "search" | "calc";

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora mesmo";
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays} dia${diffDays > 1 ? "s" : ""} atrás`;

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function HistoryScreen() {
  const colors = useColors();
  const { searchHistory, calcHistory, clearSearchHistory, clearCalcHistory, clearAll } = useHistory();
  const [activeTab, setActiveTab] = useState<Tab>("search");

  const handleClear = () => {
    Alert.alert(
      "Limpar Histórico",
      activeTab === "search"
        ? "Deseja limpar todo o histórico de buscas?"
        : "Deseja limpar todo o histórico de cálculos?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar",
          style: "destructive",
          onPress: () => {
            if (activeTab === "search") clearSearchHistory();
            else clearCalcHistory();
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Limpar Tudo",
      "Deseja limpar todo o histórico (buscas e cálculos)?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Limpar Tudo", style: "destructive", onPress: clearAll },
      ]
    );
  };

  const renderSearchItem = ({ item }: { item: SearchHistoryItem }) => (
    <View style={[styles.historyItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.iconBox, { backgroundColor: colors.primary + "15" }]}>
        <IconSymbol name="magnifyingglass" size={18} color={colors.primary} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={2}>
          {item.query}
        </Text>
        <View style={styles.itemMeta}>
          <Text style={[styles.itemMetaText, { color: colors.muted }]}>
            {item.resultsCount} resultado{item.resultsCount !== 1 ? "s" : ""}
          </Text>
          {item.filters?.area && item.filters.area !== "Todas" && (
            <View style={[styles.filterTag, { backgroundColor: colors.primary + "15" }]}>
              <Text style={[styles.filterTagText, { color: colors.primary }]}>{item.filters.area}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.itemDate, { color: colors.muted }]}>{formatDate(item.timestamp)}</Text>
      </View>
    </View>
  );

  const renderCalcItem = ({ item }: { item: CalcHistoryItem }) => (
    <View style={[styles.historyItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.iconBox, { backgroundColor: "#6A1B9A15" }]}>
        <IconSymbol name="function" size={18} color="#6A1B9A" />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemExpression, { color: colors.foreground }]} numberOfLines={1}>
          {item.expression}
        </Text>
        <Text style={[styles.itemResult, { color: colors.primary }]}>= {item.result}</Text>
        <Text style={[styles.itemDate, { color: colors.muted }]}>{formatDate(item.timestamp)}</Text>
      </View>
    </View>
  );

  const currentData = activeTab === "search" ? searchHistory : calcHistory;
  const isEmpty = currentData.length === 0;

  return (
    <ScreenContainer scrollable className="p-6">
      <View className="flex-row items-center justify-between mb-8 mt-4">
        <View>
          <Text className="text-3xl font-bold tracking-tight" style={{ color: colors.foreground }}>
            Atividade
          </Text>
          <Text className="text-sm mt-1" style={{ color: colors.muted }}>
            Seu histórico de pesquisas e cálculos
          </Text>
        </View>
        <View className="flex-row gap-2">
          {!isEmpty && (
            <TouchableOpacity 
              className="p-3 rounded-2xl border" 
              style={{ backgroundColor: colors.surface, borderColor: colors.error + '40' }}
              onPress={handleClear} 
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Modern Tabs */}
      <View 
        className="flex-row p-1 rounded-2xl mb-8" 
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      >
        <TouchableOpacity
          className="flex-1 py-3 items-center rounded-xl flex-row justify-center gap-2"
          style={activeTab === "search" ? { backgroundColor: colors.primary } : {}}
          onPress={() => setActiveTab("search")}
        >
          <Ionicons name="search" size={16} color={activeTab === "search" ? "#fff" : colors.muted} />
          <Text className="font-bold text-xs uppercase tracking-widest" style={{ color: activeTab === "search" ? "#fff" : colors.muted }}>
            Buscas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 py-3 items-center rounded-xl flex-row justify-center gap-2"
          style={activeTab === "calc" ? { backgroundColor: colors.primary } : {}}
          onPress={() => setActiveTab("calc")}
        >
          <Ionicons name="calculator" size={16} color={activeTab === "calc" ? "#fff" : colors.muted} />
          <Text className="font-bold text-xs uppercase tracking-widest" style={{ color: activeTab === "calc" ? "#fff" : colors.muted }}>
            Cálculos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      {isEmpty ? (
        <View className="flex-1 items-center justify-center py-20 opacity-50">
          <Ionicons 
            name={activeTab === "search" ? "search-outline" : "calculator-outline"} 
            size={80} 
            color={colors.muted} 
          />
          <Text className="mt-4 text-center font-medium" style={{ color: colors.muted }}>
            {activeTab === "search" ? "Nenhuma busca recente." : "Nenhum cálculo recente."}
          </Text>
        </View>
      ) : (
        <View className="gap-4">
          {currentData.map((item: any) => (
            <View
              key={item.id}
              className="p-5 rounded-3xl border"
              style={{ 
                borderColor: colors.border, 
                backgroundColor: colors.surface,
              }}
            >
              <View className="flex-row items-center mb-3">
                <View 
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3" 
                  style={{ backgroundColor: colors.primary + '15' }}
                >
                  <Ionicons 
                    name={activeTab === "search" ? "search" : "calculator"} 
                    size={18} 
                    color={colors.primary} 
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-sm" style={{ color: colors.foreground }} numberOfLines={1}>
                    {activeTab === "search" ? item.query : item.expression}
                  </Text>
                  <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.muted }}>
                    {formatDate(item.timestamp)}
                  </Text>
                </View>
              </View>
              {activeTab === "calc" && (
                <Text className="text-xl font-bold" style={{ color: colors.primary }}>
                  = {item.result}
                </Text>
              )}
              {activeTab === "search" && (
                <View className="flex-row items-center">
                  <Text className="text-xs font-medium" style={{ color: colors.muted }}>
                    {item.resultsCount} resultados encontrados
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  clearAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: "600",
  },
  tabRow: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  listHeader: {
    fontSize: 13,
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
    gap: 3,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  itemExpression: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  itemResult: {
    fontSize: 16,
    fontWeight: "700",
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemMetaText: {
    fontSize: 12,
  },
  filterTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  filterTagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  itemDate: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
