import { useEffect, useMemo, useRef, useState } from 'react';
import { OPENWEATHER_API_KEY } from '@/constants/config';
import { useTema } from '@/hooks/useTema';
import type { Local } from '@/types/weather';
import { gerarHtmlMapa, type CamadaMapa } from '@/utils/mapaHtml';

export type { CamadaMapa };

interface WeatherMapProps {
  local: Local;
  camada: CamadaMapa;
}

/** Janela do iframe com a função que a página do mapa expõe. */
type JanelaMapa = Window & { trocarCamada?: (camada: CamadaMapa) => void };

/**
 * Versão web do mapa: a WebView não existe no navegador, então usamos um
 * <iframe> com a mesma página Leaflet (`src/utils/mapaHtml.ts`).
 */
export function WeatherMap({ local, camada }: WeatherMapProps) {
  const { escuro } = useTema();
  const iframe = useRef<HTMLIFrameElement>(null);
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

  useEffect(() => {
    // O iframe com srcDoc tem a mesma origem da página, então podemos chamar a função direto.
    (iframe.current?.contentWindow as JanelaMapa | null)?.trocarCamada?.(camada);
  }, [camada]);

  return (
    <iframe
      ref={iframe}
      title={`Mapa meteorológico de ${local.nome}`}
      srcDoc={html}
      onLoad={() => (iframe.current?.contentWindow as JanelaMapa | null)?.trocarCamada?.(camada)}
      style={{ border: 0, width: '100%', height: '100%', flex: 1 }}
    />
  );
}
