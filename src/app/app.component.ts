import { Component, afterNextRender, effect, HostListener, inject, signal, viewChild } from '@angular/core';
import { DiagramaComponent } from './diagrama/diagrama.component';
import { PersistenciaComponent } from './persistencia/persistencia.component';
import { VinculosComponent } from './vinculos/vinculos.component';
import { PessoasComponent } from './pessoas/pessoas.component';
import { GenogramaService } from './genograma/genograma.service';
import { RascunhoService } from './recuperacao/rascunho.service';
import { RecuperacaoComponent } from './recuperacao/recuperacao.component';

@Component({
  selector: 'app-root', standalone: true,
  imports: [DiagramaComponent, PessoasComponent, VinculosComponent, PersistenciaComponent, RecuperacaoComponent],
  templateUrl: './app.component.html', styleUrl: './app.component.css'
})
export class AppComponent {
  readonly ocupado = signal(false);
  private readonly pronto = signal(false);
  private readonly genograma = inject(GenogramaService);
  private readonly rascunho = inject(RascunhoService);
  private readonly persistencia = viewChild(PersistenciaComponent);
  private readonly cadastro = viewChild(PessoasComponent);
  private readonly vinculos = viewChild(VinculosComponent);

  constructor() {
    const local = this.rascunho.ler();
    if (local) this.genograma.substituir(local.pessoas, local.vinculos);
    // Só começa a gravar após os formulários e o contexto remoto terem sido restaurados.
    afterNextRender(() => this.pronto.set(true));
    effect(() => { if (this.pronto()) this.guardarRascunho(); });
  }

  @HostListener('window:beforeunload')
  guardarRascunho(): void {
    this.rascunho.revisao();
    const persistencia = this.persistencia();
    const cadastro = this.cadastro();
    const vinculos = this.vinculos();
    if (!this.pronto() || !persistencia || !cadastro || !vinculos) return;
    if (persistencia.ocupado()) return;
    const pessoa = cadastro.capturarRascunho();
    if (pessoa?.editandoId && !this.genograma.pessoas().some(atual => atual.id === pessoa.editandoId)) return;
    const vinculo = vinculos.capturarRascunho();
    this.rascunho.guardar({ ...persistencia.contextoLocal(), pessoas: this.genograma.pessoas(), vinculos: this.genograma.vinculos(), pessoa, vinculo },
      persistencia.alterado() || Boolean(pessoa?.sujo) || vinculo.sujo);
  }
}
