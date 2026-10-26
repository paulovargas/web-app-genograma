# Roteiro do app de genograma

## Objetivo e escopo proposto

Construir um editor individual no navegador: criar um genograma, cadastrar pessoas, relacionar integrantes, visualizar o diagrama e salvar localmente.

O escopo abaixo é uma proposta inicial, que pode ser refinada antes de cada etapa. Autenticação, backend, compartilhamento, colaboração e exportação ficam para versões posteriores.

## Etapas

| Etapa | Entrega | Critérios de conclusão | Commit sugerido |
| --- | --- | --- | --- |
| 01 | Documentação inicial | README em português, escopo e roteiro registrados | `docs: define escopo e etapas do genograma` |
| 02 | Estrutura visual | Substituir tela padrão do Angular; criar área do editor e estado vazio; adaptar a celular e desktop | `feat: cria estrutura inicial do editor` |
| 03 | Pessoas | Adicionar, editar e remover pessoas em memória; validar nome; informar impactos da remoção | `feat: implementa cadastro de pessoas` |
| 04 | Vínculos | Criar e remover união e filiação; validar referências, duplicatas e ciclos de ancestralidade | `feat: implementa vinculos familiares` |
| 05 | Diagrama | Definir simbologia e tecnologia; renderizar pessoas e conexões com legenda; refletir edições | `feat: adiciona visualizacao do genograma` |
| 06 | Persistência | Salvar localmente e recuperar após recarregar; tratar dados inválidos e falha de armazenamento | `feat: adiciona persistencia local` |
| 07 | Revisão do fluxo | Validar fluxo completo, teclado, responsividade e mensagens; documentar uso e limitações | `docs: documenta primeiro fluxo completo` |

Situação: etapa 01 documentada; etapa 02 implementada, com validação visual e execução dos testes pendentes; etapa 03 implementada, com validação em navegador pendente; etapas 04 a 07 pendentes.

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
