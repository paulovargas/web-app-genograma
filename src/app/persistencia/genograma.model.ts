import { Pessoa } from '../pessoas/pessoa.model';
import { Vinculo } from '../vinculos/vinculo.model';

export interface DadosGenograma {
  readonly titulo: string;
  readonly pessoas: readonly Pessoa[];
  readonly vinculos: readonly Vinculo[];
}

export interface GenogramaSalvo extends DadosGenograma {
  readonly id: string;
}
