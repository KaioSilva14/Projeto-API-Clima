import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Botao } from '@/components/Botao';
import { Card } from '@/components/Card';
import { SemDadosClima } from '@/components/SemDadosClima';
import { useTema } from '@/hooks/useTema';
import { useWeather } from '@/hooks/useWeather';
import { notificacoesSuportadas } from '@/services/notificacoes';
import { usePreferencesStore } from '@/store/preferencesStore';
import { gerarAlertas, type TipoAlerta } from '@/utils/alertas';

const ICONES: Record<TipoAlerta, ComponentProps<typeof Ionicons>['name']> = {
  tempestade: 'thunderstorm',
  'chuva-forte': 'rainy',
  calor: 'thermometer',
  frio: 'snow',
  vento: 'flag',
};

export default function AlertsScreen() {
  const { dados, carregando, erro, recarregar } = useWeather();
  const { cores } = useTema();
  const unidade = usePreferencesStore((s) => s.unidade);
  const notificacoesAtivas = usePreferencesStore((s) => s.notificacoesAtivas);

  if (!dados) return <SemDadosClima carregando={carregando} erro={erro} aoTentarNovamente={recarregar} />;

  const alertas = gerarAlertas(dados, unidade);

  return (
    <ScrollView
      style={{ backgroundColor: cores.fundo }}
      contentContainerStyle={styles.conteudo}
      refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={cores.primaria} />}
    >
      <Text style={[styles.subtitulo, { color: cores.textoSecundario }]}>
        Próximas 12 horas em {dados.local.nome}
      </Text>

      {alertas.length === 0 ? (
        <Card>
          <View style={styles.vazio}>
            <Ionicons name="checkmark-circle-outline" size={40} color={cores.sucesso} />
            <Text style={[styles.tituloVazio, { color: cores.texto }]}>Nenhum alerta no momento</Text>
            <Text style={{ color: cores.textoSecundario, textAlign: 'center' }}>
              Avisaremos sobre chuva forte, tempestades, calor ou frio intensos e ventos fortes.
            </Text>
          </View>
        </Card>
      ) : (
        alertas.map((alerta) => {
          const cor = alerta.severidade === 'perigo' ? cores.perigo : cores.aviso;
          return (
            <Card key={alerta.id} style={{ borderLeftWidth: 4, borderLeftColor: cor }}>
              <View style={styles.alerta}>
                <Ionicons name={ICONES[alerta.tipo]} size={28} color={cor} />
                <View style={styles.textos}>
                  <Text style={[styles.tituloAlerta, { color: cores.texto }]}>{alerta.titulo}</Text>
                  <Text style={{ color: cores.textoSecundario, lineHeight: 20 }}>{alerta.mensagem}</Text>
                </View>
              </View>
            </Card>
          );
        })
      )}

      {notificacoesSuportadas && !notificacoesAtivas && (
        <Card titulo="Notificações">
          <Text style={{ color: cores.textoSecundario, lineHeight: 20 }}>
            Ative as notificações para receber estes alertas mesmo fora desta tela.
          </Text>
          <Botao titulo="Ativar nas configurações" variante="secundario" onPress={() => router.push('/settings')} />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: 16, gap: 12, paddingBottom: 32 },
  subtitulo: { fontSize: 14, fontWeight: '600' },
  vazio: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  tituloVazio: { fontSize: 17, fontWeight: '700' },
  alerta: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  textos: { flex: 1, gap: 4 },
  tituloAlerta: { fontSize: 16, fontWeight: '700' },
});
