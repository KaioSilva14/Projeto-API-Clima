import { StyleSheet } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { OPENWEATHER_API_KEY, OPENWEATHER_TILES_URL } from '@/constants/config';
import type { Local } from '@/types/weather';

/**
 * Mapa meteorológico (seção 6.5).
 *
 * Conceitos:
 * - Região: centro (latitude/longitude) + "delta", que define o zoom. Um delta
 *   de 1.5 grau mostra ~150 km — bom para ver a chuva na região.
 * - Tiles (ladrilhos): o mapa é dividido em imagens quadradas por zoom (z) e
 *   posição (x, y). A OpenWeather oferece camadas transparentes nesse formato,
 *   que desenhamos POR CIMA do mapa base com <UrlTile>.
 *
 * Este arquivo é a versão para Android/iOS. No navegador, o Metro usa
 * automaticamente o `WeatherMap.web.tsx` (extensão por plataforma).
 */

export type CamadaMapa = 'precipitation_new' | 'clouds_new' | 'temp_new' | 'wind_new';

interface WeatherMapProps {
  local: Local;
  camada: CamadaMapa;
}

export function WeatherMap({ local, camada }: WeatherMapProps) {
  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={{
        latitude: local.latitude,
        longitude: local.longitude,
        latitudeDelta: 1.5,
        longitudeDelta: 1.5,
      }}
      showsUserLocation
    >
      <UrlTile
        // A key força o React a recriar o componente ao trocar de camada.
        key={camada}
        urlTemplate={`${OPENWEATHER_TILES_URL}/${camada}/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
        maximumZ={12}
        opacity={0.8}
        zIndex={1}
      />
      <Marker
        coordinate={{ latitude: local.latitude, longitude: local.longitude }}
        title={local.nome}
        description="Local consultado"
      />
    </MapView>
  );
}
