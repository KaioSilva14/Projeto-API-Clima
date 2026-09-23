import type { OWClimaAtualResposta, OWPrevisaoItem, OWPrevisaoResposta } from '@/types/openWeather';
import { agruparPorDia, cidadeParaLocal, montarDadosClima } from '../transformarDados';
import { AGORA_MS, AGORA_S, FUSO_BRASILIA, criarHora } from './fixtures';

function itemPrevisao(dt: number, temp: number, codigo = 800, pop = 0): OWPrevisaoItem {
  return {
    dt,
    main: { temp, feels_like: temp, temp_min: temp, temp_max: temp, humidity: 50 },
    weather: [{ id: codigo, main: '', description: 'céu limpo', icon: '01d' }],
    wind: { speed: 2, deg: 0 },
    pop,
    sys: { pod: 'd' },
  };
}

const atual: OWClimaAtualResposta = {
  dt: AGORA_S,
  timezone: FUSO_BRASILIA,
  name: 'Londrina',
  coord: { lat: -23.31, lon: -51.16 },
  weather: [{ id: 801, main: 'Clouds', description: 'algumas nuvens', icon: '02d' }],
  main: { temp: 16, feels_like: 15, temp_min: 15, temp_max: 17, pressure: 1016, humidity: 70 },
  visibility: 10000,
  wind: { speed: 4, deg: 120 },
  clouds: { all: 20 },
  sys: { country: 'BR', sunrise: AGORA_S - 3 * 3600, sunset: AGORA_S + 9 * 3600 },
};

const previsao: OWPrevisaoResposta = {
  list: [
    itemPrevisao(AGORA_S + 3 * 3600, 22, 800, 0.35),
    itemPrevisao(AGORA_S + 6 * 3600, 25),
    itemPrevisao(AGORA_S + 24 * 3600, 20, 500, 0.9),
  ],
  city: { name: 'Londrina', country: 'BR', timezone: FUSO_BRASILIA, sunrise: 0, sunset: 0, coord: { lat: 0, lon: 0 } },
};

describe('montarDadosClima', () => {
  const local = cidadeParaLocal({ name: 'Londrina', lat: -23.31, lon: -51.16, country: 'BR', state: 'Paraná' });
  const dados = montarDadosClima({ atual, previsao, local, indiceUV: null, agoraMs: AGORA_MS });

  it('converte o clima atual', () => {
    expect(dados.atual.temperatura).toBe(16);
    expect(dados.atual.categoria).toBe('poucas-nuvens');
    expect(dados.atual.ehNoite).toBe(false);
    // chance de chuva vem do primeiro bloco da previsão
    expect(dados.atual.probabilidadeChuva).toBe(0.35);
  });

  it('agrupa a previsão por dia e inclui a temperatura atual em "hoje"', () => {
    expect(dados.dias.map((d) => d.data)).toEqual(['2026-09-23', '2026-09-24']);
    expect(dados.dias[0].tempMin).toBe(16);
    expect(dados.dias[0].tempMax).toBe(25);
    expect(dados.dias[1].categoria).toBe('chuva');
  });
});

describe('montarDadosClima perto da meia-noite', () => {
  it('cria o dia de hoje quando a previsão já começa amanhã', () => {
    const quaseMeiaNoite = Date.UTC(2026, 8, 24, 2, 30) / 1000; // 23:30 em Brasília
    const local = cidadeParaLocal({ name: 'Londrina', lat: -23.31, lon: -51.16, country: 'BR' });
    const dados = montarDadosClima({
      atual: { ...atual, dt: quaseMeiaNoite },
      previsao: { ...previsao, list: [itemPrevisao(quaseMeiaNoite + 3600, 14)] }, // 00:30 de amanhã
      local,
      indiceUV: null,
      agoraMs: quaseMeiaNoite * 1000,
    });
    expect(dados.dias.map((d) => d.data)).toEqual(['2026-09-23', '2026-09-24']);
    expect(dados.dias[0].tempMax).toBe(16);
  });
});

describe('cidadeParaLocal', () => {
  it('prefere o nome em português', () => {
    const local = cidadeParaLocal({
      name: 'New York',
      local_names: { pt: 'Nova Iorque' },
      lat: 40.71,
      lon: -74.01,
      country: 'US',
      state: 'New York',
    });
    expect(local.nome).toBe('Nova Iorque');
    expect(local.id).toBe('40.71,-74.01');
  });
});

describe('agruparPorDia', () => {
  it('tempestade define a categoria do dia mesmo sendo minoria', () => {
    const horas = [
      criarHora({ horario: AGORA_S }),
      criarHora({ horario: AGORA_S + 3600 }),
      criarHora({ horario: AGORA_S + 7200, categoria: 'tempestade', descricao: 'trovoada' }),
    ];
    expect(agruparPorDia(horas, FUSO_BRASILIA)[0].categoria).toBe('tempestade');
  });

  it('tarde chuvosa faz o dia ser "chuva", mesmo com a manhã de sol', () => {
    const horas = [0, 1, 2, 3, 4, 5].map((i) =>
      criarHora({
        horario: AGORA_S + i * 1800,
        ...(i >= 4 ? { categoria: 'chuva' as const, descricao: 'chuva leve', probabilidadeChuva: 0.7 } : {}),
      }),
    );
    const [dia] = agruparPorDia(horas, FUSO_BRASILIA);
    expect(dia.categoria).toBe('chuva');
    expect(dia.descricao).toBe('chuva leve');
  });

  it('uma única hora de garoa não muda o dia', () => {
    const horas = [criarHora({ horario: AGORA_S }), criarHora({ horario: AGORA_S + 1800, categoria: 'garoa' })];
    expect(agruparPorDia(horas, FUSO_BRASILIA)[0].categoria).toBe('limpo');
  });
});
