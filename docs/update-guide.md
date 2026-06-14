# Como Lançar uma Nova Versão

Este documento descreve o processo exato para o Desenvolvedor disparar uma nova atualização oficial para todos os usuários do **TBH Easy Market**. 

O sistema foi arquitetado usando **Electron-Builder** + **GitHub Actions**. Quando uma nova "Tag" é enviada, o GitHub automaticamente constrói os executáveis (`.exe` Instalador e Portátil) e os publica na aba de Releases. O aplicativo nos computadores dos jogadores detecta a nova versão e exibe um banner de atualização automática.

## Passo a Passo para Atualizar:

**1. Aumente a Versão no `package.json`**
Abra o arquivo `package.json` na raiz do projeto e altere o número da versão. 
*Exemplo: de `"1.0.0"` para `"1.1.0"`.*

**2. Faça o Commit das suas mudanças**
Adicione todos os arquivos modificados e faça um commit com a descrição do que foi feito.
```bash
git add .
git commit -m "feat: Adicionada nova funcionalidade X"
```

**3. Crie a Etiqueta (Tag) da Versão**
Crie uma Tag no Git exatamente com o prefixo `v` seguido do número que você colocou no `package.json`.
```bash
git tag v1.1.0
```

**4. Envie tudo para o GitHub (Push com Tags)**
Envie as suas mudanças e, o mais importante, envie a Tag para o GitHub. É a Tag que vai "acordar" os robôs do GitHub Actions.
```bash
git push origin main
git push --tags
```
*(Ou de forma combinada: `git push origin main --tags`)*

---

## O Que Acontece Depois?

- **No Servidor:** Vá para a aba **"Actions"** no seu repositório do GitHub. Você verá um robô trabalhando (geralmente leva de 3 a 5 minutos). Ele está rodando o `npm run dist` em um computador Windows alugado pela Microsoft.
- **Nas Releases:** Assim que o robô terminar, a aba **Releases** do seu repositório ganhará uma nova postagem oficial com os arquivos `TBH Easy Market Setup 1.1.0.exe` e `TBH Easy Market Portable 1.1.0.exe`.
- **No Site:** A Landing Page hospedada no GitHub Pages detectará imediatamente a nova versão via API e mudará os botões de Download para o novo link.
- **No App do Usuário:** Quem abrir o jogo a partir desse momento verá a fina barra vermelha no topo com a mensagem *"A new version of TBH Easy Market is available!"* e poderá baixar e instalar com um clique silencioso.

## Notas Técnicas:
- Não é necessário rodar o build localmente (`npm run dist`) a menos que você queira testar a compilação. O processo de lançamento oficial é **estritamente na nuvem** (CI/CD) para garantir arquivos limpos e consistentes.
- Se a versão for apenas um teste que você não quer lançar para o público, **NÃO crie a tag `vX.X.X`**. Faça apenas commits normais.
