import { Component } from '@angular/core';
import { VinculosComponent } from './vinculos/vinculos.component';
import { PessoasComponent } from './pessoas/pessoas.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PessoasComponent, VinculosComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}
