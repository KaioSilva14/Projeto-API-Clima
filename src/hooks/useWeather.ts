import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useCitiesStore } from '@/store/citiesStore';
import { useWeatherStore } from '@/store/weatherStore';

/**
 * Hook usado pelas telas que mostram clima.
 *
 * - Dispara a busca ao montar a tela e sempre que o local escolhido muda.
 * - Recarrega quando o app volta do segundo plano (se o cache estiver velho).
 * - Chamadas repetidas são baratas: o store ignora se os dados ainda estão frescos.
 */
export function useWeather() {
  // useShallow: o componente só re-renderiza se algum desses campos mudar.
  const estado = useWeatherStore(
    useShallow((s) => ({
      dados: s.dados,
      carregando: s.carregando,
      erro: s.erro,
      origem: s.origem,
      semPermissaoLocalizacao: s.semPermissaoLocalizacao,
      localizacaoAproximada: s.localizacaoAproximada,
      carregar: s.carregar,
    })),
  );
  const idCidade = useCitiesStore((s) => s.cidadeSelecionada?.id ?? null);
  const { carregar } = estado;

  useEffect(() => {
    carregar();
  }, [carregar, idCidade]);

  useEffect(() => {
    const assinatura = AppState.addEventListener('change', (status) => {
      if (status === 'active') carregar();
    });
    return () => assinatura.remove();
  }, [carregar]);

  return {
    ...estado,
    recarregar: () => carregar({ forcar: true }),
  };
}
