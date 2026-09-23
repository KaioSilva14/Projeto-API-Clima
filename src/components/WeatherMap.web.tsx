import { StateMessage } from './StateMessage';
import type { Local } from '@/types/weather';

export type CamadaMapa = 'precipitation_new' | 'clouds_new' | 'temp_new' | 'wind_new';

interface WeatherMapProps {
  local: Local;
  camada: CamadaMapa;
}

/**
 * O react-native-maps não funciona no navegador. Em vez de quebrar a tela,
 * mostramos um aviso (tratamento explícito, como pede o CLAUDE.md).
 */
export function WeatherMap({ local }: WeatherMapProps) {
  return (
    <StateMessage
      icone="map-outline"
      titulo="Mapa disponível só no celular"
      mensagem={`Abra o app no Android ou iOS para ver o mapa de ${local.nome}.`}
    />
  );
}
