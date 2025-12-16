import { NlpManager } from 'node-nlp';

const manager = new NlpManager({ languages: ['pt'], forceNER: true });
manager.load('./model.nlp'); // modelo já treinado

// Memória de sessões (em RAM)
const sessions = {};

function getSession(userId) {
  if (!sessions[userId]) sessions[userId] = [];
  return sessions[userId];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({ status: 'API do chatbot com memória está ativa.' });
    return;
  }

  if (req.method === 'POST') {
    try {
      const { message, userId = 'anon' } = req.body;
      if (!message) {
        res.status(400).json({ error: 'Mensagem não fornecida.' });
        return;
      }

      const history = getSession(userId);
      history.push(message);

      // Usa as últimas 3 mensagens como contexto
      const context = history.slice(-3).join(' ');
      const response = await manager.process('pt', context);

      const reply = response.answer || 'Desculpe, não entendi. Pode reformular?';

      res.status(200).json({ reply });
    } catch (err) {
      console.error('Erro no chatbot:', err);
      res.status(500).json({ error: 'Erro interno no chatbot.' });
    }
    return;
  }

  res.status(405).json({ error: 'Método não permitido.' });
}
