import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTema } from '@/hooks/useTema';

interface Opcao<T extends string> {
  valor: T;
  rotulo: string;
}

interface SegmentedControlProps<T extends string> {
  opcoes: Opcao<T>[];
  selecionado: T;
  aoMudar: (valor: T) => void;
}

/**
 * Seletor de opções lado a lado. É um componente GENÉRICO (<T>): funciona
 * com qualquer conjunto de valores ('C' | 'F', 'claro' | 'escuro'...) e o
 * TypeScript garante que `aoMudar` recebe exatamente esse tipo.
 */
export function SegmentedControl<T extends string>({ opcoes, selecionado, aoMudar }: SegmentedControlProps<T>) {
  const { cores } = useTema();

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo, borderColor: cores.borda }]} accessibilityRole="radiogroup">
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === selecionado;
        return (
          <Pressable
            key={opcao.valor}
            onPress={() => aoMudar(opcao.valor)}
            accessibilityRole="radio"
            accessibilityState={{ checked: ativo }}
            style={[styles.opcao, ativo && { backgroundColor: cores.primaria }]}
          >
            <Text style={[styles.texto, { color: ativo ? '#FFFFFF' : cores.texto }]}>{opcao.rotulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 3 },
  opcao: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  texto: { fontSize: 14, fontWeight: '600' },
});
