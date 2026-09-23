import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { CategoriaClima } from '@/types/weather';

type NomeIcone = ComponentProps<typeof Ionicons>['name'];

const ICONES_DIA: Record<CategoriaClima, NomeIcone> = {
  limpo: 'sunny',
  'poucas-nuvens': 'partly-sunny',
  nublado: 'cloudy',
  garoa: 'rainy-outline',
  chuva: 'rainy',
  tempestade: 'thunderstorm',
  neve: 'snow',
  neblina: 'reorder-three',
};

const ICONES_NOITE: Partial<Record<CategoriaClima, NomeIcone>> = {
  limpo: 'moon',
  'poucas-nuvens': 'cloudy-night',
};

interface WeatherIconProps {
  categoria: CategoriaClima;
  ehNoite?: boolean;
  tamanho?: number;
  cor: string;
}

export function WeatherIcon({ categoria, ehNoite = false, tamanho = 24, cor }: WeatherIconProps) {
  const nome = (ehNoite && ICONES_NOITE[categoria]) || ICONES_DIA[categoria];
  return <Ionicons name={nome} size={tamanho} color={cor} accessibilityElementsHidden />;
}
