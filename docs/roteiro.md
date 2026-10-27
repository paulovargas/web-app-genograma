# Roteiro do app de genograma

## Objetivo e escopo proposto

Construir um editor individual no navegador: criar um genograma, cadastrar pessoas, relacionar integrantes, visualizar o diagrama e salvar na API de protótipo.

O escopo abaixo é uma proposta inicial, que pode ser refinada antes de cada etapa. Autenticação, backend próprio, colaboração e exportação ficam para versões posteriores. A persistência foi antecipada por solicitação do usuário e usa MockAPI.

## Etapas

| Etapa | Entrega | Critérios de conclusão | Commit sugerido |
| --- | --- | --- | --- |
| 01 | Documentação inicial | README em português, escopo e roteiro registrados | `docs: define escopo e etapas do genograma` |
| 02 | Estrutura visual | Substituir tela padrão do Angular; criar área do editor e estado vazio; adaptar a celular e desktop | `feat: cria estrutura inicial do editor` |
| 03 | Pessoas | Adicionar, editar e remover pessoas em memória; validar nome; informar impactos da remoção | `feat: implementa cadastro de pessoas` |
| 04 | Vínculos | Criar e remover união e filiação; validar referências, duplicatas e ciclos de ancestralidade | `feat: implementa vinculos familiares` |
| 05 | Diagrama | Definir simbologia e tecnologia; renderizar pessoas e conexões com legenda; refletir edições | `feat: adiciona visualizacao do genograma` |
| 06 | Persistência na API (antecipada) | Salvar e recuperar genogramas completos; tratar espera, erros, descarte e respostas inválidas | `feat: integra persistencia de genogramas com mockapi` |
| 07 | Revisão do fluxo | Validar fluxo completo, teclado, responsividade e mensagens; documentar uso e limitações | `fix: protege alteracoes pendentes e valida fluxo completo` |

Situação: etapas 01 a 04 implementadas; etapa 06 antecipada e implementada com MockAPI. Etapas 05 e 07 concluídas. Primeiro fluxo revisado, com suíte automatizada aprovada e conferência visual e de teclado no Chrome em desktop e celular de 390 px.

## Evoluções após o primeiro fluxo

| Etapa | Entrega | Critérios de conclusão | Commit sugerido |
| --- | --- | --- | --- |
| 08 | Símbolos e situações conjugais | Escolher quadrado, círculo ou losango; representar separação e divórcio; salvar e reabrir mantendo compatibilidade | `feat: amplia simbolos e situacoes conjugais` |
| 09 | Adoção e acolhimento | Criar e alterar modalidade, distinguir no diagrama e preservar na API com compatibilidade | `feat: adiciona adocao e acolhimento aos vinculos` |
| 10 | Vínculos emocionais | Proximidade, conflito e afastamento, edição, diagrama e persistência independentes de filiação | `feat: adiciona vinculos emocionais ao genograma` |
| 11 | Recuperação automática | Restaurar dados, contexto remoto e formulários alterados; tratar falhas e limpar cópias ao salvar ou trocar de genograma | `feat: adiciona recuperacao automatica de rascunhos` |
| 12 | Backup JSON | Exportar dados completos; validar arquivo, conferir e importar como cópia independente | `feat: adiciona exportacao e importacao de genogramas em json` |

## Modelo inicial proposto

- Genograma: identificador, título, pessoas e vínculos.
- Pessoa: identificador, nome, nascimento opcional e informação opcional de falecimento.
- Vínculo: identificador, tipo e referências às pessoas envolvidas.

A definição dos símbolos e dos dados necessários à representação de cada pessoa ocorrerá antes da implementação do diagrama.

## Regras propostas

- Nome obrigatório; pessoas com nomes iguais são permitidas.
- Vínculos devem apontar para pessoas existentes no mesmo genograma.
- Impedir vínculo de uma pessoa consigo mesma e vínculos duplicados.
- Na união, inverter a ordem das pessoas não cria um vínculo diferente.
- Na filiação, distinguir responsável e descendente e impedir ciclos de ancestralidade.
- Ao remover uma pessoa, informar os vínculos que também serão removidos.
- Permitir informações incompletas nos campos opcionais.

## Decisões em aberto

- Público principal e finalidade de uso.
- Convenção visual e tipos de vínculo necessários.
- Posicionamento manual ou organização automática.
- Quantidade esperada de pessoas por genograma.
- Necessidade futura de contas e sincronização.

Adoção, vínculos emocionais e situações conjugais adicionais precisam de requisitos próprios antes de entrar no escopo. Utilizar dados fictícios nos exemplos e testes versionados.

## Fluxo de trabalho no Git

1. Refinar o escopo da próxima etapa.
2. Implementar uma entrega pequena e verificável.
3. Executar as validações pertinentes e revisar o diff.
4. Atualizar este roteiro com a situação e as decisões da etapa.
5. Adicionar os arquivos da entrega explicitamente e criar um commit descritivo.

Formato: `tipo: descricao curta`, com descrição em português. Tipos: `docs`, `feat`, `fix`, `refactor`, `test` e `chore`. Uma etapa pode ter mais de um commit quando houver entregas independentes.

Antes de cada commit:

```bash
git status --short
git diff --check
git diff
```

Executar o build quando houver alterações na aplicação. Testar comportamentos relevantes de cadastro, exclusão, vínculos e persistência. Conferir visualmente alterações de interface em desktop e celular. Registrar comandos executados e limitações na entrega.

## Organização técnica

Preservar a configuração Angular existente e usar componentes standalone. Organizar por funcionalidade conforme o projeto crescer, separando modelos, apresentação e serviços. Evitar camadas vazias antecipadas.

Registrar decisões arquiteturais relevantes em `docs/decisoes/` quando forem tomadas, incluindo contexto, escolha, motivo e limitações. A escolha da tecnologia de diagrama pertence à etapa 05.

## Entrega da etapa 02 — 26/10/2026

- Tela padrão do Angular substituída pela estrutura inicial do editor.
- Lista de pessoas vazia, área do genograma e orientações iniciais em português.
- Layout com adaptações para telas de até 640px e 1000px.
- Link para pular ao editor, títulos semânticos e idioma `pt-BR`.
- Cadastro, vínculos, renderização do diagrama e persistência permanecem nas próximas etapas.
- Teste padrão atualizado para verificar o estado vazio e o acesso ao editor.

Validação executada:

- `npm.cmd run build`: passou sem avisos.
- `npm.cmd test -- --watch=false --browsers=ChromeHeadless`: compilou a suíte, mas o Chrome falhou na inicialização da GPU; nenhum resultado de teste confirmado.
- `git diff --check`: executado após a revisão dos arquivos.

Pendências de validação: executar a suíte em ambiente com ChromeHeadless funcional e conferir a tela no navegador em desktop e celular. As adaptações responsivas foram implementadas, mas ainda não verificadas visualmente.

No PowerShell deste ambiente, foi necessário usar `npm.cmd`, pois a política de execução bloqueia `npm.ps1`.

## Entrega da etapa 03 — 26/10/2026

- Componente de pessoas separado do layout, com modelo tipado e formulário reativo.
- Cadastro e edição em memória: nome obrigatório sem aceitar apenas espaços, nascimento opcional e indicação de pessoa falecida.
- Nomes iguais permitidos e identificadores distintos; edição preserva o identificador.
- Exclusão com confirmação e opção de cancelar. Ainda não existem vínculos para remover.
- Lista, contagem e mensagem de sucesso atualizadas após as operações.
- Aviso de perda de dados ao recarregar; persistência continua prevista na etapa 06.
- Testes adicionados para validação do nome, cadastro pelo formulário, nomes iguais, edição, cancelamento e exclusão confirmada.

Validação: build de produção e compilação TypeScript da suíte executados com sucesso. A conferência visual no navegador permanece pendente.

Commit sugerido: `feat: implementa cadastro de pessoas`.

A execução de `npm.cmd test -- --watch=false --browsers=ChromeHeadless` compilou a suíte, mas o ChromeHeadless falhou ao iniciar por erro de GPU no ambiente. Os testes ainda precisam ser executados em um navegador funcional. `npx.cmd tsc -p tsconfig.spec.json --noEmit` passou.

## Entrega da etapa 04 — 26/10/2026

- Estado de pessoas e vínculos centralizado em `GenogramaService`, compartilhado pelos componentes.
- Criação de união e filiação; filiação orientada do responsável ao descendente.
- Impedidos vínculos consigo mesmo, referências inexistentes, duplicatas e ciclos diretos ou indiretos de ancestralidade.
- União considera a ordem das pessoas indiferente. Múltiplos responsáveis são permitidos.
- Remoção de vínculo com confirmação, preservando as pessoas.
- Exclusão de pessoa informa a quantidade de vínculos afetados e remove essas conexões junto com o cadastro.
- Pessoas com nomes iguais podem ser diferenciadas pela identificação curta na lista e nas opções do formulário.
- Dados continuam apenas em memória; o diagrama permanece previsto para a etapa 05.

Validação:

- `npm.cmd run build`: passou sem avisos.
- `npx.cmd tsc -p tsconfig.spec.json --noEmit`: passou.
- `npm.cmd test -- --watch=false --browsers=ChromeHeadless`: suíte executada fora das restrições do sandbox, resolvendo a falha de inicialização do Chrome observada anteriormente.
- A conferência visual em desktop e celular continua pendente.

Decisão técnica: a busca de ciclos percorre apenas os vínculos de filiação, seguindo responsável → descendente. Uniões não definem ancestralidade.

Commit sugerido: `feat: implementa vinculos familiares`.

Resultado final da suíte: 14 testes passaram, incluindo os testes das etapas anteriores e a exclusão de pessoa com seus vínculos.

## Entrega da etapa 06 (antecipada) — 26/10/2026

A pedido do usuário, a persistência foi antecipada e passou a usar o recurso `genogramas` da MockAPI em lugar do armazenamento local inicialmente proposto.

- Salvamento manual: POST para criar e PUT para atualizar o registro aberto ou recém-criado.
- Lista de genogramas, abertura por identificador e criação de um novo editor vazio.
- Título obrigatório, indicador de alterações não salvas e confirmação antes de descartar o conteúdo atual.
- Editor bloqueado durante salvamento e abertura, evitando alterações concorrentes com a requisição.
- Falhas de rede e respostas inválidas preservam os dados locais. Validação de formato, referências, duplicatas e ciclos antes de abrir um registro.
- Formulários de pessoas e vínculos são reiniciados quando outro genograma é aberto.
- API sem autenticação e registros compartilhados; usar dados fictícios. Sem cache offline e sem exclusão remota pela interface.

Validação: build sem avisos; compilação TypeScript dos testes aprovada; 24 testes passaram no ChromeHeadless. Teste real de POST, GET e PUT com registro fictício temporário aprovado; registro de teste removido ao finalizar. `git diff --check` aprovado. Conferência visual ainda pendente.

Detalhes em [persistência pela API](persistencia-api.md).

Commit sugerido: `feat: integra persistencia de genogramas com mockapi`.

## Entrega da etapa 05 — 26/10/2026

- Diagrama SVG conectado ao estado compartilhado: cadastro, edição, exclusão e abertura pela API refletem na visualização.
- Organização automática por gerações usando os vínculos de filiação.
- Cartões neutros com nome, nascimento opcional e indicação de falecimento.
- União tracejada e filiação com seta, acompanhadas de legenda.
- Zoom de 50% a 150%, restauração da escala e área de rolagem com acesso por teclado.
- Descrição textual expansível para consultar pessoas e conexões com nomes completos.
- Escolha e limitações registradas na [decisão 001](decisoes/001-diagrama-svg.md).

Validação: build de produção sem avisos; 31 testes passaram no ChromeHeadless. Conferência visual no Chrome em desktop e viewport de 390 × 844 com pessoas fictícias, união e filiação. No celular, a largura do documento permaneceu em 390 px e a rolagem horizontal ficou contida na área do diagrama. Zoom de 50% conferido. Os dados fictícios dessa conferência ficaram apenas no editor, sem gravação na API.

Commit sugerido: `feat: adiciona visualizacao do genograma`.

## Entrega da etapa 07 — 26/10/2026

Primeiro fluxo completo revisado e documentado no [guia de uso](guia-de-uso.md).

Correções encontradas durante a revisão:

- Formulários ainda em edição não são silenciosamente omitidos pelo salvamento do genograma; a interface orienta concluir ou cancelar.
- A confirmação de descarte também considera rascunhos de pessoas e vínculos.
- Aviso nativo ao fechar/atualizar com alterações ou formulários pendentes.
- Indicador do cabeçalho distingue novo genograma, alterações pendentes e versão salva.
- Iniciar novo cadastro de pessoa cancela a confirmação de exclusão anterior.
- Formulário de vínculo pode ser limpo sem adicionar a conexão.
- Texto de nomes limitado visualmente à área do cartão, preservando o nome completo no título e na descrição textual.

Validação: testes integrados do fluxo completo com API simulada; verificações de teclado e mensagens no Chrome; layout revisado em desktop e 390 × 844; console sem erros. Não houve gravação nem alteração de registros reais da MockAPI nesta revisão.

Commit sugerido: `fix: protege alteracoes pendentes e valida fluxo completo`.

Resultado final da validação da etapa 07:

- `npm.cmd run build`: aprovado sem avisos.
- `npx.cmd tsc -p tsconfig.spec.json --noEmit`: aprovado.
- `npm.cmd test -- --watch=false --browsers=ChromeHeadless`: 36 testes aprovados.
- `git diff --check`: aprovado.

## Entrega da etapa 08 — 26/10/2026

Escopo escolhido pelo usuário: quadrado, círculo, losango, separação e divórcio.

- Símbolo selecionável no cadastro e na edição, mantendo opção neutra.
- Situação conjugal ao criar uma união ou editar sua situação pela lista.
- Diagrama com formas, indicação de falecimento e marcações de um ou dois traços para separação ou divórcio.
- Legenda, descrição textual, modelos e validação de dados atualizados.
- Uma união por par, independente da situação; filiação preserva suas regras de ancestralidade.
- Persistência dos novos campos opcionais e abertura de registros antigos sem migração.
- Conferência visual no Chrome com três pessoas fictícias, separação e divórcio; mudança pela lista e layout de 390 × 844 verificados, sem alargar a página nem apresentar erros no console. Os dados de conferência ficaram locais, sem alteração dos registros da API.

Decisão registrada em [símbolos e situação conjugal](decisoes/002-simbolos-e-situacao-conjugal.md).

Commit sugerido: `feat: amplia simbolos e situacoes conjugais`.

Situação da etapa 08: concluída.

Validação final:

- `npm.cmd run build`: aprovado sem avisos.
- `npm.cmd test -- --watch=false --browsers=ChromeHeadless`: 44 testes aprovados, incluindo gravação e reabertura dos novos campos com HTTP simulado.
- Compilação TypeScript da suíte aprovada.
- `git diff --check`: aprovado.

## Entrega da etapa 09 — 26/10/2026

Situação: concluída. Escopo: adoção e acolhimento; relações emocionais ficam para uma próxima ampliação.

- Modalidade selecionável na criação e alteração pela lista, preservando o vínculo.
- Adoção com seta tracejada, acolhimento com seta pontilhada, legenda e descrição textual atualizadas.
- Acolhimento apresentado como cuidado; vínculos antigos não recebem natureza biológica presumida.
- Regras de referências, duplicatas e ciclos mantidas para todas as modalidades direcionadas.
- Persistência do campo opcional, com abertura de registros antigos sem migração ou regravação automática.
- Decisão registrada em [adoção e acolhimento](decisoes/003-adocao-e-acolhimento.md).

Validação: `npm.cmd run build` sem avisos; `npx.cmd tsc -p tsconfig.spec.json --noEmit` aprovado; `npm.cmd test -- --watch=false --browsers=ChromeHeadless` com 51 testes aprovados; `git diff --check` aprovado. Testes incluem salvamento e reabertura com HTTP simulado. Conferência no Chrome em desktop e viewport de 390 × 844, incluindo criação e alteração de modalidade, sem alargar a página e sem erros no console. Dados de conferência locais e fictícios; registros existentes da API não foram alterados.

Commit sugerido: `feat: adiciona adocao e acolhimento aos vinculos`.

## Entrega da etapa 10 — 26/10/2026

Situação: concluída. Vínculos emocionais de proximidade, conflito e afastamento.

- Criação e alteração da relação pela lista, com preservação do identificador.
- Vínculos simétricos: uma relação emocional atual por par, sem duplicata com a ordem invertida.
- Coexistência com união e filiação/cuidado; referências e exclusão em conjunto preservadas.
- Diagrama sem setas para relações emocionais, com linha dupla, marca de conflito ou pontilhado, além de legenda e descrição textual.
- Relações emocionais não alteram níveis de gerações nem participam da validação de ciclos de filiação.
- Persistência do tipo e da relação na API, com compatibilidade dos registros antigos.
- Decisão registrada em [vínculos emocionais](decisoes/004-vinculos-emocionais.md).

Validação: `npm.cmd run build` aprovado sem avisos; `npx.cmd tsc -p tsconfig.spec.json --noEmit` aprovado; `npm.cmd test -- --watch=false --browsers=ChromeHeadless` com 58 testes aprovados; `git diff --check` aprovado. Testes cobrem regras, visualização e salvamento/reabertura com HTTP simulado. Interface conferida no Chrome em desktop e viewport de 390 × 844, incluindo edição pela lista, sem alargar a página e sem erros no console. Dados fictícios usados apenas no editor, sem alteração dos registros existentes da API.

Commit sugerido: `feat: adiciona vinculos emocionais ao genograma`.

## Entrega da etapa 11 — 26/10/2026

Situação: concluída. Recuperação automática de rascunhos no navegador.

- Cópia local versionada de título, pessoas, vínculos, contexto remoto e formulários alterados.
- Restauração automática com validação antes de iniciar a gravação do novo estado.
- Preservação do identificador remoto e do estado de alterações, evitando POST indevido após recuperar edição de registro existente.
- Cópia removida após salvar na API, iniciar novo ou abrir outro registro válido. Falhas remotas preservam o rascunho atual.
- Avisos para armazenamento indisponível, leitura bloqueada, falta de espaço e cópia inválida. Cópia inválida preservada até descarte explícito com confirmação.
- Captura final ao sair e preservação de formulários de pessoa e vínculo ainda não concluídos.
- Decisão registrada em [recuperação automática](decisoes/005-recuperacao-automatica.md).

Conferência no Chrome em endereço local separado (`127.0.0.1:4201`), com restauração em nova inicialização de título, duas pessoas, união e ambos os formulários em edição. Layout conferido em desktop e 390 × 844, sem alargar a página e sem erros no console. Os dados fictícios foram descartados nas duas abas de conferência. Nenhum registro da API foi criado ou alterado.

Commit sugerido: `feat: adiciona recuperacao automatica de rascunhos`.

Validação final da etapa 11: `npm.cmd run build` aprovado sem avisos; compilação TypeScript da suíte aprovada; `npm.cmd test -- --watch=false --browsers=ChromeHeadless` com 71 testes aprovados; `git diff --check` aprovado. Os testes incluem recuperação de dados e formulários, contexto remoto, captura ao sair, limpeza após salvar/descartar/trocar documento, falhas de rede, leitura bloqueada, quota e preservação de cópia inválida.


## Entrega da etapa 12 — 27/10/2026

Situação: concluída. Exportação e importação de backups JSON versionados.

- Download com nome derivado do título e limite de 5 MiB; formulários pendentes bloqueiam a exportação.
- Validação de formato, versão, pessoas, vínculos, referências, duplicatas e ciclos antes de alterar o editor.
- Prévia com título e quantidades, confirmação de substituição e cancelamento sem perda do conteúdo atual.
- Importação como novo genograma, sem identidade remota e sem envio automático à API; recuperação local protege a cópia aplicada.
- Decisão registrada em [backup JSON](decisoes/006-backup-json.md).

Validação: build aprovado sem avisos, compilação TypeScript da suíte aprovada e 82 testes aprovados em ChromeHeadless. Testes incluem ida e volta dos dados, arquivos inválidos, limite de tamanho, erro de leitura, cancelamento, formulários pendentes, importação sem sobrescrever o registro remoto e recuperação local. A conferência manual da seleção de arquivo ficou limitada pelo bloqueio de acesso a arquivos da extensão do Chrome; permissões não foram alteradas. Nenhum registro remoto foi criado ou alterado na conferência.

Commit sugerido: `feat: adiciona exportacao e importacao de genogramas em json`.
