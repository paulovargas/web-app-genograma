import { criarBackupJson, lerBackupJson, LIMITE_BACKUP_JSON, nomeBackupJson } from './backup-json';
import { DownloadJsonService } from './download-json.service';
import { RascunhoService } from '../recuperacao/rascunho.service';
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
  private readonly rascunhoLocal = inject(RascunhoService);
  private readonly download = inject(DownloadJsonService);
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
  readonly confirmacao = signal<'abrir' | 'novo' | 'importar' | null>(null);
  readonly importacao = signal<{ nome: string; dados: DadosGenograma } | null>(null);
  readonly tituloAtual = signal('Genograma sem título');
  private readonly ultimaVersaoSalva = signal('');
  readonly assinatura = computed(() => JSON.stringify({ titulo: this.tituloAtual().trim(), pessoas: this.genograma.pessoas(), vinculos: this.genograma.vinculos() }));
  readonly alterado = computed(() => this.assinatura() !== this.ultimaVersaoSalva());

  ngOnInit(): void {
    const local = this.rascunhoLocal.recuperado;
    if (local) {
      this.titulo.setValue(local.titulo);
      this.tituloAtual.set(local.titulo);
      this.idAtual.set(local.idRemoto);
    }
    this.ultimaVersaoSalva.set(local?.ultimaVersaoSalva ?? this.assinatura());
    this.titulo.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(titulo => this.tituloAtual.set(titulo));
    this.listar();
  }

  contextoLocal(): { titulo: string; idRemoto: string | null; ultimaVersaoSalva: string } {
    return { titulo: this.tituloAtual(), idRemoto: this.idAtual(), ultimaVersaoSalva: this.ultimaVersaoSalva() };
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
    if (this.ocupado() || this.confirmacao()) return;
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
          this.rascunhoLocal.restaurado.set(false);
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
    if (this.ocupado() || this.confirmacao() || (acao === 'abrir' && !this.selecionado.value)) return;
    if (this.alterado() || this.rascunhoPendente()) { this.confirmacao.set(acao); return; }
    this.executar(acao);
  }

  exportarJson(): void {
    if (this.ocupado() || this.confirmacao()) return;
    this.erro.set('');
    this.mensagem.set('');
    if (this.rascunhoPendente()) {
      this.erro.set('Conclua ou cancele o formulário de pessoa ou vínculo antes de exportar o genograma.');
      return;
    }
    this.titulo.markAsTouched();
    if (this.titulo.invalid) return;
    try {
      const dados = { titulo: this.titulo.value.trim(), pessoas: this.genograma.pessoas(), vinculos: this.genograma.vinculos() };
      this.download.baixar(criarBackupJson(dados), nomeBackupJson(dados.titulo));
      this.mensagem.set('Download do backup JSON iniciado. O salvamento na API continua manual.');
    } catch (erro) { this.erro.set(erro instanceof Error ? erro.message : 'Não foi possível exportar o backup.'); }
  }

  async selecionarArquivo(evento: Event): Promise<void> {
    const campo = evento.target as HTMLInputElement;
    const arquivo = campo.files?.[0];
    if (!arquivo) return;
    try { await this.importarArquivo(arquivo); }
    finally { campo.value = ''; }
  }

  async importarArquivo(arquivo: File): Promise<void> {
    if (this.ocupado() || this.confirmacao()) return;
    this.iniciar();
    this.importacao.set(null);
    try {
      if (arquivo.size > LIMITE_BACKUP_JSON) throw new Error('O arquivo ultrapassa o limite de 5 MiB.');
      const dados = lerBackupJson(await arquivo.text());
      this.importacao.set({ nome: arquivo.name, dados });
      this.confirmacao.set('importar');
    } catch (erro) {
      this.erro.set(erro instanceof Error ? erro.message : 'Não foi possível ler o arquivo. O editor foi preservado.');
    } finally { this.finalizar(); }
  }

  cancelarConfirmacao(): void {
    this.confirmacao.set(null);
    this.importacao.set(null);
  }
  confirmar(): void {
    const acao = this.confirmacao();
    if (acao) this.executar(acao);
  }

  private executar(acao: 'abrir' | 'novo' | 'importar'): void {
    this.confirmacao.set(null);
    if (acao === 'importar') {
      const arquivo = this.importacao();
      if (!arquivo) return;
      this.genograma.substituir(arquivo.dados.pessoas, arquivo.dados.vinculos);
      this.titulo.setValue(arquivo.dados.titulo);
      this.idAtual.set(null);
      this.selecionado.setValue('');
      this.ultimaVersaoSalva.set('');
      this.rascunhoLocal.restaurado.set(false);
      this.importacao.set(null);
      this.erro.set('');
      this.mensagem.set('Backup importado como novo genograma. Use Salvar genograma para enviar à API.');
      return;
    }
    if (acao === 'novo') {
      this.genograma.substituir([], []);
      this.titulo.setValue('Genograma sem título');
      this.idAtual.set(null);
      this.ultimaVersaoSalva.set(this.assinatura());
      this.erro.set('');
      this.rascunhoLocal.restaurado.set(false);
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
          this.rascunhoLocal.restaurado.set(false);
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
