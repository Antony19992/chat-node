const express = require('express');
const { NlpManager } = require('node-nlp');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
app.use(cors({
  origin: '*', // ou use o domínio do seu front-end para mais segurança
  methods: ['GET', 'POST', 'OPTIONS'],
}));


const app = express();
app.use(express.json());

// Caminhos corretos (sobem uma pasta para achar os arquivos na raiz)
const MODEL_PATH = path.join(__dirname, '..', 'model.nlp');
const INTENTS_PATH = path.join(__dirname, '..', 'intents.json');

// Cria o gerenciador NLP
const manager = new NlpManager({ languages: ['pt'], forceNER: true });

// Função para normalizar texto
function normalizarTexto(texto) {
  if (!texto) return "";
  let t = texto.toLowerCase();
  t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  t = t.replace(/(.)\1{2,}/g, "$1$1");
  t = t.trim().replace(/\s+/g, " ");
  return t;
}

// Carrega intents do arquivo JSON
function carregarIntents() {
  const dataset = JSON.parse(fs.readFileSync(INTENTS_PATH, 'utf8'));
  for (const intent of dataset.intents) {
    const { tag, patterns, responses } = intent;
    patterns.forEach(p => manager.addDocument('pt', p, tag));
    responses.forEach(r => manager.addAnswer('pt', tag, r));
  }
}

// Treina ou carrega modelo
async function trainIfNeeded() {
  if (fs.existsSync(MODEL_PATH)) {
    manager.load(MODEL_PATH);
    console.log("✅ Modelo carregado de", MODEL_PATH);
  } else {
    console.log("⚙️ Treinando modelo...");
    carregarIntents();
    await manager.train();
    manager.save(MODEL_PATH);
    console.log("✅ Modelo treinado e salvo em", MODEL_PATH);
  }
}

// Inicializa servidor
(async () => {
  await trainIfNeeded();

  app.post('/chat', async (req, res) => {
    const texto = normalizarTexto(req.body.message);
    const resposta = await manager.process('pt', texto);
    res.json({ reply: resposta.answer || "Não entendi 🤔" });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 API de chat rodando em http://localhost:${PORT}/chat`);
  });
})();
