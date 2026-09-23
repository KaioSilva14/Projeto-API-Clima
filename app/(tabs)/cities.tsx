import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from '@/components/Card';
import { useTema } from '@/hooks/useTema';
import { buscarCidades, mensagemAmigavel } from '@/services/openWeather';
import { useCitiesStore } from '@/store/citiesStore';
import type { Local } from '@/types/weather';
import { nomeCompletoDoLocal } from '@/utils/formatar';

/** Espera o usuário parar de digitar antes de chamar a API. */
const ATRASO_BUSCA_MS = 500;

interface RespostaBusca {
  /** Texto que gerou esta resposta. */
  termo: string;
  cidades: Local[];
  erro: string | null;
}

export default function CitiesScreen() {
  const { cores } = useTema();
  const { favoritas, cidadeSelecionada, adicionarFavorita, removerFavorita, selecionarCidade, usarLocalizacaoAtual } =
    useCitiesStore(
      useShallow((s) => ({
        favoritas: s.favoritas,
        cidadeSelecionada: s.cidadeSelecionada,
        adicionarFavorita: s.adicionarFavorita,
        removerFavorita: s.removerFavorita,
        selecionarCidade: s.selecionarCidade,
        usarLocalizacaoAtual: s.usarLocalizacaoAtual,
      })),
    );

  const [termo, setTermo] = useState('');
  const [resposta, setResposta] = useState<RespostaBusca | null>(null);

  const texto = termo.trim();
  const buscaAtiva = texto.length >= 2;
  // Estado DERIVADO: "buscando" é calculado, não guardado. Se a última
  // resposta não é do texto atual, ainda estamos esperando a API.
  const respostaAtual = resposta?.termo === texto ? resposta : null;
  const buscando = buscaAtiva && respostaAtual === null;

  /**
   * Busca com "debounce": cada tecla reinicia o cronômetro. A API só é
   * chamada 500 ms depois da última tecla — economiza requisições.
   * A flag `cancelado` descarta respostas de buscas antigas que chegarem
   * atrasadas (ex.: "Lon" responder depois de "Londrina").
   */
  useEffect(() => {
    if (texto.length < 2) return;

    let cancelado = false;
    const cronometro = setTimeout(async () => {
      try {
        const cidades = await buscarCidades(texto);
        if (!cancelado) {
          setResposta({ termo: texto, cidades, erro: cidades.length === 0 ? 'Nenhuma cidade encontrada.' : null });
        }
      } catch (erro) {
        if (!cancelado) setResposta({ termo: texto, cidades: [], erro: mensagemAmigavel(erro) });
      }
    }, ATRASO_BUSCA_MS);

    return () => {
      cancelado = true;
      clearTimeout(cronometro);
    };
  }, [texto]);

  const ehFavorita = (id: string) => favoritas.some((f) => f.id === id);

  const escolher = (local: Local) => {
    selecionarCidade(local);
    setTermo('');
    router.navigate('/');
  };

  const escolherGps = () => {
    usarLocalizacaoAtual();
    router.navigate('/');
  };

  const alternarFavorita = (local: Local) => {
    if (ehFavorita(local.id)) removerFavorita(local.id);
    else adicionarFavorita(local);
  };

  const renderizarCidade = (local: Local) => {
    const selecionada = cidadeSelecionada?.id === local.id;
    const favorita = ehFavorita(local.id);
    return (
      <View key={local.id} style={[styles.linha, { borderBottomColor: cores.borda }]}>
        <Pressable
          style={styles.infoCidade}
          onPress={() => escolher(local)}
          accessibilityRole="button"
          accessibilityLabel={`Ver clima de ${nomeCompletoDoLocal(local)}`}
        >
          <Text style={[styles.nomeCidade, { color: cores.texto }]}>{local.nome}</Text>
          <Text style={[styles.regiao, { color: cores.textoSecundario }]}>
            {[local.estado, local.pais].filter(Boolean).join(', ')}
          </Text>
        </Pressable>
        {selecionada && <Ionicons name="checkmark-circle" size={22} color={cores.sucesso} />}
        <Pressable
          onPress={() => alternarFavorita(local)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={favorita ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Ionicons name={favorita ? 'star' : 'star-outline'} size={22} color={cores.aviso} />
        </Pressable>
      </View>
    );
  };

  return (
    <ScrollView
      style={{ backgroundColor: cores.fundo }}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.campoBusca, { backgroundColor: cores.superficie, borderColor: cores.borda }]}>
        <Ionicons name="search" size={18} color={cores.textoSecundario} />
        <TextInput
          value={termo}
          onChangeText={setTermo}
          placeholder="Buscar cidade (ex.: Londrina, Nova York)"
          placeholderTextColor={cores.textoSecundario}
          style={[styles.input, { color: cores.texto }]}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Buscar cidade"
        />
        {buscando && <ActivityIndicator size="small" color={cores.primaria} />}
      </View>

      {buscaAtiva && (
        <Card titulo="Resultados">
          {buscando && <Text style={{ color: cores.textoSecundario }}>Buscando...</Text>}
          {respostaAtual?.erro ? (
            <Text style={{ color: cores.textoSecundario }}>{respostaAtual.erro}</Text>
          ) : (
            respostaAtual?.cidades.map(renderizarCidade)
          )}
        </Card>
      )}

      <Pressable
        onPress={escolherGps}
        style={[styles.gps, { backgroundColor: cores.superficie, borderColor: cores.borda }]}
        accessibilityRole="button"
      >
        <Ionicons name="navigate" size={20} color={cores.primaria} />
        <Text style={[styles.textoGps, { color: cores.texto }]}>Usar minha localização atual</Text>
        {cidadeSelecionada === null && <Ionicons name="checkmark-circle" size={22} color={cores.sucesso} />}
      </Pressable>

      <Card titulo="Favoritas">
        {favoritas.length === 0 ? (
          <Text style={{ color: cores.textoSecundario }}>
            Toque na estrela de uma cidade pesquisada para salvá-la aqui.
          </Text>
        ) : (
          favoritas.map(renderizarCidade)
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: 16, gap: 16, paddingBottom: 32 },
  campoBusca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  // No navegador, remove a borda de foco padrão (o campo já tem a própria borda).
  input: { flex: 1, paddingVertical: 12, fontSize: 16, ...(Platform.OS === 'web' ? { outlineWidth: 0 } : {}) },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoCidade: { flex: 1 },
  nomeCidade: { fontSize: 16, fontWeight: '600' },
  regiao: { fontSize: 13 },
  gps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  textoGps: { flex: 1, fontSize: 16, fontWeight: '600' },
});
