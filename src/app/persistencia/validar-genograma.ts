import { DadosGenograma, GenogramaSalvo } from './genograma.model';
import { GenogramaService } from '../genograma/genograma.service';
import { SIMBOLOS_PESSOA, SimboloPessoa } from '../pessoas/pessoa.model';
import { SITUACOES_CONJUGAIS, SituacaoConjugal } from '../vinculos/vinculo.model';

function registro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

export function validarGenograma(valor: unknown): GenogramaSalvo {
  if (!registro(valor) || typeof valor['id'] !== 'string' || !valor['id'].trim()
    || typeof valor['titulo'] !== 'string' || !valor['titulo'].trim()
    || !Array.isArray(valor['pessoas']) || !Array.isArray(valor['vinculos'])) {
    throw new Error('O genograma recebido possui formato inválido.');
  }

  // Valida em um estado isolado para não substituir o editor com dados incompletos.
  const temporario = new GenogramaService();
  const idsPessoas = new Set<string>();
  for (const pessoa of valor['pessoas']) {
    if (!registro(pessoa) || typeof pessoa['id'] !== 'string' || !pessoa['id'].trim()
      || idsPessoas.has(pessoa['id']) || typeof pessoa['nome'] !== 'string' || !pessoa['nome'].trim()
      || typeof pessoa['nascimento'] !== 'string' || typeof pessoa['falecida'] !== 'boolean'
      || (pessoa['simbolo'] !== undefined && !SIMBOLOS_PESSOA.includes(pessoa['simbolo'] as SimboloPessoa))) {
      throw new Error('O genograma contém uma pessoa inválida.');
    }
    idsPessoas.add(pessoa['id']);
    temporario.salvarPessoa({ id: pessoa['id'], nome: pessoa['nome'], nascimento: pessoa['nascimento'], falecida: pessoa['falecida'],
      ...(pessoa['simbolo'] !== undefined ? { simbolo: pessoa['simbolo'] as SimboloPessoa } : {}) });
  }
  const idsVinculos = new Set<string>();
  for (const vinculo of valor['vinculos']) {
    if (!registro(vinculo) || typeof vinculo['id'] !== 'string' || !vinculo['id'].trim()
      || idsVinculos.has(vinculo['id']) || (vinculo['tipo'] !== 'uniao' && vinculo['tipo'] !== 'filiacao')
      || typeof vinculo['origemId'] !== 'string' || typeof vinculo['destinoId'] !== 'string'
      || (vinculo['situacao'] !== undefined && (vinculo['tipo'] !== 'uniao' || !SITUACOES_CONJUGAIS.includes(vinculo['situacao'] as SituacaoConjugal)))
      || temporario.adicionarVinculo(vinculo['tipo'], vinculo['origemId'], vinculo['destinoId'], vinculo['situacao'] as SituacaoConjugal | undefined)) {
      throw new Error('O genograma contém vínculos inválidos, duplicados ou ciclos de ancestralidade.');
    }
    idsVinculos.add(vinculo['id']);
  }

  return {
    id: valor['id'], titulo: valor['titulo'], pessoas: temporario.pessoas(),
    vinculos: valor['vinculos'].map(vinculo => ({ id: vinculo.id, tipo: vinculo.tipo, origemId: vinculo.origemId, destinoId: vinculo.destinoId,
      ...(vinculo.situacao !== undefined ? { situacao: vinculo.situacao } : {}) }))
  };
}

export function copiarDados(dados: DadosGenograma): DadosGenograma {
  return { titulo: dados.titulo, pessoas: dados.pessoas.map(pessoa => ({ ...pessoa })), vinculos: dados.vinculos.map(vinculo => ({ ...vinculo })) };
}
