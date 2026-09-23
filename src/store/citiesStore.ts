import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Local } from '@/types/weather';
import { armazenamentoLocal } from './armazenamento';

/**
 * Cidades favoritas (seção 6.2) e qual local está sendo exibido.
 * `cidadeSelecionada === null` significa "usar a localização do GPS".
 */
interface EstadoCidades {
  favoritas: Local[];
  cidadeSelecionada: Local | null;

  adicionarFavorita: (local: Local) => void;
  removerFavorita: (id: string) => void;
  selecionarCidade: (local: Local) => void;
  usarLocalizacaoAtual: () => void;
}

export const useCitiesStore = create<EstadoCidades>()(
  persist(
    (set) => ({
      favoritas: [],
      cidadeSelecionada: null,

      adicionarFavorita: (local) =>
        set((estado) =>
          estado.favoritas.some((f) => f.id === local.id) ? estado : { favoritas: [...estado.favoritas, local] },
        ),
      removerFavorita: (id) => set((estado) => ({ favoritas: estado.favoritas.filter((f) => f.id !== id) })),
      selecionarCidade: (local) => set({ cidadeSelecionada: local }),
      usarLocalizacaoAtual: () => set({ cidadeSelecionada: null }),
    }),
    { name: 'weatherflow-cidades', storage: armazenamentoLocal },
  ),
);
