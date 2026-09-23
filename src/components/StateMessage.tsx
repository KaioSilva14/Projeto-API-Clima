import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTema } from '@/hooks/useTema';
import { Logo } from './Logo';

interface StateMessageProps {
  /** Sem ícone e com spinner = estado de carregamento. */
  carregando?: boolean;
  /** Mostra o logo do app acima da mensagem (ex.: primeira abertura). */
  comLogo?: boolean;
  icone?: ComponentProps<typeof Ionicons>['name'];
  titulo: string;
  mensagem?: string;
  /** Botões de ação (ex.: "Tentar novamente"). */
  children?: ReactNode;
}

/**
 * Tela de "estado": carregando, erro ou vazio. Usar sempre este componente
 * garante que nenhuma tela fique em branco quando algo dá errado.
 */
export function StateMessage({ carregando = false, comLogo = false, icone, titulo, mensagem, children }: StateMessageProps) {
  const { cores } = useTema();

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      {comLogo && <Logo tamanho={72} />}
      {carregando ? (
        <ActivityIndicator size="large" color={cores.primaria} />
      ) : (
        icone && <Ionicons name={icone} size={48} color={cores.textoSecundario} />
      )}
      <Text style={[styles.titulo, { color: cores.texto }]}>{titulo}</Text>
      {mensagem && <Text style={[styles.mensagem, { color: cores.textoSecundario }]}>{mensagem}</Text>}
      {children && <View style={styles.acoes}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  titulo: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  mensagem: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  acoes: { marginTop: 8, gap: 10, alignSelf: 'stretch' },
});
