# TBH Easy Market

**Descubra quanto vale o seu baú no TBH: Task Bar Hero sem abrir a Steam.**

Um app que roda no seu PC e mostra:

- 💰 **O valor total do seu inventário** (equipamentos + materiais), lido direto do save do jogo. Você não digita nada.
- 🔎 **Os preços do Mercado da Steam** de todos os itens, do mais caro pro mais barato, com busca instantânea.
- 🪙 Preço em **dólar e em real (R$)**.

Feito por **[EuSouOGiba](https://eusouogiba.com)** · [youtube.com/@eusouogiba](https://youtube.com/@eusouogiba)

![demo](docs/demo.png)

---

## ✅ É seguro? Vou tomar ban?

**Não.** Esse app **só LÊ arquivos** que já estão no seu computador. Ele:

- ✅ Lê uma **cópia** do save do jogo (na memória) só pra calcular o valor.
- ✅ Usa os mesmos endereços públicos de preço que o site da Steam usa.
- ❌ **NÃO** modifica o seu save.
- ❌ **NÃO** mexe no jogo enquanto ele roda (não injeta nada, não trapaceia).
- ❌ **NÃO** automatiza compra/venda.
- ❌ **NÃO** envia seus dados pra lugar nenhum (roda 100% no seu PC).

Ban acontece quando alguém **modifica** o save pra trapacear ou automatiza trocas. Nada disso é feito aqui. É leitura passiva, como abrir o arquivo no Bloco de Notas.

> ⚠️ Ainda assim, use por sua conta e risco. Este é um projeto da comunidade, sem vínculo com a Valve ou com os criadores do TBH.

---

## 🚀 Como instalar (passo a passo pra quem nunca programou)

### Passo 1 — Instalar o Node.js

O app precisa do **Node.js** (um programa gratuito que roda o código).

1. Acesse 👉 **https://nodejs.org**
2. Baixe a versão **"LTS"** (o botão verde da esquerda).
3. Instale clicando "Avançar / Next" até o fim.

### Passo 2 — Baixar este app

- Clique no botão verde **"Code"** aqui em cima nesta página → **"Download ZIP"**.
- Extraia o ZIP numa pasta fácil, ex: `C:\tbh-easy-market`.

### Passo 3 — Abrir e rodar

1. Entre na pasta que você extraiu.
2. **Dê dois cliques** no arquivo **`tbh-easymarket.bat`**.
3. Vai abrir uma janela preta (é normal!) e o app abre sozinho no seu navegador.

Pronto! 🎉 O seu baú aparece preenchido automaticamente.

> Da próxima vez, é só dar dois cliques no `tbh-easymarket.bat` de novo.

---

## 🆘 Deu erro? (problemas comuns)

| Problema | Solução |
|---|---|
| "node não é reconhecido" | Você não instalou o Node.js (Passo 1) ou precisa **reiniciar o PC** depois de instalar. |
| "save do TBH não encontrado" | Abra o TBH pelo menos uma vez pra ele criar o save. |
| "assets do TBH não encontrados" | O jogo está instalado num lugar diferente. Veja **"Steam em outra pasta"** abaixo. |
| Os nomes dos materiais não aparecem | Normal! Os nomes dos materiais são opcionais — veja a seção **"Mostrar nomes dos materiais"**. |
| A página não abre | Abra o navegador e digite: `http://localhost:5260` |

### Steam em outra pasta

O app procura o TBH automaticamente nos drives C, D, E… Se você instalou em um lugar incomum, descubra a pasta `TaskBarHero_Data` (clique direito no jogo na Steam → Gerenciar → Procurar arquivos locais) e rode assim, trocando o caminho:

```bat
set TBH_GAME_DIR=D:\MinhaPasta\TaskbarHero\TaskBarHero_Data
tbh-easymarket.bat
```

---

## 🔩 Mostrar os nomes dos materiais (opcional)

Os **equipamentos** (espadas, armaduras) já aparecem com preço sem configurar nada.

Os **materiais** (Void Iron, Phoenix Ash…) têm nome próprio guardado de forma compactada no jogo. Pra destravar os nomes deles, rode uma vez:

1. Instale o Python: 👉 https://www.python.org/downloads (marque "Add Python to PATH" na instalação).
2. Abra a janela preta na pasta do app e rode:
   ```bat
   pip install UnityPy
   npm run extract-tables
   ```
3. Reinicie o app. Agora os materiais aparecem com nome e preço também.

Sem isso, o app funciona normal — só não soma os materiais que têm nome próprio.

---

## 🛠️ Pra quem é técnico

- **Stack:** Node puro (sem dependências), servidor HTTP + UI HTML única. Python+UnityPy só pra extrair nomes de materiais (opcional).
- **Preços:** endpoints públicos `steamcommunity.com/market/search/render` e `/priceoverview`, com throttle e cache em disco.
- **Save:** Easy Save 3 (AES-128-CBC, PBKDF2-SHA1). A chave fica em texto plano nos assets do jogo e é auto-extraída.
- **Mapeamento item→preço:** tabela mestra dos assets (`ItemKey → grade/tipo/nível`) casa com o `type` do mercado; materiais via localização Unity.

### Gerar um ZIP para distribuição

Use `npm run build:zip`. O arquivo será criado em `dist/` com uma pasta raiz curta e versionada. O pacote não inclui `.git`, caches de desenvolvimento, screenshots ou documentação interna, evitando o erro `MAX_PATH` ao extrair no Windows.

---

## 📄 Licença

MIT — use, modifique e compartilhe à vontade. Se ajudar, deixa uma estrela ⭐ e se inscreve no canal!

**EuSouOGiba** · [youtube.com/@eusouogiba](https://youtube.com/@eusouogiba) · [eusouogiba.com](https://eusouogiba.com)
