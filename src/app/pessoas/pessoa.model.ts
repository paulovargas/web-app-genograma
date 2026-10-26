export type SimboloPessoa = 'neutro' | 'quadrado' | 'circulo' | 'losango';
export const SIMBOLOS_PESSOA: readonly SimboloPessoa[] = ['neutro', 'quadrado', 'circulo', 'losango'];
export const ROTULOS_SIMBOLOS: Readonly<Record<SimboloPessoa, string>> = { neutro: 'Neutro', quadrado: 'Quadrado', circulo: 'Círculo', losango: 'Losango' };

export interface Pessoa {
  readonly id: string;
  readonly nome: string;
  readonly nascimento: string;
  readonly falecida: boolean;
  readonly simbolo?: SimboloPessoa;
}
