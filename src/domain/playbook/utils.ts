import { Playbook } from './types';

export function resolvePlaybookSymbol(playbook: Pick<Playbook, 'symbol' | 'market' | 'context'> | null | undefined): string {
  const rawSymbol =
    (typeof playbook?.symbol === 'string' && playbook.symbol) ||
    (typeof playbook?.market === 'string' && playbook.market) ||
    (typeof playbook?.context?.symbol === 'string' && playbook.context.symbol) ||
    '';

  return rawSymbol.trim().toUpperCase().replace('-', '/');
}
