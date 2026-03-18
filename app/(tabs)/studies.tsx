import { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp, ZoomIn, Layout } from "react-native-reanimated";

// Hardcoded Free Educational Resources
const EDUCATIONAL_CATEGORIES = [
  {
    id: "math",
    name: "Matemática",
    icon: "calculator",
    items: [
      { id: "m1", title: "Cálculo Volume 1", desc: "Stewart, 7ª Edição", url: "https://minhateca.com.br/calculo" },
      { id: "m2", title: "Álgebra Linear", desc: "Boldrini, 3ª Edição", url: "https://minhateca.com.br/algebra" },
    ]
  },
  {
    id: "prog",
    name: "Programação",
    icon: "code-slash",
    items: [
      { id: "p1", title: "Estruturas de Dados e Algoritmos", desc: "Aprenda a base com exemplos práticos", url: "https://github.com/EbookFoundation/free-programming-books" },
      { id: "p2", title: "Clean Code", desc: "Habilidades Ágeis de Software", url: "https://github.com/jnguyendev/clean-code-javascript" },
    ]
  },
  {
    id: "ads",
    name: "ADS",
    icon: "laptop",
    items: [
      { id: "a1", title: "Engenharia de Software", desc: "Sommerville, 9ª Edição", url: "https://engenhariadesoftware.com" },
      { id: "a2", title: "Banco de Dados: Projetos e Implementação", desc: "Modelagem Relacional", url: "https://bancodedados.com" },
    ]
  },
  {
    id: "rob",
    name: "Robótica",
    icon: "hardware-chip",
    items: [
      { id: "r1", title: "Introdução à Robótica", desc: "Mecânica e Controle", url: "https://robotica.org" },
      { id: "r2", title: "Sistemas Embarcados com Arduino", desc: "Projetos práticos gratuitos", url: "https://arduino.cc" },
    ]
  },
  {
    id: "elec",
    name: "Elétrica",
    icon: "flash",
    items: [
      { id: "e1", title: "Fundamentos de Circuitos Elétricos", desc: "Sadiku, 5ª Edição", url: "https://circuitoseletricos.com" },
      { id: "e2", title: "Eletrônica Analógica", desc: "Circuitos e Aplicações", url: "https://eletronica.org" },
    ]
  }
];

export default function StudiesScreen() {
  const colors = useColors();
  const [activeCategory, setActiveCategory] = useState(EDUCATIONAL_CATEGORIES[0].id);

  const handleOpenFile = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Aviso", "Este link de simulação não pode ser aberto diretamente.");
    });
  };

  const activeContent = EDUCATIONAL_CATEGORIES.find(c => c.id === activeCategory)?.items || [];

  return (
    <ScreenContainer scrollable={false}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
        <View className="gap-6 mt-4 pb-20">
          
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(200).duration(800)}>
            <View className="mb-2">
              <Text className="text-5xl font-black tracking-tighter" style={{ color: colors.foreground }}>
                Nexus<Text style={{ color: colors.primary }}>Academia</Text>
              </Text>
              <Text className="text-base font-bold mt-3 leading-relaxed opacity-80" style={{ color: colors.foreground }}>
                Explore uma biblioteca infinita de conhecimento{" "}
                <Text style={{ color: colors.accent }} className="font-black italic">Open Source</Text>.
              </Text>
            </View>
          </Animated.View>

          {/* Categories Horizontal Scroll */}
          <Animated.View entering={FadeInDown.delay(400).duration(800)}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
              <View className="flex-row gap-3">
                {EDUCATIONAL_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      className={`flex-row items-center gap-3 px-6 py-4 rounded-[24px] border-2 ${isActive ? 'shadow-2xl' : ''}`}
                      style={{
                        backgroundColor: isActive ? colors.primary : colors.surface + '80',
                        borderColor: isActive ? colors.primary : colors.border,
                        shadowColor: colors.primary,
                        shadowOpacity: isActive ? 0.3 : 0,
                        shadowRadius: 10,
                      }}
                      onPress={() => setActiveCategory(cat.id)}
                    >
                      <Ionicons 
                        name={cat.icon as any} 
                        size={20} 
                        color={isActive ? "#FFFFFF" : colors.primary} 
                      />
                      <Text
                        className="font-black text-xs uppercase tracking-widest"
                        style={{ color: isActive ? "#FFFFFF" : colors.foreground }}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>

          {/* List of Resources for Active Category */}
          <Animated.View entering={FadeInUp.delay(600)} layout={Layout.springify()} className="gap-5 mt-2">
            <View className="flex-row items-center justify-between px-2 mb-2">
              <Text className="text-sm font-black uppercase tracking-[4px]" style={{ color: colors.primary }}>
                Módulos Disponíveis
              </Text>
              <View className="w-8 h-1 rounded-full opacity-20" style={{ backgroundColor: colors.muted }} />
            </View>

            {activeContent.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(700 + (index * 100))}>
                <TouchableOpacity
                  className="p-8 rounded-[40px] card-premium border-2 flex-row items-center relative overflow-hidden"
                  style={{ borderColor: colors.border }}
                  onPress={() => handleOpenFile(item.url)}
                >
                  {/* Decorative Background Element */}
                  <View className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full" style={{ backgroundColor: colors.primary + '05' }} />

                  {/* Icon Container with Glow */}
                  <View 
                    className="w-16 h-16 rounded-3xl items-center justify-center mr-6 shadow-lg border"
                    style={{ 
                      backgroundColor: colors.primary + '10',
                      borderColor: colors.primary + '20'
                    }}
                  >
                    <Ionicons name="document-text" size={32} color={colors.primary} />
                  </View>

                  {/* Text Content */}
                  <View className="flex-1">
                    <Text 
                      className="font-black text-xl mb-1 tracking-tight" 
                      style={{ color: colors.foreground }}
                    >
                      {item.title}
                    </Text>
                    <Text 
                      className="text-sm font-bold opacity-60 mb-4" 
                      style={{ color: colors.foreground }}
                    >
                      {item.desc}
                    </Text>

                    {/* Meta Badges */}
                    <View className="flex-row items-center gap-2">
                      <View className="px-3 py-1 rounded-lg glass-extreme-dark border" style={{ borderColor: colors.primary + '30' }}>
                        <Text className="text-[10px] font-black uppercase tracking-[1px]" style={{ color: colors.primary }}>
                          FREE ACCESS
                        </Text>
                      </View>
                      <View className="px-3 py-1 rounded-lg border" style={{ borderColor: colors.muted + '20' }}>
                        <Text className="text-[10px] font-bold opacity-50 uppercase tracking-[1px]" style={{ color: colors.muted }}>
                          PDF/EPUB
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="ml-4">
                    <View className="p-2 rounded-full glass-extreme border" style={{ borderColor: colors.primary + '30' }}>
                      <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Premium Suggestion Box */}
          <Animated.View 
            entering={ZoomIn.delay(1000)}
            className="mt-8 p-10 rounded-[50px] glass-extreme border-2 items-center shadow-2xl" 
            style={{ borderColor: colors.primary + '20' }}
          >
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6" style={{ backgroundColor: colors.primary + '10' }}>
              <Ionicons name="library" size={48} color={colors.primary} />
            </View>
            <Text className="text-2xl font-black text-center mb-3 tracking-tighter" style={{ color: colors.foreground }}>Expanda sua Mente</Text>
            <Text className="text-center font-bold opacity-60 leading-relaxed px-4" style={{ color: colors.foreground }}>
              Nossos algoritmos estão mapeando novos repositórios agora mesmo. Novas pérolas do conhecimento chegam diariamente.
            </Text>
          </Animated.View>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
