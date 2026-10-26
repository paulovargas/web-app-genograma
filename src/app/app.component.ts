import { DiagramaComponent } from './diagrama/diagrama.component';
import { Component, signal } from '@angular/core';
import { PersistenciaComponent } from './persistencia/persistencia.component';
import { VinculosComponent } from './vinculos/vinculos.component';
import { PessoasComponent } from './pessoas/pessoas.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DiagramaComponent, PessoasComponent, VinculosComponent, PersistenciaComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent { readonly ocupado = signal(false); }
