/**
 * Formato (parcial) das respostas da OpenWeather API.
 * Só tipamos os campos que usamos. Campos marcados com `?` podem não vir.
 * Docs: https://openweathermap.org/current e https://openweathermap.org/forecast5
 */

export interface OWCondicao {
  id: number;
  main: string;
  description: string;
  /** Ex.: "10d" (dia) ou "10n" (noite) */
  icon: string;
}

export interface OWClimaAtualResposta {
  dt: number;
  timezone: number;
  name: string;
  coord: { lat: number; lon: number };
  weather: OWCondicao[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility?: number;
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  sys: { country?: string; sunrise: number; sunset: number };
}

export interface OWPrevisaoItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: OWCondicao[];
  wind: { speed: number; deg: number; gust?: number };
  /** Probabilidade de precipitação (0 a 1) */
  pop: number;
  rain?: { '3h'?: number };
  snow?: { '3h'?: number };
  sys: { pod: 'd' | 'n' };
}

export interface OWPrevisaoResposta {
  list: OWPrevisaoItem[];
  city: {
    name: string;
    country: string;
    timezone: number;
    sunrise: number;
    sunset: number;
    coord: { lat: number; lon: number };
  };
}

export interface OWCidadeGeocoding {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface OWOneCallUVResposta {
  current?: { uvi?: number };
}
