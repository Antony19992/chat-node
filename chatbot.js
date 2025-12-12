const { NlpManager } = require('node-nlp');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

// Caminhos
const DATASET_PATH = path.join(__dirname, 'intents.json');
const MODEL_PATH = path.join(__dirname, 'model.nlp');

// Função de normalização de texto
function normalizarTexto(texto) {
  if (!texto) return "";

  let t = texto.toLowerCase();
  t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  t = t.replace(/(.)\1{2,}/g, "$1$1"); // reduz repetições
  t = t.trim().replace(/\s+/g, " ");
  return t;
}

// Carregar dataset
const dataset = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf8'));

// Criar gerenciador (pt-BR)
const manager = new NlpManager({ languages: ['pt'], forceNER: true });

// Registrar intents dinamicamente
for (const intent of dataset.intents) {
  const { tag, patterns, responses } = intent;
  patterns.forEach(p => manager.addDocument('pt', p, tag));
  responses.forEach(r => manager.addAnswer('pt', tag, r));
}

async function trainIfNeeded() {
  if (fs.existsSync(MODEL_PATH)) {
    manager.load(MODEL_PATH);
    console.log('Modelo carregado do disco.');
  } else {
    console.log('Treinando modelo...');
    await manager.train();
    manager.save(MODEL_PATH);
    console.log('Modelo treinado e salvo.');
  }
}

async function startServer() {
  await trainIfNeeded();

  const app = express();
  app.use(bodyParser.json());

  // Endpoint principal
  app.post('/chat', async (req, res) => {
    const { message } = req.body;
    const entrada = normalizarTexto(message);
    const result = await manager.process('pt', entrada);
    const resposta = result.answer || 'Não entendi, pode reformular?';
    res.json({ reply: resposta });
  });

  // Endpoint de teste
  app.get('/', (_req, res) => {
    res.send('Chatbot em Node.js está rodando! Use POST /chat com { "message": "..." }');
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Erro ao iniciar servidor:', err);
});
