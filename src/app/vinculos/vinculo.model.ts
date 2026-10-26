export type TipoVinculo = 'uniao' | 'filiacao';

export interface Vinculo {
  readonly id: string;
  readonly tipo: TipoVinculo;
  readonly origemId: string;
  readonly destinoId: string;
}
