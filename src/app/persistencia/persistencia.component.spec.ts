import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GenogramaService } from '../genograma/genograma.service';
import { GENOGRAMAS_URL } from './genograma-api.service';
import { PersistenciaComponent } from './persistencia.component';

const registro = { id: '1', titulo: 'Família fictícia', pessoas: [{ id: 'a', nome: 'Ana', nascimento: '', falecida: false }], vinculos: [] };

describe('PersistenciaComponent', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersistenciaComponent], providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function criar() {
    const fixture = TestBed.createComponent(PersistenciaComponent);
    fixture.detectChanges();
    http.expectOne(GENOGRAMAS_URL).flush([]);
    return fixture;
  }

  it('deve mostrar a lista vazia e impedir título em branco', () => {
    const fixture = criar();
    const component = fixture.componentInstance;
    component.titulo.setValue('   ');
    component.salvar();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nenhum genograma salvo');
    expect(fixture.nativeElement.textContent).toContain('Informe um título');
    http.expectNone(request => request.method === 'POST');
  });

  it('deve criar com POST, impedir envio duplicado e atualizar com PUT', () => {
    const component = criar().componentInstance;
    const service = TestBed.inject(GenogramaService);
    service.salvarPessoa(registro.pessoas[0]);
    component.titulo.setValue(registro.titulo);
    component.salvar();
    component.salvar();
    const post = http.expectOne(request => request.method === 'POST');
    expect(post.request.body).toEqual({ titulo: registro.titulo, pessoas: registro.pessoas, vinculos: [] });
    expect(component.ocupado()).toBeTrue();
    post.flush(registro);
    http.expectOne(GENOGRAMAS_URL).flush([registro]);
    expect(component.alterado()).toBeFalse();
    expect(component.ocupado()).toBeFalse();
    component.titulo.setValue('Novo título');
    expect(component.alterado()).toBeTrue();
    component.salvar();
    http.expectOne({ method: 'PUT', url: GENOGRAMAS_URL + '/1' }).flush({ ...registro, titulo: 'Novo título' });
    http.expectOne(GENOGRAMAS_URL).flush([registro]);
    expect(component.idAtual()).toBe('1');
    expect(component.alterado()).toBeFalse();
  });

  it('deve preservar o editor após erro de salvamento e permitir nova tentativa', () => {
    const component = criar().componentInstance;
    const service = TestBed.inject(GenogramaService);
    service.salvarPessoa(registro.pessoas[0]);
    component.salvar();
    http.expectOne({ method: 'POST', url: GENOGRAMAS_URL }).flush({}, { status: 500, statusText: 'Erro' });
    expect(component.ocupado()).toBeFalse();
    expect(component.erro()).toContain('Seus dados continuam');
    expect(component.alterado()).toBeTrue();
    expect(service.pessoas()).toEqual(registro.pessoas);
  });

  it('deve confirmar o descarte e carregar pessoas e vínculos pelo identificador', () => {
    const component = criar().componentInstance;
    const service = TestBed.inject(GenogramaService);
    service.salvarPessoa({ ...registro.pessoas[0], id: 'local' });
    component.selecionado.setValue('1');
    component.solicitar('abrir');
    expect(component.confirmacao()).toBe('abrir');
    http.expectNone(GENOGRAMAS_URL + '/1');
    component.confirmar();
    http.expectOne(GENOGRAMAS_URL + '/1').flush(registro);
    expect(service.pessoas()).toEqual(registro.pessoas);
    expect(component.titulo.value).toBe(registro.titulo);
    expect(component.idAtual()).toBe('1');
    expect(component.alterado()).toBeFalse();
  });

  it('deve preservar o editor quando o registro recebido for inválido ou não existir', () => {
    const component = criar().componentInstance;
    component.selecionado.setValue('1');
    component.solicitar('abrir');
    http.expectOne(GENOGRAMAS_URL + '/1').flush({ ...registro, pessoas: 'inválido' });
    expect(component.erro()).toContain('inválido');
    expect(component.idAtual()).toBeNull();
    expect(component.titulo.value).toBe('Genograma sem título');
    component.solicitar('abrir');
    http.expectOne(GENOGRAMAS_URL + '/1').flush({}, { status: 404, statusText: 'Not Found' });
    expect(component.erro()).toContain('conteúdo atual foi preservado');
  });

  it('deve cancelar o descarte e iniciar um novo genograma sem alterar o registro salvo', () => {
    const component = criar().componentInstance;
    const service = TestBed.inject(GenogramaService);
    service.salvarPessoa(registro.pessoas[0]);
    component.solicitar('novo');
    component.confirmacao.set(null);
    expect(service.pessoas().length).toBe(1);
    component.solicitar('novo');
    component.confirmar();
    expect(service.pessoas()).toEqual([]);
    expect(component.idAtual()).toBeNull();
    expect(component.titulo.value).toBe('Genograma sem título');
    http.expectNone(request => request.method === 'DELETE');
  });

  it('deve tratar falha na lista e permitir atualizar sem apagar dados locais', () => {
    const fixture = TestBed.createComponent(PersistenciaComponent);
    fixture.detectChanges();
    http.expectOne(GENOGRAMAS_URL).flush({}, { status: 503, statusText: 'Unavailable' });
    expect(fixture.componentInstance.erroLista()).toContain('Não foi possível listar');
    fixture.componentInstance.listar();
    http.expectOne(GENOGRAMAS_URL).flush([registro]);
    expect(fixture.componentInstance.registros()).toEqual([{ id: '1', titulo: registro.titulo }]);
    expect(fixture.componentInstance.erroLista()).toBe('');
  });
  it('deve impedir salvar um formulário pendente e confirmar antes de descartá-lo', () => {
    const fixture = criar();
    fixture.componentRef.setInput('rascunhoPendente', true);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.salvar();
    expect(component.erro()).toContain('Conclua ou cancele');
    http.expectNone(request => request.method === 'POST');
    component.solicitar('novo');
    expect(component.confirmacao()).toBe('novo');
  });

  it('deve avisar ao sair apenas quando houver alterações ou formulários pendentes', () => {
    const fixture = criar();
    const component = fixture.componentInstance;
    const semAlteracoes = new Event('beforeunload', { cancelable: true });
    component.avisarAoSair(semAlteracoes as BeforeUnloadEvent);
    expect(semAlteracoes.defaultPrevented).toBeFalse();
    component.titulo.setValue('Alterado');
    const comAlteracoes = new Event('beforeunload', { cancelable: true });
    component.avisarAoSair(comAlteracoes as BeforeUnloadEvent);
    expect(comAlteracoes.defaultPrevented).toBeTrue();
    component.titulo.setValue('Genograma sem título');
    fixture.componentRef.setInput('rascunhoPendente', true);
    fixture.detectChanges();
    const comRascunho = new Event('beforeunload', { cancelable: true });
    component.avisarAoSair(comRascunho as BeforeUnloadEvent);
    expect(comRascunho.defaultPrevented).toBeTrue();
  });
  it('deve salvar e recuperar símbolo e situação conjugal no genograma completo', () => {
    const fixture = criar();
    const component = fixture.componentInstance;
    const service = TestBed.inject(GenogramaService);
    service.salvarPessoa({ id: 'a', nome: 'A', nascimento: '', falecida: false, simbolo: 'quadrado' });
    service.salvarPessoa({ id: 'b', nome: 'B', nascimento: '', falecida: false, simbolo: 'losango' });
    service.adicionarVinculo('uniao', 'a', 'b', 'divorciados');
    component.salvar();
    const request = http.expectOne({ method: 'POST', url: GENOGRAMAS_URL });
    expect(request.request.body.pessoas[0].simbolo).toBe('quadrado');
    expect(request.request.body.vinculos[0].situacao).toBe('divorciados');
    const salvo = { ...request.request.body, id: 'novo' };
    request.flush(salvo);
    http.expectOne(GENOGRAMAS_URL).flush([salvo]);
    component.solicitar('novo');
    component.selecionado.setValue('novo');
    component.solicitar('abrir');
    http.expectOne(GENOGRAMAS_URL + '/novo').flush(salvo);
    expect(service.pessoas()[0].simbolo).toBe('quadrado');
    expect(service.pessoas()[1].simbolo).toBe('losango');
    expect(service.vinculos()[0].situacao).toBe('divorciados');
  });
});
