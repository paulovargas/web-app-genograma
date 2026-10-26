# Guia do primeiro fluxo do genograma

## Criar e salvar

1. Clique em **Adicionar pessoa**, preencha o nome e confirme em **Salvar**. Nascimento e indicação de falecimento são opcionais.
2. Cadastre outra pessoa. Nomes iguais são permitidos; use a identificação curta para distinguir os integrantes.
3. Em **Vínculos familiares**, selecione união ou filiação e as duas pessoas. Na filiação, escolha primeiro o responsável e depois o descendente.
4. Clique em **Adicionar vínculo**. O diagrama é atualizado automaticamente.
5. Informe o título e clique em **Salvar genograma**. Aguarde a mensagem **Genograma salvo na API**.

Salvar uma pessoa ou adicionar um vínculo atualiza o editor. Para gravar essas alterações na API, é necessário também clicar em **Salvar genograma**. Se houver um formulário em edição, conclua ou cancele o cadastro antes de salvar o conjunto. Para descartar a seleção de um vínculo ainda não adicionado, use **Limpar formulário**.

## Reabrir e continuar

Após recarregar a página, escolha o registro em **Genogramas salvos** e clique em **Abrir**. Pessoas, vínculos, título e diagrama serão recuperados. Os próximos salvamentos atualizarão esse registro.

**Novo** começa outro genograma sem excluir registros da API. Abrir outro registro ou iniciar um novo pede confirmação quando houver alterações ou formulários pendentes.

## Editar e remover

Use **Editar** na lista de pessoas e confirme em **Salvar**. A alteração aparece no diagrama.

**Remover** em uma pessoa informa quantos vínculos também serão removidos. Confirme apenas se desejar excluir o cadastro e essas conexões. Remover um vínculo preserva as pessoas. As exclusões só chegam à API ao salvar o genograma novamente.

## Explorar e usar o teclado

- O primeiro Tab da página alcança **Ir para o editor**; Enter leva o foco à área do genograma.
- Os campos possuem rótulos e os botões podem ser acionados pelo teclado.
- Use o zoom entre 50% e 150%, ou **Restaurar** para voltar a 100%.
- A área do diagrama aceita foco e rolagem pelas setas.
- A **Descrição textual do genograma** apresenta os nomes completos e as conexões.

## Evitar perda de alterações

O salvamento é manual. O indicador informa se há alterações ou formulários pendentes. Ao tentar fechar ou atualizar a página com trabalho pendente, o aplicativo solicita o aviso nativo do navegador. A exibição desse aviso depende das regras do navegador e não substitui o salvamento.

Erros de carregamento preservam o editor atual. Se a confirmação de salvamento falhar, confira a lista antes de repetir: a API pode ter recebido a gravação mesmo sem a resposta chegar ao navegador.

## Limitações desta versão

- MockAPI compartilhada, sem autenticação ou separação por usuário: usar apenas dados fictícios.
- Sem cache offline, salvamento automático, histórico ou resolução de edições simultâneas.
- Sem exportação, arraste dos cartões ou exclusão de genogramas remotos pela interface.
- Layout neutro com legenda própria, sem convenção clínica completa. Famílias extensas podem ter conexões sobrepostas.

## Revisão executada em 26/10/2026

- Fluxo integrado automatizado: cadastrar duas pessoas, adicionar filiação, salvar por POST, iniciar novo, abrir por GET e recuperar o diagrama.
- Testes de regras, falhas HTTP, dados inválidos, confirmação de descarte e exclusão em conjunto.
- Testes do bloqueio de salvamento com formulário pendente e do evento de aviso ao sair.
- Navegação real no Chrome: primeiro Tab, atalho para o editor, campo de nome, mensagem de formulário pendente e cancelamento da confirmação sem perder o formulário.
- Tela conferida em desktop e viewport de 390 × 844, com mensagens legíveis e sem rolagem horizontal da página. Console sem erros durante a revisão.
- Esta revisão usa HTTP simulado nos testes integrados e dados fictícios locais na inspeção visual. O teste de gravação real na API foi realizado na etapa 06 e está registrado em `persistencia-api.md`.

## Símbolos de pessoa e situações conjugais (etapa 08)

No cadastro ou na edição de uma pessoa, escolha o **Símbolo da pessoa**: neutro, quadrado, círculo ou losango. O símbolo aparece no cartão e a descrição textual informa a escolha. A opção neutra remove a representação adicional. Pessoas falecidas possuem indicação textual e X sobre o símbolo, quando há uma forma escolhida.

Ao adicionar uma união, escolha a **Situação conjugal**. Separação aparece com um traço diagonal e divórcio com dois traços na linha da união. Para mudar uma união existente, use **Alterar situação conjugal** na lista de vínculos. Não é necessário remover o vínculo nem as pessoas.

Clique em **Salvar genograma** para guardar essas escolhas na API. Registros antigos sem os campos novos continuam abrindo normalmente. O app registra uma situação atual por par de pessoas, sem histórico ou datas de mudança.
