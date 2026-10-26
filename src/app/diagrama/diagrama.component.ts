import { Component, computed, inject, signal } from '@angular/core';
import { GenogramaService } from '../genograma/genograma.service';
import { construirDiagrama } from './diagrama-layout';
import { ROTULOS_SIMBOLOS } from '../pessoas/pessoa.model';

@Component({
  selector: 'app-diagrama',
  standalone: true,
  templateUrl: './diagrama.component.html',
  styleUrl: './diagrama.component.css'
})
export class DiagramaComponent {
  readonly rotulosSimbolos = ROTULOS_SIMBOLOS;
  readonly genograma = inject(GenogramaService);
  readonly diagrama = computed(() => construirDiagrama(this.genograma.pessoas(), this.genograma.vinculos()));
  readonly zoom = signal(100);

  alterarZoom(incremento: number): void {
    this.zoom.update(zoom => Math.max(50, Math.min(150, zoom + incremento)));
  }
}
