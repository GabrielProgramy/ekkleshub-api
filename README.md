# EkklesHub API

API backend do EkklesHub, uma plataforma em desenvolvimento para apoiar a gestão de igrejas, membros e células.

O projeto está sendo construído como uma aplicação real e também como parte do meu portfólio de desenvolvimento backend, com foco em organização de código, regras de negócio, testes, documentação e infraestrutura.

## Status do projeto

🚧 Em desenvolvimento.

Atualmente, o projeto está na fase de configuração da estrutura inicial da API.

## Objetivos iniciais

- Gerenciar organizações e igrejas
- Cadastrar e acompanhar membros
- Gerenciar células e seus participantes
- Registrar o histórico de participação dos membros
- Implementar usuários e autenticação

## Tecnologias

- Node.js
- TypeScript
- NestJS
- PostgreSQL
- Docker

> Algumas tecnologias listadas ainda serão adicionadas durante o desenvolvimento.

## Como executar

Para a instalação e execução temos dois caminhos, um via Docker que é o mais recomendado e um para execução local sem Docker.


### Opção recomendada: Docker

#### Pré-requisitos
- Docker
- Docker Compose
- Git

1. Clone o repositório:
```bash
git clone https://github.com/GabrielProgramy/ekkleshub-api.git
```
2. Entre na pasta do projeto:
```bash
cd ekkleshub-api
```
3. Crie um arquivo .env a partir do .env.example.
   
4. Preencha as variáveis
   
5. Rode o comando para iniciar os serviços relacionados ao projeto (Banco e API):
```bash
docker compose up --build
```
A API só será iniciada após o banco de dados ficar saudável (healthy).

6. Para iniciar novamente containers já criados:
```bash
docker compose start
```
Para parar a execução use:
```bash
docker compose stop
```

7. Caso deseje encerrar o sistema, use o comando: 
```bash
docker compose down
```


### Execução local sem Docker

#### Pré-requisitos

- Node.js
- npm
- PostgreSQL
- Git

1. Clone o repositório:

```bash
git clone https://github.com/GabrielProgramy/ekkleshub-api.git
```
2. Entre na pasta do projeto:
```bash
cd ekkleshub-api
```
3. Instale as dependências:
```bash
npm install
```
4. Crie um arquivo .env a partir do .env.example.
   
5. Preencha as variáveis
   
6. Execute em modo de desenvolvimento:
```bash
npm run start:dev
```
7. A aplicação estará disponível em:
	http://localhost:3000

#### Observações
- Para utilizar o sistema terá que ter uma instância do Postgres rodando localmente;
- As credenciais e o nome do banco configurados no PostgreSQL devem corresponder às variáveis definidas no .env.

### Funcionalidades disponíveis
- Endpoint de verificação de saúde da API
- Gestão de organizações
- Gestão de igrejas
- Gestão de membros
- Gestão de células
- Autenticação e autorização

## Desenvolvimento

O desenvolvimento do projeto é organizado utilizando issues, branches e pull requests.

## Licença

Este projeto está licenciado sob a licença MIT.