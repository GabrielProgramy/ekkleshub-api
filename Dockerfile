#Imagem base usada na construção da imagem da aplicação
FROM node:24.19-alpine

#Pasta de trabalho dentro do container, todos os comandos em sequência rodará aqui.
WORKDIR /app

# Copia os arquivos que descrevem as dependências do projeto
COPY package*.json ./

# Executa um comando enquanto a imagem está sendo construida.
RUN npm ci

# Copia o conteúdo do projeto para o workdir
COPY . .

# Porta que a aplicação espera utilizar no container, não publica a porta diretamente só cria uma documentação sobre
EXPOSE 3000

# Comando padrão de execução da aplicação
CMD ["npm","run","start:dev"]

