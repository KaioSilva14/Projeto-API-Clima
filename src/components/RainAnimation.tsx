import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';

/**
 * Gotas de chuva caindo (seção 6.4). Usa a API Animated do próprio React Native.
 *
 * `useNativeDriver: true` faz a animação rodar na thread nativa, e não no
 * JavaScript — por isso ela continua fluida mesmo se o JS estiver ocupado.
 * Só funciona com propriedades de transformação e opacidade.
 */
interface Gota {
  x: number;
  atraso: number;
  duracao: number;
  comprimento: number;
  progresso: Animated.Value;
}

function criarGotas(quantidade: number, largura: number): Gota[] {
  return Array.from({ length: quantidade }, () => ({
    x: Math.random() * largura,
    atraso: Math.random() * 1500,
    duracao: 700 + Math.random() * 500,
    comprimento: 12 + Math.random() * 10,
    progresso: new Animated.Value(0),
  }));
}

export function RainAnimation({ intensidade = 40 }: { intensidade?: number }) {
  const { width, height } = useWindowDimensions();
  // Inicializador "preguiçoso": as gotas são sorteadas uma única vez.
  const [gotas] = useState(() => criarGotas(intensidade, width));

  useEffect(() => {
    const animacoes = gotas.map((gota) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(gota.atraso),
          Animated.timing(gota.progresso, {
            toValue: 1,
            duration: gota.duracao,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    animacoes.forEach((a) => a.start());
    // Limpeza: parar as animações quando o componente sair da tela.
    return () => animacoes.forEach((a) => a.stop());
  }, [gotas]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {gotas.map((gota, i) => (
        <Animated.View
          key={i}
          style={[
            styles.gota,
            {
              left: gota.x,
              height: gota.comprimento,
              transform: [
                {
                  translateY: gota.progresso.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-40, height],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gota: {
    position: 'absolute',
    top: 0,
    width: 1.5,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});
