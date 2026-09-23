import * as Location from 'expo-location';

/**
 * GPS e permissões (seção 6.1 do CLAUDE.md).
 *
 * Como funcionam as permissões no celular:
 * 1. O app PERGUNTA (requestForegroundPermissionsAsync). O sistema mostra o
 *    diálogo "Permitir que o WeatherFlow acesse sua localização?".
 * 2. O usuário pode aceitar, negar, ou (Android 12+/iOS 14+) liberar apenas a
 *    localização APROXIMADA. Tudo isso precisa funcionar.
 * 3. Se o usuário negar e marcar "não perguntar de novo", `canAskAgain` vira
 *    false — aí só dá para liberar pelas configurações do sistema.
 *
 * "Foreground" = só enquanto o app está aberto. Não pedimos localização em
 * segundo plano: não precisamos e as lojas são rígidas com isso.
 */

export type StatusPermissao = 'concedida' | 'negada' | 'bloqueada' | 'nao-perguntado';

export interface Coordenadas {
  latitude: number;
  longitude: number;
}

export type ResultadoLocalizacao =
  | { ok: true; coordenadas: Coordenadas; aproximada: boolean }
  | { ok: false; motivo: 'permissao-negada' | 'gps-desligado' | 'indisponivel' };

function interpretarPermissao(resposta: Location.LocationPermissionResponse): StatusPermissao {
  if (resposta.granted) return 'concedida';
  if (resposta.status === 'undetermined') return 'nao-perguntado';
  return resposta.canAskAgain ? 'negada' : 'bloqueada';
}

/** Só consulta, sem mostrar diálogo. */
export async function consultarPermissao(): Promise<StatusPermissao> {
  return interpretarPermissao(await Location.getForegroundPermissionsAsync());
}

/** Mostra o diálogo do sistema (se ainda for possível perguntar). */
export async function pedirPermissao(): Promise<StatusPermissao> {
  return interpretarPermissao(await Location.requestForegroundPermissionsAsync());
}

export async function obterLocalizacaoAtual(): Promise<ResultadoLocalizacao> {
  const permissao = await pedirPermissao();
  if (permissao !== 'concedida') return { ok: false, motivo: 'permissao-negada' };

  const servicosLigados = await Location.hasServicesEnabledAsync();
  if (!servicosLigados) return { ok: false, motivo: 'gps-desligado' };

  // "Balanced" (~100 m) é suficiente para clima e gasta menos bateria que "High".
  try {
    const posicao = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return {
      ok: true,
      coordenadas: { latitude: posicao.coords.latitude, longitude: posicao.coords.longitude },
      aproximada: false,
    };
  } catch {
    // Pode falhar em locais fechados ou com permissão só "aproximada".
    // Plano B: a última posição conhecida pelo sistema (pode ser de minutos atrás).
    const ultima = await Location.getLastKnownPositionAsync().catch(() => null);
    if (ultima) {
      return {
        ok: true,
        coordenadas: { latitude: ultima.coords.latitude, longitude: ultima.coords.longitude },
        aproximada: true,
      };
    }
    return { ok: false, motivo: 'indisponivel' };
  }
}
