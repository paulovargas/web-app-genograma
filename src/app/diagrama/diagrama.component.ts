import { Component, computed, inject, signal } from '@angular/core';
import { GenogramaService } from '../genograma/genograma.service';
import { input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { construirDiagrama } from './diagrama-layout';
import { ROTULOS_SIMBOLOS } from '../pessoas/pessoa.model';

@Component({
  selector: 'app-diagrama',
  standalone: true,
  templateUrl: './diagrama.component.html',
  styleUrl: './diagrama.component.css'
})
export class DiagramaComponent {
  private readonly document = inject(DOCUMENT);
  readonly titulo = input('');
  readonly rascunhoPendente = input(false);
  readonly erroImpressao = signal('');

  imprimir(): void {
    this.erroImpressao.set('');
    if (this.rascunhoPendente()) {
      this.erroImpressao.set('Conclua ou cancele os formulários em edição antes de exportar o PDF.');
      return;
    }
    if (!this.titulo().trim() || this.genograma.pessoas().length === 0) {
      this.erroImpressao.set('Informe um título e adicione uma pessoa antes de exportar o PDF.');
      return;
    }
    this.document.defaultView?.print();
  }
  readonly rotulosSimbolos = ROTULOS_SIMBOLOS;
  readonly genograma = inject(GenogramaService);
  readonly diagrama = computed(() => construirDiagrama(this.genograma.pessoas(), this.genograma.vinculos()));
  readonly zoom = signal(100);

  alterarZoom(incremento: number): void {
    this.zoom.update(zoom => Math.max(50, Math.min(150, zoom + incremento)));
  }
}
