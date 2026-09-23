import type { CategoriaClima } from '@/types/weather';

/**
 * Cores do app. Cada tema (claro/escuro) tem o mesmo conjunto de "tokens",
 * assim os componentes nunca usam uma cor fixa — pedem `cores.texto`, por
 * exemplo, e recebem a cor certa para o tema ativo.
 */
export interface PaletaCores {
  fundo: string;
  superficie: string;
  borda: string;
  texto: string;
  textoSecundario: string;
  primaria: string;
  perigo: string;
  aviso: string;
  sucesso: string;
}

export const coresClaras: PaletaCores = {
  fundo: '#F2F5FA',
  superficie: '#FFFFFF',
  borda: '#DCE3EE',
  texto: '#14213D',
  textoSecundario: '#5B6B85',
  primaria: '#2F6FED',
  perigo: '#D64545',
  aviso: '#C98A0B',
  sucesso: '#2E9D5B',
};

export const coresEscuras: PaletaCores = {
  fundo: '#0D1421',
  superficie: '#172234',
  borda: '#26344B',
  texto: '#EEF2F8',
  textoSecundario: '#9AA8C0',
  primaria: '#6C9BFF',
  perigo: '#FF7A7A',
  aviso: '#F2C14E',
  sucesso: '#5CCB8A',
};

/**
 * Gradientes de fundo da Home, conforme o tempo (seção 6.4 do CLAUDE.md).
 * Sol → tons claros; chuva/tempestade → tons fechados; noite → azul escuro.
 * Sobre esses fundos o texto é sempre branco.
 */
const gradientesDia: Record<CategoriaClima, [string, string]> = {
  limpo: ['#3B8CEB', '#8FD0FF'],
  'poucas-nuvens': ['#4A8FD8', '#A7C9EA'],
  nublado: ['#5F7590', '#9BAABD'],
  garoa: ['#51657F', '#8496AD'],
  chuva: ['#3A4C66', '#6B7F99'],
  tempestade: ['#1F2433', '#4A4F66'],
  neve: ['#7E9BB8', '#D5E2EE'],
  neblina: ['#6F7C8A', '#B5BEC8'],
};

const gradientesNoite: Record<CategoriaClima, [string, string]> = {
  limpo: ['#0B1633', '#243B6B'],
  'poucas-nuvens': ['#101B36', '#2C3E63'],
  nublado: ['#161D2B', '#343F54'],
  garoa: ['#141B28', '#2E394C'],
  chuva: ['#10151F', '#2A3242'],
  tempestade: ['#07090F', '#232838'],
  neve: ['#1B2638', '#46566F'],
  neblina: ['#1A1F28', '#3B434F'],
};

export function gradienteDoClima(categoria: CategoriaClima, ehNoite: boolean): [string, string] {
  return ehNoite ? gradientesNoite[categoria] : gradientesDia[categoria];
}
