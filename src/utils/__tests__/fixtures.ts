import type { ClimaAtual, DadosClima, PrevisaoHora } from '@/types/weather';

/**
 * Fábricas de dados falsos para os testes. Cada teste só sobrescreve o que
 * importa para ele — o resto vem com valores "neutros" (dia bom, 24°C).
 */

/** 23/09/2026 12:00 UTC (= 09:00 em Brasília). */
export const AGORA_S = Date.UTC(2026, 8, 23, 12, 0, 0) / 1000;
export const AGORA_MS = AGORA_S * 1000;
export const FUSO_BRASILIA = -3 * 3600;

export function criarHora(parcial: Partial<PrevisaoHora> = {}): PrevisaoHora {
  return {
    horario: AGORA_S,
    temperatura: 24,
    sensacaoTermica: 24,
    probabilidadeChuva: 0,
    volumeChuva: 0,
    ventoVelocidade: 3,
    descricao: 'céu limpo',
    categoria: 'limpo',
    ehNoite: false,
    ...parcial,
  };
}

export function criarAtual(parcial: Partial<ClimaAtual> = {}): ClimaAtual {
  return {
    horario: AGORA_S,
    temperatura: 24,
    sensacaoTermica: 24,
    tempMin: 18,
    tempMax: 28,
    umidade: 60,
    pressao: 1015,
    ventoVelocidade: 3,
    ventoDirecao: 90,
    ventoRajada: null,
    visibilidade: 10000,
    nuvens: 0,
    descricao: 'céu limpo',
    categoria: 'limpo',
    ehNoite: false,
    nascerDoSol: AGORA_S - 3 * 3600,
    porDoSol: AGORA_S + 9 * 3600,
    probabilidadeChuva: 0,
    indiceUV: null,
    ...parcial,
  };
}

export function criarDados(parcial: { atual?: Partial<ClimaAtual>; horas?: PrevisaoHora[] } = {}): DadosClima {
  const horas = parcial.horas ?? [0, 3, 6, 9].map((h) => criarHora({ horario: AGORA_S + h * 3600 }));
  const temps = horas.map((h) => h.temperatura);
  return {
    local: { id: '-23.31,-51.16', nome: 'Londrina', estado: 'Paraná', pais: 'BR', latitude: -23.31, longitude: -51.16 },
    atual: criarAtual(parcial.atual),
    horas,
    dias: [
      {
        data: '2026-09-23',
        tempMin: Math.min(...temps),
        tempMax: Math.max(...temps),
        probabilidadeChuvaMax: Math.max(...horas.map((h) => h.probabilidadeChuva)),
        categoria: horas[0].categoria,
        descricao: horas[0].descricao,
        horas,
      },
    ],
    fusoHorario: FUSO_BRASILIA,
    obtidoEm: AGORA_MS,
  };
}
