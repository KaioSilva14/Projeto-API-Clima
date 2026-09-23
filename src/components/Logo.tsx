import { Image, StyleSheet, Text, View } from 'react-native';

interface LogoProps {
  tamanho?: number;
  /** Mostra o nome "WeatherFlow" ao lado do ícone. */
  comNome?: boolean;
  corTexto?: string;
}

/**
 * Logo do app. O ícone é o mesmo PNG usado como ícone do aplicativo
 * (os originais em SVG ficam em assets/brand/).
 * `require` de imagem é resolvido pelo Metro na hora de montar o app.
 */
export function Logo({ tamanho = 56, comNome = false, corTexto = '#FFFFFF' }: LogoProps) {
  return (
    <View style={styles.linha} accessible accessibilityLabel="WeatherFlow">
      <Image
        source={require('../../assets/icon.png')}
        style={{ width: tamanho, height: tamanho, borderRadius: tamanho * 0.23 }}
      />
      {comNome && <Text style={[styles.nome, { color: corTexto, fontSize: tamanho * 0.42 }]}>WeatherFlow</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nome: { fontWeight: '700', letterSpacing: 0.3 },
});
