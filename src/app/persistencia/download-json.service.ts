import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DownloadJsonService {
  private readonly document = inject(DOCUMENT);

  baixar(texto: string, nome: string): void {
    const url = URL.createObjectURL(new Blob([texto], { type: 'application/json;charset=utf-8' }));
    const link = this.document.createElement('a');
    link.href = url;
    link.download = nome;
    this.document.body.appendChild(link);
    try { link.click(); }
    finally {
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    }
  }
}
