import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, StyleSheet } from 'react-native';
import { gradienteDoClima } from '@/constants/theme';
import type { CategoriaClima } from '@/types/weather';
import { LightningFlash } from './LightningFlash';
import { RainAnimation } from './RainAnimation';

interface WeatherBackgroundProps {
  categoria: CategoriaClima;
  ehNoite: boolean;
  children: ReactNode;
}

/**
 * Fundo que muda conforme o clima (seção 6.4): gradiente + animações.
 * Respeita a opção de acessibilidade "reduzir movimento" do celular.
 */
export function WeatherBackground({ categoria, ehNoite, children }: WeatherBackgroundProps) {
  const [reduzirMovimento, setReduzirMovimento] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduzirMovimento).catch(() => {});
    const assinatura = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduzirMovimento);
    return () => assinatura.remove();
  }, []);

  const chovendo = categoria === 'chuva' || categoria === 'tempestade';
  const garoando = categoria === 'garoa';

  return (
    <LinearGradient colors={gradienteDoClima(categoria, ehNoite)} style={styles.container}>
      {!reduzirMovimento && (chovendo || garoando) && <RainAnimation intensidade={garoando ? 18 : 45} />}
      {!reduzirMovimento && categoria === 'tempestade' && <LightningFlash />}
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
