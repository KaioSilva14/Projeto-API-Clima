import type { CategoriaClima, DadosClima, PrevisaoDia } from '@/types/weather';
import { ehChuvoso } from './categorizarClima';
import { horaLocal, metrosPorSegundoParaKmh } from './formatar';

/**
 * "Como está o dia?" — o diferencial do WeatherFlow.
 *
 * Transforma números (26°C, 20% de chuva, 14 km/h) em conselhos práticos
 * ("Bom momento para sair"). Na V1 isso é feito com REGRAS simples, sem IA.
 *
 * Tudo aqui trabalha em °C e km/h — a conversão para a unidade do usuário
 * acontece só na tela. As regras são avaliadas em ordem de prioridade:
 * a primeira que "casar" define o conselho.
 */

export type TipoConselho =
  | 'bom-para-sair'
  | 'leve-guarda-chuva'
  | 'evite-atividades-externas'
  | 'hidrate-se'
  | 'agasalhe-se'
  | 'atencao';

export interface EntradaInterpretacao {
  temperatura: number;
  sensacaoTermica: number;
  /** 0 a 1 */
  probabilidadeChuva: number;
  ventoKmh: number;
  categoria: CategoriaClima;
  ehNoite: boolean;
  /** Em quantas horas a chuva deve começar (null = sem chuva prevista em breve). */
  horasAteChuva: number | null;
}

export interface Conselho {
  tipo: TipoConselho;
  titulo: string;
  /** Frase complementar opcional, ex.: "Chuva prevista nas próximas 2 horas." */
  mensagem: string | null;
  /** Itens curtos exibidos após a temperatura: "Baixa chance de chuva", "Vento moderado". */
  detalhes: string[];
}

// Limites usados pelas regras — nomeados para ficar fácil ajustar depois.
export const LIMITES = {
  ventoForteKmh: 50,
  calorSensacao: 35,
  frioSensacao: 8,
  chanceChuvaAlta: 0.6,
  chanceChuvaMedia: 0.3,
} as const;

export function descreverChanceDeChuva(probabilidade: number): string {
  if (probabilidade >= LIMITES.chanceChuvaAlta) return 'Alta chance de chuva';
  if (probabilidade >= LIMITES.chanceChuvaMedia) return 'Chance moderada de chuva';
  return 'Baixa chance de chuva';
}

export function descreverVento(kmh: number): string {
  if (kmh < 12) return 'Vento fraco';
  if (kmh < 30) return 'Vento moderado';
  if (kmh < LIMITES.ventoForteKmh) return 'Vento forte';
  return 'Ventania';
}

function mensagemDeChuva(horasAteChuva: number | null): string | null {
  if (horasAteChuva === null) return null;
  if (horasAteChuva <= 0) return 'Está chovendo ou a chuva está começando agora.';
  if (horasAteChuva === 1) return 'Chuva prevista para a próxima hora.';
  return `Chuva prevista nas próximas ${horasAteChuva} horas.`;
}

export function interpretarClima(entrada: EntradaInterpretacao): Conselho {
  const { sensacaoTermica, probabilidadeChuva, ventoKmh, categoria, ehNoite, horasAteChuva } = entrada;
  const detalhes = [descreverChanceDeChuva(probabilidadeChuva), descreverVento(ventoKmh)];

  // 1. Tempestade: segurança em primeiro lugar.
  if (categoria === 'tempestade') {
    return {
      tipo: 'evite-atividades-externas',
      titulo: 'Evite atividades externas',
      mensagem: 'Tempestade na região — prefira ficar em um local protegido.',
      detalhes,
    };
  }

  // 2. Vento muito forte.
  if (ventoKmh >= LIMITES.ventoForteKmh) {
    return {
      tipo: 'evite-atividades-externas',
      titulo: 'Evite atividades externas',
      mensagem: 'Ventos fortes — cuidado com objetos soltos e árvores.',
      detalhes,
    };
  }

  // 3. Chovendo agora ou chuva muito provável.
  if (ehChuvoso(categoria) || probabilidadeChuva >= LIMITES.chanceChuvaAlta || horasAteChuva !== null) {
    return {
      tipo: 'leve-guarda-chuva',
      titulo: 'Leve um guarda-chuva',
      mensagem: mensagemDeChuva(ehChuvoso(categoria) ? 0 : horasAteChuva),
      detalhes,
    };
  }

  // 4. Calor intenso.
  if (sensacaoTermica >= LIMITES.calorSensacao) {
    return {
      tipo: 'hidrate-se',
      titulo: 'Calor intenso — hidrate-se',
      mensagem: 'Evite o sol entre 10h e 16h e use protetor solar.',
      detalhes,
    };
  }

  // 5. Frio.
  if (sensacaoTermica <= LIMITES.frioSensacao) {
    return {
      tipo: 'agasalhe-se',
      titulo: 'Leve um agasalho',
      mensagem: 'A sensação térmica está baixa.',
      detalhes,
    };
  }

  // 6. Tempo instável (chance moderada de chuva).
  if (probabilidadeChuva >= LIMITES.chanceChuvaMedia) {
    return {
      tipo: 'atencao',
      titulo: 'Tempo instável',
      mensagem: 'Um guarda-chuva na bolsa pode ser útil.',
      detalhes,
    };
  }

  // 7. Neblina.
  if (categoria === 'neblina') {
    return {
      tipo: 'atencao',
      titulo: 'Atenção à neblina',
      mensagem: 'Visibilidade reduzida — cuidado no trânsito.',
      detalhes,
    };
  }

  // 8. Nenhum problema encontrado.
  return {
    tipo: 'bom-para-sair',
    titulo: ehNoite ? 'Noite tranquila para sair' : 'Bom momento para sair',
    mensagem: null,
    detalhes,
  };
}

/**
 * Procura a primeira previsão com chuva provável nas próximas `janelaHoras`.
 * Retorna em quantas horas (arredondado) ou null.
 */
export function calcularHorasAteChuva(
  dados: Pick<DadosClima, 'horas'>,
  agoraSegundos: number,
  janelaHoras = 6,
): number | null {
  const limite = agoraSegundos + janelaHoras * 3600;
  const proxima = dados.horas.find(
    (h) =>
      h.horario <= limite &&
      h.horario + 3 * 3600 > agoraSegundos && // bloco de 3h ainda não terminou
      (ehChuvoso(h.categoria) || h.probabilidadeChuva >= LIMITES.chanceChuvaAlta),
  );
  if (!proxima) return null;
  return Math.max(0, Math.round((proxima.horario - agoraSegundos) / 3600));
}

/** Atalho: monta a entrada a partir dos dados completos e interpreta. */
export function interpretarDados(dados: DadosClima, agoraMs: number = Date.now()): Conselho {
  const { atual } = dados;
  return interpretarClima({
    temperatura: atual.temperatura,
    sensacaoTermica: atual.sensacaoTermica,
    probabilidadeChuva: atual.probabilidadeChuva,
    ventoKmh: metrosPorSegundoParaKmh(atual.ventoVelocidade),
    categoria: atual.categoria,
    ehNoite: atual.ehNoite,
    horasAteChuva: calcularHorasAteChuva(dados, Math.floor(agoraMs / 1000)),
  });
}

// ---------------------------------------------------------------------------
// Resumo do dia — ex.: "Temperatura agradável durante a tarde, com
// possibilidade baixa de chuva."
// ---------------------------------------------------------------------------

export function descreverTemperatura(celsius: number): string {
  if (celsius <= 10) return 'fria';
  if (celsius <= 18) return 'amena';
  if (celsius <= 28) return 'agradável';
  if (celsius <= 33) return 'quente';
  return 'muito quente';
}

function periodoDoDia(hora: number): string {
  if (hora < 6) return 'durante a madrugada';
  if (hora < 12) return 'pela manhã';
  if (hora < 18) return 'durante a tarde';
  return 'à noite';
}

function possibilidadeDeChuva(probabilidade: number): string {
  if (probabilidade >= LIMITES.chanceChuvaAlta) return 'alta';
  if (probabilidade >= LIMITES.chanceChuvaMedia) return 'moderada';
  return 'baixa';
}

export function gerarResumoDoDia(dia: PrevisaoDia, fusoHorario: number): string {
  const chance = possibilidadeDeChuva(dia.probabilidadeChuvaMax);

  if (dia.horas.length === 0) {
    return `Temperatura ${descreverTemperatura(dia.tempMax)}, com possibilidade ${chance} de chuva.`;
  }

  // Encontra o horário mais quente do dia para dizer "quando" será agradável/quente.
  const maisQuente = dia.horas.reduce((a, b) => (b.temperatura > a.temperatura ? b : a));
  const periodo = periodoDoDia(horaLocal(maisQuente.horario, fusoHorario));
  const temperatura = descreverTemperatura(maisQuente.temperatura);

  const frases = [`Temperatura ${temperatura} ${periodo}, com possibilidade ${chance} de chuva.`];

  const amplitude = dia.tempMax - dia.tempMin;
  if (amplitude >= 12) frases.push('Grande variação de temperatura ao longo do dia.');
  if (dia.categoria === 'tempestade') frases.push('Há risco de tempestade.');

  return frases.join(' ');
}
