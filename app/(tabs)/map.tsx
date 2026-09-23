import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SemDadosClima } from '@/components/SemDadosClima';
import { WeatherMap, type CamadaMapa } from '@/components/WeatherMap';
import { useTema } from '@/hooks/useTema';
import { useWeather } from '@/hooks/useWeather';

const CAMADAS: { valor: CamadaMapa; rotulo: string }[] = [
  { valor: 'precipitation_new', rotulo: 'Chuva' },
  { valor: 'clouds_new', rotulo: 'Nuvens' },
  { valor: 'temp_new', rotulo: 'Temperatura' },
  { valor: 'wind_new', rotulo: 'Vento' },
];

export default function MapScreen() {
  const { dados, carregando, erro, recarregar } = useWeather();
  const { cores } = useTema();
  const [camada, setCamada] = useState<CamadaMapa>('precipitation_new');

  if (!dados) return <SemDadosClima carregando={carregando} erro={erro} aoTentarNovamente={recarregar} />;

  return (
    <View style={styles.container}>
      {/* key: ao trocar de cidade, o mapa é recriado já centralizado no novo local. */}
      <WeatherMap key={dados.local.id} local={dados.local} camada={camada} />

      <View style={styles.camadas} pointerEvents="box-none">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listaCamadas}>
          {CAMADAS.map((c) => {
            const ativa = c.valor === camada;
            return (
              <Pressable
                key={c.valor}
                onPress={() => setCamada(c.valor)}
                accessibilityRole="button"
                accessibilityState={{ selected: ativa }}
                style={[
                  styles.chip,
                  { backgroundColor: ativa ? cores.primaria : cores.superficie, borderColor: cores.borda },
                ]}
              >
                <Text style={{ color: ativa ? '#FFFFFF' : cores.texto, fontWeight: '600' }}>{c.rotulo}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camadas: { position: 'absolute', left: 0, right: 0, bottom: 16 },
  listaCamadas: { gap: 8, paddingHorizontal: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
