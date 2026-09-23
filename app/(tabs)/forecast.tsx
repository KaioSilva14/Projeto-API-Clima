import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { DailyForecastRow } from '@/components/DailyForecastRow';
import { HourlyForecast } from '@/components/HourlyForecast';
import { SemDadosClima } from '@/components/SemDadosClima';
import { TemperatureChart } from '@/components/TemperatureChart';
import { WeatherIcon } from '@/components/WeatherIcon';
import { useTema } from '@/hooks/useTema';
import { useWeather } from '@/hooks/useWeather';
import { useHistoryStore } from '@/store/historyStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import {
  celsiusParaFahrenheit,
  chaveDoDia,
  formatarDiaMes,
  formatarHora,
  formatarTemperatura,
  nomeCompletoDoLocal,
} from '@/utils/formatar';

/** Quantos blocos de 3h mostrar: 8 × 3h = próximas 24 horas. */
const BLOCOS_24H = 8;

export default function ForecastScreen() {
  const { dados, carregando, erro, recarregar } = useWeather();
  const { cores } = useTema();
  const unidade = usePreferencesStore((s) => s.unidade);
  const historico = useHistoryStore((s) => s.registros);

  if (!dados) return <SemDadosClima carregando={carregando} erro={erro} aoTentarNovamente={recarregar} />;

  const proximasHoras = dados.horas.slice(0, BLOCOS_24H);
  const chaveHoje = chaveDoDia(dados.atual.horario, dados.fusoHorario);

  // No gráfico, os valores já vão convertidos para a unidade escolhida.
  const pontosGrafico = proximasHoras.map((h) => ({
    rotulo: formatarHora(h.horario, dados.fusoHorario).slice(0, 2) + 'h',
    valor: unidade === 'F' ? celsiusParaFahrenheit(h.temperatura) : h.temperatura,
  }));

  return (
    <ScrollView
      style={{ backgroundColor: cores.fundo }}
      contentContainerStyle={styles.conteudo}
      refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={cores.primaria} />}
    >
      <Text style={[styles.local, { color: cores.textoSecundario }]}>{nomeCompletoDoLocal(dados.local)}</Text>

      <Card titulo="Próximas 24 horas">
        <HourlyForecast horas={proximasHoras} fusoHorario={dados.fusoHorario} />
      </Card>

      <Card titulo="Temperatura">
        <TemperatureChart pontos={pontosGrafico} formatarValor={(v) => `${Math.round(v)}°`} />
      </Card>

      <Card titulo="Próximos dias">
        <View>
          {dados.dias.map((dia) => (
            <DailyForecastRow key={dia.data} dia={dia} chaveHoje={chaveHoje} />
          ))}
        </View>
        <Text style={[styles.nota, { color: cores.textoSecundario }]}>
          A previsão gratuita da OpenWeather cobre 5 dias, em intervalos de 3 horas.
        </Text>
      </Card>

      <Card titulo="Histórico de consultas">
        {historico.length === 0 ? (
          <Text style={{ color: cores.textoSecundario }}>Nenhuma consulta registrada ainda.</Text>
        ) : (
          historico.slice(0, 10).map((registro) => (
            <View key={registro.id} style={styles.linhaHistorico}>
              <WeatherIcon categoria={registro.categoria} tamanho={18} cor={cores.textoSecundario} />
              <Text style={[styles.textoHistorico, { color: cores.texto }]}>
                {formatarDiaMes(registro.data)} — {formatarTemperatura(registro.temperatura, unidade)}
              </Text>
              <Text style={[styles.cidadeHistorico, { color: cores.textoSecundario }]} numberOfLines={1}>
                {registro.nomeLocal}
              </Text>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: 16, gap: 16, paddingBottom: 32 },
  local: { fontSize: 14, fontWeight: '600' },
  nota: { fontSize: 12, marginTop: 4 },
  linhaHistorico: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  textoHistorico: { fontSize: 15, fontWeight: '600' },
  cidadeHistorico: { flex: 1, fontSize: 14, textAlign: 'right' },
});
