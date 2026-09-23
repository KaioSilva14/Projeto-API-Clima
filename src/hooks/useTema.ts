import { useColorScheme } from 'react-native';
import { coresClaras, coresEscuras, type PaletaCores } from '@/constants/theme';
import { usePreferencesStore } from '@/store/preferencesStore';

/**
 * Resolve o tema ativo: a preferência do usuário ("claro"/"escuro") ou, se ele
 * escolheu "sistema", o tema configurado no próprio celular.
 */
export function useTema(): { cores: PaletaCores; escuro: boolean } {
  const preferencia = usePreferencesStore((s) => s.tema);
  const temaDoSistema = useColorScheme();
  const escuro = preferencia === 'sistema' ? temaDoSistema === 'dark' : preferencia === 'escuro';
  return { cores: escuro ? coresEscuras : coresClaras, escuro };
}
