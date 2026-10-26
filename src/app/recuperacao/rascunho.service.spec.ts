import { rascunhoExemplo } from './rascunho.fixture';
import { TestBed } from '@angular/core/testing';
import { RascunhoService, RASCUNHO_CHAVE, RASCUNHO_STORAGE } from './rascunho.service';
import { validarRascunho } from './rascunho-local.model';

describe('RascunhoService', () => {
  let storage: jasmine.SpyObj<Storage>;
  let service: RascunhoService;
  beforeEach(() => {
    storage = jasmine.createSpyObj('storage', ['getItem', 'setItem', 'removeItem']);
    storage.getItem.and.returnValue(null);
    TestBed.configureTestingModule({ providers: [{ provide: RASCUNHO_STORAGE, useValue: storage }] });
    service = TestBed.inject(RascunhoService);
  });

  it('deve gravar o conteúdo pendente e recuperar o estado validado', () => {
    service.guardar(rascunhoExemplo(), true);
    const gravado = storage.setItem.calls.mostRecent().args;
    expect(gravado[0]).toBe(RASCUNHO_CHAVE);
    storage.getItem.and.returnValue(gravado[1]);
    expect(service.ler()?.pessoa?.dados.nome).toBe('Ana em edição');
    expect(service.ler()?.vinculo.dados.modalidade).toBe('adocao');
    expect(service.protegido()).toBeTrue();
  });

  it('deve remover a cópia quando não há alterações pendentes', () => {
    service.guardar(rascunhoExemplo(), true);
    service.guardar(rascunhoExemplo(), false);
    expect(storage.removeItem).toHaveBeenCalledWith(RASCUNHO_CHAVE);
    expect(service.protegido()).toBeFalse();
  });

  it('deve preservar cópia inválida sem restaurar ou sobrescrever e permitir descarte explícito', () => {
    storage.getItem.and.returnValue('{corrompido');
    expect(service.ler()).toBeNull();
    service.guardar(rascunhoExemplo(), true);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
    expect(service.invalido()).toBeTrue();
    service.descartarInvalido();
    service.guardar(rascunhoExemplo(), true);
    expect(storage.setItem).toHaveBeenCalled();
    expect(service.invalido()).toBeFalse();
  });

  it('deve preservar a cópia quando a leitura for bloqueada', () => {
    storage.getItem.and.throwError('bloqueado');
    expect(service.ler()).toBeNull();
    expect(service.erro()).toContain('ler');
    service.guardar(rascunhoExemplo(), true);
    service.guardar(rascunhoExemplo(), false);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it('deve informar falta de espaço sem anunciar proteção bem-sucedida', () => {
    storage.setItem.and.throwError('quota');
    service.guardar(rascunhoExemplo(), true);
    expect(service.protegido()).toBeFalse();
    expect(service.erro()).toContain('API');
  });

  it('deve rejeitar versões desconhecidas e formulários incoerentes e aceitar título vazio', () => {
    expect(() => validarRascunho({ ...rascunhoExemplo(), versao: 9 })).toThrow();
    expect(() => validarRascunho({ ...rascunhoExemplo(), pessoa: { ...rascunhoExemplo().pessoa, editandoId: 'removida' } })).toThrow();
    expect(validarRascunho({ ...rascunhoExemplo(), titulo: '' }).titulo).toBe('');
  });
});
