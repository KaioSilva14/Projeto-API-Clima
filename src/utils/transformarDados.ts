import type {
  OWCidadeGeocoding,
  OWClimaAtualResposta,
  OWPrevisaoItem,
  OWPrevisaoResposta,
} from '@/types/openWeather';
import type { CategoriaClima, ClimaAtual, DadosClima, Local, PrevisaoDia, PrevisaoHora } from '@/types/weather';
import { categorizarClima, ehChuvoso } from './categorizarClima';
import { chaveDoDia } from './formatar';

/**
 * Converte as respostas "cruas" da OpenWeather nos tipos do app.
 * Toda a dependência do formato da API fica concentrada aqui.
 */

/** Id estável para um local: coordenadas com 2 casas (~1 km de precisão). */
export function gerarIdLocal(latitude: number, longitude: number): string {
  return `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
}

export function cidadeParaLocal(cidade: OWCidadeGeocoding): Local {
  return {
    id: gerarIdLocal(cidade.lat, cidade.lon),
    // A API às vezes traz o nome em português (ex.: "Nova York").
    nome: cidade.local_names?.pt ?? cidade.name,
    estado: cidade.state,
    pais: cidade.country,
    latitude: cidade.lat,
    longitude: cidade.lon,
  };
}

function transformarHora(item: OWPrevisaoItem): PrevisaoHora {
  const condicao = item.weather[0];
  return {
    horario: item.dt,
    temperatura: item.main.temp,
    sensacaoTermica: item.main.feels_like,
    probabilidadeChuva: item.pop ?? 0,
    volumeChuva: item.rain?.['3h'] ?? 0,
    ventoVelocidade: item.wind.speed,
    descricao: condicao?.description ?? '',
    categoria: categorizarClima(condicao?.id ?? 800),
    ehNoite: item.sys.pod === 'n',
  };
}

/** A categoria que mais aparece na lista (em empate, a que apareceu primeiro). */
function maisFrequente(horas: PrevisaoHora[]): PrevisaoHora {
  const contagem = new Map<CategoriaClima, number>();
  for (const h of horas) contagem.set(h.categoria, (contagem.get(h.categoria) ?? 0) + 1);

  let vencedora = horas[0];
  for (const h of horas) {
    if ((contagem.get(h.categoria) ?? 0) > (contagem.get(vencedora.categoria) ?? 0)) vencedora = h;
  }
  return vencedora;
}

/**
 * Escolhe a categoria que representa o dia, por ordem de importância:
 * 1. Tempestade em qualquer horário.
 * 2. Chuva/garoa em pelo menos 2 blocos (6 horas) — senão um dia com a tarde
 *    toda chuvosa apareceria como "céu limpo" com 70% de chance de chuva.
 * 3. A condição mais frequente.
 */
function categoriaDoDia(horas: PrevisaoHora[]): { categoria: CategoriaClima; descricao: string } {
  const tempestade = horas.find((h) => h.categoria === 'tempestade');
  if (tempestade) return { categoria: 'tempestade', descricao: tempestade.descricao };

  const chuvosas = horas.filter((h) => ehChuvoso(h.categoria));
  const escolhida = chuvosas.length >= 2 ? maisFrequente(chuvosas) : maisFrequente(horas);
  return { categoria: escolhida.categoria, descricao: escolhida.descricao };
}

/** Agrupa a previsão de 3 em 3 horas em dias (no fuso da cidade). */
export function agruparPorDia(horas: PrevisaoHora[], fusoHorario: number): PrevisaoDia[] {
  const grupos = new Map<string, PrevisaoHora[]>();
  for (const hora of horas) {
    const chave = chaveDoDia(hora.horario, fusoHorario);
    const lista = grupos.get(chave) ?? [];
    lista.push(hora);
    grupos.set(chave, lista);
  }

  return Array.from(grupos.entries()).map(([data, horasDoDia]) => {
    const temperaturas = horasDoDia.map((h) => h.temperatura);
    const { categoria, descricao } = categoriaDoDia(horasDoDia);
    return {
      data,
      tempMin: Math.min(...temperaturas),
      tempMax: Math.max(...temperaturas),
      probabilidadeChuvaMax: Math.max(...horasDoDia.map((h) => h.probabilidadeChuva)),
      categoria,
      descricao,
      horas: horasDoDia,
    };
  });
}

export function montarDadosClima(params: {
  atual: OWClimaAtualResposta;
  previsao: OWPrevisaoResposta;
  local: Local;
  indiceUV: number | null;
  agoraMs: number;
}): DadosClima {
  const { atual, previsao, local, indiceUV, agoraMs } = params;
  const fusoHorario = atual.timezone;
  const condicao = atual.weather[0];

  const horas = previsao.list.map(transformarHora);
  const dias = agruparPorDia(horas, fusoHorario);

  const climaAtual: ClimaAtual = {
    horario: atual.dt,
    temperatura: atual.main.temp,
    sensacaoTermica: atual.main.feels_like,
    tempMin: atual.main.temp_min,
    tempMax: atual.main.temp_max,
    umidade: atual.main.humidity,
    pressao: atual.main.pressure,
    ventoVelocidade: atual.wind.speed,
    ventoDirecao: atual.wind.deg,
    ventoRajada: atual.wind.gust ?? null,
    visibilidade: atual.visibility ?? null,
    nuvens: atual.clouds.all,
    descricao: condicao?.description ?? '',
    categoria: categorizarClima(condicao?.id ?? 800),
    ehNoite: atual.dt < atual.sys.sunrise || atual.dt > atual.sys.sunset,
    nascerDoSol: atual.sys.sunrise,
    porDoSol: atual.sys.sunset,
    // O clima atual não traz chance de chuva; usamos a do próximo bloco da previsão.
    probabilidadeChuva: horas[0]?.probabilidadeChuva ?? 0,
    indiceUV,
  };

  // O "hoje" da previsão só tem as horas que faltam; incluímos a temperatura
  // atual para a mínima/máxima do dia não ficarem estranhas à noite.
  const chaveHoje = chaveDoDia(atual.dt, fusoHorario);
  const hoje = dias[0];
  if (hoje && hoje.data === chaveHoje) {
    hoje.tempMin = Math.min(hoje.tempMin, climaAtual.temperatura);
    hoje.tempMax = Math.max(hoje.tempMax, climaAtual.temperatura);
  } else {
    // Perto da meia-noite, o primeiro bloco da previsão já é de amanhã.
    // Criamos o "hoje" a partir do clima atual para a tela nunca mostrar
    // a máxima/mínima de amanhã como se fosse de hoje.
    dias.unshift({
      data: chaveHoje,
      tempMin: climaAtual.temperatura,
      tempMax: climaAtual.temperatura,
      probabilidadeChuvaMax: climaAtual.probabilidadeChuva,
      categoria: climaAtual.categoria,
      descricao: climaAtual.descricao,
      horas: [],
    });
  }

  return { local, atual: climaAtual, horas, dias, fusoHorario, obtidoEm: agoraMs };
}
