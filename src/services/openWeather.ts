import {
  IDIOMA_API,
  OPENWEATHER_API_KEY,
  OPENWEATHER_URL,
  TIMEOUT_REQUISICAO_MS,
  temChaveApi,
} from '@/constants/config';
import type {
  OWCidadeGeocoding,
  OWClimaAtualResposta,
  OWOneCallUVResposta,
  OWPrevisaoResposta,
} from '@/types/openWeather';
import type { DadosClima, Local } from '@/types/weather';
import { cidadeParaLocal, gerarIdLocal, montarDadosClima } from '@/utils/transformarDados';

/**
 * Todas as chamadas à OpenWeather ficam aqui (regra do CLAUDE.md: nenhum
 * componente de UI chama a API diretamente).
 *
 * Endpoints usados (todos do plano gratuito):
 * - /data/2.5/weather   → clima atual
 * - /data/2.5/forecast  → previsão de 5 dias em passos de 3 horas
 * - /geo/1.0/direct     → busca de cidade pelo nome
 * - /geo/1.0/reverse    → nome da cidade a partir das coordenadas
 * - /data/3.0/onecall   → só para o índice UV (opcional, ver buscarIndiceUV)
 */

export type TipoErroApi = 'sem-chave' | 'chave-invalida' | 'nao-encontrado' | 'limite' | 'rede' | 'desconhecido';

/** Erro com um "tipo", para a tela saber qual mensagem mostrar. */
export class ErroApi extends Error {
  constructor(
    public readonly tipo: TipoErroApi,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = 'ErroApi';
  }
}

export function mensagemAmigavel(erro: unknown): string {
  if (erro instanceof ErroApi) {
    switch (erro.tipo) {
      case 'sem-chave':
        return 'Chave da OpenWeather não configurada. Crie o arquivo .env (veja o README).';
      case 'chave-invalida':
        return 'Chave da OpenWeather inválida. Chaves novas podem levar até 2 horas para serem ativadas.';
      case 'nao-encontrado':
        return 'Local não encontrado.';
      case 'limite':
        return 'Limite de consultas da API atingido. Tente novamente em alguns minutos.';
      case 'rede':
        return 'Sem conexão com a internet (ou o servidor demorou demais para responder).';
      default:
        return 'Não foi possível carregar o clima. Tente novamente.';
    }
  }
  return 'Ocorreu um erro inesperado.';
}

/**
 * GET genérico com timeout e tratamento de erro.
 * `<T>` é um "genérico": quem chama diz qual tipo espera receber.
 */
async function requisitar<T>(caminho: string, parametros: Record<string, string | number>): Promise<T> {
  if (!temChaveApi()) throw new ErroApi('sem-chave', 'API key ausente');

  const query = new URLSearchParams({
    ...Object.fromEntries(Object.entries(parametros).map(([k, v]) => [k, String(v)])),
    appid: OPENWEATHER_API_KEY,
  });

  // AbortController permite cancelar o fetch se ele demorar demais.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_REQUISICAO_MS);

  let resposta: Response;
  try {
    resposta = await fetch(`${OPENWEATHER_URL}${caminho}?${query.toString()}`, { signal: controller.signal });
  } catch {
    // fetch só lança erro quando nem chegou resposta: sem internet, DNS, timeout...
    throw new ErroApi('rede', 'Falha de rede');
  } finally {
    clearTimeout(timeout);
  }

  if (!resposta.ok) {
    // fetch NÃO lança erro para status 4xx/5xx — precisamos checar manualmente.
    if (resposta.status === 401) throw new ErroApi('chave-invalida', 'HTTP 401');
    if (resposta.status === 404) throw new ErroApi('nao-encontrado', 'HTTP 404');
    if (resposta.status === 429) throw new ErroApi('limite', 'HTTP 429');
    throw new ErroApi('desconhecido', `HTTP ${resposta.status}`);
  }

  return (await resposta.json()) as T;
}

export async function buscarCidades(nome: string): Promise<Local[]> {
  const termo = nome.trim();
  if (termo.length < 2) return [];
  const cidades = await requisitar<OWCidadeGeocoding[]>('/geo/1.0/direct', { q: termo, limit: 5 });
  return cidades.map(cidadeParaLocal);
}

/** Descobre o nome da cidade para uma coordenada do GPS. */
export async function buscarLocalPorCoordenadas(latitude: number, longitude: number): Promise<Local> {
  const cidades = await requisitar<OWCidadeGeocoding[]>('/geo/1.0/reverse', {
    lat: latitude,
    lon: longitude,
    limit: 1,
  });
  const cidade = cidades[0];
  if (!cidade) {
    return { id: gerarIdLocal(latitude, longitude), nome: 'Minha localização', pais: '', latitude, longitude };
  }
  // Mantemos as coordenadas do GPS (mais precisas que o centro da cidade).
  return { ...cidadeParaLocal(cidade), id: gerarIdLocal(latitude, longitude), latitude, longitude };
}

/**
 * O índice UV não existe nos endpoints gratuitos 2.5. Ele está na One Call 3.0,
 * que exige uma assinatura (com cota gratuita) na OpenWeather. Por isso esta
 * função NUNCA lança erro: se não der, devolve null e a tela mostra "—".
 */
async function buscarIndiceUV(latitude: number, longitude: number): Promise<number | null> {
  try {
    const resposta = await requisitar<OWOneCallUVResposta>('/data/3.0/onecall', {
      lat: latitude,
      lon: longitude,
      exclude: 'minutely,hourly,daily,alerts',
    });
    return resposta.current?.uvi ?? null;
  } catch {
    return null;
  }
}

/** Busca tudo que a Home/Previsão precisam, em paralelo. */
export async function buscarDadosClima(local: Local): Promise<DadosClima> {
  const coordenadas = { lat: local.latitude, lon: local.longitude, units: 'metric', lang: IDIOMA_API };

  // Promise.all dispara as 3 requisições ao mesmo tempo (mais rápido que uma por vez).
  const [atual, previsao, indiceUV] = await Promise.all([
    requisitar<OWClimaAtualResposta>('/data/2.5/weather', coordenadas),
    requisitar<OWPrevisaoResposta>('/data/2.5/forecast', coordenadas),
    buscarIndiceUV(local.latitude, local.longitude),
  ]);

  return montarDadosClima({ atual, previsao, local, indiceUV, agoraMs: Date.now() });
}
