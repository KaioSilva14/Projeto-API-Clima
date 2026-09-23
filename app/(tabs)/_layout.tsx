import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useMemo } from 'react';
import { Pressable } from 'react-native';
import { useTema } from '@/hooks/useTema';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useWeatherStore } from '@/store/weatherStore';
import { gerarAlertas } from '@/utils/alertas';

function BotaoConfiguracoes() {
  const { cores } = useTema();
  return (
    <Link href="/settings" asChild>
      <Pressable accessibilityLabel="Abrir configurações" hitSlop={12} style={{ marginHorizontal: 16 }}>
        <Ionicons name="settings-outline" size={22} color={cores.texto} />
      </Pressable>
    </Link>
  );
}

export default function TabsLayout() {
  const { cores } = useTema();
  const dados = useWeatherStore((s) => s.dados);
  const unidade = usePreferencesStore((s) => s.unidade);

  // Número de alertas ativos, mostrado como "badge" na aba Alertas.
  const totalAlertas = useMemo(() => (dados ? gerarAlertas(dados, unidade).length : 0), [dados, unidade]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSecundario,
        headerRight: () => <BotaoConfiguracoes />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          headerShown: false, // a Home tem cabeçalho próprio sobre o gradiente
          tabBarIcon: ({ color, size }) => <Ionicons name="partly-sunny" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="forecast"
        options={{
          title: 'Previsão',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cities"
        options={{
          title: 'Cidades',
          tabBarIcon: ({ color, size }) => <Ionicons name="location" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, size }) => <Ionicons name="map" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alertas',
          tabBarBadge: totalAlertas > 0 ? totalAlertas : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
