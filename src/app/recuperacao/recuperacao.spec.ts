import { criarBackupJson } from '../persistencia/backup-json';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { AppComponent } from '../app.component';
import { GenogramaService } from '../genograma/genograma.service';
import { PersistenciaComponent } from '../persistencia/persistencia.component';
import { PessoasComponent } from '../pessoas/pessoas.component';
import { VinculosComponent } from '../vinculos/vinculos.component';
import { GENOGRAMAS_URL } from '../persistencia/genograma-api.service';
import { RASCUNHO_CHAVE, RASCUNHO_STORAGE } from './rascunho.service';
import { rascunhoExemplo } from './rascunho.fixture';

describe('Recuperação do editor', () => {
  let dados: Map<string, string>;
  let http: HttpTestingController;
  let fixture: ComponentFixture<AppComponent>;

  async function iniciar(): Promise<void> {
    await TestBed.configureTestingModule({ imports: [AppComponent], providers: [provideHttpClient(), provideHttpClientTesting(),
      { provide: RASCUNHO_STORAGE, useValue: { getItem: (chave: string) => dados.get(chave) ?? null,
        setItem: (chave: string, valor: string) => dados.set(chave, valor), removeItem: (chave: string) => dados.delete(chave) } }
    ] }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    http.expectOne(GENOGRAMAS_URL).flush([]);
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => { dados = new Map(); });
  afterEach(() => http.verify());

  it('deve restaurar dados, título, identificador remoto e ambos os formulários sem consultar registro remoto', async () => {
    dados.set(RASCUNHO_CHAVE, JSON.stringify(rascunhoExemplo()));
    await iniciar();
    const service = TestBed.inject(GenogramaService);
    const pessoas = fixture.debugElement.query(By.directive(PessoasComponent)).componentInstance as PessoasComponent;
    const vinculos = fixture.debugElement.query(By.directive(VinculosComponent)).componentInstance as VinculosComponent;
    const persistencia = fixture.debugElement.query(By.directive(PersistenciaComponent)).componentInstance as PersistenciaComponent;
    expect(service.pessoas().length).toBe(2);
    expect(service.vinculos()[0].relacao).toBe('proximidade');
    expect(pessoas.formulario.value.nome).toBe('Ana em edição');
    expect(pessoas.editandoId()).toBe('a');
    expect(pessoas.rascunhoPendente()).toBeTrue();
    expect(vinculos.formulario.value.modalidade).toBe('adocao');
    expect(vinculos.rascunhoPendente()).toBeTrue();
    expect(persistencia.idAtual()).toBe('7');
    expect(persistencia.alterado()).toBeTrue();
    expect(persistencia.titulo.value).toBe('Em edição');
    expect(fixture.nativeElement.textContent).toContain('Rascunho recuperado');
    http.expectNone(GENOGRAMAS_URL + '/7');
  });

  it('deve gravar automaticamente o título, o cadastro e os campos digitados e restaurá-los em outra inicialização', async () => {
    await iniciar();
    TestBed.inject(GenogramaService).salvarPessoa({ id: 'a', nome: 'Ana', nascimento: '', falecida: false });
    const pessoas = fixture.debugElement.query(By.directive(PessoasComponent)).componentInstance as PessoasComponent;
    const persistencia = fixture.debugElement.query(By.directive(PersistenciaComponent)).componentInstance as PersistenciaComponent;
    persistencia.titulo.setValue('Título local');
    pessoas.novaPessoa();
    pessoas.formulario.controls.nome.markAsDirty();
    pessoas.formulario.controls.nome.setValue('Nome ainda em edição');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(JSON.parse(dados.get(RASCUNHO_CHAVE)!).pessoa.dados.nome).toBe('Nome ainda em edição');
    http.verify();
    TestBed.resetTestingModule();
    await iniciar();
    expect(TestBed.inject(GenogramaService).pessoas()[0].nome).toBe('Ana');
    const restaurado = fixture.debugElement.query(By.directive(PessoasComponent)).componentInstance as PessoasComponent;
    expect(restaurado.formulario.value.nome).toBe('Nome ainda em edição');
    expect(fixture.nativeElement.querySelector('#editor-title').textContent).toBe('Título local');
  });

  it('deve limpar o rascunho ao iniciar novo e não ressuscitar os dados descartados', async () => {
    dados.set(RASCUNHO_CHAVE, JSON.stringify(rascunhoExemplo()));
    await iniciar();
    const persistencia = fixture.debugElement.query(By.directive(PersistenciaComponent)).componentInstance as PersistenciaComponent;
    persistencia.solicitar('novo');
    persistencia.confirmar();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(dados.has(RASCUNHO_CHAVE)).toBeFalse();
    expect(TestBed.inject(GenogramaService).pessoas()).toEqual([]);
    expect(fixture.nativeElement.textContent).not.toContain('Rascunho recuperado');
  });

  it('deve usar PUT ao salvar uma recuperação de registro remoto e limpar a cópia após confirmação', async () => {
    const local = { ...rascunhoExemplo(), pessoa: null, vinculo: { ...rascunhoExemplo().vinculo, sujo: false } };
    dados.set(RASCUNHO_CHAVE, JSON.stringify(local));
    await iniciar();
    const persistencia = fixture.debugElement.query(By.directive(PersistenciaComponent)).componentInstance as PersistenciaComponent;
    persistencia.salvar();
    const request = http.expectOne({ method: 'PUT', url: GENOGRAMAS_URL + '/7' });
    request.flush({ ...request.request.body, id: '7' });
    http.expectOne(GENOGRAMAS_URL).flush([]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(dados.has(RASCUNHO_CHAVE)).toBeFalse();
    expect(persistencia.alterado()).toBeFalse();
  });

  it('deve manter o rascunho quando a abertura remota falhar e substituí-lo apenas após uma abertura válida', async () => {
    dados.set(RASCUNHO_CHAVE, JSON.stringify(rascunhoExemplo()));
    await iniciar();
    const persistencia = fixture.debugElement.query(By.directive(PersistenciaComponent)).componentInstance as PersistenciaComponent;
    persistencia.selecionado.setValue('8');
    persistencia.solicitar('abrir'); persistencia.confirmar();
    http.expectOne(GENOGRAMAS_URL + '/8').flush({}, { status: 500, statusText: 'Erro' });
    fixture.detectChanges(); await fixture.whenStable();
    expect(dados.has(RASCUNHO_CHAVE)).toBeTrue();
    persistencia.solicitar('abrir'); persistencia.confirmar();
    http.expectOne(GENOGRAMAS_URL + '/8').flush({ id: '8', titulo: 'Outro', pessoas: [], vinculos: [] });
    fixture.detectChanges(); await fixture.whenStable();
    expect(dados.has(RASCUNHO_CHAVE)).toBeFalse();
    expect(TestBed.inject(GenogramaService).pessoas()).toEqual([]);
  });
  it('deve capturar os últimos campos ao sair mesmo antes do próximo ciclo de renderização', async () => {
    await iniciar();
    const persistencia = fixture.debugElement.query(By.directive(PersistenciaComponent)).componentInstance as PersistenciaComponent;
    persistencia.titulo.setValue('Última digitação');
    fixture.componentInstance.guardarRascunho();
    expect(JSON.parse(dados.get(RASCUNHO_CHAVE)!).titulo).toBe('Última digitação');
  });

  it('deve preservar a cópia inválida e manter o editor utilizável sem restaurar dados corrompidos', async () => {
    dados.set(RASCUNHO_CHAVE, '{inválido');
    await iniciar();
    expect(dados.get(RASCUNHO_CHAVE)).toBe('{inválido');
    expect(TestBed.inject(GenogramaService).pessoas()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('A cópia local não pôde ser recuperada');
    expect(fixture.nativeElement.querySelector('app-pessoas button').disabled).toBeFalse();
  });
  it('deve proteger a cópia importada localmente sem manter a identidade remota anterior', async () => {
    dados.set(RASCUNHO_CHAVE, JSON.stringify(rascunhoExemplo()));
    await iniciar();
    const persistencia = fixture.debugElement.query(By.directive(PersistenciaComponent)).componentInstance as PersistenciaComponent;
    const conteudo = { titulo: 'Importado', pessoas: [], vinculos: [] };
    await persistencia.importarArquivo(new File([criarBackupJson(conteudo)], 'backup.json'));
    persistencia.confirmar();
    fixture.detectChanges(); await fixture.whenStable();
    const local = JSON.parse(dados.get(RASCUNHO_CHAVE)!);
    expect(local.titulo).toBe('Importado');
    expect(local.idRemoto).toBeNull();
    expect(local.pessoa).toBeNull();
    expect(local.vinculo.sujo).toBeFalse();
    expect(TestBed.inject(GenogramaService).pessoas()).toEqual([]);
    http.expectNone(request => request.method === 'POST' || request.method === 'PUT');
  });
});
