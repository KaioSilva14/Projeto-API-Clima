import { gerarAlertas } from '../alertas';
import { AGORA_MS, AGORA_S, criarDados, criarHora } from './fixtures';

describe('gerarAlertas', () => {
  it('dia tranquilo não gera alertas', () => {
    expect(gerarAlertas(criarDados(), 'C', AGORA_MS)).toEqual([]);
  });

  it('tempestade prevista gera alerta de perigo', () => {
    const dados = criarDados({ horas: [criarHora({ horario: AGORA_S + 3 * 3600, categoria: 'tempestade' })] });
    const alertas = gerarAlertas(dados, 'C', AGORA_MS);
    expect(alertas.map((a) => a.tipo)).toContain('tempestade');
    expect(alertas.find((a) => a.tipo === 'tempestade')?.severidade).toBe('perigo');
  });

  it('muita chuva acumulada gera alerta de chuva forte', () => {
    const dados = criarDados({
      horas: [criarHora({ horario: AGORA_S + 3 * 3600, categoria: 'chuva', volumeChuva: 15, probabilidadeChuva: 1 })],
    });
    expect(gerarAlertas(dados, 'C', AGORA_MS).map((a) => a.tipo)).toContain('chuva-forte');
  });

  it('calor extremo usa a unidade do usuário na mensagem', () => {
    const dados = criarDados({ horas: [criarHora({ temperatura: 37 })] });
    const [calorC] = gerarAlertas(dados, 'C', AGORA_MS).filter((a) => a.tipo === 'calor');
    const [calorF] = gerarAlertas(dados, 'F', AGORA_MS).filter((a) => a.tipo === 'calor');
    expect(calorC.mensagem).toBe('Temperatura prevista acima de 35°C hoje.');
    expect(calorF.mensagem).toBe('Temperatura prevista acima de 95°F hoje.');
  });

  it('frio intenso', () => {
    const dados = criarDados({ atual: { temperatura: 3 }, horas: [criarHora({ temperatura: 4 })] });
    expect(gerarAlertas(dados, 'C', AGORA_MS).map((a) => a.tipo)).toContain('frio');
  });

  it('rajadas fortes geram alerta de vento', () => {
    const dados = criarDados({ atual: { ventoRajada: 20 } }); // 20 m/s = 72 km/h
    expect(gerarAlertas(dados, 'C', AGORA_MS).map((a) => a.tipo)).toContain('vento');
  });

  it('ids são estáveis (para não notificar duas vezes)', () => {
    const dados = criarDados({ horas: [criarHora({ categoria: 'tempestade' })] });
    const a = gerarAlertas(dados, 'C', AGORA_MS);
    const b = gerarAlertas(dados, 'C', AGORA_MS + 60_000);
    expect(a.map((x) => x.id)).toEqual(b.map((x) => x.id));
  });
});
