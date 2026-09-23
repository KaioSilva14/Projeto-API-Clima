import type { UnidadeTemperatura } from '@/types/weather';

/**
 * Funções puras de formatação. "Pura" = mesma entrada, mesma saída, sem
 * efeitos colaterais. Isso torna tudo aqui fácil de testar (ver __tests__).
 */

export function celsiusParaFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

/** Ex.: formatarTemperatura(27.4, 'C') → "27°C" */
export function formatarTemperatura(celsius: number, unidade: UnidadeTemperatura, comUnidade = true): string {
  const valor = unidade === 'F' ? celsiusParaFahrenheit(celsius) : celsius;
  // Math.round(-0.4) dá -0; somar 0 transforma em 0 para não exibir "-0°".
  const arredondado = Math.round(valor) + 0;
  return comUnidade ? `${arredondado}°${unidade}` : `${arredondado}°`;
}

export function metrosPorSegundoParaKmh(ms: number): number {
  return ms * 3.6;
}

/**
 * Vento em km/h para quem usa °C e em mph para quem usa °F
 * (é o costume nos países que usam Fahrenheit).
 */
export function formatarVento(ms: number, unidade: UnidadeTemperatura): string {
  if (unidade === 'F') return `${Math.round(ms * 2.23694)} mph`;
  return `${Math.round(metrosPorSegundoParaKmh(ms))} km/h`;
}

const DIRECOES = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'] as const;

/** Converte graus (0–360) em ponto cardeal. Ex.: 45 → "NE". */
export function direcaoDoVento(graus: number): string {
  const normalizado = ((graus % 360) + 360) % 360;
  const indice = Math.round(normalizado / 45) % 8;
  return DIRECOES[indice];
}

export function formatarPorcentagem(fracao: number): string {
  return `${Math.round(fracao * 100)}%`;
}

export function formatarVisibilidade(metros: number | null): string {
  if (metros === null) return '—';
  if (metros >= 1000) return `${(metros / 1000).toFixed(metros >= 10000 ? 0 : 1).replace('.', ',')} km`;
  return `${metros} m`;
}

/** Índice UV com a classificação da OMS. Ex.: 7 → "7 (alto)". */
export function formatarIndiceUV(uv: number | null): string {
  if (uv === null) return '—';
  const valor = Math.round(uv);
  let nivel = 'extremo';
  if (valor <= 2) nivel = 'baixo';
  else if (valor <= 5) nivel = 'moderado';
  else if (valor <= 7) nivel = 'alto';
  else if (valor <= 10) nivel = 'muito alto';
  return `${valor} (${nivel})`;
}

/**
 * Datas e horas: a API manda horários em UTC + o fuso da cidade (em segundos).
 * Somamos o fuso e lemos com getUTC*, assim a hora exibida é a hora local
 * DA CIDADE — e não a do celular (importante ao ver o clima de Nova York
 * estando no Brasil, por exemplo).
 */
function dataNoFuso(unixSegundos: number, fusoSegundos: number): Date {
  return new Date((unixSegundos + fusoSegundos) * 1000);
}

function doisDigitos(n: number): string {
  return n.toString().padStart(2, '0');
}

/** Ex.: "06:42" */
export function formatarHora(unixSegundos: number, fusoSegundos: number): string {
  const d = dataNoFuso(unixSegundos, fusoSegundos);
  return `${doisDigitos(d.getUTCHours())}:${doisDigitos(d.getUTCMinutes())}`;
}

/** Hora local (0–23) da cidade. */
export function horaLocal(unixSegundos: number, fusoSegundos: number): number {
  return dataNoFuso(unixSegundos, fusoSegundos).getUTCHours();
}

/** Ex.: "2026-09-23" — usado como chave para agrupar por dia. */
export function chaveDoDia(unixSegundos: number, fusoSegundos: number): string {
  const d = dataNoFuso(unixSegundos, fusoSegundos);
  return `${d.getUTCFullYear()}-${doisDigitos(d.getUTCMonth() + 1)}-${doisDigitos(d.getUTCDate())}`;
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** "2026-09-23" → "23/09" */
export function formatarDiaMes(chave: string): string {
  const [, mes, dia] = chave.split('-');
  return `${dia}/${mes}`;
}

/** "2026-09-23" → "Qua" (ou "Hoje" / "Amanhã" quando for o caso). */
export function nomeDoDia(chave: string, chaveHoje: string): string {
  if (chave === chaveHoje) return 'Hoje';
  const [ano, mes, dia] = chave.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  const [anoH, mesH, diaH] = chaveHoje.split('-').map(Number);
  const hoje = new Date(Date.UTC(anoH, mesH - 1, diaH));
  const diferencaDias = Math.round((data.getTime() - hoje.getTime()) / 86_400_000);
  if (diferencaDias === 1) return 'Amanhã';
  return DIAS_SEMANA[data.getUTCDay()];
}

/** "há 5 min", "agora mesmo"... para mostrar a idade dos dados em cache. */
export function tempoDecorrido(desdeMs: number, agoraMs: number = Date.now()): string {
  const minutos = Math.floor((agoraMs - desdeMs) / 60_000);
  if (minutos < 1) return 'agora mesmo';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  return `há ${Math.floor(horas / 24)} dia(s)`;
}

/** "céu limpo" → "Céu limpo" */
export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function nomeCompletoDoLocal(local: { nome: string; estado?: string; pais: string }): string {
  return [local.nome, local.estado, local.pais].filter(Boolean).join(', ');
}
