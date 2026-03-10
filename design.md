# AcadêmicoSearch — Design Document

## Brand Identity

- **Primary Color:** `#1565C0` (Azul científico profundo)
- **Secondary Color:** `#0D47A1` (Azul escuro)
- **Accent:** `#42A5F5` (Azul claro vibrante)
- **Success:** `#2E7D32` (Verde acadêmico)
- **Warning:** `#F57F17` (Âmbar)
- **Error:** `#C62828` (Vermelho)
- **Background Light:** `#F8FAFF` (Branco azulado)
- **Background Dark:** `#0D1117` (Preto científico)
- **Surface Light:** `#FFFFFF`
- **Surface Dark:** `#161B22`

## Screen List

1. **Busca Acadêmica** (tab principal) — Pesquisa de artigos científicos com filtros
2. **Resultado de Busca** — Lista de artigos com resumo e links
3. **Detalhe do Artigo** — Resumo completo + todos os links + exportar PDF
4. **Tabelas Numéricas** — Conversão binário/octal/decimal/hexadecimal (0–50)
5. **Calculadora Científica** — Calculadora com passo a passo detalhado
6. **Tabuadas** — Tabuadas interativas de 1 a 10
7. **Histórico** — Histórico de buscas e cálculos com SQLite

## Primary Content and Functionality

### Busca Acadêmica
- Campo de busca com placeholder "Pesquisar artigos científicos..."
- Filtros: Área (Biologia, Química, Física, Medicina, etc.), Tipo (TCC, Artigo, Dissertação), Idioma
- Botão de busca com indicador de carregamento
- Lista de resultados com cards: título, autores, resumo curto, fonte, links
- Remoção automática de resultados não relacionados ao assunto
- Exportação de resultados em PDF
- Cache offline dos últimos resultados

### Tabelas Numéricas
- Seletor de base: Binário | Octal | Decimal | Hexadecimal
- Tabela com valores de 0 a 50 em todas as bases simultaneamente
- Destaque visual para a base selecionada como referência
- Scroll suave, linhas alternadas para legibilidade

### Calculadora Científica
- Display principal com expressão e resultado
- Teclado numérico + funções: sin, cos, tan, log, ln, √, x², x³, π, e
- Histórico de cálculos
- Painel de passo a passo: cada operação explicada em linguagem natural
- Suporte a parênteses e precedência de operadores

### Tabuadas
- Seletor de número (1–10) com scroll horizontal
- Tabela completa de multiplicação (1×N até 10×N)
- Destaque animado ao tocar em uma linha
- Modo quiz: responder tabuada com feedback

### Histórico
- Lista de buscas recentes com data/hora
- Lista de cálculos recentes
- Opção de limpar histórico
- Persistência via AsyncStorage/SQLite

## Key User Flows

### Busca Acadêmica
1. Usuário abre app → tela de Busca
2. Digita assunto (ex: "fotossíntese em plantas C4")
3. Seleciona filtros opcionais
4. Toca em "Buscar"
5. Vê lista de artigos filtrados e relevantes
6. Toca em artigo → vê resumo completo + todos os links
7. Toca em "Exportar PDF" → compartilha ou salva

### Calculadora
1. Usuário abre aba Calculadora
2. Digita expressão (ex: "sin(30) + log(100)")
3. Toca em "="
4. Vê resultado imediato
5. Toca em "Ver Passo a Passo"
6. Vê cada etapa da resolução explicada

### Tabuadas
1. Usuário abre aba Tabuadas
2. Seleciona número desejado (ex: 7)
3. Vê tabuada completa do 7
4. Opcional: toca em "Quiz" para testar conhecimento

## Tab Bar (5 abas)

| Ícone | Label | Tela |
|-------|-------|------|
| 🔬 magnifyingglass | Busca | Busca acadêmica |
| 🔢 number | Tabelas | Tabelas numéricas |
| 🧮 function | Calc | Calculadora científica |
| ✖️ xmark.circle | Tabuada | Tabuadas |
| 🕐 clock | Histórico | Histórico |
