#Imagem base da nova imagem
FROM node:24.19-alpine

#Pasta de trabalho dentro do container
WORKDIR /app

# Copia os arquivos que descrevem as dependências do projeto
COPY package*.json ./

# Executa um comando enquanto a imagem está sendo construida.
RUN npm ci

# Copia o conteúdo do projeto para o workdir
COPY . .

# Porta que a aplicação espera utilizar no container
EXPOSE 3000

CMD []

