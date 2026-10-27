# App de Genograma

Aplicação Angular para construir e visualizar pessoas e vínculos familiares em um genograma.

## Estado atual

Angular 19, TypeScript, CSS, Jasmine e Karma. Editor com cadastro, edição e remoção de pessoas e vínculos de união e filiação. Os vínculos validam duplicatas e ciclos de ancestralidade.

A persistência usa MockAPI com salvamento manual de cada genograma completo. Diagrama SVG implementado com organização por gerações, legenda, zoom e descrição textual acessível.

## Visualizar o genograma

Pessoas e vínculos aparecem automaticamente no diagrama. Filiações usam setas e uniões usam linhas tracejadas. Ajuste o zoom ou use a rolagem para explorar famílias maiores. A descrição textual abaixo do diagrama apresenta os nomes completos e as conexões.

Os cartões usam a representação escolhida no cadastro; sem escolha, permanecem neutros. Consulte a [decisão sobre o diagrama](docs/decisoes/001-diagrama-svg.md) para conhecer a convenção visual e as limitações.

## Símbolos e situações conjugais

No cadastro de pessoas, escolha **Neutro**, **Quadrado**, **Círculo** ou **Losango**. Ao criar uma união, selecione **União**, **Separação** ou **Divórcio**. A situação também pode ser alterada na lista de vínculos e aparece no diagrama e na descrição textual. Salve o genograma após as alterações.

Genogramas antigos continuam compatíveis. Veja a [decisão sobre símbolos e situações conjugais](docs/decisoes/002-simbolos-e-situacao-conjugal.md).

## Adoção e acolhimento

Em **Filiação ou cuidado**, escolha a modalidade do vínculo: não especificada, adoção ou acolhimento. O diagrama usa seta tracejada para adoção e pontilhada para acolhimento. A modalidade pode ser alterada na lista e é preservada ao salvar e reabrir. Registros antigos continuam compatíveis. Veja o [guia de uso](docs/guia-de-uso.md).

## Vínculos emocionais

Escolha **Emocional** para registrar proximidade, conflito ou afastamento entre duas pessoas. A relação pode ser alterada pela lista, aparece no diagrama e é preservada ao salvar e reabrir. Vínculos emocionais podem coexistir com os familiares e não alteram as gerações. Veja a [convenção visual e regras](docs/decisoes/004-vinculos-emocionais.md).

## Salvar e reabrir

1. Cadastre as pessoas e seus vínculos.
2. Informe um título e clique em **Salvar genograma**.
3. Para recuperar um registro da API, selecione-o em **Genogramas salvos** e clique em **Abrir**. Se houver rascunho local pendente, ele é restaurado automaticamente ao iniciar.
4. Alterações posteriores precisam ser salvas novamente. O mesmo registro será atualizado.
5. **Novo** inicia outro genograma; não exclui os registros da API.

Abrir outro genograma ou iniciar um novo pede confirmação quando há alterações não salvas. Falhas de rede preservam o conteúdo do editor. Alterações pendentes são protegidas automaticamente neste navegador, incluindo formulários em edição. O aviso acima do editor informa se a cópia foi protegida ou recuperada, ou se houve falha. O envio à API permanece manual.

Ambiente de protótipo sem autenticação: utilizar apenas dados fictícios. Os registros disponíveis no recurso são compartilhados, sem separação por usuário.

Consulte o [contrato da API e suas limitações](docs/persistencia-api.md).

## Recuperação automática

Ao reabrir o app no mesmo navegador e endereço, um rascunho válido é restaurado automaticamente. A cópia local é removida após salvar na API, iniciar um novo genograma ou abrir outro registro com sucesso. Limpar os dados do navegador também apaga essa cópia; ela não é sincronizada entre dispositivos.

Consulte a [decisão sobre recuperação automática](docs/decisoes/005-recuperacao-automatica.md) para conhecer o funcionamento e os limites.

## Backup em JSON

Em **Backup em arquivo**, use **Exportar JSON** para baixar uma cópia do título, pessoas e vínculos. Conclua ou cancele os formulários pendentes antes de exportar.

Para restaurar, escolha o arquivo em **Importar JSON**, confira o título e as quantidades e confirme **Importar como novo genograma**. Cancelar mantém o editor atual. A importação cria uma cópia independente; use **Salvar genograma** para enviá-la à API como um novo registro.

O limite é de 5 MiB por arquivo. O backup não inclui formulários pendentes nem o identificador remoto. Consulte a [decisão sobre backup JSON](docs/decisoes/006-backup-json.md).

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

## Guia de uso

Consulte o [guia do primeiro fluxo](docs/guia-de-uso.md) para cadastro, edição, salvamento, recuperação e navegação por teclado.

O app avisa quando há formulários pendentes e solicita confirmação ao sair com alterações não salvas.

## Desenvolvimento por etapas

Consulte o [roteiro](docs/roteiro.md) para escopo proposto, critérios de conclusão e padrão de commits.
