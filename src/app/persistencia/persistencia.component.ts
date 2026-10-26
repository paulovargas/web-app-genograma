import { Component, computed, DestroyRef, HostListener, inject, input, OnInit, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { GenogramaService } from '../genograma/genograma.service';
import { GenogramaApiService } from './genograma-api.service';
import { DadosGenograma } from './genograma.model';
import { copiarDados, validarGenograma } from './validar-genograma';

@Component({
  selector: 'app-persistencia',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './persistencia.component.html',
  styleUrl: './persistencia.component.css'
})
export class PersistenciaComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(GenogramaApiService);
  readonly genograma = inject(GenogramaService);
  readonly rascunhoPendente = input(false);
  readonly ocupadoChange = output<boolean>();
  readonly titulo = new FormControl('Genograma sem título', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] });
  readonly selecionado = new FormControl('', { nonNullable: true });
  readonly registros = signal<readonly { id: string; titulo: string }[]>([]);
  readonly ocupado = signal(false);
  readonly listando = signal(false);
  readonly idAtual = signal<string | null>(null);
  readonly erro = signal('');
  readonly erroLista = signal('');
  readonly mensagem = signal('');
  readonly confirmacao = signal<'abrir' | 'novo' | null>(null);
  readonly tituloAtual = signal('Genograma sem título');
  private readonly ultimaVersaoSalva = signal('');
  readonly assinatura = computed(() => JSON.stringify({ titulo: this.tituloAtual().trim(), pessoas: this.genograma.pessoas(), vinculos: this.genograma.vinculos() }));
  readonly alterado = computed(() => this.assinatura() !== this.ultimaVersaoSalva());

  ngOnInit(): void {
    this.ultimaVersaoSalva.set(this.assinatura());
    this.titulo.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(titulo => this.tituloAtual.set(titulo));
    this.listar();
  }

  @HostListener('window:beforeunload', ['$event'])
  avisarAoSair(evento: BeforeUnloadEvent): void {
    if (this.alterado() || this.rascunhoPendente()) {
      evento.preventDefault();
      evento.returnValue = '';
    }
  }

  listar(): void {
    if (this.listando()) return;
    this.listando.set(true);
    this.erroLista.set('');
    this.api.listar().pipe(finalize(() => this.listando.set(false))).subscribe({
      next: registros => {
        if (!Array.isArray(registros) || registros.some(registro => !registro || typeof registro.id !== 'string' || typeof registro.titulo !== 'string')) {
          this.erroLista.set('A lista recebida possui formato inválido.');
          return;
        }
        this.registros.set(registros.map(({ id, titulo }) => ({ id, titulo })));
      },
      error: () => this.erroLista.set('Não foi possível listar os genogramas. Tente atualizar a lista.')
    });
  }

  salvar(): void {
    if (this.ocupado()) return;
    if (this.rascunhoPendente()) {
      this.erro.set('Conclua ou cancele o formulário de pessoa ou vínculo antes de salvar o genograma.');
      return;
    }
    this.titulo.markAsTouched();
    if (this.titulo.invalid) return;
    const dados: DadosGenograma = copiarDados({ titulo: this.titulo.value.trim(), pessoas: this.genograma.pessoas(), vinculos: this.genograma.vinculos() });
    this.iniciar();
    this.api.salvar(dados, this.idAtual()).pipe(finalize(() => this.finalizar())).subscribe({
      next: resposta => {
        try {
          const salvo = validarGenograma(resposta);
          this.idAtual.set(salvo.id);
          this.ultimaVersaoSalva.set(JSON.stringify(dados));
          this.mensagem.set('Genograma salvo na API.');
          this.listar();
        } catch {
          this.erro.set('A API respondeu com dados inválidos. O salvamento não pôde ser confirmado; confira a lista antes de tentar novamente.');
        }
      },
      error: () => this.erro.set('Não foi possível confirmar o salvamento. Seus dados continuam no editor. Confira a lista antes de tentar novamente.')
    });
  }

  solicitar(acao: 'abrir' | 'novo'): void {
    if (this.ocupado() || (acao === 'abrir' && !this.selecionado.value)) return;
    if (this.alterado() || this.rascunhoPendente()) { this.confirmacao.set(acao); return; }
    this.executar(acao);
  }

  confirmar(): void {
    const acao = this.confirmacao();
    if (acao) this.executar(acao);
  }

  private executar(acao: 'abrir' | 'novo'): void {
    this.confirmacao.set(null);
    if (acao === 'novo') {
      this.genograma.substituir([], []);
      this.titulo.setValue('Genograma sem título');
      this.idAtual.set(null);
      this.ultimaVersaoSalva.set(this.assinatura());
      this.erro.set('');
      this.mensagem.set('Novo genograma iniciado.');
      return;
    }
    this.iniciar();
    this.api.carregar(this.selecionado.value).pipe(finalize(() => this.finalizar())).subscribe({
      next: resposta => {
        try {
          const salvo = validarGenograma(resposta);
          this.genograma.substituir(salvo.pessoas, salvo.vinculos);
          this.titulo.setValue(salvo.titulo);
          this.idAtual.set(salvo.id);
          this.ultimaVersaoSalva.set(this.assinatura());
          this.mensagem.set('Genograma carregado.');
        } catch (erro) {
          this.erro.set(erro instanceof Error ? erro.message : 'Dados inválidos.');
        }
      },
      error: () => this.erro.set('Não foi possível carregar o genograma. O conteúdo atual foi preservado.')
    });
  }

  private iniciar(): void {
    this.ocupado.set(true);
    this.ocupadoChange.emit(true);
    this.erro.set('');
    this.mensagem.set('');
  }

  private finalizar(): void {
    this.ocupado.set(false);
    this.ocupadoChange.emit(false);
  }
}
