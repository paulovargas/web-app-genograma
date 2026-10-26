import { validarGenograma } from './validar-genograma';

describe('validarGenograma', () => {
  const pessoas = ['a', 'b', 'c'].map(id => ({ id, nome: id, nascimento: '', falecida: false }));
  const base = { id: '1', titulo: 'Teste', pessoas, vinculos: [] };

  it('deve rejeitar pessoas inválidas e identificadores duplicados', () => {
    expect(() => validarGenograma({ ...base, pessoas: [{ ...pessoas[0], nome: ' ' }] })).toThrow();
    expect(() => validarGenograma({ ...base, pessoas: [pessoas[0], pessoas[0]] })).toThrow();
    expect(() => validarGenograma({ ...base, pessoas: null })).toThrow();
  });

  it('deve rejeitar vínculos órfãos, duplicados e ciclos recebidos da API', () => {
    const ab = { id: 'ab', tipo: 'filiacao', origemId: 'a', destinoId: 'b' };
    const bc = { id: 'bc', tipo: 'filiacao', origemId: 'b', destinoId: 'c' };
    const ca = { id: 'ca', tipo: 'filiacao', origemId: 'c', destinoId: 'a' };
    expect(() => validarGenograma({ ...base, vinculos: [ab, bc, ca] })).toThrow();
    expect(() => validarGenograma({ ...base, vinculos: [ab, { ...ab, id: 'outro' }] })).toThrow();
    expect(() => validarGenograma({ ...base, vinculos: [{ ...ab, destinoId: 'inexistente' }] })).toThrow();
  });

  it('deve preservar identificadores dos vínculos ao carregar dados válidos', () => {
    const vinculos = [{ id: 'original', tipo: 'filiacao' as const, origemId: 'a', destinoId: 'b' }];
    expect(validarGenograma({ ...base, vinculos }).vinculos).toEqual(vinculos);
  });
});
