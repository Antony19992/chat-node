const { manager, normalizarTexto, trainIfNeeded } = require('../chatbot');

let trained = false;

module.exports = async (req, res) => {
  if (!trained) {
    await trainIfNeeded();
    trained = true;
  }

  // Rota de teste GET /
  if (req.method === 'GET' && req.url === '/') {
    res.status(200).send('Chatbot em Node.js está rodando! Use POST /chat com { "message": "..." }');
    return;
  }

  // Rota principal POST /chat
  if (req.method === 'POST') {
    const { message } = req.body;
    const entrada = normalizarTexto(message);
    const result = await manager.process('pt', entrada);
    const resposta = result.answer || 'Não entendi, pode reformular?';
    res.status(200).json({ reply: resposta });
    return;
  }

  // Qualquer outra rota
  res.status(404).send('Rota não encontrada');
};
