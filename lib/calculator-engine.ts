export interface CalcStep {
  description: string;
  expression: string;
  result: string;
}

export interface CalcResult {
  result: string;
  steps: CalcStep[];
  error?: string;
}

const DEG_TO_RAD = Math.PI / 180;

// Tokenizer
type TokenType =
  | "number"
  | "operator"
  | "function"
  | "lparen"
  | "rparen"
  | "constant";

interface Token {
  type: TokenType;
  value: string;
}

const FUNCTIONS = ["sin", "cos", "tan", "asin", "acos", "atan", "log", "ln", "sqrt", "abs", "ceil", "floor", "round"];
const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  π: Math.PI,
  e: Math.E,
};

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const clean = expr.replace(/\s+/g, "").toLowerCase();

  while (i < clean.length) {
    const ch = clean[i];

    // Number
    if (/[0-9.]/.test(ch)) {
      let num = "";
      while (i < clean.length && /[0-9.]/.test(clean[i])) {
        num += clean[i++];
      }
      tokens.push({ type: "number", value: num });
      continue;
    }

    // Function or constant
    if (/[a-zπ]/.test(ch)) {
      let word = "";
      while (i < clean.length && /[a-zπ]/.test(clean[i])) {
        word += clean[i++];
      }
      if (FUNCTIONS.includes(word)) {
        tokens.push({ type: "function", value: word });
      } else if (word in CONSTANTS) {
        tokens.push({ type: "constant", value: word });
      } else {
        throw new Error(`Função desconhecida: ${word}`);
      }
      continue;
    }

    // Operators
    if (["+", "-", "*", "/", "^", "%"].includes(ch)) {
      tokens.push({ type: "operator", value: ch });
      i++;
      continue;
    }

    if (ch === "(") { tokens.push({ type: "lparen", value: "(" }); i++; continue; }
    if (ch === ")") { tokens.push({ type: "rparen", value: ")" }); i++; continue; }

    // × and ÷ symbols
    if (ch === "×") { tokens.push({ type: "operator", value: "*" }); i++; continue; }
    if (ch === "÷") { tokens.push({ type: "operator", value: "/" }); i++; continue; }

    throw new Error(`Caractere inválido: ${ch}`);
  }

  return tokens;
}

// Shunting-yard algorithm
const PRECEDENCE: Record<string, number> = {
  "+": 1, "-": 1,
  "*": 2, "/": 2, "%": 2,
  "^": 3,
};

function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const opStack: Token[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "number" || token.type === "constant") {
      output.push(token);
    } else if (token.type === "function") {
      opStack.push(token);
    } else if (token.type === "operator") {
      // Handle unary minus
      if (token.value === "-" && (i === 0 || tokens[i - 1].type === "lparen" || tokens[i - 1].type === "operator")) {
        output.push({ type: "number", value: "0" });
      }
      while (
        opStack.length > 0 &&
        opStack[opStack.length - 1].type !== "lparen" &&
        (opStack[opStack.length - 1].type === "function" ||
          PRECEDENCE[opStack[opStack.length - 1].value] >= PRECEDENCE[token.value])
      ) {
        output.push(opStack.pop()!);
      }
      opStack.push(token);
    } else if (token.type === "lparen") {
      opStack.push(token);
    } else if (token.type === "rparen") {
      while (opStack.length > 0 && opStack[opStack.length - 1].type !== "lparen") {
        output.push(opStack.pop()!);
      }
      if (opStack.length === 0) throw new Error("Parênteses desbalanceados");
      opStack.pop(); // remove lparen
      if (opStack.length > 0 && opStack[opStack.length - 1].type === "function") {
        output.push(opStack.pop()!);
      }
    }
  }

  while (opStack.length > 0) {
    const op = opStack.pop()!;
    if (op.type === "lparen") throw new Error("Parênteses desbalanceados");
    output.push(op);
  }

  return output;
}

function applyFunction(name: string, val: number, steps: CalcStep[]): number {
  let result: number;
  let desc: string;

  switch (name) {
    case "sin":
      result = Math.sin(val * DEG_TO_RAD);
      desc = `sin(${val}°) = sin(${(val * DEG_TO_RAD).toFixed(4)} rad)`;
      break;
    case "cos":
      result = Math.cos(val * DEG_TO_RAD);
      desc = `cos(${val}°) = cos(${(val * DEG_TO_RAD).toFixed(4)} rad)`;
      break;
    case "tan":
      result = Math.tan(val * DEG_TO_RAD);
      desc = `tan(${val}°) = tan(${(val * DEG_TO_RAD).toFixed(4)} rad)`;
      break;
    case "asin":
      result = Math.asin(val) / DEG_TO_RAD;
      desc = `arcsin(${val}) em graus`;
      break;
    case "acos":
      result = Math.acos(val) / DEG_TO_RAD;
      desc = `arccos(${val}) em graus`;
      break;
    case "atan":
      result = Math.atan(val) / DEG_TO_RAD;
      desc = `arctan(${val}) em graus`;
      break;
    case "log":
      if (val <= 0) throw new Error("log() requer valor positivo");
      result = Math.log10(val);
      desc = `log₁₀(${val}) — logaritmo na base 10`;
      break;
    case "ln":
      if (val <= 0) throw new Error("ln() requer valor positivo");
      result = Math.log(val);
      desc = `ln(${val}) — logaritmo natural (base e)`;
      break;
    case "sqrt":
      if (val < 0) throw new Error("√ requer valor não-negativo");
      result = Math.sqrt(val);
      desc = `√${val} — raiz quadrada de ${val}`;
      break;
    case "abs":
      result = Math.abs(val);
      desc = `|${val}| — valor absoluto`;
      break;
    case "ceil":
      result = Math.ceil(val);
      desc = `⌈${val}⌉ — arredondamento para cima`;
      break;
    case "floor":
      result = Math.floor(val);
      desc = `⌊${val}⌋ — arredondamento para baixo`;
      break;
    case "round":
      result = Math.round(val);
      desc = `arredondamento de ${val}`;
      break;
    default:
      throw new Error(`Função desconhecida: ${name}`);
  }

  steps.push({
    description: desc,
    expression: `${name}(${val})`,
    result: formatNum(result),
  });

  return result;
}

function applyOperator(op: string, a: number, b: number, steps: CalcStep[]): number {
  let result: number;
  let desc: string;

  switch (op) {
    case "+":
      result = a + b;
      desc = `Adição: ${formatNum(a)} + ${formatNum(b)}`;
      break;
    case "-":
      result = a - b;
      desc = `Subtração: ${formatNum(a)} − ${formatNum(b)}`;
      break;
    case "*":
      result = a * b;
      desc = `Multiplicação: ${formatNum(a)} × ${formatNum(b)}`;
      break;
    case "/":
      if (b === 0) throw new Error("Divisão por zero");
      result = a / b;
      desc = `Divisão: ${formatNum(a)} ÷ ${formatNum(b)}`;
      break;
    case "^":
      result = Math.pow(a, b);
      desc = `Potência: ${formatNum(a)}^${formatNum(b)} — ${formatNum(a)} elevado a ${formatNum(b)}`;
      break;
    case "%":
      result = a % b;
      desc = `Módulo: ${formatNum(a)} mod ${formatNum(b)} — resto da divisão`;
      break;
    default:
      throw new Error(`Operador desconhecido: ${op}`);
  }

  steps.push({
    description: desc,
    expression: `${formatNum(a)} ${op} ${formatNum(b)}`,
    result: formatNum(result),
  });

  return result;
}

function formatNum(n: number): string {
  if (!isFinite(n)) return n > 0 ? "∞" : "-∞";
  if (isNaN(n)) return "Indefinido";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e10 || abs < 1e-6)) {
    return n.toExponential(6);
  }
  const str = parseFloat(n.toPrecision(10)).toString();
  return str;
}

function evaluateRPN(rpn: Token[], steps: CalcStep[]): number {
  const stack: number[] = [];

  for (const token of rpn) {
    if (token.type === "number") {
      stack.push(parseFloat(token.value));
    } else if (token.type === "constant") {
      const val = CONSTANTS[token.value];
      steps.push({
        description: `Constante ${token.value} = ${val}`,
        expression: token.value,
        result: formatNum(val),
      });
      stack.push(val);
    } else if (token.type === "function") {
      if (stack.length < 1) throw new Error("Expressão inválida");
      const val = stack.pop()!;
      stack.push(applyFunction(token.value, val, steps));
    } else if (token.type === "operator") {
      if (stack.length < 2) throw new Error("Expressão inválida");
      const b = stack.pop()!;
      const a = stack.pop()!;
      stack.push(applyOperator(token.value, a, b, steps));
    }
  }

  if (stack.length !== 1) throw new Error("Expressão inválida");
  return stack[0];
}

export function calculate(expression: string): CalcResult {
  if (!expression.trim()) {
    return { result: "", steps: [], error: "Expressão vazia" };
  }

  const steps: CalcStep[] = [];

  try {
    steps.push({
      description: "Expressão original a ser calculada",
      expression: expression,
      result: "...",
    });

    const tokens = tokenize(expression);
    const rpn = toRPN(tokens);
    const value = evaluateRPN(rpn, steps);
    const result = formatNum(value);

    // Update last step
    if (steps.length > 0) {
      steps[steps.length - 1].result = result;
    }

    steps.push({
      description: "Resultado final",
      expression: expression,
      result,
    });

    return { result, steps };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return { result: "Erro", steps, error: msg };
  }
}
