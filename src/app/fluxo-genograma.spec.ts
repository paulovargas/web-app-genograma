import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { GENOGRAMAS_URL } from './persistencia/genograma-api.service';
import { GenogramaService } from './genograma/genograma.service';

describe('Fluxo completo do genograma', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent], providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('deve cadastrar, relacionar, salvar, iniciar novo e recuperar o diagrama pela API', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    http.expectOne(GENOGRAMAS_URL).flush([]);
    const element = fixture.nativeElement as HTMLElement;
    const service = TestBed.inject(GenogramaService);
    const clicar = (texto: string) => {
      Array.from(element.querySelectorAll('button')).find(button => button.textContent?.trim() === texto)!.click();
      fixture.detectChanges();
    };
    const preencher = (seletor: string, valor: string, evento = 'input') => {
      const campo = element.querySelector(seletor) as HTMLInputElement;
      campo.value = valor;
      campo.dispatchEvent(new Event(evento));
      fixture.detectChanges();
    };
    for (const nome of ['Ana Exemplo', 'Bruno Exemplo']) {
      clicar('Adicionar pessoa');
      preencher('#nome', nome);
      clicar('Salvar');
    }
    const [ana, bruno] = service.pessoas();
    preencher('app-vinculos select[formControlName="tipo"]', 'filiacao', 'change');
    preencher('app-vinculos select[formControlName="origemId"]', ana.id, 'change');
    preencher('app-vinculos select[formControlName="destinoId"]', bruno.id, 'change');
    clicar('Adicionar vínculo');
    expect(element.querySelectorAll('.person').length).toBe(2);
    expect(element.querySelectorAll('.connection').length).toBe(1);
    preencher('app-persistencia input', 'Família de teste');
    clicar('Salvar genograma');
    const request = http.expectOne({ method: 'POST', url: GENOGRAMAS_URL });
    expect(request.request.body.pessoas.length).toBe(2);
    expect(request.request.body.vinculos[0].origemId).toBe(ana.id);
    expect(element.querySelector('app-pessoas button')!.matches(':disabled')).toBeTrue();
    const salvo = { ...request.request.body, id: 'salvo-1' };
    request.flush(salvo);
    http.expectOne(GENOGRAMAS_URL).flush([salvo]);
    fixture.detectChanges();
    expect(element.querySelector('.status')?.textContent).toContain('Genograma salvo');
    clicar('Novo');
    expect(service.pessoas()).toEqual([]);
    expect(element.textContent).toContain('Nenhuma pessoa adicionada');
    preencher('app-persistencia select', 'salvo-1', 'change');
    clicar('Abrir');
    http.expectOne(GENOGRAMAS_URL + '/salvo-1').flush(salvo);
    fixture.detectChanges();
    expect(service.pessoas().map(pessoa => pessoa.nome)).toEqual(['Ana Exemplo', 'Bruno Exemplo']);
    expect(element.querySelectorAll('.person').length).toBe(2);
    expect(element.querySelectorAll('.connection').length).toBe(1);
    expect(element.querySelector('#editor-title')?.textContent).toContain('Família de teste');
    expect(element.textContent).toContain('Genograma carregado');
  });

  it('deve impedir salvamento do genograma com cadastro de pessoa ainda em edição', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    http.expectOne(GENOGRAMAS_URL).flush([]);
    const element = fixture.nativeElement as HTMLElement;
    (element.querySelector('app-pessoas button') as HTMLButtonElement).click();
    fixture.detectChanges();
    const campo = element.querySelector('#nome') as HTMLInputElement;
    campo.value = 'Pessoa ainda não cadastrada';
    campo.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (element.querySelector('app-persistencia button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.textContent).toContain('Conclua ou cancele');
    http.expectNone(request => request.method === 'POST');
    expect(TestBed.inject(GenogramaService).pessoas()).toEqual([]);
  });
});
