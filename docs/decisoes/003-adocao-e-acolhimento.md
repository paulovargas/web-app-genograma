# Decisão 003 — Adoção e acolhimento

Data: 26/10/2026. Situação: implementada na etapa 09.

## Escopo

A ampliação de vínculos começa por adoção e acolhimento. Relações emocionais ficam para uma etapa posterior.

## Representação dos dados

O campo opcional `modalidade` em um vínculo direcionado de `tipo: filiacao` aceita:

| Valor | Interface | Representação |
| --- | --- | --- |
| Ausente ou `nao_informada` | Filiação não especificada | Seta contínua |
| `adocao` | Adoção | Seta tracejada |
| `acolhimento` | Acolhimento | Seta pontilhada |

A interface agrupa essas opções em **Filiação ou cuidado**. Acolhimento representa cuidado no diagrama e não é apresentado como inferência de filiação biológica ou jurídica. O tipo interno foi mantido para preservar o contrato existente; as modalidades distinguem a informação exibida.

Não atribuímos natureza biológica aos vínculos antigos sem modalidade. Eles permanecem não especificados.

## Comportamento e validação

O vínculo parte do responsável para o descendente ou pessoa acolhida. A modalidade pode ser escolhida na criação e alterada na lista sem recriar o vínculo nem mudar seus identificadores. A alteração só é persistida quando o genograma é salvo.

Cada par direcionado possui uma modalidade atual. Não é permitido duplicar o mesmo vínculo com outra modalidade. Diferentes responsáveis podem ser vinculados à mesma pessoa.

Todos os vínculos direcionados participam da detecção de ciclos e da organização dos níveis visuais, incluindo os de cuidado. Isso mantém o grafo navegável e não declara ancestralidade biológica. Uniões não aceitam modalidade de filiação ou cuidado.

## Compatibilidade e limites

O parser aceita registros antigos sem o novo campo e preserva o campo quando presente. Valores desconhecidos, modalidades em uniões e vínculos inválidos são rejeitados antes de substituir o editor.

O campo fica dentro de `vinculos`, sem necessidade de alterar o recurso MockAPI ou migrar registros. Nenhum registro existente é regravado automaticamente.

Esta etapa não inclui histórico, datas de início/fim, distinções adicionais de filiação nem vínculos emocionais. A legenda é uma convenção visual do aplicativo.
