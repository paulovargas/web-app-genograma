# Decisão 004 — Vínculos emocionais

Data: 26/10/2026. Situação: implementada na etapa 10.

## Escolha

Adicionar `tipo: emocional` com o campo obrigatório `relacao`:

| Valor | Rótulo | Representação no aplicativo |
| --- | --- | --- |
| `proximidade` | Proximidade | Linha dupla azul, sem seta |
| `conflito` | Conflito | Linha vermelha com marca em zigue-zague, sem seta |
| `afastamento` | Afastamento | Linha cinza pontilhada, sem seta |

A legenda e a descrição textual complementam as cores e os padrões. A convenção descreve escolhas feitas pelo usuário, sem gerar avaliações ou inferir relações a partir dos dados cadastrados.

## Regras

- Relações emocionais são simétricas nesta versão: inverter as pessoas não cria outro vínculo.
- Há uma relação emocional atual por par de pessoas. Ela pode ser alterada pela lista sem recriar o vínculo.
- O vínculo emocional pode coexistir com união e filiação ou cuidado entre as mesmas pessoas.
- As pessoas devem existir e ser diferentes.
- Situação conjugal e modalidade de filiação não são aceitas em vínculo emocional; o campo `relacao` não é aceito nos demais tipos.
- Remover uma pessoa também remove os vínculos emocionais que a referenciam.

## Organização visual

Os vínculos emocionais não participam da detecção de ciclos de filiação nem do cálculo de gerações. Relações emocionais entre várias pessoas podem formar ciclos sem alterar a hierarquia familiar.

Na mesma linha de cartões, as conexões passam abaixo dos cartões. Entre níveis diferentes, passam pela lateral esquerda. Isso distingue seu percurso dos vínculos de união e preserva o layout de pessoas ao acrescentar relações emocionais. Cruzamentos ainda podem ocorrer em famílias extensas.

## Persistência e limites

O novo tipo e seu campo ficam no array `vinculos`, sem mudança nos campos de primeiro nível do recurso MockAPI. Relação ausente ou desconhecida é rejeitada antes de substituir o editor. Registros antigos continuam válidos; nenhuma relação emocional é criada automaticamente.

O salvamento permanece manual. Não há histórico, intensidade, datas, relações direcionais nem múltiplas relações emocionais simultâneas para o mesmo par nesta etapa.
