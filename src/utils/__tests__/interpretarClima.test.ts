import {
  calcularHorasAteChuva,
  gerarResumoDoDia,
  interpretarClima,
  interpretarDados,
  type EntradaInterpretacao,
} from '../interpretarClima';
import { AGORA_MS, AGORA_S, FUSO_BRASILIA, criarDados, criarHora } from './fixtures';

/** Um dia perfeito; cada teste muda só o necessário. */
const diaBom: EntradaInterpretacao = {
  temperatura: 26,
  sensacaoTermica: 26,
  probabilidadeChuva: 0.1,
  ventoKmh: 14,
  categoria: 'poucas-nuvens',
  ehNoite: false,
  horasAteChuva: null,
};

describe('interpretarClima', () => {
  it('dia bom → "Bom momento para sair"', () => {
    const conselho = interpretarClima(diaBom);
    expect(conselho.tipo).toBe('bom-para-sair');
    expect(conselho.titulo).toBe('Bom momento para sair');
    expect(conselho.detalhes).toEqual(['Baixa chance de chuva', 'Vento moderado']);
  });

  it('à noite o texto muda', () => {
    expect(interpretarClima({ ...diaBom, ehNoite: true }).titulo).toBe('Noite tranquila para sair');
  });

  it('chuva prevista em 2 horas → guarda-chuva com mensagem', () => {
    const conselho = interpretarClima({ ...diaBom, horasAteChuva: 2 });
    expect(conselho.tipo).toBe('leve-guarda-chuva');
    expect(conselho.mensagem).toBe('Chuva prevista nas próximas 2 horas.');
  });

  it('chovendo agora → guarda-chuva', () => {
    const conselho = interpretarClima({ ...diaBom, categoria: 'chuva', probabilidadeChuva: 0.9 });
    expect(conselho.tipo).toBe('leve-guarda-chuva');
    expect(conselho.detalhes[0]).toBe('Alta chance de chuva');
  });

  it('tempestade tem prioridade sobre tudo', () => {
    const conselho = interpretarClima({ ...diaBom, categoria: 'tempestade', sensacaoTermica: 38 });
    expect(conselho.tipo).toBe('evite-atividades-externas');
  });

  it('vento muito forte → evitar atividades externas', () => {
    expect(interpretarClima({ ...diaBom, ventoKmh: 60 }).tipo).toBe('evite-atividades-externas');
  });

  it('calor intenso → hidrate-se', () => {
    expect(interpretarClima({ ...diaBom, sensacaoTermica: 37 }).tipo).toBe('hidrate-se');
  });

  it('frio → agasalhe-se', () => {
    expect(interpretarClima({ ...diaBom, sensacaoTermica: 5 }).tipo).toBe('agasalhe-se');
  });

  it('chance moderada de chuva → tempo instável', () => {
    const conselho = interpretarClima({ ...diaBom, probabilidadeChuva: 0.4 });
    expect(conselho.tipo).toBe('atencao');
    expect(conselho.detalhes[0]).toBe('Chance moderada de chuva');
  });
});

describe('calcularHorasAteChuva', () => {
  it('encontra a primeira chuva provável', () => {
    const dados = criarDados({
      horas: [
        criarHora({ horario: AGORA_S }),
        criarHora({ horario: AGORA_S + 3 * 3600, categoria: 'chuva', probabilidadeChuva: 0.8 }),
      ],
    });
    expect(calcularHorasAteChuva(dados, AGORA_S)).toBe(3);
  });

  it('ignora chuva fora da janela', () => {
    const dados = criarDados({
      horas: [criarHora({ horario: AGORA_S + 9 * 3600, categoria: 'chuva', probabilidadeChuva: 0.9 })],
    });
    expect(calcularHorasAteChuva(dados, AGORA_S)).toBeNull();
  });

  it('interpretarDados junta tudo', () => {
    const dados = criarDados({
      horas: [criarHora({ horario: AGORA_S + 2 * 3600, categoria: 'chuva', probabilidadeChuva: 0.7 })],
    });
    expect(interpretarDados(dados, AGORA_MS).mensagem).toBe('Chuva prevista nas próximas 2 horas.');
  });
});

describe('gerarResumoDoDia', () => {
  it('descreve o período mais quente e a chance de chuva', () => {
    const dados = criarDados({
      horas: [
        criarHora({ horario: AGORA_S, temperatura: 20 }), // 09h em Brasília
        criarHora({ horario: AGORA_S + 6 * 3600, temperatura: 27 }), // 15h
        criarHora({ horario: AGORA_S + 9 * 3600, temperatura: 22, probabilidadeChuva: 0.2 }),
      ],
    });
    expect(gerarResumoDoDia(dados.dias[0], FUSO_BRASILIA)).toBe(
      'Temperatura agradável durante a tarde, com possibilidade baixa de chuva.',
    );
  });
});
