import { GenogramaSalvo } from './genograma.model';
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
  it('deve abrir registros antigos sem símbolo nem situação e preservar os novos campos', () => {
    expect(validarGenograma(base)).toEqual(base);
    const atualizado: GenogramaSalvo = { ...base,
      pessoas: pessoas.map((pessoa, indice) => ({ ...pessoa, simbolo: indice === 0 ? 'quadrado' : 'circulo' })),
      vinculos: [{ id: 'u', tipo: 'uniao', origemId: 'a', destinoId: 'b', situacao: 'divorciados' }]
    };
    expect(validarGenograma(atualizado)).toEqual(atualizado);
  });

  it('deve rejeitar símbolos e situações desconhecidas sem aceitar situação em filiação', () => {
    expect(() => validarGenograma({ ...base, pessoas: [{ ...pessoas[0], simbolo: 'invalido' }] })).toThrow();
    expect(() => validarGenograma({ ...base, vinculos: [{ id: 'u', tipo: 'uniao', origemId: 'a', destinoId: 'b', situacao: 'invalida' }] })).toThrow();
    expect(() => validarGenograma({ ...base, vinculos: [{ id: 'f', tipo: 'filiacao', origemId: 'a', destinoId: 'b', situacao: 'separados' }] })).toThrow();
  });
  it('deve preservar adoção e acolhimento e continuar aceitando vínculos antigos sem modalidade', () => {
    const antigo = { ...base, vinculos: [{ id: 'f', tipo: 'filiacao' as const, origemId: 'a', destinoId: 'b' }] };
    expect(validarGenograma(antigo)).toEqual(antigo);
    for (const modalidade of ['adocao', 'acolhimento'] as const) {
      const atualizado = { ...antigo, vinculos: [{ ...antigo.vinculos[0], modalidade }] };
      expect(validarGenograma(atualizado)).toEqual(atualizado);
    }
  });

  it('deve rejeitar modalidade desconhecida ou aplicada em união', () => {
    expect(() => validarGenograma({ ...base, vinculos: [{ id: 'f', tipo: 'filiacao', origemId: 'a', destinoId: 'b', modalidade: 'invalida' }] })).toThrow();
    expect(() => validarGenograma({ ...base, vinculos: [{ id: 'u', tipo: 'uniao', origemId: 'a', destinoId: 'b', modalidade: 'acolhimento' }] })).toThrow();
  });
});
