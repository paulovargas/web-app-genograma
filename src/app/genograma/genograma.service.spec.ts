import { GenogramaService } from './genograma.service';

describe('GenogramaService', () => {
  let service: GenogramaService;

  beforeEach(() => {
    service = new GenogramaService();
    for (const id of ['a', 'b', 'c', 'd']) {
      service.salvarPessoa({ id, nome: id.toUpperCase(), nascimento: '', falecida: false });
    }
  });

  it('deve rejeitar referências inexistentes e vínculos consigo mesmo sem alterar os dados', () => {
    expect(service.adicionarVinculo('uniao', 'a', 'inexistente')).not.toBeNull();
    expect(service.adicionarVinculo('filiacao', '', 'b')).not.toBeNull();
    expect(service.adicionarVinculo('uniao', 'a', 'a')).not.toBeNull();
    expect(service.vinculos()).toEqual([]);
  });

  it('deve impedir união duplicada mesmo com a ordem invertida', () => {
    expect(service.adicionarVinculo('uniao', 'a', 'b')).toBeNull();
    expect(service.adicionarVinculo('uniao', 'a', 'b')).toContain('já foi cadastrado');
    expect(service.adicionarVinculo('uniao', 'b', 'a')).toContain('já foi cadastrado');
    expect(service.vinculos().length).toBe(1);
  });

  it('deve rejeitar filiação duplicada e ciclos diretos e indiretos', () => {
    expect(service.adicionarVinculo('filiacao', 'a', 'b')).toBeNull();
    expect(service.adicionarVinculo('filiacao', 'a', 'b')).toContain('já foi cadastrado');
    expect(service.adicionarVinculo('filiacao', 'b', 'a')).toContain('ciclo');
    expect(service.adicionarVinculo('filiacao', 'b', 'c')).toBeNull();
    expect(service.adicionarVinculo('filiacao', 'c', 'a')).toContain('ciclo');
    expect(service.vinculos().length).toBe(2);
  });

  it('deve aceitar múltiplos responsáveis e ignorar uniões na busca de ancestralidade', () => {
    expect(service.adicionarVinculo('uniao', 'a', 'b')).toBeNull();
    expect(service.adicionarVinculo('filiacao', 'a', 'c')).toBeNull();
    expect(service.adicionarVinculo('filiacao', 'b', 'c')).toBeNull();
    expect(service.adicionarVinculo('filiacao', 'd', 'a')).toBeNull();
    expect(service.vinculos().length).toBe(4);
  });

  it('deve remover vínculos da pessoa excluída e preservar os demais', () => {
    service.adicionarVinculo('uniao', 'a', 'b');
    service.adicionarVinculo('filiacao', 'a', 'c');
    service.adicionarVinculo('filiacao', 'b', 'd');
    expect(service.vinculosDaPessoa('a').length).toBe(2);
    service.removerPessoa('a');
    expect(service.pessoas().map(pessoa => pessoa.id)).toEqual(['b', 'c', 'd']);
    expect(service.vinculos().length).toBe(1);
    expect(service.vinculos()[0].destinoId).toBe('d');
  });

  it('deve remover apenas o vínculo escolhido sem excluir pessoas', () => {
    service.adicionarVinculo('uniao', 'a', 'b');
    service.adicionarVinculo('filiacao', 'a', 'c');
    service.removerVinculo(service.vinculos()[0].id);
    expect(service.vinculos().length).toBe(1);
    expect(service.vinculos()[0].tipo).toBe('filiacao');
    expect(service.pessoas().length).toBe(4);
  });
});
