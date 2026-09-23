import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Logo } from '@/components/Logo';
import { useHidratacao } from '@/hooks/useHidratacao';
import { useTema } from '@/hooks/useTema';
import { configurarNotificacoes } from '@/services/notificacoes';

/**
 * Layout raiz (Expo Router): tudo passa por aqui.
 *
 * No Expo Router, a navegação é definida pelos ARQUIVOS da pasta `app/`:
 * - `(tabs)/` é um grupo com as abas (os parênteses não aparecem na URL)
 * - `settings.tsx` é uma tela empilhada por cima das abas
 */
export default function RootLayout() {
  const pronto = useHidratacao();
  const { cores, escuro } = useTema();

  useEffect(() => {
    configurarNotificacoes().catch((erro) => console.warn('Falha ao configurar notificações', erro));
  }, []);

  // Enquanto o AsyncStorage carrega as preferências, mostramos só um indicador.
  if (!pronto) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, backgroundColor: cores.fundo }}>
        <Logo tamanho={88} />
        <ActivityIndicator color={cores.primaria} />
      </View>
    );
  }

  // Tema da navegação (cabeçalhos, barra de abas) alinhado às nossas cores.
  const base = escuro ? DarkTheme : DefaultTheme;
  const temaNavegacao: Theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: cores.primaria,
      background: cores.fundo,
      card: cores.superficie,
      text: cores.texto,
      border: cores.borda,
    },
  };

  return (
    <ThemeProvider value={temaNavegacao}>
      <StatusBar style={escuro ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: 'Configurações' }} />
      </Stack>
    </ThemeProvider>
  );
}
