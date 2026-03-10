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

export default function SearchScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const colors = useColors();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<"web" | "news" | "images">("web");

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
    try {
      const response = await searchInternet(query, searchType);
      setResults(response.results);

      if (response.results.length === 0) {
        Alert.alert("No Results", `No ${searchType} results found for "${query}"`);
      }
    } catch (error: any) {
      Alert.alert("Search Error", error.message || "Failed to search");
    } finally {
      setIsLoading(false);
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
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="items-center gap-1 mb-2">
            <Text
              className="text-2xl font-bold"
              style={{ color: colors.foreground }}
            >
              AcadêmicoSearch
            </Text>
            <Text className="text-xs" style={{ color: colors.muted }}>
              Welcome, {user?.email}
            </Text>
          </View>

          {/* Search Input */}
          <View className="gap-2">
            <TextInput
              className="border rounded-lg p-3"
              style={{
                borderColor: colors.border,
                color: colors.foreground,
                backgroundColor: colors.surface,
              }}
              placeholder="Search the internet..."
              placeholderTextColor={colors.muted}
              value={query}
              onChangeText={setQuery}
              editable={!isLoading}
            />

            {/* Search Type Tabs */}
            <View className="flex-row gap-2">
              {(["web", "news", "images"] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  className="flex-1 p-2 rounded-lg items-center"
                  style={{
                    backgroundColor:
                      searchType === type ? colors.primary : colors.surface,
                  }}
                  onPress={() => setSearchType(type)}
                  disabled={isLoading}
                >
                  <Text
                    className="text-sm font-semibold capitalize"
                    style={{
                      color:
                        searchType === type ? colors.background : colors.foreground,
                    }}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Search Button */}
            <TouchableOpacity
              className="rounded-lg p-3 items-center"
              style={{ backgroundColor: colors.primary }}
              onPress={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text
                  className="font-semibold"
                  style={{ color: colors.background }}
                >
                  Search
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Results */}
          {results.length > 0 && (
            <View className="gap-2">
              <Text
                className="text-sm font-semibold"
                style={{ color: colors.foreground }}
              >
                Results ({results.length})
              </Text>

              <FlatList
                scrollEnabled={false}
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="border rounded-lg p-3 mb-2"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    }}
                    onPress={() => handleOpenUrl(item.url)}
                  >
                    <Text
                      className="font-semibold text-sm mb-1"
                      style={{ color: colors.primary }}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    <Text
                      className="text-xs mb-2"
                      style={{ color: colors.muted }}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                    <View className="flex-row justify-between items-center">
                      <Text
                        className="text-xs"
                        style={{ color: colors.muted }}
                        numberOfLines={1}
                      >
                        {item.source}
                      </Text>
                      <TouchableOpacity
                        className="px-2 py-1 rounded"
                        style={{ backgroundColor: colors.primary }}
                        onPress={() => handleShare(item)}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: colors.background }}
                        >
                          Share
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* Empty State */}
          {!isLoading && results.length === 0 && query && (
            <View className="items-center py-8">
              <Text style={{ color: colors.muted }}>No results found</Text>
            </View>
          )}

          {!isLoading && results.length === 0 && !query && (
            <View className="items-center py-8 gap-2">
              <Text
                className="font-semibold"
                style={{ color: colors.foreground }}
              >
                Start Searching
              </Text>
              <Text style={{ color: colors.muted }}>
                Enter a search term to find results across the internet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
