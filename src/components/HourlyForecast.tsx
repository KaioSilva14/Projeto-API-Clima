import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTema } from '@/hooks/useTema';
import { usePreferencesStore } from '@/store/preferencesStore';
import type { PrevisaoHora } from '@/types/weather';
import { formatarHora, formatarPorcentagem, formatarTemperatura } from '@/utils/formatar';
import { WeatherIcon } from './WeatherIcon';

interface HourlyForecastProps {
  horas: PrevisaoHora[];
  fusoHorario: number;
}

/** Faixa horizontal com a previsão de 3 em 3 horas. */
export function HourlyForecast({ horas, fusoHorario }: HourlyForecastProps) {
  const { cores } = useTema();
  const unidade = usePreferencesStore((s) => s.unidade);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lista}>
      {horas.map((hora) => (
        <View key={hora.horario} style={[styles.item, { backgroundColor: cores.fundo }]}>
          <Text style={[styles.hora, { color: cores.textoSecundario }]}>{formatarHora(hora.horario, fusoHorario)}</Text>
          <WeatherIcon categoria={hora.categoria} ehNoite={hora.ehNoite} tamanho={26} cor={cores.primaria} />
          <Text style={[styles.temperatura, { color: cores.texto }]}>
            {formatarTemperatura(hora.temperatura, unidade, false)}
          </Text>
          <View style={styles.chuva}>
            <Ionicons name="water" size={11} color={cores.primaria} />
            <Text style={[styles.textoChuva, { color: cores.textoSecundario }]}>
              {formatarPorcentagem(hora.probabilidadeChuva)}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lista: { gap: 10, paddingVertical: 2 },
  item: { alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 14, minWidth: 64 },
  hora: { fontSize: 12, fontWeight: '600' },
  temperatura: { fontSize: 17, fontWeight: '600' },
  chuva: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  textoChuva: { fontSize: 11 },
});
