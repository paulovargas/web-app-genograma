# 007 — Impressão e PDF pelo navegador

Data: 27/10/2026. Situação: aceita.

## Decisão

Utilizar a impressão nativa do navegador para oferecer impressão e Salvar como PDF sem dependências adicionais. O botão aparece quando há pessoas no diagrama e exige título e formulários concluídos ou cancelados.

CSS de impressão prepara A4 em paisagem com margens de 10 mm e oculta navegação, cadastros, persistência, recuperação, controles de zoom e descrição expansível. A saída contém o título atual, SVG vetorial e legenda. O viewBox preserva o desenho completo; dimensões de impressão substituem o zoom sem alterar o estado do editor.

A janela de impressão permite escolher destino e cancelar. O aplicativo não sabe se o usuário concluiu a gravação, por isso não informa sucesso nem altera o estado de salvamento. Não há envio à API, exclusão do rascunho ou alteração dos dados.

## Limites

O destino PDF depende do navegador/sistema. Configurações escolhidas na janela podem substituir o tamanho, margens e escala sugeridos. Recomenda-se conferir a prévia, manter A4 em paisagem e desativar cabeçalhos e rodapés do navegador. Genogramas extensos são reduzidos e podem perder legibilidade; não há divisão em várias folhas nesta etapa. Títulos muito longos podem ocupar espaço adicional.

O PDF não substitui o backup JSON e não pode ser importado para edição. A representação e as limitações de sobreposição do diagrama existente são preservadas.