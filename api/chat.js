const { NlpManager } = require('node-nlp');
const fs = require('fs');
const path = require('path');

const DATASET_PATH = path.join(__dirname, '../../intents.json');
const MODEL_PATH = path.join(__dirname, '../../model.nlp');

const manager = new NlpManager({ languages: ['pt'], forceNER: true });

const dataset = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf8'));
for (const intent of dataset.intents) {
  const { tag, patterns, responses } = intent;
  patterns.forEach(p => manager.addDocument('pt', p, tag));
  responses.forEach(r => manager.addAnswer('pt', tag, r));
}

let trained = false;

async function trainIfNeeded() {
  if (fs.existsSync(MODEL_PATH)) {
    manager.load(MODEL_PATH);
  } else {
    await manager.train();
    manager.save(MODEL_PATH);
  }
  trained = true;
}

module.exports = async (req, res) => {
  if (!trained) await trainIfNeeded();

  if (req.method === 'POST') {
    const { message } = req.body;
    const entrada = message?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const result = await manager.process('pt', entrada);
    const resposta = result.answer || 'Não entendi, pode reformular?';
    res.status(200).json({ reply: resposta });
  } else {
    res.status(200).send('Chatbot em Node.js está rodando! Use POST /api/chat com { "message": "..." }');
  }
};
