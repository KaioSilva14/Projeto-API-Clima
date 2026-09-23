import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SemDadosClima } from '@/components/SemDadosClima';
import { WeatherMap, type CamadaMapa } from '@/components/WeatherMap';
import { useTema } from '@/hooks/useTema';
import { useWeather } from '@/hooks/useWeather';

const CAMADAS: { valor: CamadaMapa; rotulo: string; legenda: string }[] = [
  {
    valor: 'precipitation_new',
    rotulo: 'Chuva',
    legenda: 'Manchas azuis mostram onde está chovendo agora. Sem chuva na região, a camada fica transparente.',
  },
  { valor: 'clouds_new', rotulo: 'Nuvens', legenda: 'Quanto mais branco, mais nuvens no céu.' },
  { valor: 'temp_new', rotulo: 'Temperatura', legenda: 'Do azul (frio) ao vermelho (quente).' },
  { valor: 'wind_new', rotulo: 'Vento', legenda: 'Tons mais fortes indicam vento mais intenso.' },
];

export default function MapScreen() {
  const { dados, carregando, erro, recarregar } = useWeather();
  const { cores } = useTema();
  const [camada, setCamada] = useState<CamadaMapa>('precipitation_new');

  if (!dados) return <SemDadosClima carregando={carregando} erro={erro} aoTentarNovamente={recarregar} />;

  const legenda = CAMADAS.find((c) => c.valor === camada)?.legenda;

  return (
    <View style={styles.container}>
      {/* key: ao trocar de cidade, o mapa é recriado já centralizado no novo local. */}
      <WeatherMap key={dados.local.id} local={dados.local} camada={camada} />

      <View style={styles.rodape} pointerEvents="box-none">
        <View style={[styles.legenda, { backgroundColor: cores.superficie, borderColor: cores.borda }]}>
          <Text style={[styles.textoLegenda, { color: cores.textoSecundario }]}>{legenda}</Text>
        </View>
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

const sombra = {
  elevation: 3,
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  rodape: { position: 'absolute', left: 0, right: 0, bottom: 16, gap: 10 },
  legenda: {
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    ...sombra,
  },
  textoLegenda: { fontSize: 13, lineHeight: 18 },
  listaCamadas: { gap: 8, paddingHorizontal: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    ...sombra,
  },
});
