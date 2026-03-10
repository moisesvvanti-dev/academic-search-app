# AcadêmicoSearch — TODO

## Funcionalidades Principais Implementadas
- [x] Busca acadêmica com múltiplas APIs (Semantic Scholar, CrossRef, PubMed)
- [x] Tabelas numéricas (binário, octal, decimal, hexadecimal) de 0 a 50
- [x] Calculadora científica com passo a passo
- [x] Tabuadas interativas com modo quiz
- [x] Histórico de buscas e cálculos com AsyncStorage
- [x] Busca universal na internet com DuckDuckGo
- [x] Autenticação com email/senha
- [x] Reset de senha via SMS com token temporário
- [x] Busca real via internet (WiFi/dados móveis)
- [x] Permissões de contatos para compartilhamento
- [x] Compartilhamento de resultados via WhatsApp, Email, SMS

## Melhorias Implementadas
- [x] Cache offline inteligente (10 min TTL)
- [x] Filtros de busca avançados (por tipo: web, news, images)
- [x] Sugestões de busca na tela inicial
- [x] Tela de login com email e senha
- [x] Tela de reset de senha com SMS
- [x] Integração com banco de dados (MySQL + Drizzle ORM)
- [x] Rotas protegidas com autenticação
- [x] Compartilhamento com contatos do dispositivo

## Bugs Corrigidos
- [x] Busca acadêmica retorna "nada encontrado" — CORRIGIDO
- [x] Erro de build APK (minSdkVersion) — CORRIGIDO
- [x] Compatibilidade com Kotlin 2.0.21 — CORRIGIDO
- [x] compileSdkVersion 35 para compatibilidade — CORRIGIDO

## Próximas Melhorias Sugeridas
- [ ] Exportação de resultados em PDF com formatação
- [ ] Busca por voz com reconhecimento de fala
- [ ] Favoritos com anotações pessoais
- [ ] Notificações push de novos artigos em tópicos de interesse
- [ ] Sincronização em nuvem de histórico e favoritos
- [ ] Modo offline com cache inteligente de resultados populares
- [ ] Integração com Zotero para gestão de referências


## Bugs Corrigidos
- [x] Erro de build R8: classes faltando em expo-contacts e expo-sharing — CORRIGIDO: adicionadas regras de keep no ProGuard
