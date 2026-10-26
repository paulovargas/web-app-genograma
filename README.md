# App de Genograma

Aplicação Angular para construir e visualizar pessoas e vínculos familiares em um genograma.

## Estado atual

Angular 19, TypeScript, CSS, Jasmine e Karma. Editor com cadastro, edição e remoção de pessoas e vínculos de união e filiação. Os vínculos validam duplicatas e ciclos de ancestralidade.

A persistência usa MockAPI com salvamento manual de cada genograma completo. Diagrama SVG implementado com organização por gerações, legenda, zoom e descrição textual acessível.

## Visualizar o genograma

Pessoas e vínculos aparecem automaticamente no diagrama. Filiações usam setas e uniões usam linhas tracejadas. Ajuste o zoom ou use a rolagem para explorar famílias maiores. A descrição textual abaixo do diagrama apresenta os nomes completos e as conexões.

Os cartões usam símbolos neutros. Consulte a [decisão sobre o diagrama](docs/decisoes/001-diagrama-svg.md) para conhecer a convenção visual e as limitações.

## Salvar e reabrir

1. Cadastre as pessoas e seus vínculos.
2. Informe um título e clique em **Salvar genograma**.
3. Para recuperar após recarregar, selecione o registro em **Genogramas salvos** e clique em **Abrir**.
4. Alterações posteriores precisam ser salvas novamente. O mesmo registro será atualizado.
5. **Novo** inicia outro genograma; não exclui os registros da API.

Abrir outro genograma ou iniciar um novo pede confirmação quando há alterações não salvas. Falhas de rede preservam o conteúdo do editor. Não há salvamento automático nem cache offline; alterações não salvas serão perdidas ao recarregar a página.

Ambiente de protótipo sem autenticação: utilizar apenas dados fictícios. Os registros disponíveis no recurso são compartilhados, sem separação por usuário.

Consulte o [contrato da API e suas limitações](docs/persistencia-api.md).

## Executar

Pré-requisitos: Node.js compatível com Angular 19 e npm.

```bash
npm ci
npm start
```

Acesse `http://localhost:4200/`.

## Validar

```bash
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

Os testes precisam de Chrome disponível. O build é gerado em `dist/web-app-genograma/`.

## Desenvolvimento por etapas

Consulte o [roteiro](docs/roteiro.md) para escopo proposto, critérios de conclusão e padrão de commits.
