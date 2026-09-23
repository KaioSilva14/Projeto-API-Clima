import { gerarHtmlMapa, type OpcoesMapa } from '../mapaHtml';

const opcoes: OpcoesMapa = {
  latitude: -23.31,
  longitude: -51.16,
  nomeLocal: 'Londrina',
  camada: 'precipitation_new',
  chaveApi: 'abc123',
  escuro: false,
};

describe('gerarHtmlMapa', () => {
  it('centraliza o mapa nas coordenadas do local', () => {
    expect(gerarHtmlMapa(opcoes)).toContain('var centro = [-23.31, -51.16]');
  });

  it('usa a camada e a chave da OpenWeather', () => {
    const html = gerarHtmlMapa(opcoes);
    expect(html).toContain('urlCamada("precipitation_new")');
    expect(html).toContain('var chave = "abc123"');
  });

  it('aplica o filtro escuro só no tema escuro', () => {
    expect(gerarHtmlMapa(opcoes)).toContain('<body class="">');
    expect(gerarHtmlMapa({ ...opcoes, escuro: true })).toContain('<body class="escuro">');
  });

  it('não deixa um nome de cidade quebrar o script', () => {
    const html = gerarHtmlMapa({ ...opcoes, nomeLocal: 'A"</script><script>alert(1)' });
    expect(html).not.toContain('</script><script>alert(1)');
    expect(html).toContain('bindPopup("A\\"\\u003c/script>\\u003cscript>alert(1)")');
  });
});
