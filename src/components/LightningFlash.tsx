import { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

/** Clarão rápido de relâmpago a cada alguns segundos (tempestade). */
export function LightningFlash() {
  // useState com inicializador cria o Animated.Value uma única vez.
  const [opacidade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const piscar = (valor: number, duracao: number) =>
      Animated.timing(opacidade, { toValue: valor, duration: duracao, useNativeDriver: true });

    const animacao = Animated.loop(
      Animated.sequence([
        Animated.delay(5000),
        piscar(0.45, 60),
        piscar(0, 90),
        piscar(0.3, 50),
        piscar(0, 250),
      ]),
    );
    animacao.start();
    return () => animacao.stop();
  }, [opacidade]);

  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clarao, { opacity: opacidade }]} />;
}

const styles = StyleSheet.create({
  clarao: { backgroundColor: '#FFFFFF' },
});
