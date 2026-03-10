import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navigation
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  // Academic Search
  "magnifyingglass": "search",
  "magnifyingglass.circle.fill": "manage-search",
  "doc.text.magnifyingglass": "article",
  "book.fill": "menu-book",
  "graduationcap.fill": "school",
  // Tables
  "number": "tag",
  "table.fill": "table-chart",
  "list.number": "format-list-numbered",
  // Calculator
  "function": "functions",
  "plus.slash.minus": "calculate",
  "divide": "calculate",
  // Multiplication / Tabuada
  "xmark.circle": "close",
  "xmark.circle.fill": "cancel",
  "multiply": "close",
  // History
  "clock": "history",
  "clock.fill": "history",
  "clock.arrow.circlepath": "update",
  // Actions
  "square.and.arrow.up": "share",
  "square.and.arrow.up.fill": "ios-share",
  "arrow.down.doc.fill": "download",
  "trash.fill": "delete",
  "trash": "delete-outline",
  "xmark": "close",
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",
  "info.circle": "info",
  "info.circle.fill": "info",
  "star.fill": "star",
  "filter": "filter-list",
  "slider.horizontal.3": "tune",
  // Misc
  "link": "link",
  "globe": "language",
  "arrow.right": "arrow-forward",
  "arrow.left": "arrow-back",
  "arrow.up.right.square": "open-in-new",
  "doc.fill": "description",
  "doc.on.doc.fill": "content-copy",
  "exclamationmark.triangle.fill": "warning",
  "wifi.slash": "wifi-off",
  "wifi": "wifi",
} as unknown as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
