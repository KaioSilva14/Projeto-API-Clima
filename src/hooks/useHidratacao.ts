import { useEffect, useState } from 'react';
import { useCitiesStore } from '@/store/citiesStore';
import { useHistoryStore } from '@/store/historyStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useWeatherStore } from '@/store/weatherStore';

/**
 * O AsyncStorage é assíncrono: ao abrir o app, os stores começam com os
 * valores padrão e só "hidratam" (recebem o que estava salvo) um instante
 * depois. Se buscarmos o clima antes disso, usaríamos o GPS mesmo com uma
 * cidade escolhida. Este hook diz quando TODOS os stores estão prontos.
 */
const stores = [usePreferencesStore, useCitiesStore, useHistoryStore, useWeatherStore];

function todosHidratados(): boolean {
  return stores.every((store) => store.persist.hasHydrated());
}

export function useHidratacao(): boolean {
  const [pronto, setPronto] = useState<boolean>(todosHidratados);

  useEffect(() => {
    if (pronto) return;
    const atualizar = () => setPronto(todosHidratados());
    const cancelar = stores.map((store) => store.persist.onFinishHydration(atualizar));
    atualizar(); // caso tenham terminado entre o render e o efeito
    return () => cancelar.forEach((fn) => fn());
  }, [pronto]);

  return pronto;
}
