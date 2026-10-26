import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import { DadosGenograma, GenogramaSalvo } from './genograma.model';

export const GENOGRAMAS_URL = 'https://6adf95af8e42963c8d5e3255.mockapi.io/api/v1/genogramas';

@Injectable({ providedIn: 'root' })
export class GenogramaApiService {
  private readonly http = inject(HttpClient);

  listar(): Observable<readonly GenogramaSalvo[]> {
    return this.http.get<readonly GenogramaSalvo[]>(GENOGRAMAS_URL).pipe(timeout(15000));
  }

  carregar(id: string): Observable<unknown> {
    return this.http.get<unknown>(`${GENOGRAMAS_URL}/${encodeURIComponent(id)}`).pipe(timeout(15000));
  }

  salvar(dados: DadosGenograma, id: string | null): Observable<unknown> {
    return (id
      ? this.http.put<unknown>(`${GENOGRAMAS_URL}/${encodeURIComponent(id)}`, dados)
      : this.http.post<unknown>(GENOGRAMAS_URL, dados)).pipe(timeout(15000));
  }
}
