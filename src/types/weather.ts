/**
 * Tipos do domínio do app (já "traduzidos" para o nosso vocabulário).
 *
 * Por que ter tipos próprios em vez de usar direto o JSON da OpenWeather?
 * - A UI não fica acoplada ao formato da API: se trocarmos de API, só o
 *   arquivo `src/utils/transformarDados.ts` muda.
 * - Os nomes ficam em português e com unidades bem definidas.
 *
 * Convenção de unidades usada em TODO o app (a conversão para °F/mph
 * acontece só na hora de exibir, em `src/utils/formatar.ts`):
 * - Temperaturas em °C
 * - Velocidade do vento em m/s
 * - Probabilidade de chuva de 0 a 1
 * - Horários em timestamp Unix (segundos, UTC)
 */

/** Categoria simplificada da condição do tempo — base para cores, ícones e regras. */
export type CategoriaClima =
  | 'limpo'
  | 'poucas-nuvens'
  | 'nublado'
  | 'garoa'
  | 'chuva'
  | 'tempestade'
  | 'neve'
  | 'neblina';

/** Um lugar no mapa (cidade pesquisada ou posição do GPS). */
export interface Local {
  /** Identificador estável, derivado das coordenadas. */
  id: string;
  nome: string;
  estado?: string;
  pais: string;
  latitude: number;
  longitude: number;
}

export interface ClimaAtual {
  horario: number;
  temperatura: number;
  sensacaoTermica: number;
  tempMin: number;
  tempMax: number;
  umidade: number;
  /** hPa */
  pressao: number;
  ventoVelocidade: number;
  /** Graus (0 = norte, 90 = leste...) */
  ventoDirecao: number;
  ventoRajada: number | null;
  /** Metros. A API pode não enviar. */
  visibilidade: number | null;
  /** Percentual de cobertura de nuvens (0–100). */
  nuvens: number;
  descricao: string;
  categoria: CategoriaClima;
  ehNoite: boolean;
  nascerDoSol: number;
  porDoSol: number;
  /** Vem da previsão (o endpoint de clima atual não informa). */
  probabilidadeChuva: number;
  /** Só disponível se a chave tiver acesso à One Call 3.0. */
  indiceUV: number | null;
}

export interface PrevisaoHora {
  horario: number;
  temperatura: number;
  sensacaoTermica: number;
  probabilidadeChuva: number;
  /** Volume de chuva em mm no intervalo de 3 horas. */
  volumeChuva: number;
  ventoVelocidade: number;
  descricao: string;
  categoria: CategoriaClima;
  ehNoite: boolean;
}

export interface PrevisaoDia {
  /** Data local no formato AAAA-MM-DD. */
  data: string;
  tempMin: number;
  tempMax: number;
  probabilidadeChuvaMax: number;
  categoria: CategoriaClima;
  descricao: string;
  horas: PrevisaoHora[];
}

/** Tudo que uma tela precisa para mostrar o clima de um local. */
export interface DadosClima {
  local: Local;
  atual: ClimaAtual;
  /** Próximas horas (passos de 3h, como vem da API gratuita). */
  horas: PrevisaoHora[];
  dias: PrevisaoDia[];
  /** Diferença do fuso da cidade em relação ao UTC, em segundos. */
  fusoHorario: number;
  /** Quando os dados foram buscados (ms, Date.now()). */
  obtidoEm: number;
}

export type UnidadeTemperatura = 'C' | 'F';
export type PreferenciaTema = 'sistema' | 'claro' | 'escuro';
