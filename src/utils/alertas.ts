import type { DadosClima, UnidadeTemperatura } from '@/types/weather';
import { chaveDoDia, formatarTemperatura, metrosPorSegundoParaKmh } from './formatar';
import { LIMITES } from './interpretarClima';

/**
 * Gera alertas meteorológicos a partir da previsão (seção 6.6 do CLAUDE.md).
 * Função pura: não envia notificação — só diz QUAIS alertas existem.
 * Quem notifica é `src/services/notificacoes.ts`.
 */

export type TipoAlerta = 'tempestade' | 'chuva-forte' | 'calor' | 'frio' | 'vento';
export type Severidade = 'aviso' | 'perigo';

export interface Alerta {
  /** Único por tipo + local + dia, para não notificar o mesmo alerta duas vezes. */
  id: string;
  tipo: TipoAlerta;
  severidade: Severidade;
  titulo: string;
  mensagem: string;
}

export const LIMITES_ALERTA = {
  /** Horizonte analisado a partir de agora. */
  janelaHoras: 12,
  /** mm em 3 horas considerados "chuva forte". */
  chuvaForteMm: 10,
  calorC: 35,
  frioC: 5,
} as const;

export function gerarAlertas(dados: DadosClima, unidade: UnidadeTemperatura, agoraMs: number = Date.now()): Alerta[] {
  const agora = Math.floor(agoraMs / 1000);
  const limite = agora + LIMITES_ALERTA.janelaHoras * 3600;
  const proximas = dados.horas.filter((h) => h.horario + 3 * 3600 > agora && h.horario <= limite);
  const hoje = chaveDoDia(agora, dados.fusoHorario);
  const diaDeHoje = dados.dias.find((d) => d.data === hoje);
  const prefixo = `${dados.local.id}-${hoje}`;

  const alertas: Alerta[] = [];

  if (dados.atual.categoria === 'tempestade' || proximas.some((h) => h.categoria === 'tempestade')) {
    alertas.push({
      id: `${prefixo}-tempestade`,
      tipo: 'tempestade',
      severidade: 'perigo',
      titulo: 'Possibilidade de tempestade',
      mensagem: 'Há previsão de tempestade nas próximas horas. Evite áreas abertas.',
    });
  }

  const chuvaForte = proximas.some(
    (h) => h.volumeChuva >= LIMITES_ALERTA.chuvaForteMm || (h.categoria === 'chuva' && h.probabilidadeChuva >= 0.8),
  );
  if (chuvaForte) {
    alertas.push({
      id: `${prefixo}-chuva-forte`,
      tipo: 'chuva-forte',
      severidade: 'aviso',
      titulo: 'Chuva forte',
      mensagem: 'Possibilidade de chuva forte nas próximas horas.',
    });
  }

  const tempMax = Math.max(diaDeHoje?.tempMax ?? -Infinity, dados.atual.temperatura);
  if (tempMax >= LIMITES_ALERTA.calorC) {
    alertas.push({
      id: `${prefixo}-calor`,
      tipo: 'calor',
      severidade: 'aviso',
      titulo: 'Calor extremo',
      mensagem: `Temperatura prevista acima de ${formatarTemperatura(LIMITES_ALERTA.calorC, unidade)} hoje.`,
    });
  }

  const tempMin = Math.min(diaDeHoje?.tempMin ?? Infinity, dados.atual.temperatura);
  if (tempMin <= LIMITES_ALERTA.frioC) {
    alertas.push({
      id: `${prefixo}-frio`,
      tipo: 'frio',
      severidade: 'aviso',
      titulo: 'Frio intenso',
      mensagem: `Temperatura prevista abaixo de ${formatarTemperatura(LIMITES_ALERTA.frioC, unidade)} hoje.`,
    });
  }

  const ventoMaxKmh = metrosPorSegundoParaKmh(
    Math.max(dados.atual.ventoRajada ?? 0, dados.atual.ventoVelocidade, ...proximas.map((h) => h.ventoVelocidade)),
  );
  if (ventoMaxKmh >= LIMITES.ventoForteKmh) {
    alertas.push({
      id: `${prefixo}-vento`,
      tipo: 'vento',
      severidade: 'aviso',
      titulo: 'Ventos fortes',
      mensagem: 'Rajadas de vento fortes previstas nas próximas horas.',
    });
  }

  return alertas;
}
