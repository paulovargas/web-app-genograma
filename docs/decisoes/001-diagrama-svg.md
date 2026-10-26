# Decisão 001 — Diagrama SVG com organização por gerações

Data: 26/10/2026. Situação: implementada na etapa 05.

## Contexto

O app já possui pessoas e vínculos de união e filiação no estado compartilhado, recuperável pela MockAPI. A visualização precisa acompanhar alterações, funcionar em telas pequenas e representar os dados atualmente cadastrados.

## Escolha

Usar SVG nativo em um componente Angular standalone, sem novas dependências. O cálculo de posições fica em uma função pura separada da renderização.

Cada pessoa usa um cartão neutro com nome, nascimento opcional, identificação curta e indicação de falecimento. O cadastro não inclui sexo ou gênero; portanto, não inferimos esses dados para escolher símbolos. Esta versão representa conexões familiares com legenda própria, sem declarar conformidade com uma convenção clínica.

Filiações usam linha contínua e seta do responsável ao descendente. Uniões usam linha tracejada sem direção. O símbolo `†` indica pessoa falecida.

## Organização

As filiações são percorridas em ordem topológica. O nível de cada pessoa corresponde ao maior caminho de filiação a partir de uma raiz, garantindo que descendentes fiquem abaixo de todos os responsáveis. Pessoas sem filiação de entrada ficam na primeira linha. Uniões não determinam ancestralidade nem obrigam as pessoas a ocupar a mesma linha.

Os cartões de cada nível respeitam a ordem de cadastro e têm espaçamento fixo. As linhas são roteadas com segmentos ortogonais. O SVG possui dimensões próprias; a área de visualização oferece rolagem e zoom entre 50% e 150%.

## Acessibilidade e textos

A área de rolagem recebe foco pelo teclado, os controles têm nomes acessíveis e há legenda e descrição textual expansível com nomes completos e vínculos. Nomes longos têm até duas linhas no cartão, com reticências; o texto completo permanece no título do cartão e na descrição textual.

## Consequências e limites

- Não há custo ou dependência de biblioteca de grafos nesta etapa.
- Layout e zoom são calculados localmente; o contrato da API permanece o mesmo.
- Não há arraste, posicionamento manual, exportação nem otimização de cruzamentos.
- Famílias extensas podem produzir diagramas largos e linhas sobrepostas. O layout prioriza a ordem de gerações e a separação dos cartões, sem garantir ausência de cruzamentos entre conexões.
- Uma biblioteca de layout poderá ser avaliada quando os requisitos exigirem posicionamento mais elaborado.

## Evolução da decisão — etapa 08

A decisão 001 continua válida para SVG e organização por gerações. A etapa 08 acrescenta símbolos escolhidos pelo usuário e marcações de separação e divórcio. Consulte a [decisão 002](002-simbolos-e-situacao-conjugal.md), que complementa a convenção visual inicial.
