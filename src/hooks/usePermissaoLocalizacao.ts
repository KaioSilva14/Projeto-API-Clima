import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { consultarPermissao, pedirPermissao, type StatusPermissao } from '@/services/localizacao';

/**
 * Status da permissão de localização, para a tela de Configurações.
 * Reconsulta ao voltar para o app — o usuário pode ter mudado a permissão
 * nas configurações do sistema enquanto o app estava em segundo plano.
 */
export function usePermissaoLocalizacao() {
  const [status, setStatus] = useState<StatusPermissao | null>(null);

  useEffect(() => {
    // O setState acontece no .then (depois da resposta), não direto no efeito.
    const atualizar = () => {
      consultarPermissao()
        .then(setStatus)
        .catch(() => setStatus(null));
    };
    atualizar();
    const assinatura = AppState.addEventListener('change', (s) => {
      if (s === 'active') atualizar();
    });
    return () => assinatura.remove();
  }, []);

  const solicitar = useCallback(async () => {
    const novo = await pedirPermissao();
    setStatus(novo);
    // Se o sistema não deixa mais perguntar, o único caminho é a tela de ajustes.
    if (novo === 'bloqueada') await Linking.openSettings();
  }, []);

  return { status, solicitar, abrirConfiguracoes: () => Linking.openSettings() };
}
