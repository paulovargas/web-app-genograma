import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GenogramaService } from '../genograma/genograma.service';
import { PersistenciaComponent } from './persistencia.component';
import { DownloadJsonService } from './download-json.service';
import { criarBackupJson, lerBackupJson, LIMITE_BACKUP_JSON } from './backup-json';
import { GENOGRAMAS_URL } from './genograma-api.service';

const dadosImportados = { titulo: 'Backup fictício', pessoas: [{ id: 'a', nome: 'Ana', nascimento: '', falecida: false }], vinculos: [] };

describe('Importação e exportação no editor', () => {
  let http: HttpTestingController;
  let download: jasmine.SpyObj<DownloadJsonService>;
  beforeEach(async () => {
    download = jasmine.createSpyObj('download', ['baixar']);
    await TestBed.configureTestingModule({ imports: [PersistenciaComponent], providers: [provideHttpClient(), provideHttpClientTesting(),
      { provide: DownloadJsonService, useValue: download }] }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  function criar() {
    const fixture = TestBed.createComponent(PersistenciaComponent);
    fixture.detectChanges();
    http.expectOne(GENOGRAMAS_URL).flush([]);
    return fixture;
  }
  function arquivo(): File { return new File([criarBackupJson(dadosImportados)], 'backup.json', { type: 'application/json' }); }

  it('deve exportar o estado atual sem marcar como salvo na API', () => {
    const component = criar().componentInstance;
    TestBed.inject(GenogramaService).salvarPessoa(dadosImportados.pessoas[0]);
    component.titulo.setValue(dadosImportados.titulo);
    component.exportarJson();
    const [texto, nome] = download.baixar.calls.mostRecent().args;
    expect(lerBackupJson(texto)).toEqual(dadosImportados);
    expect(nome).toBe('genograma-backup-ficticio.json');
    expect(component.alterado()).toBeTrue();
    http.expectNone(request => request.method === 'POST' || request.method === 'PUT');
  });

  it('deve bloquear exportação de formulário pendente e de título vazio', () => {
    const fixture = criar();
    fixture.componentRef.setInput('rascunhoPendente', true);
    fixture.detectChanges();
    fixture.componentInstance.exportarJson();
    expect(fixture.componentInstance.erro()).toContain('Conclua ou cancele');
    fixture.componentRef.setInput('rascunhoPendente', false);
    fixture.detectChanges();
    fixture.componentInstance.titulo.setValue(' ');
    fixture.componentInstance.exportarJson();
    expect(download.baixar).not.toHaveBeenCalled();
  });

  it('deve mostrar prévia, preservar o editor ao cancelar e importar como cópia sem identidade remota', async () => {
    const component = criar().componentInstance;
    const service = TestBed.inject(GenogramaService);
    service.salvarPessoa({ ...dadosImportados.pessoas[0], id: 'local', nome: 'Atual' });
    component.idAtual.set('remoto');
    await component.importarArquivo(arquivo());
    expect(component.confirmacao()).toBe('importar');
    expect(component.importacao()?.dados.titulo).toBe('Backup fictício');
    expect(service.pessoas()[0].nome).toBe('Atual');
    component.cancelarConfirmacao();
    expect(component.idAtual()).toBe('remoto');
    expect(service.pessoas()[0].nome).toBe('Atual');
    await component.importarArquivo(arquivo());
    component.confirmar();
    expect(component.idAtual()).toBeNull();
    expect(component.alterado()).toBeTrue();
    expect(service.pessoas()).toEqual(dadosImportados.pessoas);
    expect(component.titulo.value).toBe('Backup fictício');
    http.expectNone(request => request.method === 'POST' || request.method === 'PUT');
    component.salvar();
    const post = http.expectOne({ method: 'POST', url: GENOGRAMAS_URL });
    post.flush({ ...dadosImportados, id: 'nova-copia' });
    http.expectOne(GENOGRAMAS_URL).flush([]);
  });

  it('deve preservar título, pessoas e identidade remota após arquivo inválido ou erro de leitura', async () => {
    const component = criar().componentInstance;
    component.titulo.setValue('Atual');
    component.idAtual.set('7');
    await component.importarArquivo(new File(['{inválido'], 'erro.json'));
    expect(component.erro()).toContain('JSON válido');
    expect(component.confirmacao()).toBeNull();
    const file = arquivo();
    spyOn(file, 'text').and.returnValue(Promise.reject(new Error('Erro de leitura')));
    await component.importarArquivo(file);
    expect(component.ocupado()).toBeFalse();
    expect(component.titulo.value).toBe('Atual');
    expect(component.idAtual()).toBe('7');
  });

  it('deve rejeitar arquivo acima do limite sem ler seu conteúdo', async () => {
    const component = criar().componentInstance;
    const file = arquivo();
    Object.defineProperty(file, 'size', { value: LIMITE_BACKUP_JSON + 1 });
    const ler = spyOn(file, 'text');
    await component.importarArquivo(file);
    expect(component.erro()).toContain('5 MiB');
    expect(ler).not.toHaveBeenCalled();
    expect(component.ocupado()).toBeFalse();
  });

  it('deve impedir ações concorrentes enquanto lê o arquivo e limpar a seleção após leitura', async () => {
    const fixture = criar();
    const component = fixture.componentInstance;
    const file = arquivo();
    let resolver!: (texto: string) => void;
    spyOn(file, 'text').and.returnValue(new Promise(resolve => { resolver = resolve; }));
    const campo = fixture.nativeElement.querySelector('input[type=file]') as HTMLInputElement;
    Object.defineProperty(campo, 'files', { value: [file] });
    const pendente = component.selecionarArquivo({ target: campo } as unknown as Event);
    expect(component.ocupado()).toBeTrue();
    component.solicitar('novo');
    component.salvar();
    component.exportarJson();
    expect(component.confirmacao()).toBeNull();
    expect(download.baixar).not.toHaveBeenCalled();
    resolver(criarBackupJson(dadosImportados));
    await pendente;
    expect(campo.value).toBe('');
    expect(component.confirmacao()).toBe('importar');
  });
});
