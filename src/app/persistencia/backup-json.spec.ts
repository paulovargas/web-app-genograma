import { criarBackupJson, lerBackupJson, nomeBackupJson } from './backup-json';
import { DadosGenograma } from './genograma.model';

const dados: DadosGenograma = {
  titulo: 'Família fictícia', pessoas: [
    { id: 'a', nome: 'Ana', nascimento: '', falecida: false, simbolo: 'circulo' },
    { id: 'b', nome: 'Bruno', nascimento: '', falecida: false, simbolo: 'quadrado' }
  ], vinculos: [
    { id: 'u', tipo: 'uniao', origemId: 'a', destinoId: 'b', situacao: 'divorciados' },
    { id: 'f', tipo: 'filiacao', origemId: 'a', destinoId: 'b', modalidade: 'adocao' },
    { id: 'e', tipo: 'emocional', origemId: 'a', destinoId: 'b', relacao: 'proximidade' }
  ]
};

describe('Backup JSON', () => {
  it('deve preservar símbolos e todos os tipos de vínculos ao exportar e importar', () => {
    const texto = criarBackupJson(dados);
    expect(lerBackupJson(texto)).toEqual(dados);
    expect(lerBackupJson('\uFEFF' + texto)).toEqual(dados);
    expect(JSON.parse(texto).versao).toBe(1);
  });

  it('deve remover o identificador remoto e dados desconhecidos sem mudar os identificadores internos', () => {
    const backup = JSON.parse(criarBackupJson(dados));
    backup.genograma.id = 'registro-remoto';
    backup.genograma.segredo = 'não deve ser copiado';
    expect(lerBackupJson(JSON.stringify(backup))).toEqual(dados);
    expect(JSON.parse(criarBackupJson(dados)).genograma.id).toBeUndefined();
  });

  it('deve rejeitar JSON inválido, versão desconhecida, vínculos órfãos e ciclos', () => {
    expect(() => lerBackupJson('{inválido')).toThrow();
    expect(() => lerBackupJson(JSON.stringify({ ...JSON.parse(criarBackupJson(dados)), versao: 2 }))).toThrow();
    const backup = JSON.parse(criarBackupJson(dados));
    backup.genograma.vinculos[0].origemId = 'inexistente';
    expect(() => lerBackupJson(JSON.stringify(backup))).toThrow();
    backup.genograma.vinculos = [
      { id: '1', tipo: 'filiacao', origemId: 'a', destinoId: 'b' },
      { id: '2', tipo: 'filiacao', origemId: 'b', destinoId: 'a' }
    ];
    expect(() => lerBackupJson(JSON.stringify(backup))).toThrow();
  });

  it('deve gerar nome de arquivo portátil sem caminhos e com extensão JSON', () => {
    expect(nomeBackupJson('Família / Exemplo')).toBe('genograma-familia-exemplo.json');
    expect(nomeBackupJson('...')).toBe('genograma-sem-titulo.json');
  });
});
