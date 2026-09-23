import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TEMPO_CACHE_MS } from '@/constants/config';
import { obterLocalizacaoAtual, type ResultadoLocalizacao } from '@/services/localizacao';
import { notificacoesSuportadas, notificarAlerta } from '@/services/notificacoes';
import { buscarDadosClima, buscarLocalPorCoordenadas, mensagemAmigavel } from '@/services/openWeather';
import type { DadosClima, Local } from '@/types/weather';
import { gerarAlertas } from '@/utils/alertas';
import { armazenamentoLocal } from './armazenamento';
import { useCitiesStore } from './citiesStore';
import { useHistoryStore } from './historyStore';
import { usePreferencesStore } from './preferencesStore';

/**
 * Estado central do clima, compartilhado por todas as abas.
 *
 * Por que um store global e não um useState na Home?
 * Home, Previsão, Mapa e Alertas mostram o MESMO dado. Com um store, buscamos
 * uma vez só e todas as telas leem daqui.
 *
 * Os últimos dados ficam salvos (cache): se o app abrir sem internet, ainda
 * mostramos a última consulta com o aviso de erro por cima.
 */
type Origem = 'gps' | 'cidade';

interface EstadoClima {
  dados: DadosClima | null;
  origem: Origem | null;
  carregando: boolean;
  erro: string | null;
  /** true quando o GPS foi negado — a tela oferece a busca manual de cidade. */
  semPermissaoLocalizacao: boolean;
  localizacaoAproximada: boolean;

  carregar: (opcoes?: { forcar?: boolean }) => Promise<void>;
}

function mensagemDeLocalizacao(motivo: Extract<ResultadoLocalizacao, { ok: false }>['motivo']): string {
  switch (motivo) {
    case 'permissao-negada':
      return 'Sem permissão de localização. Pesquise uma cidade ou libere o acesso nas configurações.';
    case 'gps-desligado':
      return 'A localização do aparelho está desligada. Ative o GPS ou pesquise uma cidade.';
    default:
      return 'Não foi possível descobrir sua localização. Tente novamente ou pesquise uma cidade.';
  }
}

/** Envia notificação dos alertas novos (se o usuário ativou nas configurações). */
async function notificarNovosAlertas(dados: DadosClima): Promise<void> {
  const preferencias = usePreferencesStore.getState();
  // Sem suporte (web / Expo Go no Android) não marcamos nada como "notificado".
  if (!notificacoesSuportadas || !preferencias.notificacoesAtivas) return;

  const novos = gerarAlertas(dados, preferencias.unidade).filter(
    (a) => !preferencias.alertasNotificados.includes(a.id),
  );
  if (novos.length === 0) return;

  preferencias.marcarAlertasNotificados(novos.map((a) => a.id));
  for (const alerta of novos) await notificarAlerta(alerta, dados.local.nome);
}

/**
 * Contador de requisições: se o usuário trocar de cidade enquanto uma busca
 * ainda está em andamento, a resposta antiga chega depois e é descartada.
 */
let requisicaoAtual = 0;

export const useWeatherStore = create<EstadoClima>()(
  persist(
    (set, get) => ({
      dados: null,
      origem: null,
      carregando: false,
      erro: null,
      semPermissaoLocalizacao: false,
      localizacaoAproximada: false,

      carregar: async ({ forcar = false } = {}) => {
        const cidade = useCitiesStore.getState().cidadeSelecionada;
        const { dados, origem, carregando } = get();

        const mesmoAlvo = cidade ? origem === 'cidade' && dados?.local.id === cidade.id : origem === 'gps';
        const cacheValido = dados !== null && Date.now() - dados.obtidoEm < TEMPO_CACHE_MS;
        if (mesmoAlvo && !forcar && (carregando || cacheValido)) return;

        const minhaRequisicao = ++requisicaoAtual;
        set({ carregando: true, erro: null, semPermissaoLocalizacao: false });

        try {
          let local: Local;
          let aproximada = false;

          if (cidade) {
            local = cidade;
          } else {
            const resultado = await obterLocalizacaoAtual();
            if (!resultado.ok) {
              if (minhaRequisicao !== requisicaoAtual) return;
              set({
                carregando: false,
                erro: mensagemDeLocalizacao(resultado.motivo),
                semPermissaoLocalizacao: resultado.motivo === 'permissao-negada',
              });
              return;
            }
            aproximada = resultado.aproximada;
            local = await buscarLocalPorCoordenadas(resultado.coordenadas.latitude, resultado.coordenadas.longitude);
          }

          const novosDados = await buscarDadosClima(local);
          if (minhaRequisicao !== requisicaoAtual) return; // resposta atrasada: ignorar

          set({
            dados: novosDados,
            origem: cidade ? 'cidade' : 'gps',
            carregando: false,
            localizacaoAproximada: aproximada,
          });

          useHistoryStore.getState().registrar(novosDados);
          // Falha ao notificar não deve derrubar a tela: registramos e seguimos.
          notificarNovosAlertas(novosDados).catch((e) => console.warn('Falha ao notificar alertas', e));
        } catch (erro) {
          if (minhaRequisicao !== requisicaoAtual) return;
          set({ carregando: false, erro: mensagemAmigavel(erro) });
        }
      },
    }),
    {
      name: 'weatherflow-clima',
      storage: armazenamentoLocal,
      // Só salvamos os dados; estados temporários (carregando, erro) não.
      partialize: (estado) => ({ dados: estado.dados, origem: estado.origem }),
    },
  ),
);
