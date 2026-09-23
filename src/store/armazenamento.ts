import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/**
 * Ponte entre o Zustand e o AsyncStorage.
 *
 * O middleware `persist` do Zustand salva o estado automaticamente sempre que
 * ele muda e o recarrega quando o app abre ("hidratação"). O AsyncStorage é
 * um armazenamento chave-valor simples e assíncrono, que só guarda texto —
 * por isso o `createJSONStorage` converte os objetos para JSON.
 */
export const armazenamentoLocal = createJSONStorage(() => AsyncStorage);
