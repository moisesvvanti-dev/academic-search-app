import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { searchInternet, type SearchResult } from "@/lib/internet-search-service";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";

export default function NewsScreen() {
  const colors = useColors();
  const [news, setNews] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [category, setCategory] = useState("G1 Notícias");

  const categories = ["G1 Notícias", "Tecnologia", "Ciência", "Brasil", "Mundo", "Economia"];

  const fetchNews = async (searchQuery: string, refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const response = await searchInternet(searchQuery, "news");
      setNews(response.results);
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível carregar as notícias mais recentes.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews(category);
  }, [category]);

  const handleOpenInAppBrowser = async (url: string) => {
    try {
      if (!url) {
        Alert.alert("Erro", "URL inválida");
        return;
      }
      await WebBrowser.openBrowserAsync(url, {
        toolbarColor: colors.background,
        controlsColor: colors.primary,
        enableBarCollapsing: true,
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível abrir a página.");
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      <View className="flex-1 px-4 pt-6">
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(200).duration(800)} className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-4xl font-black tracking-tighter" style={{ color: colors.foreground }}>
                Nexus<Text style={{ color: colors.primary }}>News</Text>
              </Text>
              <Text className="text-sm font-bold mt-1 uppercase tracking-widest" style={{ color: colors.muted }}>
                Radar de Informações Globais
              </Text>
            </View>
            <View className="w-14 h-14 rounded-full items-center justify-center glass-extreme border-2 shadow-xl" style={{ borderColor: colors.primary + '30', backgroundColor: colors.surface }}>
              <Ionicons name="newspaper" size={24} color={colors.primary} />
            </View>
          </View>

          {/* Categories Horizontal Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
            <View className="flex-row gap-3">
              {categories.map((cat, idx) => {
                const isActive = category === cat;
                return (
                  <TouchableOpacity
                    key={idx}
                    className={`px-6 py-3 rounded-full border-2 ${isActive ? 'shadow-lg' : ''}`}
                    style={{
                      backgroundColor: isActive ? colors.primary : colors.surface + '80',
                      borderColor: isActive ? colors.primary : colors.border,
                      shadowColor: colors.primary,
                    }}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      className="text-xs font-black uppercase tracking-widest"
                      style={{ color: isActive ? "#FFFFFF" : colors.foreground }}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </Animated.View>

        {/* News List */}
        {isLoading && !isRefreshing ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="mt-4 font-bold" style={{ color: colors.muted }}>Buscando manchetes pelo mundo...</Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchNews(category, true)}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          >
            {news.length === 0 ? (
              <Animated.View entering={ZoomIn} className="items-center py-20 px-6">
                <Ionicons name="search-outline" size={64} color={colors.muted} className="opacity-40 mb-4" />
                <Text className="text-2xl font-black text-center mb-2" style={{ color: colors.foreground }}>Nada encontrado</Text>
                <Text className="text-center font-semibold" style={{ color: colors.muted }}>
                  Desculpe, não conseguimos encontrar notícias para "{category}" neste momento.
                </Text>
              </Animated.View>
            ) : (
              news.map((item, index) => (
                <Animated.View key={item.id || index} entering={FadeInUp.delay(index * 100).duration(500)}>
                  <TouchableOpacity
                    className="mb-5 p-6 rounded-[35px] border-2 glass-extreme shadow-sm overflow-hidden"
                    style={{ borderColor: colors.border }}
                    onPress={() => handleOpenInAppBrowser(item.url)}
                  >
                    <View className="flex-row items-center gap-2 mb-3">
                      <View className="px-3 py-1.5 rounded-full border bg-primary/10" style={{ borderColor: colors.primary + '40', backgroundColor: colors.primary + '15' }}>
                        <Text className="text-[10px] font-black uppercase tracking-wider" style={{ color: colors.primary }}>
                          {item.source || "Fonte Global"}
                        </Text>
                      </View>
                      {item.date && (
                        <Text className="text-[10px] font-bold opacity-60" style={{ color: colors.muted }}>
                          {item.date}
                        </Text>
                      )}
                    </View>
                    
                    <Text className="text-xl font-black mb-3 leading-tight" style={{ color: colors.foreground }}>
                      {item.title}
                    </Text>
                    
                    <Text className="text-sm font-medium leading-relaxed opacity-75 mb-4" style={{ color: colors.foreground }} numberOfLines={3}>
                      {item.description}
                    </Text>

                    <View className="flex-row items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: colors.border + '50' }}>
                      <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.accent }}>
                        Ler mais in-app
                      </Text>
                      <View className="w-8 h-8 rounded-full items-center justify-center bg-accent/20" style={{ backgroundColor: colors.accent + '20' }}>
                        <Ionicons name="arrow-forward" size={16} color={colors.accent} />
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </ScreenContainer>
  );
}
