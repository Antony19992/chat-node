const { NlpManager } = require('node-nlp');
const fs = require('fs');
const path = require('path');

// Caminhos
const DATASET_PATH = path.join(__dirname, 'intents.json');
const MODEL_PATH = path.join(__dirname, 'model.nlp');

// Função de normalização de texto
function normalizarTexto(texto) {
  if (!texto) return "";

  // Colocar em minúsculas
  let t = texto.toLowerCase();

  // Remover acentos
  t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Reduzir repetições de letras (ex.: oiiiiii -> oi)
  t = t.replace(/(.)\1{2,}/g, "$1$1"); 
  // regra: mantém no máximo 2 repetições

  // Remover espaços extras
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
  // Se existir modelo salvo, carregar; senão treinar
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

async function startConsole() {
  await trainIfNeeded();

  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('Chatbot iniciado. Digite sua mensagem (Ctrl+C para sair).');

  const loop = () => {
    rl.question('Você: ', async (texto) => {
      const entrada = normalizarTexto(texto);
      const res = await manager.process('pt', entrada);
      const resposta = res.answer || 'Não entendi, pode reformular?';
      console.log('Bot:', resposta);
      loop();
    });
  };

  loop();
}

startConsole().catch(err => {
  console.error('Erro ao iniciar chatbot:', err);
});
