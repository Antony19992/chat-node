// api/chat.js
const { manager, normalizarTexto, trainIfNeeded } = require('../chatbot');

let trained = false;

module.exports = async (req, res) => {
  // Treina ou carrega o modelo apenas uma vez
  if (!trained) {
    await trainIfNeeded();
    trained = true;
  }

  // Rota de teste GET /api/chat
  if (req.method === 'GET') {
    res.status(200).send('Chatbot em Node.js está rodando! Use POST /api/chat com { "message": "..." }');
    return;
  }

  // Rota principal POST /api/chat
  if (req.method === 'POST') {
    const { message } = req.body || {};
    const entrada = normalizarTexto(message);
    const result = await manager.process('pt', entrada);
    const resposta = result.answer || 'Não entendi, pode reformular?';
    res.status(200).json({ reply: resposta });
    return;
  }

  // Qualquer outra rota/método
  res.status(404).send('Rota não encontrada');
};
