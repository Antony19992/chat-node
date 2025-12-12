# Usar imagem oficial do Node.js (leve)
FROM node:20-alpine

# Definir diretório de trabalho dentro do container
WORKDIR /app

# Copiar arquivos de configuração primeiro (para aproveitar cache)
COPY package*.json ./

# Instalar dependências
RUN npm install --production

# Copiar o restante do código
COPY . .

# Definir variável de ambiente (opcional)
ENV NODE_ENV=production

# Comando padrão para iniciar o chatbot
CMD ["node", "chatbot.js"]
