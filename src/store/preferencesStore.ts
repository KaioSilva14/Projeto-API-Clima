import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PreferenciaTema, UnidadeTemperatura } from '@/types/weather';
import { armazenamentoLocal } from './armazenamento';

/**
 * Preferências do usuário (tela Settings). Persistidas no AsyncStorage.
 *
 * Como usar em um componente:
 *   const unidade = usePreferencesStore((s) => s.unidade);
 * O "seletor" (s) => s.unidade faz o componente re-renderizar SÓ quando a
 * unidade muda, e não a cada mudança qualquer no store.
 */
interface EstadoPreferencias {
  unidade: UnidadeTemperatura;
  tema: PreferenciaTema;
  notificacoesAtivas: boolean;
  /** Ids de alertas já notificados — evita notificar o mesmo alerta de novo. */
  alertasNotificados: string[];

  definirUnidade: (unidade: UnidadeTemperatura) => void;
  definirTema: (tema: PreferenciaTema) => void;
  definirNotificacoes: (ativas: boolean) => void;
  marcarAlertasNotificados: (ids: string[]) => void;
}

export const usePreferencesStore = create<EstadoPreferencias>()(
  persist(
    (set) => ({
      unidade: 'C',
      tema: 'sistema',
      notificacoesAtivas: false,
      alertasNotificados: [],

      definirUnidade: (unidade) => set({ unidade }),
      definirTema: (tema) => set({ tema }),
      definirNotificacoes: (notificacoesAtivas) => set({ notificacoesAtivas }),
      marcarAlertasNotificados: (ids) =>
        // Guardamos só os 50 mais recentes para a lista não crescer para sempre.
        set((estado) => ({ alertasNotificados: [...ids, ...estado.alertasNotificados].slice(0, 50) })),
    }),
    { name: 'weatherflow-preferencias', storage: armazenamentoLocal },
  ),
);
