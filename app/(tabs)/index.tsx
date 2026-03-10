import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
  Platform,
  Keyboard,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { combinedSearch, SearchResult } from "@/lib/duckduckgo-search-service";
import { useHistory } from "@/lib/history-context";

export default function SearchScreen() {
  const colors = useColors();
  const { addSearchHistory } = useHistory();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  const inputRef = useRef<TextInput>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setSearched(true);

    try {
      const papers = await combinedSearch(query.trim());
      setResults(papers);

      addSearchHistory({
        query: query.trim(),
        resultsCount: papers.length,
      });
    } catch (e) {
      Alert.alert("Erro", "Não foi possível realizar a busca. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }, [query, addSearchHistory]);

  const openLink = useCallback((url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Erro", "Não foi possível abrir o link.");
    });
  }, []);

  const getSourceColor = (source: string) => {
    switch (source) {
      case "DuckDuckGo Web":
        return "#DE5833";
      case "DuckDuckGo News":
        return "#1E90FF";
      case "DuckDuckGo Images":
        return "#FF6B6B";
      default:
        return colors.primary;
    }
  };

  const renderResultCard = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => setSelectedResult(item)}
      activeOpacity={0.75}
    >
      {item.image && (
        <View style={styles.cardImage}>
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.primary + "20" }]}>
            <IconSymbol name="doc.fill" size={24} color={colors.primary} />
          </View>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.sourceBadge,
              { backgroundColor: getSourceColor(item.source) + "20" },
            ]}
          >
            <Text style={[styles.sourceText, { color: getSourceColor(item.source) }]}>
              {item.source}
            </Text>
          </View>
          {item.category && (
            <Text style={[styles.categoryText, { color: colors.muted }]}>{item.category}</Text>
          )}
        </View>

        <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={[styles.descriptionText, { color: colors.muted }]} numberOfLines={2}>
          {item.description}
        </Text>

        {item.date && (
          <Text style={[styles.dateText, { color: colors.muted }]}>{item.date}</Text>
        )}

        <View style={styles.cardFooter}>
          <Text style={[styles.linkText, { color: colors.primary }]}>Ver mais →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <IconSymbol name="magnifyingglass" size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Busca Universal</Text>
        </View>
        <Text style={[styles.headerSub, { color: colors.muted }]}>
          Pesquise qualquer coisa na internet
        </Text>

        {/* Search Bar */}
        <View style={[styles.searchRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Digite qualquer coisa..."
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                setResults([]);
                setSearched(false);
              }}
            >
              <IconSymbol name="xmark" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Button */}
        <TouchableOpacity
          style={[styles.searchBtn, { backgroundColor: colors.primary }]}
          onPress={handleSearch}
          disabled={loading || !query.trim()}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <IconSymbol name="magnifyingglass" size={16} color="#fff" />
              <Text style={styles.searchBtnText}>Buscar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Buscando na internet com DuckDuckGo...
          </Text>
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.centerContent}>
          <IconSymbol name="exclamationmark.triangle.fill" size={48} color={colors.warning} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nenhum resultado encontrado</Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Tente outro termo de busca.
          </Text>
        </View>
      ) : !searched ? (
        <View style={styles.centerContent}>
          <IconSymbol name="globe" size={64} color={colors.primary + "60"} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Busque qualquer coisa</Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Pesquise em toda a internet com DuckDuckGo.
          </Text>
          <View style={styles.suggestionsRow}>
            {["Python", "História do Brasil", "Astronomia", "Receitas"].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.suggestionChip, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}
                onPress={() => {
                  setQuery(s);
                }}
              >
                <Text style={[styles.suggestionText, { color: colors.primary }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderResultCard}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={[styles.resultsCount, { color: colors.muted }]}>
              {results.length} resultado{results.length !== 1 ? "s" : ""} para "{query}"
            </Text>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Result Detail Modal */}
      {selectedResult && (
        <Modal visible={!!selectedResult} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.detailModal, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {selectedResult.title}
                </Text>
                <TouchableOpacity onPress={() => setSelectedResult(null)}>
                  <IconSymbol name="xmark" size={24} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
                {/* Meta */}
                <View style={styles.metaRow}>
                  <View
                    style={[
                      styles.sourceBadge,
                      { backgroundColor: getSourceColor(selectedResult.source) + "20" },
                    ]}
                  >
                    <Text
                      style={[styles.sourceText, { color: getSourceColor(selectedResult.source) }]}
                    >
                      {selectedResult.source}
                    </Text>
                  </View>
                  {selectedResult.category && (
                    <Text style={[styles.categoryText, { color: colors.muted }]}>
                      {selectedResult.category}
                    </Text>
                  )}
                  {selectedResult.date && (
                    <Text style={[styles.dateText, { color: colors.muted }]}>{selectedResult.date}</Text>
                  )}
                </View>

                {/* Description */}
                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { color: colors.primary }]}>Descrição</Text>
                  <Text style={[styles.detailTextLarge, { color: colors.foreground }]}>
                    {selectedResult.description}
                  </Text>
                </View>

                {/* Link */}
                <View style={styles.detailSection}>
                  <TouchableOpacity
                    style={[styles.linkBtn, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}
                    onPress={() => openLink(selectedResult.url)}
                  >
                    <IconSymbol name="arrow.up.right.square" size={16} color={colors.primary} />
                    <Text style={[styles.linkBtnText, { color: colors.primary }]} numberOfLines={2}>
                      Abrir fonte
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  searchBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  suggestionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  resultsCount: {
    fontSize: 13,
    marginBottom: 8,
  },
  card: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
    flexDirection: "row",
    gap: 12,
  },
  cardImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: "700",
  },
  categoryText: {
    fontSize: 11,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },
  descriptionText: {
    fontSize: 12,
    lineHeight: 17,
  },
  dateText: {
    fontSize: 11,
  },
  cardFooter: {
    marginTop: 4,
  },
  linkText: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  detailModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "92%",
    flex: 1,
    marginTop: 60,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
    lineHeight: 23,
  },
  detailScroll: {
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  detailTextLarge: {
    fontSize: 15,
    lineHeight: 22,
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  linkBtnText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
});
