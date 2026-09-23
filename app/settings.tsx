import Constants from 'expo-constants';
import { useShallow } from 'zustand/react/shallow';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Botao } from '@/components/Botao';
import { Card } from '@/components/Card';
import { Logo } from '@/components/Logo';
import { SegmentedControl } from '@/components/SegmentedControl';
import { temChaveApi } from '@/constants/config';
import { usePermissaoLocalizacao } from '@/hooks/usePermissaoLocalizacao';
import { useTema } from '@/hooks/useTema';
import type { StatusPermissao } from '@/services/localizacao';
import {
  enviarNotificacaoDeTeste,
  motivoIndisponivel,
  notificacoesSuportadas,
  pedirPermissaoNotificacoes,
} from '@/services/notificacoes';
import { useHistoryStore } from '@/store/historyStore';
import { usePreferencesStore } from '@/store/preferencesStore';

const TEXTO_PERMISSAO: Record<StatusPermissao, string> = {
  concedida: 'Permitida',
  negada: 'Negada',
  bloqueada: 'Bloqueada (libere nas configurações do sistema)',
  'nao-perguntado': 'Ainda não solicitada',
};

export default function SettingsScreen() {
  const { cores } = useTema();
  // useShallow: re-renderiza só quando um destes campos mudar (e não a cada mudança no store).
  const { unidade, tema, notificacoesAtivas, definirUnidade, definirTema, definirNotificacoes } = usePreferencesStore(
    useShallow((s) => ({
      unidade: s.unidade,
      tema: s.tema,
      notificacoesAtivas: s.notificacoesAtivas,
      definirUnidade: s.definirUnidade,
      definirTema: s.definirTema,
      definirNotificacoes: s.definirNotificacoes,
    })),
  );
  const limparHistorico = useHistoryStore((s) => s.limpar);
  const totalHistorico = useHistoryStore((s) => s.registros.length);
  const localizacao = usePermissaoLocalizacao();

  const alternarNotificacoes = async (ativar: boolean) => {
    if (!ativar) {
      definirNotificacoes(false);
      return;
    }
    // Só ativamos a preferência se o sistema realmente permitir notificações.
    const permitido = await pedirPermissaoNotificacoes();
    if (permitido) {
      definirNotificacoes(true);
    } else {
      Alert.alert(
        'Permissão necessária',
        'Para receber alertas, permita as notificações do WeatherFlow nas configurações do aparelho.',
        [
          { text: 'Agora não', style: 'cancel' },
          { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
        ],
      );
    }
  };

  const confirmarLimpeza = () => {
    // No navegador o Alert do React Native não aparece; usamos o confirm() da página.
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('Apagar todas as consultas salvas?')) limparHistorico();
      return;
    }
    Alert.alert('Limpar histórico', 'Apagar todas as consultas salvas?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: limparHistorico },
    ]);
  };

  const textoSecundario = { color: cores.textoSecundario, lineHeight: 20 };

  return (
    <ScrollView style={{ backgroundColor: cores.fundo }} contentContainerStyle={styles.conteudo}>
      <Card titulo="Unidade de temperatura">
        <SegmentedControl
          opcoes={[
            { valor: 'C', rotulo: 'Celsius (°C)' },
            { valor: 'F', rotulo: 'Fahrenheit (°F)' },
          ]}
          selecionado={unidade}
          aoMudar={definirUnidade}
        />
        <Text style={textoSecundario}>O vento é exibido em km/h (°C) ou mph (°F).</Text>
      </Card>

      <Card titulo="Tema">
        <SegmentedControl
          opcoes={[
            { valor: 'sistema', rotulo: 'Sistema' },
            { valor: 'claro', rotulo: 'Claro' },
            { valor: 'escuro', rotulo: 'Escuro' },
          ]}
          selecionado={tema}
          aoMudar={definirTema}
        />
      </Card>

      <Card titulo="Notificações">
        {notificacoesSuportadas ? (
          <>
            <View style={styles.linha}>
              <Text style={[styles.rotulo, { color: cores.texto }]}>Alertas meteorológicos</Text>
              <Switch
                value={notificacoesAtivas}
                onValueChange={alternarNotificacoes}
                trackColor={{ true: cores.primaria }}
                accessibilityLabel="Ativar alertas meteorológicos"
              />
            </View>
            <Text style={textoSecundario}>
              Os alertas são verificados sempre que o app atualiza o clima (ao abrir ou ao puxar a tela para
              baixo).
            </Text>
            {notificacoesAtivas && (
              <Botao titulo="Enviar notificação de teste" variante="secundario" onPress={enviarNotificacaoDeTeste} />
            )}
          </>
        ) : (
          <Text style={textoSecundario}>{motivoIndisponivel}</Text>
        )}
      </Card>

      <Card titulo="Permissões">
        <View style={styles.linha}>
          <Text style={[styles.rotulo, { color: cores.texto }]}>Localização</Text>
          <Text style={{ color: cores.textoSecundario }}>
            {localizacao.status ? TEXTO_PERMISSAO[localizacao.status] : '...'}
          </Text>
        </View>
        {localizacao.status !== 'concedida' && (
          <Botao titulo="Permitir localização" variante="secundario" onPress={localizacao.solicitar} />
        )}
        {/* No navegador não existe "configurações do aparelho". */}
        {Platform.OS !== 'web' && (
          <Botao titulo="Abrir configurações do aparelho" variante="secundario" onPress={localizacao.abrirConfiguracoes} />
        )}
      </Card>

      <Card titulo="Dados salvos">
        <Text style={textoSecundario}>{totalHistorico} consulta(s) no histórico.</Text>
        <Botao titulo="Limpar histórico" variante="secundario" onPress={confirmarLimpeza} desabilitado={totalHistorico === 0} />
      </Card>

      <Card titulo="Sobre">
        <Logo tamanho={48} comNome corTexto={cores.texto} />
        <Text style={textoSecundario}>Versão {Constants.expoConfig?.version ?? '1.0.0'}</Text>
        <Text style={textoSecundario}>Dados meteorológicos: OpenWeather</Text>
        <Text style={{ color: temChaveApi() ? cores.sucesso : cores.perigo }}>
          {temChaveApi() ? 'Chave da API configurada' : 'Chave da API não configurada (veja o README)'}
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: 16, gap: 16, paddingBottom: 40 },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rotulo: { fontSize: 16, fontWeight: '600' },
});
