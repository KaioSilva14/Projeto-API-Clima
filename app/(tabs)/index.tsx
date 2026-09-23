import { Ionicons } from '@expo/vector-icons';
import { Link, router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Botao } from '@/components/Botao';
import { Card } from '@/components/Card';
import { DayInsightCard } from '@/components/DayInsightCard';
import { DetailItem } from '@/components/DetailItem';
import { StateMessage } from '@/components/StateMessage';
import { WeatherBackground } from '@/components/WeatherBackground';
import { WeatherIcon } from '@/components/WeatherIcon';
import { useWeather } from '@/hooks/useWeather';
import { usePreferencesStore } from '@/store/preferencesStore';
import {
  capitalizar,
  direcaoDoVento,
  formatarHora,
  formatarIndiceUV,
  formatarPorcentagem,
  formatarTemperatura,
  formatarVento,
  formatarVisibilidade,
  tempoDecorrido,
} from '@/utils/formatar';
import { gerarResumoDoDia, interpretarDados } from '@/utils/interpretarClima';

/**
 * Home: clima atual, resumo do dia e "Como está o dia?".
 * Toda a lógica pesada está em hooks/utils — aqui é só montar a tela.
 */
export default function HomeScreen() {
  const { dados, carregando, erro, origem, semPermissaoLocalizacao, localizacaoAproximada, recarregar } =
    useWeather();
  const unidade = usePreferencesStore((s) => s.unidade);
  const focada = useIsFocused();

  // 1) Ainda não temos nenhum dado (nem em cache).
  if (!dados) {
    if (carregando || !erro) {
      return <StateMessage carregando comLogo titulo="Buscando o clima..." mensagem="Descobrindo sua localização" />;
    }
    return (
      <StateMessage
        icone={semPermissaoLocalizacao ? 'location-outline' : 'cloud-offline-outline'}
        titulo="Não foi possível carregar o clima"
        mensagem={erro}
      >
        {semPermissaoLocalizacao && <Botao titulo="Pesquisar uma cidade" onPress={() => router.navigate('/cities')} />}
        <Botao titulo="Tentar novamente" variante="secundario" onPress={recarregar} />
      </StateMessage>
    );
  }

  // 2) Temos dados: montamos a tela.
  const { atual, local, fusoHorario } = dados;
  const temp = (c: number) => formatarTemperatura(c, unidade);
  const conselho = interpretarDados(dados);
  const hoje = dados.dias[0];

  return (
    <WeatherBackground categoria={atual.categoria} ehNoite={atual.ehNoite}>
      {/* Texto branco sobre o gradiente: barra de status clara só quando esta aba está visível. */}
      {focada && <StatusBar style="light" />}
      <SafeAreaView edges={['top']} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.conteudo}
          refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor="#FFFFFF" />}
        >
          <View style={styles.cabecalho}>
            <Pressable
              style={styles.local}
              onPress={() => router.navigate('/cities')}
              accessibilityRole="button"
              accessibilityLabel={`Local: ${local.nome}. Toque para trocar de cidade.`}
            >
              <Ionicons name={origem === 'gps' ? 'navigate' : 'location'} size={18} color="#FFFFFF" />
              <Text style={styles.nomeLocal} numberOfLines={1}>
                {local.nome}
              </Text>
              <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.8)" />
            </Pressable>
            <Link href="/settings" asChild>
              <Pressable hitSlop={12} accessibilityLabel="Abrir configurações">
                <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
              </Pressable>
            </Link>
          </View>

          {erro && (
            <View style={styles.aviso}>
              <Ionicons name="warning-outline" size={16} color="#FFFFFF" />
              <Text style={styles.textoAviso}>
                {erro} Mostrando dados salvos {tempoDecorrido(dados.obtidoEm)}.
              </Text>
            </View>
          )}
          {localizacaoAproximada && origem === 'gps' && (
            <Text style={styles.nota}>Usando localização aproximada.</Text>
          )}

          <View style={styles.principal}>
            <WeatherIcon categoria={atual.categoria} ehNoite={atual.ehNoite} tamanho={64} cor="#FFFFFF" />
            <Text style={styles.temperatura} accessibilityLabel={`Temperatura ${temp(atual.temperatura)}`}>
              {formatarTemperatura(atual.temperatura, unidade, false)}
            </Text>
            <Text style={styles.condicao}>{capitalizar(atual.descricao)}</Text>
            <Text style={styles.linhaSecundaria}>Sensação de {temp(atual.sensacaoTermica)}</Text>
            {hoje && (
              <Text style={styles.linhaSecundaria}>
                Máx. {temp(hoje.tempMax)} • Mín. {temp(hoje.tempMin)}
              </Text>
            )}
            <View style={styles.chips}>
              <Text style={styles.chip}>Chuva: {formatarPorcentagem(atual.probabilidadeChuva)}</Text>
              <Text style={styles.chip}>Vento: {formatarVento(atual.ventoVelocidade, unidade)}</Text>
            </View>
          </View>

          {hoje && (
            <Card titulo="Resumo do dia" variante="vidro">
              <Text style={styles.resumo}>{gerarResumoDoDia(hoje, fusoHorario)}</Text>
            </Card>
          )}

          <DayInsightCard conselho={conselho} temperaturaFormatada={temp(atual.temperatura)} />

          <Card titulo="Detalhes" variante="vidro">
            <View style={styles.grade}>
              <DetailItem icone="water-outline" rotulo="Umidade" valor={`${atual.umidade}%`} />
              <DetailItem icone="speedometer-outline" rotulo="Pressão" valor={`${atual.pressao} hPa`} />
              <DetailItem
                icone="flag-outline"
                rotulo="Vento"
                valor={`${formatarVento(atual.ventoVelocidade, unidade)} ${direcaoDoVento(atual.ventoDirecao)}`}
              />
              <DetailItem icone="sunny-outline" rotulo="Índice UV" valor={formatarIndiceUV(atual.indiceUV)} />
              <DetailItem icone="eye-outline" rotulo="Visibilidade" valor={formatarVisibilidade(atual.visibilidade)} />
              <DetailItem icone="umbrella-outline" rotulo="Chuva" valor={formatarPorcentagem(atual.probabilidadeChuva)} />
              <DetailItem icone="arrow-up-circle-outline" rotulo="Nascer do sol" valor={formatarHora(atual.nascerDoSol, fusoHorario)} />
              <DetailItem icone="arrow-down-circle-outline" rotulo="Pôr do sol" valor={formatarHora(atual.porDoSol, fusoHorario)} />
            </View>
          </Card>

          <Link href="/forecast" asChild>
            <Pressable style={styles.linkPrevisao} accessibilityRole="link">
              <Text style={styles.textoLink}>Ver previsão completa</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </Pressable>
          </Link>

          <Text style={styles.rodape}>
            Atualizado {tempoDecorrido(dados.obtidoEm)} • Dados: OpenWeather
          </Text>
        </ScrollView>
      </SafeAreaView>
    </WeatherBackground>
  );
}

const sombraTexto = {
  textShadowColor: 'rgba(0,0,0,0.25)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  conteudo: { padding: 16, gap: 16, paddingBottom: 32 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  local: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  nomeLocal: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', flexShrink: 1, ...sombraTexto },
  aviso: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(214,69,69,0.55)',
    padding: 12,
    borderRadius: 12,
  },
  textoAviso: { color: '#FFFFFF', flex: 1, fontSize: 13, lineHeight: 18 },
  nota: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  principal: { alignItems: 'center', gap: 4, paddingVertical: 12 },
  temperatura: { color: '#FFFFFF', fontSize: 96, fontWeight: '200', lineHeight: 104, ...sombraTexto },
  condicao: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', ...sombraTexto },
  linhaSecundaria: { color: 'rgba(255,255,255,0.9)', fontSize: 15, ...sombraTexto },
  chips: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chip: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  resumo: { color: '#FFFFFF', fontSize: 15, lineHeight: 22 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  linkPrevisao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8 },
  textoLink: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  rodape: { color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'center' },
});
