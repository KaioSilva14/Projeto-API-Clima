import type { CategoriaClima } from '@/types/weather';

/**
 * Converte o código de condição da OpenWeather em uma categoria nossa.
 * Tabela oficial: https://openweathermap.org/weather-conditions
 *
 * 2xx tempestade · 3xx garoa · 5xx chuva · 6xx neve · 7xx neblina/névoa
 * 800 céu limpo · 801–802 poucas nuvens · 803–804 nublado
 */
export function categorizarClima(codigoCondicao: number): CategoriaClima {
  if (codigoCondicao >= 200 && codigoCondicao < 300) return 'tempestade';
  if (codigoCondicao >= 300 && codigoCondicao < 400) return 'garoa';
  if (codigoCondicao >= 500 && codigoCondicao < 600) return 'chuva';
  if (codigoCondicao >= 600 && codigoCondicao < 700) return 'neve';
  if (codigoCondicao >= 700 && codigoCondicao < 800) return 'neblina';
  if (codigoCondicao === 800) return 'limpo';
  if (codigoCondicao === 801 || codigoCondicao === 802) return 'poucas-nuvens';
  return 'nublado';
}

/** Categorias em que "está chovendo" (usado pelas regras e animações). */
export function ehChuvoso(categoria: CategoriaClima): boolean {
  return categoria === 'chuva' || categoria === 'garoa' || categoria === 'tempestade';
}
