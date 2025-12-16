# Chatbot Node.js com NLP

Este projeto é um chatbot em Node.js utilizando a biblioteca **node-nlp**, preparado para rodar em ambiente **serverless** na Vercel.

---

## 🚀 Estrutura do Projeto

- `chatbot.js` → módulo utilitário que contém:
  - Funções de normalização de texto
  - Carregamento de intents
  - Carregamento do modelo NLP
- `api/chat.js` → função serverless que expõe a API:
  - `GET /api/chat` → rota de teste
  - `POST /api/chat` → processa mensagens e retorna respostas
- `api/index.js` → rota raiz (`/`) para mensagem de boas-vindas
- `intents.json` → dataset de intents e respostas
- `model.nlp` → modelo treinado (gerado localmente e versionado no repositório)
- `train.js` → script para treinar o modelo localmente e gerar o arquivo `model.nlp`

---

## 🔄 Atualizando o Projeto

Sempre que **novas intents** forem adicionadas ou modificadas:

1. **Editar o arquivo `intents.json`**  
   - Adicione novos `patterns` e `responses` conforme necessário.

2. **Rodar o treinamento localmente (OBRIGATÓRIO)**  
   - Sempre execute:
     ```bash
     node train.js
     ```
   - Isso vai gerar/atualizar o arquivo `model.nlp`.

3. **Versionar o modelo**  
   - Certifique-se de que `model.nlp` está incluído no Git (não pode estar no `.gitignore`).
   - Faça commit e push das mudanças:
     ```bash
     git add intents.json model.nlp
     git commit -m "Atualiza intents e modelo NLP"
     git push
     ```

4. **Deploy automático na Vercel**  
   - A Vercel vai usar o `model.nlp` já treinado.
   - Em produção, **não há treinamento** (apenas carregamento do modelo).

---

## 🧪 Testando

- Localmente:
  - Treine com `node train.js`
  - Rode com `vercel dev` ou crie um `server.js` para testes locais
- Produção:
  - `GET https://seu-projeto.vercel.app/api/chat` → rota de teste
  - `POST https://seu-projeto.vercel.app/api/chat` → enviar `{ "message": "..." }`

---

## ⚠️ Observações Importantes

- O ambiente da Vercel é **somente leitura** → não é possível salvar `model.nlp` em produção.
- **Sempre rode `train.js` antes de subir qualquer atualização.**
- Se esquecer de rodar o `train.js` e subir o `model.nlp`, o chatbot não vai funcionar em produção.

---

## 📌 Fluxo Resumido

1. Editar `intents.json`  
2. **Rodar `node train.js` (sempre antes de subir)**  
3. Commitar `intents.json` + `model.nlp`  
4. Deploy automático na Vercel  
5. Testar em `/api/chat`
