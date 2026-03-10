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
import { searchAcademicPapers, AcademicPaper, SearchFilters } from "@/lib/academic-search";
import { useHistory } from "@/lib/history-context";

const AREAS = [
  "Todas", "Biologia", "Química", "Física", "Medicina", "Farmácia",
  "Ecologia", "Genética", "Neurociência", "Biotecnologia", "Zoologia",
  "Botânica", "Microbiologia", "Bioquímica", "Engenharia",
];

const TYPES = ["Todos", "Artigo", "TCC", "Dissertação", "Tese", "Revisão"];
const LANGUAGES = ["Todos", "Português", "Inglês", "Espanhol"];

export default function SearchScreen() {
  const colors = useColors();
  const { addSearchHistory } = useHistory();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AcademicPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<AcademicPaper | null>(null);

  const [filters, setFilters] = useState<SearchFilters>({
    area: "Todas",
    type: "Todos",
    language: "Todos",
  });

  const inputRef = useRef<TextInput>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setSearched(true);

    try {
      const activeFilters: SearchFilters = {};
      if (filters.area && filters.area !== "Todas") activeFilters.area = filters.area;
      if (filters.type && filters.type !== "Todos") activeFilters.type = filters.type;
      if (filters.language && filters.language !== "Todos") activeFilters.language = filters.language;

      const papers = await searchAcademicPapers(query.trim(), activeFilters);
      setResults(papers);

      addSearchHistory({
        query: query.trim(),
        resultsCount: papers.length,
        filters: activeFilters,
      });
    } catch (e) {
      Alert.alert("Erro", "Não foi possível realizar a busca. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }, [query, filters, addSearchHistory]);

  const openLink = useCallback((url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Erro", "Não foi possível abrir o link.");
    });
  }, []);

  const renderPaperCard = useCallback(({ item }: { item: AcademicPaper }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => setSelectedPaper(item)}
      activeOpacity={0.75}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.sourceBadge, { backgroundColor: colors.primary + "20" }]}>
          <Text style={[styles.sourceText, { color: colors.primary }]}>{item.source}</Text>
        </View>
        {item.isOpenAccess && (
          <View style={[styles.openBadge, { backgroundColor: colors.success + "20" }]}>
            <Text style={[styles.openText, { color: colors.success }]}>Acesso Livre</Text>
          </View>
        )}
        {item.year && (
          <Text style={[styles.yearText, { color: colors.muted }]}>{item.year}</Text>
        )}
      </View>

      <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={3}>
        {item.title}
      </Text>

      {item.authors.length > 0 && (
        <Text style={[styles.authorsText, { color: colors.muted }]} numberOfLines={1}>
          {item.authors.slice(0, 3).join(", ")}
          {item.authors.length > 3 ? ` +${item.authors.length - 3}` : ""}
        </Text>
      )}

      {item.venue && (
        <Text style={[styles.venueText, { color: colors.primary }]} numberOfLines={1}>
          {item.venue}
        </Text>
      )}

      <Text style={[styles.abstractText, { color: colors.muted }]} numberOfLines={3}>
        {item.abstract}
      </Text>

      <View style={styles.cardFooter}>
        {item.citationCount !== undefined && item.citationCount > 0 && (
          <Text style={[styles.citationText, { color: colors.muted }]}>
            {item.citationCount} citações
          </Text>
        )}
        <Text style={[styles.linksCount, { color: colors.primary }]}>
          {item.links.length} link{item.links.length !== 1 ? "s" : ""} • Ver mais →
        </Text>
      </View>
    </TouchableOpacity>
  ), [colors]);

  const renderFilterChips = (options: string[], selected: string, onSelect: (v: string) => void) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[
            styles.chip,
            {
              backgroundColor: selected === opt ? colors.primary : colors.surface,
              borderColor: selected === opt ? colors.primary : colors.border,
            },
          ]}
          onPress={() => onSelect(opt)}
        >
          <Text style={[styles.chipText, { color: selected === opt ? "#fff" : colors.foreground }]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <IconSymbol name="graduationcap.fill" size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>AcadêmicoSearch</Text>
        </View>
        <Text style={[styles.headerSub, { color: colors.muted }]}>
          Artigos científicos certificados para TCC
        </Text>

        {/* Search Bar */}
        <View style={[styles.searchRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Pesquisar artigos científicos..."
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(""); setResults([]); setSearched(false); }}>
              <IconSymbol name="xmark" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.filterBtn, { borderColor: colors.border }]}
            onPress={() => setShowFilters(true)}
          >
            <IconSymbol name="slider.horizontal.3" size={16} color={colors.primary} />
            <Text style={[styles.filterBtnText, { color: colors.primary }]}>Filtros</Text>
          </TouchableOpacity>

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
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Buscando em Semantic Scholar, CrossRef e PubMed...
          </Text>
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.centerContent}>
          <IconSymbol name="exclamationmark.triangle.fill" size={48} color={colors.warning} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nenhum resultado encontrado</Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Tente termos mais específicos ou ajuste os filtros.
          </Text>
        </View>
      ) : !searched ? (
        <View style={styles.centerContent}>
          <IconSymbol name="doc.text.magnifyingglass" size={64} color={colors.primary + "60"} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Busque artigos científicos</Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Pesquise em bases como Semantic Scholar, CrossRef e PubMed. Resultados filtrados por relevância ao assunto.
          </Text>
          <View style={styles.suggestionsRow}>
            {["fotossíntese", "CRISPR", "neurônios", "DNA recombinante"].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.suggestionChip, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}
                onPress={() => { setQuery(s); }}
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
          renderItem={renderPaperCard}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={[styles.resultsCount, { color: colors.muted }]}>
              {results.length} resultado{results.length !== 1 ? "s" : ""} para "{query}"
            </Text>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filters Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Filtros de Busca</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={[styles.filterLabel, { color: colors.muted }]}>ÁREA DO CONHECIMENTO</Text>
              {renderFilterChips(AREAS, filters.area || "Todas", (v) => setFilters((f) => ({ ...f, area: v })))}

              <Text style={[styles.filterLabel, { color: colors.muted }]}>TIPO DE TRABALHO</Text>
              {renderFilterChips(TYPES, filters.type || "Todos", (v) => setFilters((f) => ({ ...f, type: v })))}

              <Text style={[styles.filterLabel, { color: colors.muted }]}>IDIOMA</Text>
              {renderFilterChips(LANGUAGES, filters.language || "Todos", (v) => setFilters((f) => ({ ...f, language: v })))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: colors.primary }]}
              onPress={() => { setShowFilters(false); if (query.trim()) handleSearch(); }}
            >
              <Text style={styles.applyBtnText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Paper Detail Modal */}
      {selectedPaper && (
        <Modal visible={!!selectedPaper} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.detailModal, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {selectedPaper.title}
                </Text>
                <TouchableOpacity onPress={() => setSelectedPaper(null)}>
                  <IconSymbol name="xmark" size={24} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
                {/* Meta */}
                <View style={styles.metaRow}>
                  <View style={[styles.sourceBadge, { backgroundColor: colors.primary + "20" }]}>
                    <Text style={[styles.sourceText, { color: colors.primary }]}>{selectedPaper.source}</Text>
                  </View>
                  {selectedPaper.year && (
                    <Text style={[styles.yearText, { color: colors.muted }]}>{selectedPaper.year}</Text>
                  )}
                  {selectedPaper.isOpenAccess && (
                    <View style={[styles.openBadge, { backgroundColor: colors.success + "20" }]}>
                      <Text style={[styles.openText, { color: colors.success }]}>Acesso Livre</Text>
                    </View>
                  )}
                </View>

                {/* Authors */}
                {selectedPaper.authors.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailSectionTitle, { color: colors.primary }]}>Autores</Text>
                    <Text style={[styles.detailText, { color: colors.foreground }]}>
                      {selectedPaper.authors.join(", ")}
                    </Text>
                  </View>
                )}

                {/* Venue */}
                {selectedPaper.venue && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailSectionTitle, { color: colors.primary }]}>Publicado em</Text>
                    <Text style={[styles.detailText, { color: colors.foreground }]}>{selectedPaper.venue}</Text>
                  </View>
                )}

                {/* Fields */}
                {selectedPaper.fields && selectedPaper.fields.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailSectionTitle, { color: colors.primary }]}>Áreas</Text>
                    <Text style={[styles.detailText, { color: colors.foreground }]}>
                      {selectedPaper.fields.join(" • ")}
                    </Text>
                  </View>
                )}

                {/* Abstract */}
                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { color: colors.primary }]}>Resumo</Text>
                  <Text style={[styles.abstractFull, { color: colors.foreground }]}>
                    {selectedPaper.abstract}
                  </Text>
                </View>

                {/* DOI */}
                {selectedPaper.doi && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailSectionTitle, { color: colors.primary }]}>DOI</Text>
                    <Text style={[styles.detailText, { color: colors.muted }]}>{selectedPaper.doi}</Text>
                  </View>
                )}

                {/* Citations */}
                {selectedPaper.citationCount !== undefined && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailSectionTitle, { color: colors.primary }]}>Citações</Text>
                    <Text style={[styles.detailText, { color: colors.foreground }]}>
                      {selectedPaper.citationCount} citações
                    </Text>
                  </View>
                )}

                {/* Links */}
                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { color: colors.primary }]}>
                    Links Fonte ({selectedPaper.links.length})
                  </Text>
                  {selectedPaper.links.map((link, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.linkBtn, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}
                      onPress={() => openLink(link)}
                    >
                      <IconSymbol name="arrow.up.right.square" size={16} color={colors.primary} />
                      <Text style={[styles.linkText, { color: colors.primary }]} numberOfLines={2}>
                        {link}
                      </Text>
                    </TouchableOpacity>
                  ))}
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
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  searchBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
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
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
    gap: 6,
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
  openBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  openText: {
    fontSize: 11,
    fontWeight: "600",
  },
  yearText: {
    fontSize: 12,
    marginLeft: "auto",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },
  authorsText: {
    fontSize: 12,
    lineHeight: 17,
  },
  venueText: {
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 17,
  },
  abstractText: {
    fontSize: 13,
    lineHeight: 19,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  citationText: {
    fontSize: 11,
  },
  linksCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
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
  filterLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  chipsScroll: {
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  applyBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  applyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
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
  detailText: {
    fontSize: 14,
    lineHeight: 20,
  },
  abstractFull: {
    fontSize: 14,
    lineHeight: 22,
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  linkText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
