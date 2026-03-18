import { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  Linking,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";

import { useRouter } from "expo-router";
import { searchInternet, type SearchResult } from "@/lib/internet-search-service";
import { shareResult } from "@/lib/sharing-service";
import { generateAIResponse } from "@/lib/ollama-service";
import { generateAcademicReport, extractNumericData } from "@/lib/report-service";
import { DataTable } from "@/components/ui/data-table";
import { Ionicons } from "@expo/vector-icons";
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  Layout, 
  SlideInRight,
  ZoomIn
} from "react-native-reanimated";

export default function SearchScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const colors = useColors();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<"web" | "news" | "images">("web");
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "table">("list");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && user === null) {
      // Only redirect if we're sure user is not authenticated (not just loading)
      const timer = setTimeout(() => {
        router.replace("/login");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user]);

  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert("Error", "Please enter a search term");
      return;
    }

    setIsLoading(true);
    setAiResponse(null);
    try {
      const response = await searchInternet(query, searchType);
      setResults(response.results);

      if (response.results.length === 0) {
        Alert.alert("No Results", `No ${searchType} results found for "${query}"`);
      } else if (isAiEnabled && searchType === "web") {
        // Run AI generation concurrently or after results
        handleAiGeneration(query, response.results);
      }
    } catch (error: any) {
      Alert.alert("Search Error", error.message || "Failed to search");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiGeneration = async (query: string, searchResults: SearchResult[]) => {
    setIsAiLoading(true);
    try {
      const context = searchResults
        .slice(0, 5)
        .map((r) => `${r.title}: ${r.description}`)
        .join("\n\n");
      const response = await generateAIResponse(query, context);
      setAiResponse(response);
    } catch (error: any) {
      console.error("AI Error:", error);
      setAiResponse("Erro ao gerar resposta da IA. Verifique se o Ollama está rodando localmente.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (results.length === 0) return;
    setIsReportLoading(true);
    setReport(null);
    try {
      const resp = await generateAcademicReport(query, results);
      setReport(resp);
    } catch (error) {
      Alert.alert("Erro", "Falha ao gerar relatório acadêmico.");
    } finally {
      setIsReportLoading(false);
    }
  };

  const handleShare = async (result: SearchResult) => {
    try {
      await shareResult({
        title: result.title,
        description: result.description,
        url: result.url,
        source: result.source,
      });
    } catch (error) {
      Alert.alert("Share Error", "Failed to share result");
    }
  };

  const handleOpenUrl = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Failed to open URL");
    });
  };

  // Show loading while checking auth
  if (user === null && !isAuthenticated) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
        <View className="gap-6 mt-4 pb-24">
          
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(200).duration(800)}>
            <View className="items-center mb-2">
              <Text
                className="text-5xl font-black tracking-tighter"
                style={{ color: colors.foreground }}
              >
                Nexus<Text style={{ color: colors.primary }}>Search</Text>
              </Text>
              <Text className="text-sm font-bold mt-2 uppercase tracking-widest" style={{ color: colors.muted }}>
                Intelligent Academic Retrieval
              </Text>
            </View>
          </Animated.View>

          {/* Search Input Area (Extreme Glassmorphism) */}
          <Animated.View 
            entering={FadeInDown.delay(400).duration(800)}
            className="p-6 rounded-[40px] glass-extreme border-2 shadow-2xl" 
            style={{ borderColor: colors.primary + '30' }}
          >
            <View className="relative mb-6">
              <View className="absolute left-4 top-4 z-10">
                <Ionicons name="search" size={24} color={colors.primary} />
              </View>
              <TextInput
                className="text-xl p-6 pl-14 rounded-3xl bg-white/40 dark:bg-black/40 font-black border-2"
                style={{
                  color: colors.foreground,
                  borderColor: colors.border,
                }}
                placeholder="Explorar conhecimento..."
                placeholderTextColor={colors.muted}
                value={query}
                onChangeText={setQuery}
                editable={!isLoading}
                onSubmitEditing={handleSearch}
              />
            </View>

            {/* Search Type Tabs - Premium Horizontal Scroll */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
              <View className="flex-row gap-3 py-1">
                {(["web", "academic", "pdf", "image"] as const).map((type) => {
                  const isActive = searchType === (type as any);
                  return (
                    <TouchableOpacity
                      key={type}
                      className={`px-6 py-3 rounded-2xl border-2 flex-row items-center gap-2 ${isActive ? 'shadow-lg' : ''}`}
                      style={{
                        backgroundColor: isActive ? colors.primary : colors.surface + '80',
                        borderColor: isActive ? colors.primary : colors.border,
                        shadowColor: colors.primary,
                      }}
                      onPress={() => setSearchType(type as any)}
                      disabled={isLoading}
                    >
                      <Ionicons 
                        name={type === 'web' ? 'globe' : type === 'academic' ? 'school' : type === 'pdf' ? 'document' : 'image'} 
                        size={18} 
                        color={isActive ? "#FFFFFF" : colors.primary} 
                      />
                      <Text
                        className="text-xs font-black uppercase tracking-widest"
                        style={{ color: isActive ? "#FFFFFF" : colors.foreground }}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Search Button & AI Toggle */}
            <View className="flex-row gap-4">
              <TouchableOpacity
                className="flex-[3] rounded-full p-5 items-center justify-center shadow-2xl flex-row gap-3"
                style={{ 
                  backgroundColor: colors.accent, 
                  shadowColor: colors.accent, 
                  shadowOpacity: 0.4, 
                  shadowRadius: 15, 
                  shadowOffset: { width: 0, height: 10 } 
                }}
                onPress={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text className="font-black text-lg tracking-wider text-white uppercase">
                      Pesquisar
                    </Text>
                    <Ionicons name="rocket" size={24} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 rounded-[30px] p-4 items-center justify-center border-2 ${isAiEnabled ? 'shadow-lg' : ''}`}
                style={{
                  backgroundColor: isAiEnabled ? colors.primary + '20' : 'transparent',
                  borderColor: isAiEnabled ? colors.primary : colors.border,
                }}
                onPress={() => setIsAiEnabled(!isAiEnabled)}
              >
                <Ionicons 
                  name={isAiEnabled ? "sparkles" : "sparkles-outline"} 
                  size={24} 
                  color={isAiEnabled ? colors.primary : colors.muted} 
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* AI Response Section */}
          {(isAiLoading || aiResponse) && (
            <Animated.View 
              entering={ZoomIn.duration(600)}
              className="p-8 rounded-[40px] glass-extreme border-2"
              style={{ borderColor: colors.accent + '40' }}
            >
              <View className="flex-row items-center gap-3 mb-4">
                <View className="p-3 rounded-2xl" style={{ backgroundColor: colors.accent + '20' }}>
                  <Ionicons name="bulb" size={24} color={colors.accent} />
                </View>
                <Text className="text-xl font-black tracking-tighter" style={{ color: colors.foreground }}>
                  Insight Estratégico
                </Text>
                {isAiLoading && <ActivityIndicator size="small" color={colors.accent} className="ml-auto" />}
              </View>
              {aiResponse ? (
                <Text className="text-lg leading-relaxed font-semibold italic opacity-90" style={{ color: colors.foreground }}>
                  "{aiResponse}"
                </Text>
              ) : (
                <Text className="text-base font-medium opacity-60" style={{ color: colors.foreground }}>
                  Nexus AI está sintetizando as evidências...
                </Text>
              )}
            </Animated.View>
          )}

          {/* Action Row */}
          {results.length > 0 && (
            <Animated.View entering={FadeInUp} className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-3 p-5 rounded-[28px] glass-extreme border-2"
                style={{ borderColor: colors.primary + '30' }}
                onPress={() => setViewMode(viewMode === "list" ? "table" : "list")}
              >
                <Ionicons name={viewMode === "list" ? "grid" : "list"} size={22} color={colors.primary} />
                <Text className="text-xs font-black uppercase tracking-widest" style={{ color: colors.primary }}>
                  {viewMode === "list" ? "Modo Tabela" : "Modo Lista"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-[1.5] flex-row items-center justify-center gap-3 p-5 rounded-[28px] shadow-2xl"
                style={{ backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.4 }}
                onPress={handleGenerateReport}
                disabled={isReportLoading}
              >
                {isReportLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="analytics" size={22} color="#FFFFFF" />
                    <Text className="text-xs font-black text-white uppercase tracking-widest">
                      Gerar Relatório
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Results Display */}
          <View className="gap-6">
            {viewMode === "table" && results.length > 0 && (
              <Animated.View entering={FadeInDown} className="rounded-[40px] overflow-hidden glass-extreme-dark border-2" style={{ borderColor: colors.border }}>
                <DataTable data={extractNumericData(results)} />
              </Animated.View>
            )}

            {viewMode === "list" && results.length > 0 && (
              <>
                <Text className="text-sm font-black uppercase tracking-[4px] pl-4 mb-2" style={{ color: colors.primary }}>
                  Conhecimento Mapeado
                </Text>

                {results.map((item, index) => (
                  <Animated.View key={index} entering={FadeInDown.delay(index * 100).duration(600)}>
                    <TouchableOpacity
                      className="p-8 rounded-[40px] card-premium border-2 relative overflow-hidden"
                      style={{ borderColor: colors.border }}
                      onPress={() => handleOpenUrl(item.url)}
                    >
                      {/* Decorative Accent */}
                      <View className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full" style={{ backgroundColor: colors.primary + '08' }} />
                      
                      <View className="flex-row items-center gap-2 mb-4">
                        <View className="px-3 py-1 rounded-full border" style={{ borderColor: colors.success + '40', backgroundColor: colors.success + '10' }}>
                          <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.success }}>Verified</Text>
                        </View>
                        <Text className="text-[10px] font-bold opacity-50 flex-1" style={{ color: colors.muted }} numberOfLines={1}>
                          {item.source}
                        </Text>
                      </View>

                      <Text
                        className="font-black text-2xl mb-3 leading-tight tracking-tight"
                        style={{ color: colors.foreground }}
                      >
                        {item.title}
                      </Text>
                      <Text
                        className="text-base mb-6 leading-relaxed font-medium opacity-70"
                        style={{ color: colors.foreground }}
                        numberOfLines={4}
                      >
                        {item.description}
                      </Text>

                      <View className="flex-row justify-between items-center mt-auto">
                        <View className="flex-row items-center gap-2">
                          <Ionicons name="link" size={14} color={colors.primary} />
                          <Text className="text-[10px] font-black uppercase tracking-widest opacity-40 max-w-[150px]" style={{ color: colors.muted }} numberOfLines={1}>
                            {item.url}
                          </Text>
                        </View>
                        
                        <TouchableOpacity
                          className="w-12 h-12 rounded-2xl items-center justify-center glass-extreme-dark"
                          onPress={() => handleShare(item)}
                        >
                          <Ionicons name="share-social" size={20} color={colors.accent} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </>
            )}
          </View>

          {/* Empty States */}
          {!isLoading && results.length === 0 && query && (
            <Animated.View entering={FadeInDown} className="items-center py-24 glass-extreme rounded-[50px]">
              <Ionicons name="rocket-outline" size={80} color={colors.muted} className="mb-6 opacity-30" />
              <Text className="font-black text-2xl tracking-tight" style={{ color: colors.muted }}>Nenhuma órbita encontrada</Text>
              <Text className="font-medium mt-2 opacity-50" style={{ color: colors.muted }}>Tente refinar seus parâmetros de busca</Text>
            </Animated.View>
          )}

          {!isLoading && results.length === 0 && !query && (
            <Animated.View entering={ZoomIn.delay(600)} className="items-center py-20 gap-6">
              <View className="w-40 h-40 rounded-full items-center justify-center glass-extreme border-4 shadow-2xl" style={{ borderColor: colors.primary + '20' }}>
                <Ionicons name="planet" size={80} color={colors.primary} />
              </View>
              <View className="items-center">
                <Text className="font-black text-3xl tracking-tighter" style={{ color: colors.foreground }}>Oceanos de Dados</Text>
                <Text className="text-center px-12 mt-3 font-semibold leading-relaxed" style={{ color: colors.muted }}>
                  Inicie sua exploração acadêmica com a inteligência multivariada Nexus.
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
