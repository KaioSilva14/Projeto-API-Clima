import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DetailItemProps {
  icone: ComponentProps<typeof Ionicons>['name'];
  rotulo: string;
  valor: string;
}

/** Um quadrinho da grade de detalhes da Home (umidade, pressão...). */
export function DetailItem({ icone, rotulo, valor }: DetailItemProps) {
  return (
    <View style={styles.item} accessible accessibilityLabel={`${rotulo}: ${valor}`}>
      <View style={styles.cabecalho}>
        <Ionicons name={icone} size={14} color="rgba(255,255,255,0.8)" />
        <Text style={styles.rotulo}>{rotulo}</Text>
      </View>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    // Duas colunas: cada item ocupa ~metade da largura (o "gap" do pai separa).
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rotulo: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  valor: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});
