# Decisão 002 — Símbolos explícitos e situação da união

Data: 26/10/2026. Situação: implementada na etapa 08.

## Escopo escolhido

O usuário priorizou quadrado, círculo e losango para pessoas, além de separação e divórcio. Adoção, acolhimento e vínculos emocionais ficam para etapas posteriores.

## Símbolos de pessoa

O campo opcional `simbolo` aceita `neutro`, `quadrado`, `circulo` e `losango`. O usuário escolhe a representação no cadastro; a escolha é preservada na edição, no salvamento e na reabertura. Não há inferência de sexo ou gênero a partir do nome.

Os símbolos aparecem no cartão da pessoa. Uma pessoa falecida recebe um X sobre o símbolo escolhido e mantém a indicação textual de falecimento. A representação neutra continua disponível e é o padrão dos registros antigos.

A legenda descreve a representação usada pelo aplicativo, sem atribuir significado clínico ou identitário automático às formas.

## Situação conjugal

Separação e divórcio são situações de um vínculo de união, por meio do campo opcional `situacao`:

| Valor | Rótulo | Diagrama |
| --- | --- | --- |
| `juntos` ou ausente | União | Linha tracejada |
| `separados` | Separação | Linha tracejada com um traço diagonal |
| `divorciados` | Divórcio | Linha tracejada com dois traços diagonais |

A situação pode ser definida ao criar a união ou alterada diretamente na lista. A mudança preserva o identificador e as pessoas envolvidas. É necessário salvar o genograma para persistir a mudança na API.

A mesma união não pode ser cadastrada novamente entre as mesmas pessoas, mesmo invertendo a ordem ou escolhendo outra situação. Filiações não aceitam situação conjugal e seguem as regras de ancestralidade existentes.

## Compatibilidade e limites

Os campos novos ficam dentro dos arrays `pessoas` e `vinculos`; não é necessário alterar os campos de primeiro nível do recurso MockAPI. A validação aceita os campos ausentes e preserva os campos novos quando presentes. Valores desconhecidos são rejeitados antes de substituir o editor.

Não há migração em massa nem alteração automática de registros remotos. A compatibilidade não depende de regravar os genogramas antigos.

Esta versão representa a situação atual de cada união. Não registra datas, histórico de separações, reconciliações ou múltiplas uniões históricas entre o mesmo par.
