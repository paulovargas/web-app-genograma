export type TipoVinculo = 'uniao' | 'filiacao';
export type SituacaoConjugal = 'juntos' | 'separados' | 'divorciados';
export type ModalidadeFiliacao = 'nao_informada' | 'adocao' | 'acolhimento';
export const MODALIDADES_FILIACAO: readonly ModalidadeFiliacao[] = ['nao_informada', 'adocao', 'acolhimento'];
export const ROTULOS_FILIACAO: Readonly<Record<ModalidadeFiliacao, string>> = {
  nao_informada: 'Filiação', adocao: 'Adoção', acolhimento: 'Acolhimento'
};
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
  readonly modalidade?: ModalidadeFiliacao;
}
