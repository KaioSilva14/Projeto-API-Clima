import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LIMITE_HISTORICO } from '@/constants/config';
import type { CategoriaClima, DadosClima } from '@/types/weather';
import { chaveDoDia } from '@/utils/formatar';
import { armazenamentoLocal } from './armazenamento';

/**
 * Histórico de consultas (seção 6.7): "23/09 — 27°C · Londrina".
 * Um registro por cidade por dia; consultar de novo no mesmo dia atualiza o registro.
 */
export interface RegistroHistorico {
  /** `${data}|${localId}` */
  id: string;
  /** AAAA-MM-DD, no fuso da cidade */
  data: string;
  nomeLocal: string;
  temperatura: number;
  categoria: CategoriaClima;
  descricao: string;
  registradoEm: number;
}

interface EstadoHistorico {
  registros: RegistroHistorico[];
  registrar: (dados: DadosClima) => void;
  limpar: () => void;
}

export function criarRegistro(dados: DadosClima): RegistroHistorico {
  const data = chaveDoDia(dados.atual.horario, dados.fusoHorario);
  return {
    id: `${data}|${dados.local.id}`,
    data,
    nomeLocal: dados.local.nome,
    temperatura: dados.atual.temperatura,
    categoria: dados.atual.categoria,
    descricao: dados.atual.descricao,
    registradoEm: dados.obtidoEm,
  };
}

export const useHistoryStore = create<EstadoHistorico>()(
  persist(
    (set) => ({
      registros: [],
      registrar: (dados) =>
        set((estado) => {
          const novo = criarRegistro(dados);
          const semDuplicado = estado.registros.filter((r) => r.id !== novo.id);
          // Mais recentes primeiro, com limite de tamanho.
          return { registros: [novo, ...semDuplicado].slice(0, LIMITE_HISTORICO) };
        }),
      limpar: () => set({ registros: [] }),
    }),
    { name: 'weatherflow-historico', storage: armazenamentoLocal },
  ),
);
