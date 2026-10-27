# Guia do primeiro fluxo do genograma

## Criar e salvar

1. Clique em **Adicionar pessoa**, preencha o nome e confirme em **Salvar**. Nascimento e indicação de falecimento são opcionais.
2. Cadastre outra pessoa. Nomes iguais são permitidos; use a identificação curta para distinguir os integrantes.
3. Em **Vínculos familiares**, selecione união ou filiação e as duas pessoas. Na filiação, escolha primeiro o responsável e depois o descendente.
4. Clique em **Adicionar vínculo**. O diagrama é atualizado automaticamente.
5. Informe o título e clique em **Salvar genograma**. Aguarde a mensagem **Genograma salvo na API**.

Salvar uma pessoa ou adicionar um vínculo atualiza o editor. Para gravar essas alterações na API, é necessário também clicar em **Salvar genograma**. Se houver um formulário em edição, conclua ou cancele o cadastro antes de salvar o conjunto. Para descartar a seleção de um vínculo ainda não adicionado, use **Limpar formulário**.

## Reabrir e continuar

Ao reabrir no mesmo navegador e endereço, o rascunho local pendente é restaurado automaticamente. Para abrir um registro da API, escolha-o em **Genogramas salvos** e clique em **Abrir**. Pessoas, vínculos, título e diagrama serão recuperados. Os próximos salvamentos atualizarão esse registro.

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

O salvamento na API é manual; a cópia de recuperação neste navegador é automática. O indicador informa se há alterações ou formulários pendentes. Ao tentar fechar ou atualizar a página com trabalho pendente, o aplicativo solicita o aviso nativo do navegador. A exibição desse aviso depende das regras do navegador e não substitui o salvamento.

Erros de carregamento preservam o editor atual. Se a confirmação de salvamento falhar, confira a lista antes de repetir: a API pode ter recebido a gravação mesmo sem a resposta chegar ao navegador.

## Limitações desta versão

- MockAPI compartilhada, sem autenticação ou separação por usuário: usar apenas dados fictícios.
- Salvamento na API manual; recuperação local sem histórico, sincronização entre dispositivos ou resolução de edições simultâneas. A aplicação não possui garantia de carregamento offline.
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

## Adoção e acolhimento (etapa 09)

1. Em **Tipo de vínculo**, escolha **Filiação ou cuidado**.
2. Selecione o responsável e a pessoa vinculada.
3. Em **Modalidade do vínculo**, escolha **Filiação não especificada**, **Adoção** ou **Acolhimento**.
4. Clique em **Adicionar vínculo**. Adoção aparece como seta tracejada e acolhimento como seta pontilhada.
5. Para corrigir um vínculo existente, use **Alterar modalidade** na lista.
6. Clique em **Salvar genograma** para gravar na API.

O acolhimento é apresentado como vínculo de cuidado. Vínculos antigos continuam não especificados, sem inferência de origem biológica. A descrição textual também informa a modalidade. Veja a [decisão sobre adoção e acolhimento](decisoes/003-adocao-e-acolhimento.md).

## Vínculos emocionais (etapa 10)

1. Em **Tipo de vínculo**, escolha **Emocional**.
2. Selecione duas pessoas diferentes.
3. Escolha **Proximidade**, **Conflito** ou **Afastamento** em **Relação emocional**.
4. Clique em **Adicionar vínculo** para atualizar o diagrama.
5. Para mudar a relação, use **Alterar relação emocional** na lista.
6. Clique em **Salvar genograma** para persistir as alterações.

Esses vínculos podem coexistir com união, filiação, adoção ou acolhimento. Não alteram as gerações e não têm direção nesta versão. A legenda diferencia os padrões; a descrição textual informa as relações por extenso. É permitida uma relação emocional atual por par de pessoas. Veja a [decisão 004](decisoes/004-vinculos-emocionais.md).

## Recuperação automática (etapa 11)

Os dados do editor e os valores dos formulários alterados são copiados automaticamente para este navegador. Quando a cópia é atualizada, aparece **Alterações protegidas neste navegador**. Ao reabrir o app no mesmo endereço, título, pessoas, vínculos e formulários pendentes são restaurados, com o aviso **Rascunho recuperado**.

Conclua ou cancele os formulários e use **Salvar genograma** para enviar à API. Se a edição recuperada pertence a um registro existente, o salvamento atualiza esse mesmo registro. A cópia local é removida depois da confirmação da API.

Novo e abertura válida de outro registro descartam a cópia anterior após a confirmação. Falhas de rede mantêm o rascunho. Se o armazenamento local falhar, siga o aviso e salve na API. Uma cópia inválida é preservada e só é removida pela ação de descarte local, com confirmação.

Use o mesmo navegador, perfil e endereço. A cópia não acompanha outro dispositivo ou endereço e pode ser apagada ao limpar os dados do navegador. Evite editar em múltiplas abas simultaneamente: a cópia local não possui histórico nem mesclagem. Dados já perdidos antes da existência de uma cópia não podem ser recuperados por esta funcionalidade.


## Backup em arquivo (etapa 12)

1. Conclua ou cancele os formulários de pessoa e vínculo e informe um título.
2. Em **Backup em arquivo**, clique em **Exportar JSON** e guarde o arquivo baixado. Isso não salva na API nem remove o rascunho local.
3. Para recuperar uma cópia, selecione um arquivo exportado pelo app em **Importar JSON**. O limite é de 5 MiB.
4. Confira nome do arquivo, título, quantidade de pessoas e vínculos. **Cancelar** mantém o editor atual.
5. Confirme **Importar como novo genograma**. Essa ação substitui o editor e descarta formulários pendentes; o aviso informa quando há alterações não salvas.
6. A cópia importada fica protegida pela recuperação local. Clique em **Salvar genograma** para criar um registro novo na API.

O arquivo inclui símbolos, situações conjugais, modalidades e relações emocionais. Não inclui identificador da API, formulários em edição ou zoom. Arquivos inválidos, versões desconhecidas e vínculos inconsistentes são rejeitados antes de substituir o editor. Não há mesclagem com o genograma aberto. JSON bruto da API e o formato interno do rascunho não são backups importáveis.
