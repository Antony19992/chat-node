// api/chat.js
import { NlpManager } from 'node-nlp';
import fs from 'fs';
import path from 'path';

const MODEL_PATH = path.join(process.cwd(), 'model.nlp');
let manager = null;

function carregarModelo() {
  if (!manager) {
    manager = new NlpManager({ languages: ['pt'], forceNER: true });
    manager.load(MODEL_PATH);
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // ou defina seu domínio específico
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Pré-flight para requisições OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Rota de teste
  if (req.method === 'GET') {
    res.status(200).json({ status: 'API do chatbot está ativa.' });
    return;
  }

  // Rota principal: POST /chat
  if (req.method === 'POST') {
    try {
      const { message } = req.body;
      if (!message) {
        res.status(400).json({ error: 'Mensagem não fornecida.' });
        return;
      }

      carregarModelo();
      const response = await manager.process('pt', message);
      const reply = response.answer || 'Desculpe, não entendi. Pode reformular?';

      res.status(200).json({ reply });
    } catch (err) {
      console.error('Erro no processamento:', err);
      res.status(500).json({ error: 'Erro interno no chatbot.' });
    }
    return;
  }

  // Método não permitido
  res.status(405).json({ error: 'Método não permitido.' });
}
