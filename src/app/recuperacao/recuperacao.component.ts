import { Component, inject } from '@angular/core';
import { RascunhoService } from './rascunho.service';

@Component({
  selector: 'app-recuperacao', standalone: true,
  template: `
    <section aria-label="Recuperação automática">
      @if (rascunho.restaurado()) { <p role="status">Rascunho recuperado deste navegador. Confira os dados e use Salvar genograma para enviar à API.</p> }
      @if (rascunho.erro()) { <p role="alert">{{ rascunho.erro() }}</p> }
      @else { <p>{{ rascunho.protegido() ? 'Alterações protegidas neste navegador.' : 'Recuperação automática ativa neste navegador.' }} O salvamento na API continua manual.</p> }
      @if (rascunho.invalido()) {
        @if (!confirmarDescarte) { <button type="button" (click)="confirmarDescarte = true">Descartar cópia local inválida</button> }
        @else { <p>Esta ação remove a cópia local inválida. Os registros da API não serão alterados.</p><button type="button" (click)="rascunho.descartarInvalido(); confirmarDescarte = false">Confirmar descarte local</button><button type="button" (click)="confirmarDescarte = false">Cancelar</button> }
      }
    </section>`,
  styles: `section { padding: 0 4px 16px; } p { margin: 6px 0; font-size: 12px; line-height: 1.7; color: #526b5c; } [role=alert] { color: #a32929; } button { padding: 8px; margin: 6px 8px 0 0; color: #274e3d; background: white; border: 1px solid #a8bbae; border-radius: 5px; cursor: pointer; } button:focus-visible { outline: 3px solid #307d67; }`
})
export class RecuperacaoComponent {
  readonly rascunho = inject(RascunhoService);
  confirmarDescarte = false;
}
