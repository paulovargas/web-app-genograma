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
  it('deve alterar a situação da união preservando o vínculo e bloquear duplicata invertida', () => {
    expect(service.adicionarVinculo('uniao', 'a', 'b', 'separados')).toBeNull();
    const id = service.vinculos()[0].id;
    expect(service.adicionarVinculo('uniao', 'b', 'a', 'divorciados')).toContain('já foi cadastrado');
    expect(service.alterarSituacaoUniao(id, 'divorciados')).toBeNull();
    expect(service.vinculos()[0].id).toBe(id);
    expect(service.vinculos()[0].situacao).toBe('divorciados');
    expect(service.alterarSituacaoUniao(id, 'juntos')).toBeNull();
    expect(service.vinculos()[0].situacao).toBe('juntos');
  });

  it('deve rejeitar situação conjugal em filiação e atualização de vínculo inexistente', () => {
    expect(service.adicionarVinculo('filiacao', 'a', 'b', 'separados')).not.toBeNull();
    expect(service.alterarSituacaoUniao('inexistente', 'divorciados')).not.toBeNull();
    expect(service.vinculos()).toEqual([]);
  });
  it('deve validar ciclos misturando filiação, adoção e acolhimento e impedir duplicatas', () => {
    expect(service.adicionarVinculo('filiacao', 'a', 'b', undefined, 'adocao')).toBeNull();
    expect(service.adicionarVinculo('filiacao', 'b', 'c', undefined, 'acolhimento')).toBeNull();
    expect(service.adicionarVinculo('filiacao', 'c', 'a')).toContain('ciclo');
    expect(service.adicionarVinculo('filiacao', 'a', 'b', undefined, 'acolhimento')).toContain('já foi cadastrado');
    expect(service.vinculos().length).toBe(2);
  });

  it('deve alterar a modalidade preservando identificador e pessoas e rejeitar modalidade em união', () => {
    service.adicionarVinculo('filiacao', 'a', 'b');
    const id = service.vinculos()[0].id;
    expect(service.alterarModalidadeFiliacao(id, 'adocao')).toBeNull();
    expect(service.vinculos()[0].id).toBe(id);
    expect(service.vinculos()[0].modalidade).toBe('adocao');
    expect(service.alterarModalidadeFiliacao(id, 'acolhimento')).toBeNull();
    expect(service.vinculos()[0].origemId).toBe('a');
    expect(service.vinculos()[0].destinoId).toBe('b');
    expect(service.adicionarVinculo('uniao', 'c', 'd', undefined, 'adocao')).not.toBeNull();
    expect(service.alterarModalidadeFiliacao('inexistente', 'adocao')).not.toBeNull();
  });
  it('deve permitir vínculo emocional junto de união e filiação sem afetar ciclos direcionados', () => {
    service.adicionarVinculo('uniao', 'a', 'b');
    service.adicionarVinculo('filiacao', 'a', 'b');
    expect(service.adicionarVinculo('emocional', 'b', 'a', undefined, undefined, 'conflito')).toBeNull();
    expect(service.adicionarVinculo('emocional', 'b', 'c', undefined, undefined, 'proximidade')).toBeNull();
    expect(service.adicionarVinculo('emocional', 'c', 'a', undefined, undefined, 'afastamento')).toBeNull();
    expect(service.adicionarVinculo('filiacao', 'b', 'a')).toContain('ciclo');
    expect(service.adicionarVinculo('emocional', 'a', 'b', undefined, undefined, 'proximidade')).toContain('já foi cadastrado');
  });

  it('deve exigir relação emocional válida e preservá-la ao editar o vínculo', () => {
    expect(service.adicionarVinculo('emocional', 'a', 'b')).not.toBeNull();
    expect(service.adicionarVinculo('uniao', 'a', 'b', undefined, undefined, 'conflito')).not.toBeNull();
    expect(service.adicionarVinculo('emocional', 'a', 'a', undefined, undefined, 'conflito')).not.toBeNull();
    expect(service.adicionarVinculo('emocional', 'a', 'b', undefined, undefined, 'proximidade')).toBeNull();
    const id = service.vinculos()[0].id;
    expect(service.alterarRelacaoEmocional(id, 'afastamento')).toBeNull();
    expect(service.vinculos()[0].id).toBe(id);
    expect(service.vinculos()[0].relacao).toBe('afastamento');
    expect(service.alterarRelacaoEmocional('inexistente', 'conflito')).not.toBeNull();
    service.removerPessoa('a');
    expect(service.vinculos()).toEqual([]);
  });
});
