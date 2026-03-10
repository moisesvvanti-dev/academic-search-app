import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  TextInput,
  Animated,
  Platform,
  Keyboard,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

type Mode = "table" | "quiz";

interface QuizQuestion {
  a: number;
  b: number;
  answer: number;
}

function generateQuiz(number: number): QuizQuestion[] {
  return Array.from({ length: 10 }, (_, i) => ({
    a: number,
    b: i + 1,
    answer: number * (i + 1),
  })).sort(() => Math.random() - 0.5);
}

export default function MultiplicationScreen() {
  const colors = useColors();
  const [selectedNumber, setSelectedNumber] = useState(2);
  const [mode, setMode] = useState<Mode>("table");
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizInput, setQuizInput] = useState("");
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "wrong" | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<boolean[]>([]);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const startQuiz = useCallback(() => {
    const questions = generateQuiz(selectedNumber);
    setQuizQuestions(questions);
    setCurrentQuizIdx(0);
    setQuizInput("");
    setQuizScore(0);
    setQuizFinished(false);
    setQuizFeedback(null);
    setQuizAnswers([]);
    setMode("quiz");
  }, [selectedNumber]);

  const handleQuizAnswer = useCallback(() => {
    if (!quizInput.trim()) return;
    Keyboard.dismiss();

    const currentQ = quizQuestions[currentQuizIdx];
    const userAnswer = parseInt(quizInput.trim());
    const isCorrect = userAnswer === currentQ.answer;

    setQuizFeedback(isCorrect ? "correct" : "wrong");
    setQuizAnswers((prev) => [...prev, isCorrect]);

    if (isCorrect) {
      setQuizScore((s) => s + 1);
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }

    setTimeout(() => {
      setQuizFeedback(null);
      setQuizInput("");
      if (currentQuizIdx + 1 >= quizQuestions.length) {
        setQuizFinished(true);
      } else {
        setCurrentQuizIdx((i) => i + 1);
      }
    }, 1000);
  }, [quizInput, quizQuestions, currentQuizIdx, shakeAnim, scaleAnim]);

  const tableData = Array.from({ length: 10 }, (_, i) => ({
    multiplier: i + 1,
    result: selectedNumber * (i + 1),
  }));

  const renderTableRow = ({ item }: { item: { multiplier: number; result: number } }) => {
    const isHighlighted = highlightedRow === item.multiplier;
    return (
      <TouchableOpacity
        style={[
          styles.tableRow,
          {
            backgroundColor: isHighlighted
              ? colors.primary + "20"
              : item.multiplier % 2 === 0
              ? colors.surface
              : colors.background,
            borderColor: isHighlighted ? colors.primary : "transparent",
          },
        ]}
        onPress={() => setHighlightedRow(isHighlighted ? null : item.multiplier)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tablePart, { color: colors.primary, fontWeight: "700" }]}>
          {selectedNumber}
        </Text>
        <Text style={[styles.tableOp, { color: colors.muted }]}>×</Text>
        <Text style={[styles.tablePart, { color: colors.foreground, fontWeight: "600" }]}>
          {item.multiplier}
        </Text>
        <Text style={[styles.tableEquals, { color: colors.muted }]}>=</Text>
        <Text style={[styles.tableResult, { color: isHighlighted ? colors.primary : colors.foreground }]}>
          {item.result}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <IconSymbol name="multiply" size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Tabuadas</Text>
        </View>

        {/* Number Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.numberScroll}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <TouchableOpacity
              key={n}
              style={[
                styles.numberChip,
                {
                  backgroundColor: selectedNumber === n ? colors.primary : colors.background,
                  borderColor: selectedNumber === n ? colors.primary : colors.border,
                },
              ]}
              onPress={() => { setSelectedNumber(n); setMode("table"); setHighlightedRow(null); }}
            >
              <Text style={[styles.numberChipText, { color: selectedNumber === n ? "#fff" : colors.foreground }]}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Mode Toggle */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === "table" && { backgroundColor: colors.primary }]}
            onPress={() => setMode("table")}
          >
            <IconSymbol name="list.number" size={16} color={mode === "table" ? "#fff" : colors.muted} />
            <Text style={[styles.modeBtnText, { color: mode === "table" ? "#fff" : colors.muted }]}>Tabuada</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === "quiz" && { backgroundColor: "#6A1B9A" }]}
            onPress={startQuiz}
          >
            <IconSymbol name="checkmark.circle.fill" size={16} color={mode === "quiz" ? "#fff" : colors.muted} />
            <Text style={[styles.modeBtnText, { color: mode === "quiz" ? "#fff" : colors.muted }]}>Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table Mode */}
      {mode === "table" && (
        <>
          <View style={[styles.tableTitle, { backgroundColor: colors.primary }]}>
            <Text style={styles.tableTitleText}>Tabuada do {selectedNumber}</Text>
          </View>
          <FlatList
            data={tableData}
            keyExtractor={(item) => item.multiplier.toString()}
            renderItem={renderTableRow}
            showsVerticalScrollIndicator={false}
            getItemLayout={(_, index) => ({ length: 60, offset: 60 * index, index })}
            ListFooterComponent={
              <View style={styles.tableFooter}>
                <Text style={[styles.tableFooterText, { color: colors.muted }]}>
                  Toque em uma linha para destacar
                </Text>
                <TouchableOpacity
                  style={[styles.quizCTA, { backgroundColor: "#6A1B9A" }]}
                  onPress={startQuiz}
                >
                  <IconSymbol name="checkmark.circle.fill" size={18} color="#fff" />
                  <Text style={styles.quizCTAText}>Testar com Quiz</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </>
      )}

      {/* Quiz Mode */}
      {mode === "quiz" && !quizFinished && quizQuestions.length > 0 && (
        <ScrollView contentContainerStyle={styles.quizContainer} showsVerticalScrollIndicator={false}>
          {/* Progress */}
          <View style={styles.progressRow}>
            <Text style={[styles.progressText, { color: colors.muted }]}>
              Questão {currentQuizIdx + 1} de {quizQuestions.length}
            </Text>
            <Text style={[styles.scoreText, { color: colors.primary }]}>
              ✓ {quizScore} acertos
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${((currentQuizIdx) / quizQuestions.length) * 100}%`,
                },
              ]}
            />
          </View>

          {/* Question */}
          <Animated.View
            style={[
              styles.questionCard,
              {
                backgroundColor: quizFeedback === "correct"
                  ? colors.success + "20"
                  : quizFeedback === "wrong"
                  ? colors.error + "20"
                  : colors.surface,
                borderColor: quizFeedback === "correct"
                  ? colors.success
                  : quizFeedback === "wrong"
                  ? colors.error
                  : colors.border,
                transform: [
                  { translateX: shakeAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            <Text style={[styles.questionText, { color: colors.foreground }]}>
              {quizQuestions[currentQuizIdx].a} × {quizQuestions[currentQuizIdx].b} = ?
            </Text>
            {quizFeedback && (
              <Text style={[styles.feedbackText, { color: quizFeedback === "correct" ? colors.success : colors.error }]}>
                {quizFeedback === "correct" ? "✓ Correto!" : `✗ Errado! A resposta é ${quizQuestions[currentQuizIdx].answer}`}
              </Text>
            )}
          </Animated.View>

          {/* Input */}
          <TextInput
            style={[styles.quizInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
            placeholder="Digite sua resposta..."
            placeholderTextColor={colors.muted}
            value={quizInput}
            onChangeText={setQuizInput}
            keyboardType="number-pad"
            onSubmitEditing={handleQuizAnswer}
            returnKeyType="done"
            editable={!quizFeedback}
          />

          <TouchableOpacity
            style={[styles.answerBtn, { backgroundColor: colors.primary, opacity: quizFeedback ? 0.5 : 1 }]}
            onPress={handleQuizAnswer}
            disabled={!!quizFeedback}
          >
            <Text style={styles.answerBtnText}>Confirmar</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Quiz Finished */}
      {mode === "quiz" && quizFinished && (
        <View style={styles.quizResult}>
          <Text style={[styles.quizResultEmoji]}>
            {quizScore === quizQuestions.length ? "🏆" : quizScore >= quizQuestions.length * 0.7 ? "⭐" : "📚"}
          </Text>
          <Text style={[styles.quizResultTitle, { color: colors.foreground }]}>
            {quizScore === quizQuestions.length ? "Perfeito!" : quizScore >= quizQuestions.length * 0.7 ? "Muito bem!" : "Continue praticando!"}
          </Text>
          <Text style={[styles.quizResultScore, { color: colors.primary }]}>
            {quizScore}/{quizQuestions.length} acertos
          </Text>

          {/* Answer Review */}
          <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {quizQuestions.map((q, idx) => (
              <View key={idx} style={styles.reviewRow}>
                <Text style={{ color: quizAnswers[idx] ? colors.success : colors.error, fontSize: 16 }}>
                  {quizAnswers[idx] ? "✓" : "✗"}
                </Text>
                <Text style={[styles.reviewText, { color: colors.foreground }]}>
                  {q.a} × {q.b} = {q.answer}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.quizResultBtns}>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: "#6A1B9A" }]}
              onPress={startQuiz}
            >
              <Text style={styles.retryBtnText}>Tentar Novamente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tableBtn, { backgroundColor: colors.primary }]}
              onPress={() => setMode("table")}
            >
              <Text style={styles.retryBtnText}>Ver Tabuada</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  numberScroll: {
    marginBottom: 10,
  },
  numberChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  numberChipText: {
    fontSize: 18,
    fontWeight: "700",
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tableTitle: {
    paddingVertical: 10,
    alignItems: "center",
  },
  tableTitleText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    height: 60,
    borderWidth: 1,
    borderRadius: 0,
  },
  tablePart: {
    fontSize: 22,
    width: 44,
    textAlign: "center",
  },
  tableOp: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  tableEquals: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  tableResult: {
    fontSize: 24,
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
  },
  tableFooter: {
    padding: 20,
    alignItems: "center",
    gap: 12,
  },
  tableFooterText: {
    fontSize: 13,
  },
  quizCTA: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  quizCTAText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  // Quiz
  quizContainer: {
    padding: 20,
    alignItems: "center",
    gap: 16,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  progressText: {
    fontSize: 13,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: "700",
  },
  progressBar: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  questionCard: {
    width: "100%",
    padding: 32,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  questionText: {
    fontSize: 40,
    fontWeight: "800",
    textAlign: "center",
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: "700",
  },
  quizInput: {
    width: "100%",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  answerBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  answerBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  // Quiz Result
  quizResult: {
    flex: 1,
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  quizResultEmoji: {
    fontSize: 64,
    marginTop: 16,
  },
  quizResultTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  quizResultScore: {
    fontSize: 20,
    fontWeight: "700",
  },
  reviewCard: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
    maxHeight: 200,
  },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reviewText: {
    fontSize: 15,
    fontWeight: "500",
  },
  quizResultBtns: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  retryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  tableBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  retryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
