import { RascunhoLocal } from './rascunho-local.model';

export function rascunhoExemplo(): RascunhoLocal {
  return {
    versao: 1, atualizadoEm: '2026-10-26T12:00:00.000Z', titulo: 'Em edição', idRemoto: '7',
    ultimaVersaoSalva: JSON.stringify({ titulo: 'Salvo', pessoas: [], vinculos: [] }),
    pessoas: [{ id: 'a', nome: 'Ana', nascimento: '', falecida: false }, { id: 'b', nome: 'Bruno', nascimento: '', falecida: false }],
    vinculos: [{ id: 'e', tipo: 'emocional', origemId: 'a', destinoId: 'b', relacao: 'proximidade' }],
    pessoa: { editandoId: 'a', sujo: true, dados: { nome: 'Ana em edição', nascimento: '', simbolo: 'losango', falecida: false } },
    vinculo: { sujo: true, dados: { tipo: 'filiacao', origemId: 'a', destinoId: 'b', modalidade: 'adocao', relacao: 'proximidade', situacao: 'juntos' } }
  };
}
