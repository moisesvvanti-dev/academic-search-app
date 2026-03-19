import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import * as WebBrowser from "expo-web-browser";

type AcademicLevel = "Graduação" | "Pós-Graduação" | "Todos";
type KnowledgeArea = "Ciências Exatas" | "Ciências Biológicas" | "Ciências Humanas" | "Tecnologia" | "Artes";

interface PortfolioActivity {
  title: string;
  description: string;
  url: string;
  source: string;
}

const portfolioData: Record<KnowledgeArea, PortfolioActivity[]> = {
  "Ciências Exatas": [
    { title: "Repositório Global de Matemática Aplicada", description: "Atividades, projetos e portfolios abertos de alunos de graduação em matemática de diversas universidades.", url: "https://github.com/topics/applied-mathematics", source: "GitHub Educacional" },
    { title: "Física Quântica: Portfólios de Pesquisa", description: "Teses e atividades de laboratório abertas na área de física moderna.", url: "https://arxiv.org/archive/quant-ph", source: "arXiv" }
  ],
  "Ciências Biológicas": [
    { title: "Laboratório Aberto de Genética", description: "Acesso gratuito a atividades sequenciamento e relatórios de alunos de pós-graduação.", url: "https://www.biorxiv.org/", source: "bioRxiv" },
    { title: "Ecologia e Meio Ambiente - Global", description: "Projetos práticos de conservação com portfólios completos.", url: "https://www.nature.com/", source: "Nature (Open Access)" }
  ],
  "Ciências Humanas": [
    { title: "Acervo Histórico e Sociológico", description: "Documentários, ensaios e atividades de pesquisa elaborados por universitários.", url: "https://www.scielo.org/", source: "SciELO" },
    { title: "Portfólios de Psicologia Clínica", description: "Estudos de caso (anonimizados) e práticas abertas de universidades de ponta.", url: "https://osf.io/", source: "Open Science Framework" }
  ],
  "Tecnologia": [
    { title: "Open Source Computer Science", description: "Gigantesca coleção de atividades e portfólios de graduação em Engenharia de Software.", url: "https://github.com/ossu/computer-science", source: "OSSU" },
    { title: "AI & Machine Learning Research", description: "Projetos de mestrado e doutorado em IA disponíveis gratuitamente.", url: "https://paperswithcode.com/", source: "Papers With Code" }
  ],
  "Artes": [
    { title: "Exposições Digitais de Belas Artes", description: "Atividades e portfólios visuais completos de alunos de artes pelo mundo.", url: "https://www.behance.net/galleries/art", source: "Behance" },
    { title: "Cinema e Audiovisual Acadêmico", description: "Repositório de curtas e atividades de produção audiovisual (Creative Commons).", url: "https://vimeo.com/categories/documentary", source: "Vimeo Arts" }
  ]
};

export default function PortfoliosScreen() {
  const colors = useColors();
  const [level, setLevel] = useState<AcademicLevel>("Todos");
  const [area, setArea] = useState<KnowledgeArea>("Tecnologia");

  const areas: KnowledgeArea[] = ["Tecnologia", "Ciências Exatas", "Ciências Biológicas", "Ciências Humanas", "Artes"];
  const levels: AcademicLevel[] = ["Todos", "Graduação", "Pós-Graduação"];

  const currentPortfolios = portfolioData[area] || [];

  const handleOpenLink = async (url: string) => {
    try {
      if (url.startsWith("http")) {
        await WebBrowser.openBrowserAsync(url, {
          toolbarColor: colors.background,
          controlsColor: colors.primary,
        });
      } else {
        Alert.alert("Erro", "URL inválida");
      }
    } catch {
      Alert.alert("Erro", "Não foi possível abrir o link do portfólio.");
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
                Acesso<Text style={{ color: colors.primary }}>Aberto</Text>
              </Text>
              <Text className="text-[11px] font-bold mt-1 uppercase tracking-[3px]" style={{ color: colors.muted }}>
                Portfólios e Atividades Globais
              </Text>
            </View>
            <View className="w-14 h-14 rounded-full items-center justify-center glass-extreme border-2 shadow-xl" style={{ borderColor: colors.primary + '30', backgroundColor: colors.surface }}>
              <Ionicons name="folder-open" size={24} color={colors.primary} />
            </View>
          </View>
          
          <Text className="text-xs font-semibold mb-6 leading-relaxed opacity-80" style={{ color: colors.muted }}>
            Explore e acesse 100% gratuitamente milhões de portfólios, atividades acadêmicas, pesquisas e teses de todas as áreas do conhecimento, abrangendo universidades no mundo todo.
          </Text>

          {/* Level Filter */}
          <View className="mb-4">
            <Text className="text-[10px] font-black uppercase tracking-widest mx-2 mb-2" style={{ color: colors.primary }}>
              Nível Acadêmico
            </Text>
            <View className="flex-row gap-2">
              {levels.map((lvl) => {
                const isActive = level === lvl;
                return (
                  <TouchableOpacity
                    key={lvl}
                    className={`flex-1 py-3 rounded-2xl items-center border-2 ${isActive ? 'shadow-md' : ''}`}
                    style={{
                      backgroundColor: isActive ? colors.primary : colors.surface,
                      borderColor: isActive ? colors.primary : colors.border,
                    }}
                    onPress={() => setLevel(lvl)}
                  >
                    <Text className="text-[10px] font-black uppercase tracking-wider" style={{ color: isActive ? "#FFFFFF" : colors.foreground }}>
                      {lvl}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Area Filter */}
          <View>
            <Text className="text-[10px] font-black uppercase tracking-widest mx-2 mb-2" style={{ color: colors.primary }}>
              Área do Conhecimento
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
              <View className="flex-row gap-3">
                {areas.map((cat) => {
                  const isActive = area === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      className="px-5 py-3 rounded-full border-2 flex-row items-center gap-2"
                      style={{
                        backgroundColor: isActive ? colors.primary + '20' : 'transparent',
                        borderColor: isActive ? colors.primary : colors.border,
                      }}
                      onPress={() => setArea(cat)}
                    >
                      <Ionicons
                        name={cat === "Tecnologia" ? "hardware-chip" : cat === "Artes" ? "color-palette" : cat === "Ciências Exatas" ? "calculator" : cat === "Ciências Biológicas" ? "leaf" : "book"}
                        size={14}
                        color={isActive ? colors.primary : colors.muted}
                      />
                      <Text
                        className="text-xs font-bold tracking-tight"
                        style={{ color: isActive ? colors.primary : colors.foreground }}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </Animated.View>

        {/* Portfolios List */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {currentPortfolios.length === 0 ? (
            <Text className="text-center font-bold opacity-50 mt-10" style={{ color: colors.muted }}>
              Nenhuma atividade encontrada para esta área.
            </Text>
          ) : (
            currentPortfolios.map((item, index) => (
              <Animated.View key={index} entering={ZoomIn.delay(index * 150).duration(600)}>
                <TouchableOpacity
                  className="mb-5 p-6 rounded-[35px] border-2 glass-extreme shadow-sm relative overflow-hidden"
                  style={{ borderColor: colors.primary + '20' }}
                  onPress={() => handleOpenLink(item.url)}
                >
                  <View className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px]" style={{ backgroundColor: colors.primary + '08' }} />
                  
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="px-3 py-1 rounded-full border" style={{ borderColor: colors.success + '40', backgroundColor: colors.success + '10' }}>
                      <Text className="text-[9px] font-black uppercase tracking-widest" style={{ color: colors.success }}>
                        Acesso Gratuito
                      </Text>
                    </View>
                    <Ionicons name="globe-outline" size={18} color={colors.primary} className="opacity-60" />
                  </View>
                  
                  <Text className="text-xl font-black mb-2 leading-tight tracking-tight pr-4" style={{ color: colors.foreground }}>
                    {item.title}
                  </Text>
                  
                  <Text className="text-sm font-medium leading-relaxed opacity-70 mb-5" style={{ color: colors.foreground }}>
                    {item.description}
                  </Text>

                  <View className="flex-row justify-between items-center mt-auto border-t pt-4" style={{ borderColor: colors.border }}>
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="school" size={14} color={colors.muted} />
                      <Text className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: colors.muted }}>
                        {item.source}
                      </Text>
                    </View>
                    
                    <View className="px-4 py-2 rounded-xl flex-row items-center gap-2" style={{ backgroundColor: colors.primary }}>
                      <Text className="text-[10px] font-black uppercase tracking-widest text-white">Explorar</Text>
                      <Ionicons name="open-outline" size={12} color="#FFF" />
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}

          {/* Search Action Area */}
          <Animated.View entering={FadeInDown.delay(600)} className="mt-4 p-6 rounded-[35px] border-2 border-dashed items-center" style={{ borderColor: colors.border }}>
            <Ionicons name="search-circle" size={40} color={colors.muted} className="mb-2 opacity-30" />
            <Text className="font-bold text-center mb-1" style={{ color: colors.foreground }}>
              Não encontrou o que procurava?
            </Text>
            <Text className="text-xs text-center font-medium opacity-60" style={{ color: colors.foreground }}>
              Use a aba explorar para acessar os bancos de dados profundos da Nexus.
            </Text>
          </Animated.View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
