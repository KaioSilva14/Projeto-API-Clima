import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Conselho, TipoConselho } from '@/utils/interpretarClima';
import { Card } from './Card';

const ICONES: Record<TipoConselho, ComponentProps<typeof Ionicons>['name']> = {
  'bom-para-sair': 'walk',
  'leve-guarda-chuva': 'umbrella',
  'evite-atividades-externas': 'home',
  'hidrate-se': 'water',
  'agasalhe-se': 'shirt',
  atencao: 'alert-circle',
};

interface DayInsightCardProps {
  conselho: Conselho;
  /** Temperatura já formatada na unidade do usuário, ex.: "26°C". */
  temperaturaFormatada: string;
}

/**
 * Seção "Como está o dia?" — mostra o conselho gerado por
 * `interpretarClima` (a lógica fica em utils; aqui é só apresentação).
 */
export function DayInsightCard({ conselho, temperaturaFormatada }: DayInsightCardProps) {
  const detalhes = [temperaturaFormatada, ...conselho.detalhes].join(' • ');

  return (
    <Card titulo="Como está o dia?" variante="vidro">
      <View style={styles.linha}>
        <View style={styles.icone}>
          <Ionicons name={ICONES[conselho.tipo]} size={26} color="#FFFFFF" />
        </View>
        <View style={styles.textos}>
          <Text style={styles.titulo}>{conselho.titulo}</Text>
          <Text style={styles.detalhes}>{detalhes}</Text>
        </View>
      </View>
      {conselho.mensagem && <Text style={styles.mensagem}>{conselho.mensagem}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1, gap: 4 },
  titulo: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  detalhes: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  mensagem: { color: '#FFFFFF', fontSize: 14, lineHeight: 20 },
});
