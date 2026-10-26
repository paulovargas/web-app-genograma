# Decisão 005 — Recuperação automática de rascunhos

Data: 26/10/2026. Situação: implementada na etapa 11.

## Objetivo e armazenamento

Preservar o trabalho ainda não enviado à API usando `localStorage`, na chave `genograma.rascunho.v1`. A cópia é atualizada automaticamente após mudanças no editor e há uma captura final no evento de saída da página.

A estrutura contém versão, data ISO da atualização, título, pessoas, vínculos, identificador remoto, referência da última versão salva e valores dos formulários alterados de pessoa e vínculo. O identificador da pessoa em edição e o estado de alteração dos formulários também são preservados.

## Restauração

Na inicialização, a cópia é lida e validada antes da gravação automática começar. Os dados do genograma passam pela mesma validação usada na abertura da API; o título pode estar vazio porque o documento pode estar em edição. Os campos dos formulários são verificados separadamente e podem estar incompletos.

Uma cópia válida restaura o editor automaticamente, sem buscar ou sobrescrever um genograma remoto. A consulta da lista da API continua funcionando independentemente. O aviso de recuperação informa que o usuário ainda precisa salvar na API.

Preservar `idRemoto` evita criar outro registro por POST quando a edição recuperada pertence a um genograma existente. A referência da última versão salva mantém correta a indicação de alterações pendentes.

## Ciclo de vida

- Alterações de título, pessoas, vínculos e formulários alterados atualizam a cópia local.
- Ao salvar na API com sucesso e sem formulários pendentes, a cópia local deixa de ser necessária e é removida.
- Novo e abertura válida de outro registro descartam o rascunho anterior após a confirmação já existente.
- Falhas de abertura ou salvamento remoto mantêm o conteúdo atual e a recuperação local.
- Exclusões pendentes de confirmação, zoom e posição de rolagem não são restaurados.

## Falhas

Erros de leitura, gravação ou falta de espaço são exibidos. O editor e o salvamento na API continuam disponíveis. Uma cópia que não pôde ser lida não é sobrescrita nesta sessão.

JSON inválido, versões desconhecidas ou dados incoerentes não substituem o editor. A cópia inválida é preservada e bloqueia a gravação local até um descarte explícito com confirmação. Esse descarte remove somente a chave do rascunho, sem apagar registros da API.

## Limites

A recuperação funciona somente no mesmo navegador, perfil e origem. `localhost:4200`, `127.0.0.1:4200` e outra porta possuem armazenamentos separados. Limpar os dados do navegador, usar outro perfil ou a indisponibilidade do armazenamento impedem a recuperação.

Há uma cópia local atual por origem. Edições simultâneas em múltiplas abas podem sobrescrevê-la; não há mesclagem ou histórico. A funcionalidade não é backup remoto, sincronização ou garantia de disponibilidade offline da aplicação.

A recuperação protege alterações a partir desta implementação. Não recupera dados que já haviam sido perdidos sem uma cópia.

## Verificação

Testes usam armazenamento isolado e HTTP simulado para verificar reabertura, formulários, identificadores, limpeza de cópia, falhas de rede, dados inválidos, leitura bloqueada e falta de espaço. A conferência real no navegador usa um endereço de desenvolvimento separado para não misturar a cópia fictícia com a sessão de uso.
