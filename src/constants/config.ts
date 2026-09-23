/**
 * Configurações gerais do app.
 *
 * A chave da API vem de uma variável de ambiente. No Expo, variáveis com o
 * prefixo EXPO_PUBLIC_ são lidas do arquivo `.env` e embutidas no app.
 *
 * ⚠️ Importante: "embutida no app" significa que qualquer pessoa pode extrair
 * essa chave do aplicativo compilado. Em apps comerciais, a chave ficaria em
 * um backend próprio. Aqui aceitamos esse risco de propósito, porque o projeto
 * não tem backend (ver CLAUDE.md, seção 3) e a chave gratuita tem baixo impacto.
 */
export const OPENWEATHER_API_KEY: string = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY ?? '';

export const OPENWEATHER_URL = 'https://api.openweathermap.org';
export const OPENWEATHER_TILES_URL = 'https://tile.openweathermap.org/map';

/** Idioma das descrições ("céu limpo", "chuva leve"...). */
export const IDIOMA_API = 'pt_br';

/** Depois desse tempo os dados do clima são considerados "velhos" e recarregados. */
export const TEMPO_CACHE_MS = 10 * 60 * 1000; // 10 minutos

/** Tempo máximo de espera por uma resposta da API. */
export const TIMEOUT_REQUISICAO_MS = 15 * 1000;

/** Quantos registros de histórico guardamos no máximo. */
export const LIMITE_HISTORICO = 60;

export function temChaveApi(): boolean {
  return OPENWEATHER_API_KEY.length > 0 && OPENWEATHER_API_KEY !== 'sua_chave_aqui';
}
