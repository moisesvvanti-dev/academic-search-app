import { View, Text, ScrollView } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface DataTableProps {
  data: { label: string; value: string; unit?: string }[];
}

export function DataTable({ data }: DataTableProps) {
  const colors = useColors();

  if (data.length === 0) {
    return (
      <View className="p-4 items-center">
        <Text style={{ color: colors.muted }}>Nenhum dado numérico encontrado para esta pesquisa.</Text>
      </View>
    );
  }

  return (
    <View className="border rounded-lg overflow-hidden" style={{ borderColor: colors.border }}>
      <View className="flex-row bg-primary/10 p-2 border-b" style={{ borderBottomColor: colors.border, backgroundColor: colors.primary + '20' }}>
        <Text className="flex-1 font-bold text-xs" style={{ color: colors.foreground }}>Fonte/Contexto</Text>
        <Text className="w-20 font-bold text-xs text-right" style={{ color: colors.foreground }}>Valor</Text>
        <Text className="w-16 font-bold text-xs text-center" style={{ color: colors.foreground }}>Unid.</Text>
      </View>
      <ScrollView style={{ maxHeight: 300 }}>
        {data.map((item, index) => (
          <View key={index} className="flex-row p-2 border-b" style={{ borderBottomColor: colors.border }}>
            <Text className="flex-1 text-xs" style={{ color: colors.foreground }} numberOfLines={1}>{item.label}</Text>
            <Text className="w-20 text-xs text-right font-semibold" style={{ color: colors.primary }}>{item.value}</Text>
            <Text className="w-16 text-xs text-center" style={{ color: colors.muted }}>{item.unit || "-"}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
