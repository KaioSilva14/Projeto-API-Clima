import { StyleSheet, Text, View } from 'react-native';
import { useTema } from '@/hooks/useTema';
import { usePreferencesStore } from '@/store/preferencesStore';
import type { PrevisaoDia } from '@/types/weather';
import { capitalizar, formatarDiaMes, formatarPorcentagem, formatarTemperatura, nomeDoDia } from '@/utils/formatar';
import { WeatherIcon } from './WeatherIcon';

interface DailyForecastRowProps {
  dia: PrevisaoDia;
  chaveHoje: string;
}

export function DailyForecastRow({ dia, chaveHoje }: DailyForecastRowProps) {
  const { cores } = useTema();
  const unidade = usePreferencesStore((s) => s.unidade);

  return (
    <View style={[styles.linha, { borderBottomColor: cores.borda }]}>
      <View style={styles.data}>
        <Text style={[styles.nomeDia, { color: cores.texto }]}>{nomeDoDia(dia.data, chaveHoje)}</Text>
        <Text style={[styles.diaMes, { color: cores.textoSecundario }]}>{formatarDiaMes(dia.data)}</Text>
      </View>
      <WeatherIcon categoria={dia.categoria} tamanho={24} cor={cores.primaria} />
      <View style={styles.descricao}>
        <Text style={[styles.textoDescricao, { color: cores.textoSecundario }]} numberOfLines={1}>
          {capitalizar(dia.descricao)}
        </Text>
        <Text style={[styles.chuva, { color: cores.primaria }]}>
          Chuva {formatarPorcentagem(dia.probabilidadeChuvaMax)}
        </Text>
      </View>
      <Text style={[styles.temperaturas, { color: cores.texto }]}>
        {formatarTemperatura(dia.tempMax, unidade, false)}
        <Text style={{ color: cores.textoSecundario }}> / {formatarTemperatura(dia.tempMin, unidade, false)}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  data: { width: 58 },
  nomeDia: { fontSize: 15, fontWeight: '600' },
  diaMes: { fontSize: 12 },
  descricao: { flex: 1 },
  textoDescricao: { fontSize: 13 },
  chuva: { fontSize: 12, fontWeight: '600' },
  temperaturas: { fontSize: 16, fontWeight: '600' },
});
