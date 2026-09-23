import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { OPENWEATHER_API_KEY } from '@/constants/config';
import { useTema } from '@/hooks/useTema';
import type { Local } from '@/types/weather';
import { gerarHtmlMapa, type CamadaMapa } from '@/utils/mapaHtml';
import { StateMessage } from './StateMessage';

export type { CamadaMapa };

interface WeatherMapProps {
  local: Local;
  camada: CamadaMapa;
}

/**
 * Mapa meteorológico no Android/iOS: uma página Leaflet dentro de uma WebView
 * (veja o porquê em `src/utils/mapaHtml.ts`). No navegador, o Metro usa
 * automaticamente o `WeatherMap.web.tsx` (extensão por plataforma).
 */
export function WeatherMap({ local, camada }: WeatherMapProps) {
  const { cores, escuro } = useTema();
  const webView = useRef<WebView>(null);
  const [erro, setErro] = useState(false);

  // A página só é recriada quando muda o local ou o tema. A camada inicial é
  // "congelada" no primeiro render; as trocas seguintes vão pelo efeito abaixo.
  const [camadaInicial] = useState(camada);
  const html = useMemo(
    () =>
      gerarHtmlMapa({
        latitude: local.latitude,
        longitude: local.longitude,
        nomeLocal: local.nome,
        camada: camadaInicial,
        chaveApi: OPENWEATHER_API_KEY,
        escuro,
      }),
    [local.latitude, local.longitude, local.nome, camadaInicial, escuro],
  );

  // Guarda a camada atual para reaplicar se a página recarregar (ex.: troca de tema).
  const camadaAtual = useRef(camada);
  const aplicarCamada = () => {
    webView.current?.injectJavaScript(
      `window.trocarCamada && window.trocarCamada(${JSON.stringify(camadaAtual.current)}); true;`,
    );
  };

  useEffect(() => {
    camadaAtual.current = camada;
    // injectJavaScript roda um trecho de JS dentro da página do mapa.
    webView.current?.injectJavaScript(`window.trocarCamada && window.trocarCamada(${JSON.stringify(camada)}); true;`);
  }, [camada]);

  if (erro) {
    return (
      <StateMessage icone="map-outline" titulo="Não foi possível carregar o mapa" mensagem="Verifique sua conexão." />
    );
  }

  return (
    <WebView
      ref={webView}
      // baseUrl dá um endereço de origem à página: o OpenStreetMap pede que os
      // pedidos de mapa informem de onde vêm (cabeçalho Referer).
      source={{ html, baseUrl: 'https://weatherflow.app/' }}
      originWhitelist={['*']}
      style={[styles.mapa, { backgroundColor: cores.fundo }]}
      startInLoadingState
      renderLoading={() => (
        <View style={[StyleSheet.absoluteFill, styles.carregando, { backgroundColor: cores.fundo }]}>
          <ActivityIndicator color={cores.primaria} />
        </View>
      )}
      onLoadEnd={aplicarCamada}
      onError={() => setErro(true)}
      // O mapa trata os próprios gestos (arrastar, pinça para zoom).
      scrollEnabled={false}
      overScrollMode="never"
      setSupportMultipleWindows={false}
    />
  );
}

const styles = StyleSheet.create({
  mapa: { flex: 1 },
  carregando: { alignItems: 'center', justifyContent: 'center' },
});
