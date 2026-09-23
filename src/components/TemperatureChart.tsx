import { useState } from 'react';
import { Platform, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { useTema } from '@/hooks/useTema';

/**
 * Gráfico de linha simples desenhado "na mão" com react-native-svg.
 *
 * Por que não uma biblioteca de gráficos? Para este caso (uma linha com
 * poucos pontos) um componente próprio é pequeno, não adiciona dependência e
 * ensina como gráficos funcionam: converter valores em coordenadas x/y.
 */
export interface PontoGrafico {
  rotulo: string;
  valor: number;
}

interface TemperatureChartProps {
  pontos: PontoGrafico[];
  altura?: number;
  /** Texto exibido acima de cada ponto, ex.: "27°". */
  formatarValor: (valor: number) => string;
}

const MARGEM_X = 18;
const MARGEM_TOPO = 24;
const MARGEM_BASE = 26;
// O texto do SVG não herda a fonte do app. No celular o padrão já é a fonte
// do sistema; no navegador seria uma fonte serifada, então definimos a fonte.
const FONTE = Platform.OS === 'web' ? 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' : undefined;

export function TemperatureChart({ pontos, altura = 150, formatarValor }: TemperatureChartProps) {
  const { cores } = useTema();
  // A largura só é conhecida depois que o layout é calculado (onLayout).
  const [largura, setLargura] = useState(0);

  const aoMedir = (evento: LayoutChangeEvent) => setLargura(evento.nativeEvent.layout.width);

  if (pontos.length < 2) return null;

  const valores = pontos.map((p) => p.valor);
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const intervalo = maximo - minimo || 1; // evita divisão por zero se tudo for igual

  const areaAltura = altura - MARGEM_TOPO - MARGEM_BASE;
  const passoX = (largura - MARGEM_X * 2) / (pontos.length - 1);

  // Valor → coordenada. No SVG, y cresce PARA BAIXO, por isso o "1 -".
  const coordenadas = pontos.map((p, i) => ({
    x: MARGEM_X + i * passoX,
    y: MARGEM_TOPO + (1 - (p.valor - minimo) / intervalo) * areaAltura,
  }));

  const caminho = coordenadas.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');

  return (
    <View style={styles.container} onLayout={aoMedir}>
      {largura > 0 && (
        <Svg width={largura} height={altura}>
          <Path d={caminho} stroke={cores.primaria} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
          {coordenadas.map((c, i) => (
            <Circle key={`c${i}`} cx={c.x} cy={c.y} r={3.5} fill={cores.primaria} />
          ))}
          {coordenadas.map((c, i) => (
            <SvgText
              key={`v${i}`}
              x={c.x}
              y={c.y - 9}
              fontSize={11}
              fontFamily={FONTE}
              fill={cores.texto}
              textAnchor="middle"
            >
              {formatarValor(pontos[i].valor)}
            </SvgText>
          ))}
          {coordenadas.map((c, i) => (
            <SvgText
              key={`r${i}`}
              x={c.x}
              y={altura - 6}
              fontSize={10}
              fontFamily={FONTE}
              fill={cores.textoSecundario}
              textAnchor="middle"
            >
              {pontos[i].rotulo}
            </SvgText>
          ))}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
});
