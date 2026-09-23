import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';
import type { Alerta } from '@/utils/alertas';

/**
 * Notificações LOCAIS (seção 6.6 do CLAUDE.md).
 *
 * Local x Push:
 * - Local: o próprio app agenda a notificação no aparelho. Não precisa de servidor.
 * - Push: um servidor envia pela internet. Exigiria backend → fora do escopo.
 *
 * Limitação consciente da V1: os alertas são avaliados quando o app busca
 * dados novos (ao abrir ou atualizar). Verificar o clima com o app fechado
 * exigiria tarefas em segundo plano (expo-background-task) — evolução futura.
 */

const CANAL_ANDROID = 'alertas-clima';

/**
 * Onde as notificações funcionam:
 * - Web: não existem.
 * - Expo Go no Android: desde o SDK 53, só IMPORTAR `expo-notifications`
 *   já lança um erro (a biblioteca tenta registrar notificações push, que o
 *   Expo Go não suporta mais). Para testar notificações no Android é preciso
 *   um "development build" (`npx expo run:android` ou EAS Build).
 */
export const motivoIndisponivel: string | null =
  Platform.OS === 'web'
    ? 'Notificações não estão disponíveis na versão web.'
    : Platform.OS === 'android' && isRunningInExpoGo()
      ? 'No Expo Go para Android as notificações não funcionam. Elas funcionam no app instalado (development build).'
      : null;

export const notificacoesSuportadas = motivoIndisponivel === null;

/**
 * Por isso a biblioteca é carregada de forma "preguiçosa": com `require`
 * dentro de uma função, e só onde ela funciona. Um `import` normal no topo
 * do arquivo rodaria sempre — e quebraria o app no Expo Go.
 * O `typeof import(...)` só traz os TIPOS, sem carregar o código.
 */
type ModuloNotificacoes = typeof import('expo-notifications');
let modulo: ModuloNotificacoes | null = null;

function carregarNotificacoes(): ModuloNotificacoes | null {
  if (!notificacoesSuportadas) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  modulo ??= require('expo-notifications') as ModuloNotificacoes;
  return modulo;
}

/** Chamar uma vez ao iniciar o app (feito em app/_layout.tsx). */
export async function configurarNotificacoes(): Promise<void> {
  const Notifications = carregarNotificacoes();
  if (!Notifications) return;

  // Define o que acontece se a notificação chegar com o app ABERTO.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // No Android 8+, toda notificação precisa de um "canal" (o usuário pode
  // silenciar canais separadamente nas configurações do sistema).
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL_ANDROID, {
      name: 'Alertas meteorológicos',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export async function pedirPermissaoNotificacoes(): Promise<boolean> {
  const Notifications = carregarNotificacoes();
  if (!Notifications) return false;
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  if (!atual.canAskAgain) return false;
  const resposta = await Notifications.requestPermissionsAsync();
  return resposta.granted;
}

export async function notificarAlerta(alerta: Alerta, nomeLocal: string): Promise<void> {
  const Notifications = carregarNotificacoes();
  if (!Notifications) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${alerta.titulo} • ${nomeLocal}`,
      body: alerta.mensagem,
      data: { alertaId: alerta.id },
    },
    // trigger null = mostrar imediatamente.
    trigger: Platform.OS === 'android' ? { channelId: CANAL_ANDROID } : null,
  });
}

export async function enviarNotificacaoDeTeste(): Promise<void> {
  const Notifications = carregarNotificacoes();
  if (!Notifications) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'WeatherFlow',
      body: 'As notificações estão funcionando! 🌤️',
    },
    // Dispara em 2 segundos — dá tempo de minimizar o app e ver a notificação.
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      ...(Platform.OS === 'android' ? { channelId: CANAL_ANDROID } : {}),
    },
  });
}
