import { router } from 'expo-router';
import { Botao } from './Botao';
import { StateMessage } from './StateMessage';

interface SemDadosClimaProps {
  carregando: boolean;
  erro: string | null;
  aoTentarNovamente: () => void;
}

/** Estado usado pelas abas quando ainda não existe nenhum dado de clima. */
export function SemDadosClima({ carregando, erro, aoTentarNovamente }: SemDadosClimaProps) {
  if (carregando || !erro) return <StateMessage carregando titulo="Carregando o clima..." />;
  return (
    <StateMessage icone="cloud-offline-outline" titulo="Sem dados do clima" mensagem={erro}>
      <Botao titulo="Tentar novamente" onPress={aoTentarNovamente} />
      <Botao titulo="Pesquisar uma cidade" variante="secundario" onPress={() => router.navigate('/cities')} />
    </StateMessage>
  );
}
