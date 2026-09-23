import { Pressable, StyleSheet, Text } from 'react-native';
import { useTema } from '@/hooks/useTema';

interface BotaoProps {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario';
  desabilitado?: boolean;
}

export function Botao({ titulo, onPress, variante = 'primario', desabilitado = false }: BotaoProps) {
  const { cores } = useTema();
  const primario = variante === 'primario';

  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado }}
      style={({ pressed }) => [
        styles.botao,
        primario ? { backgroundColor: cores.primaria } : { borderColor: cores.primaria, borderWidth: 1.5 },
        (pressed || desabilitado) && { opacity: 0.6 },
      ]}
    >
      <Text style={[styles.texto, { color: primario ? '#FFFFFF' : cores.primaria }]}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center' },
  texto: { fontSize: 15, fontWeight: '600' },
});
