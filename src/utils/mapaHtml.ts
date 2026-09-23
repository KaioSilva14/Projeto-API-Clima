/**
 * Monta a página HTML do mapa meteorológico (seção 6.5 do CLAUDE.md).
 *
 * Por que um mapa em HTML dentro de uma WebView, e não o react-native-maps?
 * No Android, o react-native-maps usa o Google Maps, que exige uma chave do
 * Google Cloud com cartão de crédito cadastrado — sem ela o mapa fica em
 * branco no app instalado. Aqui usamos:
 * - Leaflet: biblioteca de mapas em JavaScript, gratuita e muito usada na web;
 * - OpenStreetMap: o mapa base (ruas, cidades), gratuito e aberto, com atribuição;
 * - OpenWeather: as camadas de clima (chuva, nuvens...), com a nossa chave.
 *
 * Conceitos de mapas usados aqui:
 * - Coordenadas: latitude (norte/sul) e longitude (leste/oeste).
 * - Zoom: 0 = mundo inteiro; cada nível dobra o detalhe. 8 ≈ uma região.
 * - Tiles (ladrilhos): o mapa é dividido em imagens quadradas por zoom (z) e
 *   posição (x, y). Cada camada é uma "pilha" de tiles transparentes.
 */

export type CamadaMapa = 'precipitation_new' | 'clouds_new' | 'temp_new' | 'wind_new';

export interface OpcoesMapa {
  latitude: number;
  longitude: number;
  nomeLocal: string;
  camada: CamadaMapa;
  chaveApi: string;
  escuro: boolean;
}

/** Versão fixa do Leaflet — evita que uma atualização da biblioteca quebre o mapa. */
const LEAFLET = 'https://unpkg.com/leaflet@1.9.4/dist';
export const ZOOM_INICIAL = 8;

export function gerarHtmlMapa(opcoes: OpcoesMapa): string {
  const { latitude, longitude, nomeLocal, camada, chaveApi, escuro } = opcoes;

  // JSON.stringify gera textos seguros para colocar dentro do <script>
  // (um nome de cidade com aspas não quebra o código). Trocar "<" por
  // < impede que o texto feche a tag </script> antes da hora.
  const js = (valor: unknown) => JSON.stringify(valor).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="${LEAFLET}/leaflet.css" />
<style>
  html, body, #mapa { margin: 0; padding: 0; width: 100%; height: 100%; background: ${escuro ? '#0D1421' : '#F2F5FA'}; }
  /* O OpenStreetMap não tem versão escura: no tema escuro invertemos as cores
     SÓ do mapa base (as camadas de clima mantêm as cores originais). */
  .escuro .mapa-base { filter: invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9); }
  #erro { display: none; position: absolute; inset: 0; align-items: center; justify-content: center;
          font-family: system-ui, sans-serif; color: ${escuro ? '#EEF2F8' : '#14213D'}; text-align: center; padding: 24px; }
</style>
</head>
<body class="${escuro ? 'escuro' : ''}">
<div id="mapa"></div>
<div id="erro">Não foi possível carregar o mapa. Verifique sua conexão.</div>
<script src="${LEAFLET}/leaflet.js"></script>
<script>
  (function () {
    if (typeof L === 'undefined') {
      // O Leaflet vem da internet; sem conexão, mostramos um aviso.
      document.getElementById('erro').style.display = 'flex';
      return;
    }
    var centro = [${js(latitude)}, ${js(longitude)}];
    var mapa = L.map('mapa', { zoomControl: false, attributionControl: true }).setView(centro, ${ZOOM_INICIAL});
    L.control.zoom({ position: 'topright' }).addTo(mapa);

    // Mapa base (ruas e nomes de cidades).
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      className: 'mapa-base',
      attribution: '&copy; OpenStreetMap &copy; OpenWeather'
    }).addTo(mapa);

    // Camada de clima (transparente, por cima do mapa base).
    var chave = ${js(chaveApi)};
    function urlCamada(nome) {
      return 'https://tile.openweathermap.org/map/' + nome + '/{z}/{x}/{y}.png?appid=' + chave;
    }
    var clima = L.tileLayer(urlCamada(${js(camada)}), { maxZoom: 18, maxNativeZoom: 12, opacity: 0.85 }).addTo(mapa);

    // Marcador do local consultado.
    L.circleMarker(centro, { radius: 9, weight: 3, color: '#FFFFFF', fillColor: '#2F6FED', fillOpacity: 1 })
      .addTo(mapa)
      .bindPopup(${js(nomeLocal)});

    // Chamado pelo app para trocar a camada sem recarregar o mapa (mantém o zoom).
    window.trocarCamada = function (nome) { clima.setUrl(urlCamada(nome)); };
  })();
</script>
</body>
</html>`;
}
