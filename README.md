# App de Genograma

Aplicação Angular para construir e visualizar pessoas e vínculos familiares em um genograma.

## Estado atual

Estrutura inicial do Angular 19, com TypeScript, CSS, Jasmine e Karma. Estrutura visual do editor implementada, com lista de pessoas e área do genograma em estado vazio. Cadastro, vínculos e persistência ainda não implementados. Backend e tecnologia do diagrama ainda não definidos.

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
