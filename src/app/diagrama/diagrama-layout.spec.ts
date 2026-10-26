import { Pessoa } from '../pessoas/pessoa.model';
import { Vinculo } from '../vinculos/vinculo.model';
import { construirDiagrama } from './diagrama-layout';

const pessoas: Pessoa[] = ['a', 'b', 'c', 'd'].map(id => ({ id, nome: id, nascimento: '', falecida: false }));
const filiacao = (origemId: string, destinoId: string): Vinculo => ({ id: origemId + destinoId, tipo: 'filiacao', origemId, destinoId });

describe('construirDiagrama', () => {
  it('deve posicionar descendentes abaixo de todos os responsáveis em várias gerações', () => {
    const diagrama = construirDiagrama(pessoas, [filiacao('a', 'b'), filiacao('b', 'c'), filiacao('a', 'c'), filiacao('d', 'c')]);
    const y = (id: string) => diagrama.pessoas.find(no => no.pessoa.id === id)!.y;
    expect(y('b')).toBeGreaterThan(y('a'));
    expect(y('c')).toBeGreaterThan(y('b'));
    expect(y('c')).toBeGreaterThan(y('d'));
    expect(diagrama.conexoes.length).toBe(4);
  });

  it('deve manter pessoas desconectadas e uniões na mesma linha sem sobrepor cartões', () => {
    const diagrama = construirDiagrama(pessoas, [{ id: 'u', tipo: 'uniao', origemId: 'a', destinoId: 'b' }]);
    const ordenados = [...diagrama.pessoas].sort((a, b) => a.x - b.x);
    expect(new Set(ordenados.map(no => no.y)).size).toBe(1);
    for (let indice = 1; indice < ordenados.length; indice++) {
      expect(ordenados[indice].x - ordenados[indice - 1].x).toBeGreaterThan(160);
    }
    expect(diagrama.conexoes[0].descricao).toContain('União: a e b');
  });

  it('deve preservar o nome completo e limitar o texto visível ao cartão', () => {
    const nome = 'Uma pessoa fictícia com um nome bastante longo para verificar o cartão';
    const diagrama = construirDiagrama([{ ...pessoas[0], nome }], []);
    expect(diagrama.pessoas[0].pessoa.nome).toBe(nome);
    expect(diagrama.pessoas[0].linhasNome.length).toBe(2);
    expect(diagrama.pessoas[0].linhasNome[1].endsWith('…')).toBeTrue();
  });

  it('deve ignorar vínculos sem pessoas existentes e produzir dimensões válidas no estado vazio', () => {
    const diagrama = construirDiagrama([], [filiacao('a', 'b')]);
    expect(diagrama.pessoas).toEqual([]);
    expect(diagrama.conexoes).toEqual([]);
    expect(diagrama.largura).toBeGreaterThan(0);
    expect(diagrama.altura).toBeGreaterThan(0);
  });
  it('deve manter os níveis de gerações ao acrescentar vínculos emocionais', () => {
    const estrutura = [filiacao('a', 'b')];
    const semEmocional = construirDiagrama(pessoas, estrutura);
    const comEmocional = construirDiagrama(pessoas, [...estrutura, { id: 'e', tipo: 'emocional', origemId: 'b', destinoId: 'a', relacao: 'proximidade' }]);
    expect(comEmocional.pessoas).toEqual(semEmocional.pessoas);
    expect(comEmocional.conexoes[1].descricao).toContain('Proximidade: b e a');
  });
});
