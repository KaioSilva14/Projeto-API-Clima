import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTema } from '@/hooks/useTema';

interface CardProps {
  titulo?: string;
  /** "vidro" = translúcido, para usar sobre o gradiente da Home. */
  variante?: 'padrao' | 'vidro';
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export function Card({ titulo, variante = 'padrao', style, children }: CardProps) {
  const { cores } = useTema();
  const vidro = variante === 'vidro';

  return (
    <View
      style={[
        styles.card,
        vidro ? styles.vidro : { backgroundColor: cores.superficie, borderColor: cores.borda },
        style,
      ]}
    >
      {titulo && (
        <Text style={[styles.titulo, { color: vidro ? 'rgba(255,255,255,0.85)' : cores.textoSecundario }]}>
          {titulo.toUpperCase()}
        </Text>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 10,
  },
  vidro: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.25)',
  },
  titulo: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
