import { Component } from '@angular/core';
import { PessoasComponent } from './pessoas/pessoas.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PessoasComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}
