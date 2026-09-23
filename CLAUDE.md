# CLAUDE.md — WeatherFlow

Este arquivo orienta o Claude Code (e qualquer colaborador) sobre como trabalhar neste projeto. Leia antes de gerar ou alterar qualquer código.

## 1. Visão do projeto

WeatherFlow é um aplicativo mobile de clima que **não se limita a exibir dados brutos** — ele interpreta as condições climáticas e traduz em informações compreensíveis para o usuário no dia a dia.

Exemplo do tipo de experiência que queremos:

```
27°C • Parcialmente nublado
Sensação de 29°C
Chuva: 20%
Vento: 14 km/h

Resumo do dia
Temperatura agradável durante a tarde, com possibilidade baixa de chuva.
```

E a seção diferencial do app, chamada **"Como está o dia?"**, que transforma dados meteorológicos brutos em frases interpretativas, por exemplo:

- "Bom momento para sair — 26°C • Baixa chance de chuva • Vento moderado"
- "Leve um guarda-chuva — Chuva prevista nas próximas 2 horas."

Na V1, essa interpretação é feita **por regras baseadas nos dados** (sem IA). Uma versão com IA gerando explicações mais naturais pode vir depois, como evolução futura — não é escopo inicial.

## 2. Objetivo de aprendizado

Este é um projeto de portfólio/aprendizado para quem está migrando de carreira para desenvolvimento mobile, ainda iniciante em programação. O código deve:

- Priorizar clareza e boas práticas sobre "atalhos experientes"
- Ser bem comentado nos pontos conceituais importantes (permissões, GPS, gerenciamento de estado, etc.)
- Evitar complexidade desnecessária — cada tecnologia adicionada deve ter um motivo pedagógico claro

Áreas de aprendizado cobertas pelo projeto:

- TypeScript (tipagem e arquitetura)
- React Native (desenvolvimento mobile)
- Expo (recursos nativos)
- Consumo de REST API externa
- GPS e permissões (Android/iOS)
- Persistência local simples (AsyncStorage)
- Gerenciamento de estado (Zustand)
- Notificações locais
- Mapas e coordenadas
- Design de UI/UX (Figma)
- Versionamento (Git/GitHub)
- Testes e tratamento de erros em situações reais

## 3. Restrições importantes (não negociáveis)

- ❌ **Nenhum banco de dados remoto e nenhum backend próprio** (sem Supabase, sem Firebase, sem servidor próprio). Cache local + consumo direto da API externa é suficiente e mais didático.
- ❌ Sem contas de usuário / login / autenticação
- ❌ Sem funcionalidades sociais (compartilhamento entre usuários, ranking, etc.)
- ✅ Persistência local apenas via **AsyncStorage** (favoritos, histórico, preferências) — **sem SQLite** neste projeto, para manter simplicidade (diferente de outros projetos do usuário que já usam SQLite)

## 4. Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Linguagem | TypeScript |
| Framework mobile | React Native + Expo |
| Navegação | Expo Router |
| API de clima | OpenWeather API |
| Localização | Expo Location |
| Notificações | Expo Notifications |
| Armazenamento local | AsyncStorage |
| Gerenciamento de estado | Zustand |
| Mapas | React Native Maps (ou lib compatível com Expo) |
| Gráficos | componente próprio com `react-native-svg` (`src/components/TemperatureChart.tsx`) — ver seção 11 |
| Testes | Jest (`jest-expo`) para as funções puras de `src/utils` |
| Versionamento | Git + GitHub |
| Design | Figma |

## 5. Estrutura de telas/pastas

A raiz do repositório (pasta `Projeto-Clima/`) é a raiz do app — não existe uma subpasta `WeatherFlow/`.

```
Projeto-Clima/
│
├── app/                          (Expo Router)
│   ├── (tabs)/
│   │   ├── index.tsx             → Home
│   │   ├── forecast.tsx          → Forecast
│   │   ├── cities.tsx            → Cities
│   │   ├── map.tsx               → Map
│   │   └── alerts.tsx            → Alerts
│   └── settings.tsx              → Settings
│
├── src/
│   ├── components/                componentes de UI reutilizáveis
│   ├── services/                  OpenWeather API, GPS (expo-location) e notificações
│   ├── hooks/                     hooks customizados (useWeather, useTema, usePermissaoLocalizacao...)
│   ├── store/                     stores Zustand
│   ├── utils/                     funções puras (interpretação do clima, formatação)
│   ├── types/                     tipos TypeScript
│   └── constants/                 cores, temas, config
│
└── assets/                        ícones, animações, imagens
```

### Detalhamento das telas

- **Home**
  - Localização automática
  - Clima atual
  - Sensação térmica
  - Resumo/previsão do dia
  - Seção "Como está o dia?"

- **Forecast**
  - Previsão detalhada (horária e para os próximos dias)

- **Cities**
  - Pesquisar cidades (ex.: Londrina, São Paulo, Curitiba, Nova York)
  - Salvar/gerenciar cidades favoritas

- **Map**
  - Mapa meteorológico da região do usuário (versão mais avançada — pode ser posterior)

- **Alerts**
  - Alertas meteorológicos (ex.: "Possibilidade de chuva forte nas próximas horas", "Temperatura prevista acima de 35°C hoje")

- **Settings**
  - Unidade °C/°F
  - Tema
  - Notificações
  - Permissões

## 6. Funcionalidades detalhadas

### 6.1 Localização automática
- Ao abrir o app: solicitar permissão de acesso à localização
- Identificar a cidade automaticamente via GPS
- Tratar corretamente o caso de permissão negada (fallback: pesquisa manual de cidade)
- Suportar localização aproximada quando a precisa não estiver disponível

### 6.2 Pesquisa de cidades
- Busca por nome de cidade
- Lista de cidades favoritas, persistida em AsyncStorage

### 6.3 Clima atual + previsão
Dados a exibir:
- Temperatura
- Sensação térmica
- Umidade
- Pressão
- Velocidade e direção do vento
- Índice UV
- Visibilidade
- Probabilidade de chuva
- Nascer e pôr do sol
- Previsão para os próximos dias

### 6.4 Interface que muda conforme o clima
- Chuva → animação de chuva
- Sol → iluminação/gradiente mais claro
- Tempestade → pequena animação de relâmpago
- Noite → interface em modo noturno

Objetivo: experiência visual profissional, sem exagero.

### 6.5 Radar/mapa
- Mapa mostrando a região do usuário
- Aprendizado de: mapas, coordenadas, markers, interação com mapas, APIs geográficas
- Pode ser implementado em uma fase mais avançada do projeto

### 6.6 Alertas meteorológicos
- Notificações locais/push baseadas em condições (chuva forte prevista, temperatura extrema, etc.)

### 6.7 Histórico
- Guardar o clima consultado por data (ex.: 23/09 — 27°C)
- Persistido em AsyncStorage
- Base para gráficos futuros

### 6.8 Widget/atalho (evolução futura)
- Widget nativo mostrando resumo do clima atual
- Aproxima o projeto de um app mobile "de verdade"
- Não é prioridade da V1

## 7. Lógica de interpretação ("Como está o dia?")

Implementar como função pura baseada em regras, sem IA na V1:

- Entrada: temperatura, probabilidade de chuva, vento, condição geral
- Saída: frase interpretativa + ícone/categoria (ex.: "bom para sair", "leve guarda-chuva", "evite atividades externas")

Sugestão: centralizar essa lógica em `src/utils/interpretarClima.ts`, testável isoladamente e fácil de estender depois.

## 8. Ordem de desenvolvimento sugerida

1. Setup do projeto (Expo + TypeScript + Expo Router)
2. Tela Home com localização automática + consumo básico da OpenWeather API
3. Exibição de dados detalhados do clima atual
4. Lógica de interpretação ("Como está o dia?")
5. Tela Forecast (previsão detalhada)
6. Tela Cities (pesquisa + favoritos com AsyncStorage)
7. Interface dinâmica conforme o clima (animações/gradientes)
8. Tela Settings (unidade, tema, notificações, permissões)
9. Histórico de consultas (AsyncStorage)
10. Alertas meteorológicos (Expo Notifications)
11. Tela Map (avançado)
12. Widget/atalho (futuro, fora do escopo inicial)

## 9. Convenções de código

- Componentes funcionais + hooks
- Tipagem explícita em props, retornos de função e estados
- Nomes de arquivos de componentes em PascalCase; hooks em camelCase com prefixo `use`
- Nenhuma chamada direta à API dentro de componentes de UI — sempre via `src/services`
- Erros de rede/permissão devem ser tratados explicitamente (nunca deixar a tela quebrar silenciosamente)

- Imports internos usam o atalho `@/` (= `src/`), ex.: `import { useTema } from '@/hooks/useTema'`
- Unidades internas fixas: °C, m/s, probabilidade 0–1, horários Unix em segundos. Conversão para °F/mph **só na exibição** (`src/utils/formatar.ts`)
- Dependências novas: sempre `npx expo install <pacote>` (resolve a versão compatível com o SDK)
- Antes de dar uma tarefa por concluída: `npm run typecheck`, `npm run lint` e `npm test`
- Regras específicas do Expo SDK 57 estão em `AGENTS.md` (ex.: `Tabs` vem de `expo-router/js-tabs`)

## 10. Fora de escopo (V1)

- Banco de dados remoto / backend próprio
- Login / autenticação / contas de usuário
- Recursos sociais entre usuários
- Interpretação do clima via IA (pode vir depois, como evolução)
- Widget nativo (evolução futura)
## 11. Decisões técnicas (revisão de 23/09/2026)

Pontos em que a especificação original precisou de ajuste ao ser implementada:

| Tema | Decisão | Motivo |
|---|---|---|
| Endpoints da OpenWeather | Apenas os gratuitos: `/data/2.5/weather`, `/data/2.5/forecast`, `/geo/1.0/direct` e `/geo/1.0/reverse` | Não exigem cartão de crédito |
| Índice UV | Buscado na One Call 3.0 de forma **opcional**; se falhar, a tela mostra "—" sem erro | O UV não existe nos endpoints 2.5 gratuitos |
| Previsão | Blocos de 3 em 3 horas, 5 dias | É o que o plano gratuito oferece |
| Probabilidade de chuva "atual" | Vem do primeiro bloco da previsão (`pop`) | O endpoint de clima atual não traz esse dado |
| Chave da API | Variável `EXPO_PUBLIC_OPENWEATHER_API_KEY` no `.env` (não versionado) | Sem backend, a chave fica embutida no app — risco aceito por ser uma chave gratuita |
| Gráficos | Componente próprio com `react-native-svg` em vez de biblioteca de charts | Um gráfico de linha simples não justifica a dependência e é mais didático |
| Alertas | Avaliados quando o app busca dados (ao abrir ou atualizar), com notificação local | Verificar com o app fechado exige tarefa em segundo plano — evolução futura |
| Mapa na web | `WeatherMap.web.tsx` mostra um aviso | `react-native-maps` não funciona no navegador |
| Mapa no Android (build próprio) | Exige chave do Google Maps no `app.json` | No Expo Go funciona sem configuração |
| Cache | O último clima consultado fica salvo; sem internet, o app mostra esses dados com um aviso | Seção 3: cache local em vez de backend |

## 12. Status do desenvolvimento

Itens da seção 8:

- [x] 1. Setup (Expo SDK 57 + TypeScript + Expo Router)
- [x] 2. Home com localização automática + OpenWeather
- [x] 3. Dados detalhados do clima atual
- [x] 4. "Como está o dia?" (`src/utils/interpretarClima.ts`, com testes)
- [x] 5. Forecast (24h, gráfico e 5 dias)
- [x] 6. Cities (busca com debounce + favoritas)
- [x] 7. Interface dinâmica (gradientes, chuva, relâmpago; respeita "reduzir movimento")
- [x] 8. Settings (unidade, tema, notificações, permissões)
- [x] 9. Histórico (exibido na aba Previsão)
- [x] 10. Alertas + notificações locais
- [x] 11. Map (camadas de chuva, nuvens, temperatura e vento)
- [ ] 12. Widget (fora do escopo da V1)

Próximos passos sugeridos: testar em aparelho real, criar o design no Figma, verificar alertas em segundo plano (`expo-background-task`) e fazer gráficos a partir do histórico.
