import { categorizarClima } from '../categorizarClima';
import {
  chaveDoDia,
  direcaoDoVento,
  formatarHora,
  formatarIndiceUV,
  formatarTemperatura,
  formatarVento,
  formatarVisibilidade,
  nomeDoDia,
  tempoDecorrido,
} from '../formatar';
import { AGORA_S, FUSO_BRASILIA } from './fixtures';

describe('formatarTemperatura', () => {
  it('arredonda em Celsius', () => {
    expect(formatarTemperatura(27.4, 'C')).toBe('27°C');
  });

  it('converte para Fahrenheit', () => {
    expect(formatarTemperatura(0, 'F')).toBe('32°F');
    expect(formatarTemperatura(100, 'F')).toBe('212°F');
  });

  it('não mostra "-0"', () => {
    expect(formatarTemperatura(-0.3, 'C')).toBe('0°C');
  });

  it('pode omitir a unidade', () => {
    expect(formatarTemperatura(20, 'C', false)).toBe('20°');
  });
});

describe('formatarVento', () => {
  it('usa km/h para Celsius e mph para Fahrenheit', () => {
    expect(formatarVento(10, 'C')).toBe('36 km/h');
    expect(formatarVento(10, 'F')).toBe('22 mph');
  });
});

describe('direcaoDoVento', () => {
  it.each([
    [0, 'N'],
    [45, 'NE'],
    [90, 'L'],
    [180, 'S'],
    [270, 'O'],
    [350, 'N'],
    [-90, 'O'],
  ])('%i° → %s', (graus, esperado) => {
    expect(direcaoDoVento(graus)).toBe(esperado);
  });
});

describe('datas no fuso da cidade', () => {
  it('formata a hora local (Brasília = UTC-3)', () => {
    expect(formatarHora(AGORA_S, FUSO_BRASILIA)).toBe('09:00');
  });

  it('muda de dia conforme o fuso', () => {
    const meiaNoiteEMeiaUTC = Date.UTC(2026, 8, 24, 0, 30) / 1000;
    expect(chaveDoDia(meiaNoiteEMeiaUTC, 0)).toBe('2026-09-24');
    expect(chaveDoDia(meiaNoiteEMeiaUTC, FUSO_BRASILIA)).toBe('2026-09-23');
  });

  it('nomeia hoje, amanhã e os demais dias', () => {
    expect(nomeDoDia('2026-09-23', '2026-09-23')).toBe('Hoje');
    expect(nomeDoDia('2026-09-24', '2026-09-23')).toBe('Amanhã');
    expect(nomeDoDia('2026-09-26', '2026-09-23')).toBe('Sáb');
  });
});

describe('outros formatos', () => {
  it('visibilidade', () => {
    expect(formatarVisibilidade(10000)).toBe('10 km');
    expect(formatarVisibilidade(2500)).toBe('2,5 km');
    expect(formatarVisibilidade(800)).toBe('800 m');
    expect(formatarVisibilidade(null)).toBe('—');
  });

  it('índice UV', () => {
    expect(formatarIndiceUV(null)).toBe('—');
    expect(formatarIndiceUV(1.2)).toBe('1 (baixo)');
    expect(formatarIndiceUV(7)).toBe('7 (alto)');
    expect(formatarIndiceUV(12)).toBe('12 (extremo)');
  });

  it('tempo decorrido', () => {
    expect(tempoDecorrido(0, 30_000)).toBe('agora mesmo');
    expect(tempoDecorrido(0, 5 * 60_000)).toBe('há 5 min');
    expect(tempoDecorrido(0, 3 * 3_600_000)).toBe('há 3 h');
  });
});

describe('categorizarClima', () => {
  it.each([
    [211, 'tempestade'],
    [300, 'garoa'],
    [502, 'chuva'],
    [601, 'neve'],
    [741, 'neblina'],
    [800, 'limpo'],
    [802, 'poucas-nuvens'],
    [804, 'nublado'],
  ] as const)('código %i → %s', (codigo, esperado) => {
    expect(categorizarClima(codigo)).toBe(esperado);
  });
});
