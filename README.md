# Gibi Diário — Volume 1 (versão de teste)

Aplicativo web instalável (PWA), pensado para celular em orientação vertical.

## Abrir no VS Code
1. Extraia `Gibi-Diario-Volume-1.zip`.
2. Abra a pasta `Gibi-Diario-Volume-1` no VS Code.
3. Instale a extensão **Live Server** (Ritwick Dey), se ainda não tiver.
4. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.

Não abra o HTML com duplo clique (`file://`), pois o índice JSON e o service worker precisam de um servidor local.

## Publicar no GitHub Pages
1. Crie um repositório no GitHub e envie os arquivos e pastas desta pasta para a raiz do repositório.
2. Em **Settings → Pages**, selecione a branch `main` e a pasta `/ (root)`.
3. Salve e aguarde o endereço publicado.
4. Abra o link pelo navegador do celular. Android: menu do navegador → Instalar app/Adicionar à tela inicial. iPhone: Safari → Compartilhar → Adicionar à Tela de Início.

## Conteúdo recebido
- 50 pastas numeradas (`1` a `50`), preservadas.
- 271 imagens em sequência, indexadas em `comics.json`.
- `Logo.jpg` usada como capa visual e base do ícone.
- Arquivos PWA: `manifest.webmanifest` e `service-worker.js`.

## Regra diária nesta versão de teste
A edição 1 começa em **20/11/2026** (data-base definida para teste). O número da edição avança um por dia, até a edição 50. A data-base pode ser alterada no início de `app.js` (`START_DATE`).

O leitor mostra todas as imagens da pasta da edição escolhida, em ordem numérica. Os controles permitem navegar no máximo duas edições antes/depois da edição do dia.

## Offline
O app shell fica disponível offline depois da primeira abertura com conexão. As páginas vistas são armazenadas automaticamente. Para baixar todas as imagens para leitura offline, use **Preparar quadrinhos para uso offline**. São aproximadamente 612 MB de imagens; confirme que há espaço no aparelho e Wi-Fi antes de baixar.

## Rodapé
- Créditos conforme texto fornecido.
- Site Renova-me Deus Meu.

## Observações
- O app não gera APK. A instalação é feita pelo navegador, como PWA.
- O GitHub Pages publica arquivos estáticos; o link funciona como site e instalação PWA.
