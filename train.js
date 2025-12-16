// train.js
const { NlpManager } = require('node-nlp');
const fs = require('fs');
const path = require('path');

const DATASET_PATH = path.join(__dirname, 'intents.json');
const MODEL_PATH = path.join(__dirname, 'model.nlp');

async function main() {
  const manager = new NlpManager({ languages: ['pt'], forceNER: true });

  // Carregar intents
  const dataset = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf8'));
  for (const intent of dataset.intents) {
    const { tag, patterns, responses } = intent;
    patterns.forEach(p => manager.addDocument('pt', p, tag));
    responses.forEach(r => manager.addAnswer('pt', tag, r));
  }

  console.log('Treinando modelo...');
  await manager.train();
  manager.save(MODEL_PATH);
  console.log('Modelo treinado e salvo em', MODEL_PATH);
}

main().catch(err => console.error('Erro ao treinar modelo:', err));
