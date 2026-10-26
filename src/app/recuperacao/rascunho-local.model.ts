import { Pessoa, SimboloPessoa, SIMBOLOS_PESSOA } from '../pessoas/pessoa.model';
import { Vinculo, TipoVinculo, SituacaoConjugal, ModalidadeFiliacao, RelacaoEmocional, SITUACOES_CONJUGAIS, MODALIDADES_FILIACAO, RELACOES_EMOCIONAIS } from '../vinculos/vinculo.model';
import { validarGenograma } from '../persistencia/validar-genograma';

export interface FormularioPessoaLocal {
  readonly editandoId: string | null;
  readonly sujo: boolean;
  readonly dados: { nome: string; nascimento: string; simbolo: SimboloPessoa; falecida: boolean };
}
export interface FormularioVinculoLocal {
  readonly sujo: boolean;
  readonly dados: { tipo: TipoVinculo; situacao: SituacaoConjugal; modalidade: ModalidadeFiliacao; relacao: RelacaoEmocional; origemId: string; destinoId: string };
}
export interface RascunhoLocal {
  readonly versao: 1;
  readonly atualizadoEm: string;
  readonly titulo: string;
  readonly idRemoto: string | null;
  readonly ultimaVersaoSalva: string;
  readonly pessoas: readonly Pessoa[];
  readonly vinculos: readonly Vinculo[];
  readonly pessoa: FormularioPessoaLocal | null;
  readonly vinculo: FormularioVinculoLocal;
}

function objeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

export function validarRascunho(valor: unknown): RascunhoLocal {
  if (!objeto(valor) || valor['versao'] !== 1 || typeof valor['titulo'] !== 'string'
    || typeof valor['atualizadoEm'] !== 'string' || !Number.isFinite(Date.parse(valor['atualizadoEm']))
    || (valor['idRemoto'] !== null && (typeof valor['idRemoto'] !== 'string' || !valor['idRemoto'].trim()))
    || typeof valor['ultimaVersaoSalva'] !== 'string') throw new Error('Rascunho local inválido.');

  // O título pode estar vazio enquanto o usuário ainda está preenchendo o editor.
  const dados = validarGenograma({ ...valor, id: 'local', titulo: valor['titulo'].trim() || 'Rascunho' });
  const pessoa = valor['pessoa'];
  if (pessoa !== null) {
    if (!objeto(pessoa) || typeof pessoa['sujo'] !== 'boolean' || !objeto(pessoa['dados'])
      || (pessoa['editandoId'] !== null && !dados.pessoas.some(atual => atual.id === pessoa['editandoId']))) throw new Error('Formulário de pessoa inválido.');
    const formulario = pessoa['dados'];
    if (typeof formulario['nome'] !== 'string' || typeof formulario['nascimento'] !== 'string'
      || typeof formulario['falecida'] !== 'boolean' || !SIMBOLOS_PESSOA.includes(formulario['simbolo'] as SimboloPessoa)) throw new Error('Formulário de pessoa inválido.');
  }
  const vinculo = valor['vinculo'];
  if (!objeto(vinculo) || typeof vinculo['sujo'] !== 'boolean' || !objeto(vinculo['dados'])) throw new Error('Formulário de vínculo inválido.');
  const formulario = vinculo['dados'];
  if (!['uniao', 'filiacao', 'emocional'].includes(formulario['tipo'] as string)
    || !SITUACOES_CONJUGAIS.includes(formulario['situacao'] as SituacaoConjugal)
    || !MODALIDADES_FILIACAO.includes(formulario['modalidade'] as ModalidadeFiliacao)
    || !RELACOES_EMOCIONAIS.includes(formulario['relacao'] as RelacaoEmocional)
    || typeof formulario['origemId'] !== 'string' || typeof formulario['destinoId'] !== 'string') throw new Error('Formulário de vínculo inválido.');

  return { versao: 1, atualizadoEm: valor['atualizadoEm'], titulo: valor['titulo'], idRemoto: valor['idRemoto'] as string | null,
    ultimaVersaoSalva: valor['ultimaVersaoSalva'], pessoas: dados.pessoas, vinculos: dados.vinculos,
    pessoa: pessoa as unknown as FormularioPessoaLocal | null, vinculo: vinculo as unknown as FormularioVinculoLocal };
}
