export type TipoVinculo = 'uniao' | 'filiacao';
export type SituacaoConjugal = 'juntos' | 'separados' | 'divorciados';
export const SITUACOES_CONJUGAIS: readonly SituacaoConjugal[] = ['juntos', 'separados', 'divorciados'];
export const ROTULOS_CONJUGAIS: Readonly<Record<SituacaoConjugal, string>> = {
  juntos: 'União', separados: 'Separação', divorciados: 'Divórcio'
};

export interface Vinculo {
  readonly id: string;
  readonly tipo: TipoVinculo;
  readonly origemId: string;
  readonly destinoId: string;
  readonly situacao?: SituacaoConjugal;
}
