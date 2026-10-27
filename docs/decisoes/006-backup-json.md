# 006 — Backup portátil em JSON

Data: 27/10/2026. Situação: aceita.

## Decisão

Exportar um arquivo UTF-8 com envelope `formato: "genograma"`, `versao: 1`, `exportadoEm` em ISO e `genograma` contendo `titulo`, `pessoas` e `vinculos`. Todos os campos de domínio suportados são preservados. A extensão é `.json` e o tamanho máximo é de 5 MiB tanto na leitura quanto na exportação.

O arquivo não inclui identidade remota, referência da última gravação, formulários pendentes ou zoom. A exportação exige título válido e formulários concluídos ou cancelados. Baixar um backup não marca o editor como salvo na API.

A importação lê o arquivo localmente, aceita BOM UTF-8 e reutiliza a validação do contrato do genograma, incluindo referências, duplicatas e ciclos. Campos desconhecidos não são incorporados ao estado. Formato ou versão desconhecidos, JSON inválido, leitura malsucedida e excesso de tamanho preservam o editor atual.

Antes de aplicar, a interface apresenta arquivo, título e contagens. Cancelar mantém dados e formulários. Confirmar substitui o editor e limpa os formulários pendentes, com aviso quando há alterações não salvas. Não há mesclagem.

A cópia importada não tem identificador remoto. A importação não envia dados à API; o próximo salvamento manual cria outro registro por POST, preservando o original. A recuperação automática local protege a cópia após a confirmação.

## Limites

Somente o formato de backup versão 1 é importável; JSON bruto da API e o rascunho interno não são aceitos. O arquivo é uma fotografia dos dados cadastrados, sem histórico de versões. A exportação de imagem ou PDF continua fora desta etapa.

## Validação

Testes automatizados cobrem preservação dos símbolos e tipos de vínculo, isolamento da identidade remota, rejeição de dados inválidos, prévia e cancelamento, limite de tamanho, falha de leitura e integração com a recuperação automática.
