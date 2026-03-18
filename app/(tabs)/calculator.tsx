import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { calculate, CalcStep } from "@/lib/calculator-engine";
import { useHistory } from "@/lib/history-context";

interface CalcButton {
  label: string;
  value: string;
  type: "number" | "operator" | "function" | "action" | "constant";
  wide?: boolean;
}

const BUTTONS: CalcButton[][] = [
  [
    { label: "sin", value: "sin(", type: "function" },
    { label: "cos", value: "cos(", type: "function" },
    { label: "tan", value: "tan(", type: "function" },
    { label: "log", value: "log(", type: "function" },
  ],
  [
    { label: "ln", value: "ln(", type: "function" },
    { label: "√", value: "sqrt(", type: "function" },
    { label: "π", value: "pi", type: "constant" },
    { label: "e", value: "e", type: "constant" },
  ],
  [
    { label: "x²", value: "^2", type: "operator" },
    { label: "x³", value: "^3", type: "operator" },
    { label: "xⁿ", value: "^", type: "operator" },
    { label: "%", value: "%", type: "operator" },
  ],
  [
    { label: "(", value: "(", type: "operator" },
    { label: ")", value: ")", type: "operator" },
    { label: "⌫", value: "backspace", type: "action" },
    { label: "C", value: "clear", type: "action" },
  ],
  [
    { label: "7", value: "7", type: "number" },
    { label: "8", value: "8", type: "number" },
    { label: "9", value: "9", type: "number" },
    { label: "÷", value: "/", type: "operator" },
  ],
  [
    { label: "4", value: "4", type: "number" },
    { label: "5", value: "5", type: "number" },
    { label: "6", value: "6", type: "number" },
    { label: "×", value: "*", type: "operator" },
  ],
  [
    { label: "1", value: "1", type: "number" },
    { label: "2", value: "2", type: "number" },
    { label: "3", value: "3", type: "number" },
    { label: "−", value: "-", type: "operator" },
  ],
  [
    { label: "0", value: "0", type: "number", wide: false },
    { label: ".", value: ".", type: "number" },
    { label: "=", value: "equals", type: "action" },
    { label: "+", value: "+", type: "operator" },
  ],
];

export default function CalculatorScreen() {
  const colors = useColors();
  const { addCalcHistory } = useHistory();

  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [steps, setSteps] = useState<CalcStep[]>([]);
  const [showSteps, setShowSteps] = useState(false);
  const [error, setError] = useState("");

  const handleButton = useCallback((btn: CalcButton) => {
    if (btn.value === "clear") {
      setExpression("");
      setResult("");
      setSteps([]);
      setError("");
      return;
    }

    if (btn.value === "backspace") {
      setExpression((prev) => prev.slice(0, -1));
      setError("");
      return;
    }

    if (btn.value === "equals") {
      if (!expression.trim()) return;
      const calcResult = calculate(expression);
      setResult(calcResult.result);
      setSteps(calcResult.steps);
      setError(calcResult.error || "");
      if (!calcResult.error) {
        addCalcHistory({ expression, result: calcResult.result });
      }
      return;
    }

    setExpression((prev) => prev + btn.value);
    setError("");
  }, [expression, addCalcHistory]);

  const getButtonStyle = (btn: CalcButton) => {
    switch (btn.type) {
      case "number": return { backgroundColor: colors.surface, borderColor: colors.border };
      case "operator": return { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" };
      case "function": return { backgroundColor: "#6A1B9A15", borderColor: "#6A1B9A40" };
      case "constant": return { backgroundColor: "#1B5E2015", borderColor: "#1B5E2040" };
      case "action":
        if (btn.value === "equals") return { backgroundColor: colors.primary, borderColor: colors.primary };
        if (btn.value === "clear") return { backgroundColor: colors.error + "20", borderColor: colors.error + "40" };
        return { backgroundColor: colors.warning + "20", borderColor: colors.warning + "40" };
    }
  };

  const getButtonTextColor = (btn: CalcButton) => {
    switch (btn.type) {
      case "number": return colors.foreground;
      case "operator": return colors.primary;
      case "function": return "#6A1B9A";
      case "constant": return "#1B5E20";
      case "action":
        if (btn.value === "equals") return "#fff";
        if (btn.value === "clear") return colors.error;
        return colors.warning;
    }
  };

  return (
    <ScreenContainer scrollable>
      {/* Header */}
      <View className="px-6 py-6 flex-row items-center justify-between border-b" style={{ borderColor: colors.border }}>
        <View>
          <Text className="text-2xl font-bold tracking-tight" style={{ color: colors.foreground }}>
            Cálculos
          </Text>
          <Text className="text-xs uppercase font-bold tracking-widest mt-1" style={{ color: colors.muted }}>
            Motor científico de alta precisão
          </Text>
        </View>
        {steps.length > 0 && (
          <TouchableOpacity
            className="p-3 rounded-2xl border"
            style={{ backgroundColor: colors.surface, borderColor: colors.primary + "40" }}
            onPress={() => setShowSteps(true)}
          >
            <Ionicons name="list" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Display */}
        <View style={[styles.display, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.expressionText, { color: colors.muted }]} numberOfLines={2} adjustsFontSizeToFit>
            {expression || "0"}
          </Text>
          {error ? (
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          ) : result ? (
            <Text style={[styles.resultText, { color: colors.primary }]}>= {result}</Text>
          ) : null}
        </View>

        {/* Keyboard */}
        <View className="px-4 pb-8 gap-3">
          {BUTTONS.map((row, rowIdx) => (
            <View key={rowIdx} className="flex-row gap-3">
              {row.map((btn) => (
                <TouchableOpacity
                  key={btn.label}
                  className={`flex-1 py-5 rounded-3xl border items-center justify-center ${btn.wide ? 'flex-[2]' : ''}`}
                  style={[
                    getButtonStyle(btn),
                    {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 1
                    }
                  ]}
                  onPress={() => handleButton(btn)}
                  activeOpacity={0.6}
                >
                  <Text 
                    className="text-lg font-bold" 
                    style={{ color: getButtonTextColor(btn) }}
                  >
                    {btn.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Quick Reference */}
        <View style={[styles.reference, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.referenceTitle, { color: colors.muted }]}>REFERÊNCIA RÁPIDA</Text>
          <View style={styles.referenceGrid}>
            {[
              { fn: "sin(30)", desc: "seno de 30°" },
              { fn: "cos(60)", desc: "cosseno de 60°" },
              { fn: "log(100)", desc: "log₁₀(100) = 2" },
              { fn: "sqrt(16)", desc: "√16 = 4" },
              { fn: "2^10", desc: "2 elevado a 10" },
              { fn: "ln(e)", desc: "logaritmo natural de e" },
            ].map((item) => (
              <TouchableOpacity
                key={item.fn}
                style={[styles.refChip, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => setExpression(item.fn)}
              >
                <Text style={[styles.refFn, { color: colors.primary }]}>{item.fn}</Text>
                <Text style={[styles.refDesc, { color: colors.muted }]}>{item.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Steps Modal */}
      <Modal visible={showSteps} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.stepsModal, { backgroundColor: colors.surface }]}>
            <View style={styles.stepsHeader}>
              <Text style={[styles.stepsTitle, { color: colors.foreground }]}>Passo a Passo</Text>
              <TouchableOpacity onPress={() => setShowSteps(false)}>
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <View style={[styles.expressionBox, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
              <Text style={[styles.expressionBoxText, { color: colors.primary }]}>{expression} = {result}</Text>
            </View>

            <FlatList
              data={steps}
              keyExtractor={(_, idx) => idx.toString()}
              renderItem={({ item, index }) => (
                <View style={[styles.stepItem, { borderBottomColor: colors.border }]}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepDesc, { color: colors.muted }]}>{item.description}</Text>
                    <Text style={[styles.stepExpr, { color: colors.foreground }]}>{item.expression}</Text>
                    <Text style={[styles.stepResult, { color: colors.primary }]}>= {item.result}</Text>
                  </View>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  stepsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  stepsBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  container: {
    flex: 1,
  },
  display: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 100,
    justifyContent: "flex-end",
  },
  expressionText: {
    fontSize: 22,
    textAlign: "right",
    lineHeight: 30,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  resultText: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "right",
    marginTop: 8,
    lineHeight: 40,
  },
  errorText: {
    fontSize: 14,
    textAlign: "right",
    marginTop: 4,
  },
  keyboard: {
    paddingHorizontal: 12,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  wideButton: {
    flex: 2,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
  },
  reference: {
    margin: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  referenceTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  referenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  refChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    width: "47%",
  },
  refFn: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  refDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  stepsModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
    flex: 1,
    marginTop: 80,
  },
  stepsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  expressionBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  expressionBoxText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  stepItem: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  stepContent: {
    flex: 1,
    gap: 3,
  },
  stepDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  stepExpr: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  stepResult: {
    fontSize: 14,
    fontWeight: "700",
  },
});
