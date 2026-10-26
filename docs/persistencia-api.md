# Persistência de genogramas pela API

## Endereço e configuração

Recurso: `https://6adf95af8e42963c8d5e3255.mockapi.io/api/v1/genogramas`.

O endereço está centralizado em `src/app/persistencia/genograma-api.service.ts`, na constante `GENOGRAMAS_URL`. Não existe chave ou credencial configurada. O cliente HTTP é registrado em `app.config.ts`.

## Contrato

| Operação | Método | Caminho |
| --- | --- | --- |
| Listar | GET | `/genogramas` |
| Abrir | GET | `/genogramas/:id` |
| Criar | POST | `/genogramas` |
| Atualizar | PUT | `/genogramas/:id` |

Exemplo de corpo enviado:

```json
{
  "titulo": "Família fictícia",
  "pessoas": [
    { "id": "pessoa-a", "nome": "Ana", "nascimento": "", "falecida": false },
    { "id": "pessoa-b", "nome": "Bruno", "nascimento": "", "falecida": false }
  ],
  "vinculos": [
    { "id": "vinculo-a", "tipo": "filiacao", "origemId": "pessoa-a", "destinoId": "pessoa-b" }
  ]
}
```

A API gera o `id` do genograma e retorna o objeto completo. Os identificadores internos de pessoas e vínculos são preservados. O recurso deve ter `titulo` como String e `pessoas` e `vinculos` como Array.

## Comportamento

A lista é consultada na abertura da aplicação. O editor começa vazio e o usuário escolhe qual registro abrir. Salvar cria um registro quando ainda não há identificador ativo; depois atualiza o mesmo registro. Novo inicia outro documento sem apagar dados remotos.

O conteúdo completo é enviado a cada salvamento. A interface impede envios simultâneos e bloqueia o editor durante salvar/abrir. Os dados recebidos são validados antes de substituir o estado atual; registros inválidos não devem apagar o trabalho no editor.

As requisições têm limite de espera de 15 segundos. Não há repetição automática de gravações: uma falha de rede pode ocorrer após a API ter recebido o registro. Se o salvamento não puder ser confirmado, conferir a lista antes de tentar novamente, para evitar criação duplicada.

## Limitações

- Sem autenticação, isolamento por usuário, cache offline ou salvamento automático.
- Sem controle de versões: duas sessões editando o mesmo registro podem sobrescrever alterações.
- Sem exclusão de genogramas remotos pela interface nesta etapa.
- Dados não salvos são perdidos ao recarregar ou fechar a página.
- Usar apenas dados fictícios no protótipo.

## Verificações realizadas

- `npm.cmd run build`: aprovado sem avisos.
- `npx.cmd tsc -p tsconfig.spec.json --noEmit`: aprovado.
- `npm.cmd test -- --watch=false --browsers=ChromeHeadless`: 24 testes aprovados, executados fora das restrições do sandbox.
- POST, GET e PUT reais confirmados com registro fictício temporário; somente esse registro foi removido ao final.
- Conferência visual em desktop e celular pendente.

Revisão da etapa 07: formulários pendentes precisam ser concluídos ou cancelados antes de salvar o conjunto. O descarte considera esses rascunhos e o navegador é instruído a avisar ao sair com alterações pendentes. Consulte o [guia de uso](guia-de-uso.md).

## Campos opcionais da etapa 08

- `pessoas[].simbolo`: `neutro`, `quadrado`, `circulo` ou `losango`. Ausente significa representação neutra.
- `vinculos[].situacao`: `juntos`, `separados` ou `divorciados`, exclusivo de `tipo: uniao`. Ausente significa união sem marca de separação ou divórcio.

Os campos opcionais são preservados ao salvar e reabrir; não há alteração no recurso MockAPI nem migração dos registros existentes. Situações conjugais em filiação e valores desconhecidos são rejeitados. Ver [decisão 002](decisoes/002-simbolos-e-situacao-conjugal.md).
