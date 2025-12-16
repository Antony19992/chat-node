// chatbot.js
const { NlpManager } = require('node-nlp');
const fs = require('fs');
const path = require('path');

const DATASET_PATH = path.join(__dirname, 'intents.json');
const MODEL_PATH = path.join(__dirname, 'model.nlp');

const manager = new NlpManager({ languages: ['pt'], forceNER: true });

function normalizarTexto(texto) {
  if (!texto) return "";
  let t = texto.toLowerCase();
  t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  t = t.replace(/(.)\1{2,}/g, "$1$1");
  t = t.trim().replace(/\s+/g, " ");
  return t;
}

function carregarIntents() {
  const dataset = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf8'));
  for (const intent of dataset.intents) {
    const { tag, patterns, responses } = intent;
    patterns.forEach(p => manager.addDocument('pt', p, tag));
    responses.forEach(r => manager.addAnswer('pt', tag, r));
  }
}

async function trainIfNeeded() {
  if (fs.existsSync(MODEL_PATH)) {
    manager.load(MODEL_PATH);
  } else {
    carregarIntents();
    await manager.train();
    manager.save(MODEL_PATH);
  }
}

module.exports = { manager, normalizarTexto, trainIfNeeded };
