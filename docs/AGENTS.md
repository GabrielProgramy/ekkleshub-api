# AGENTS.md — EkklesHub

> Contexto compartilhado para agentes de IA que trabalhem neste repositório.
> Este documento é independente de fornecedor e pode ser usado por Codex, Claude Code, Cursor, Copilot, Gemini Code Assist ou outros agentes com acesso ao projeto.

## 1. Propósito deste documento

Este arquivo existe para evitar que um agente comece o projeto “do zero” a cada nova sessão.

Antes de alterar código:

1. leia este arquivo;
2. leia a issue atual;
3. inspecione o código existente relacionado à tarefa;
4. preserve decisões arquiteturais já tomadas;
5. não invente regras de negócio que ainda não foram definidas.

Quando houver conflito entre fontes, use esta prioridade:

1. decisão explícita mais recente do mantenedor;
2. issue atualmente em desenvolvimento;
3. código já consolidado na branch principal;
4. documentação em `docs/`;
5. este arquivo.

Se ainda houver ambiguidade relevante, destaque-a antes de introduzir uma regra nova.

---

## 2. Visão do projeto

**EkklesHub** é uma plataforma open source e gratuita de gestão para igrejas/ministérios cristãos.

O projeto também funciona como projeto profissional de portfólio do mantenedor, com foco em demonstrar capacidade real de desenvolvimento backend: modelagem de domínio, APIs REST, banco relacional, testes, migrations, Docker, autenticação, autorização e regras de negócio.

### Princípio de implantação

EkklesHub **não é multi-tenant**.

Cada ministério/instituição instala sua própria instância da aplicação e possui seu próprio banco de dados.

Portanto:

- uma instalação representa exatamente um ministério;
- não criar `tenant_id`;
- não projetar isolamento entre organizações dentro da mesma instância;
- `CHURCH` representa as igrejas/unidades pertencentes ao mesmo ministério.

O sistema deve ser utilizável de forma **self-hosted**.

---

## 3. Stack atual

Backend:

- Node.js
- TypeScript
- NestJS

Persistência:

- PostgreSQL
- TypeORM
- migrations como fonte de verdade do schema
- `synchronize: false`

Validação:

- `class-validator`
- `class-transformer`
- `ValidationPipe` global com `whitelist: true` e `transform: true`

Infraestrutura/desenvolvimento:

- Docker
- Docker Compose
- Git/GitHub

Testes:

- Jest
- Nest `TestingModule`
- testes unitários com dependências mockadas

O foco tecnológico atual é **TypeScript + Node.js**.

---

## 4. Filosofia de desenvolvimento

### 4.1 Processo no GitHub

Fluxo preferido:

`Issue -> branch -> implementação/testes -> commits -> push -> Pull Request -> self-review -> squash merge -> main`

Convenções observadas:

- branches descritivas, normalmente `feat/...`;
- commits pequenos e semanticamente coerentes;
- títulos próximos de Conventional Commits;
- PR deve usar `Closes #N` quando conclui uma issue.

Exemplos de commits aceitos:

- `feat: implementar atualização e exclusão de perfis de acesso`
- `test: adicionar cenários de criação de usuários`
- `refactor: renomear delete para deleteOne no serviço de perfis de acesso`
- `fix: preservar permissões existentes ao atualizar perfil de acesso`

Não agrupar alterações não relacionadas no mesmo commit.

### 4.2 Estratégia de testes

O projeto está adotando TDD de forma prática sempre que possível:

`Red -> Green -> Refactor`

O teste deve priorizar **comportamento**, não detalhes internos de implementação.

Exemplo:

- preferir testar o estado final salvo;
- evitar prender o teste a chamadas internas como `repository.merge()` se isso não fizer parte do contrato;
- interações com mocks são úteis quando representam uma responsabilidade real do SUT.

#### Isolamento

Em testes unitários:

- Service em teste = real.
- Repository = mock.
- Outro service usado como dependência = mock.

Exemplo atual:

`Service real -> Repository mock -> OutroService mock`

Não instanciar `OutroService` real dentro do teste unitário de `Service`.

Controllers:

`Controller real -> Service mock`

Controllers não devem duplicar testes de regras de negócio já cobertas no service.

---

## 5. Arquitetura geral

Padrão atual:

`Controller -> Service -> Repository -> PostgreSQL`

### Controller

- recebe parâmetros, body e path;
- delega ao service;
- define status HTTP;
- não concentra regra de negócio.

### Service

- regras de negócio;
- coordenação entre módulos;
- validações dependentes de estado persistido;
- erros de domínio via exceptions do Nest quando apropriado.

### Repository / TypeORM

- persistência;
- consultas;
- constraints importantes devem existir também no banco quando possível.

### DTO

- contrato de entrada;
- validação estrutural e de formato via `class-validator`.

### Entity

- representação persistida;
- não colocar validações de entrada de API na entity.

---

## 6. Decisões de persistência

### Migrations

Migrations são a fonte de evolução do schema.

- `synchronize: false`;
- runtime usa `autoLoadEntities: true`;
- CLI possui `DataSource` próprio;
- novas entities precisam ser conhecidas pelo DataSource da CLI.

Migrations podem conter:

- DDL para schema;
- DML para seeds/dados iniciais.

Quando estrutura e dados iniciais forem responsabilidades distintas, preferir migrations separadas.

### Regras em duas camadas

Quando uma constraint é crítica:

1. o service pode realizar uma checagem para retornar um erro amigável;
2. o banco deve proteger a integridade quando possível.

Exemplo já adotado: unicidade da igreja matriz e unicidade do nome de AccessProfile.

---

## 7. Domínio: Church

`CHURCH` representa tanto a matriz quanto congregações.

### Tipos

- `HEADQUARTERS`
- `CONGREGATION`

### Status

- `ACTIVE`
- `CLOSED`

### Regras

- deve existir no máximo uma `HEADQUARTERS` por instalação;
- congregações podem existir em quantidade múltipla;
- toda igreja criada inicia `ACTIVE`;
- `type` não é alterado pelo update genérico;
- não existe hard delete de Church;
- fechamento é feito mudando status para `CLOSED`;
- fechamento deve ser idempotente;
- histórico não deve ser perdido.

A unicidade da matriz é protegida:

- no service, para erro amigável;
- no PostgreSQL, por índice único parcial.

### Endereço

Address é embedded object na entity Church e fica achatado na tabela.

Campos definidos no domínio:

- street
- number
- city
- state
- complement opcional
- zip_code

DTOs aninhados usam `@ValidateNested()` + `@Type(...)`.

---

## 8. Domínio: AccessProfile

O módulo de perfis de acesso foi concluído antes da issue de usuários.

### Persistência

`AccessProfile` possui:

- `id: UUID`
- `name`
- `permissions: jsonb`
- `created_at`
- `updated_at`

`name` é único.

### Permission modules atuais

- `CHURCHES`
- `MEMBERS`
- `USERS`
- `ACCESS_PROFILES`
- `PASTORAL_LEADERSHIP`
- `AUDIT`

### Permission levels

- `FULL`
- `READ`
- `NONE`

### Permission scopes

- `GLOBAL`
- `OWN_CHURCH`

A tipagem usa a ideia:

`Record<PermissionModule, ModulePermission>`

onde `ModulePermission` possui:

- `permission`
- `scope`

### Interpretação importante

**Permission** responde:

> o que pode fazer?

**Scope** responde:

> em quais dados / onde pode fazer?

Exemplo:

`FULL + OWN_CHURCH`

significa acesso total permitido naquele módulo, porém limitado à igreja própria.

A enforcement real desses escopos pertence principalmente à issue de autorização (#11), não ao módulo de AccessProfile.

### Perfis básicos

A instalação recebe inicialmente:

#### OWNER

- CHURCHES: FULL / GLOBAL
- MEMBERS: FULL / GLOBAL
- USERS: FULL / GLOBAL
- ACCESS_PROFILES: FULL / GLOBAL
- PASTORAL_LEADERSHIP: FULL / GLOBAL
- AUDIT: FULL / GLOBAL

#### ADMIN

- CHURCHES: FULL / GLOBAL
- MEMBERS: FULL / GLOBAL
- USERS: FULL / GLOBAL
- ACCESS_PROFILES: READ / GLOBAL
- PASTORAL_LEADERSHIP: FULL / GLOBAL
- AUDIT: NONE / GLOBAL

#### SHEPHERD

- CHURCHES: FULL / OWN_CHURCH
- MEMBERS: FULL / OWN_CHURCH
- USERS: FULL / OWN_CHURCH
- ACCESS_PROFILES: READ / GLOBAL
- PASTORAL_LEADERSHIP: NONE / GLOBAL
- AUDIT: NONE / GLOBAL

#### SECRETARY

- CHURCHES: READ / OWN_CHURCH
- MEMBERS: FULL / OWN_CHURCH
- USERS: NONE / OWN_CHURCH
- ACCESS_PROFILES: NONE / GLOBAL
- PASTORAL_LEADERSHIP: NONE / GLOBAL
- AUDIT: NONE / GLOBAL

Esses perfis são **defaults/sugestões da instalação**, não papéis imutáveis do produto.

A pessoa responsável pela instalação pode:

- renomear;
- alterar permissões;
- criar perfis próprios;
- excluir perfis quando não houver impedimento relacional.

Não transformar `OWNER`, `ADMIN`, `SHEPHERD` e `SECRETARY` em um enum rígido de role sem uma nova decisão explícita.

### Update parcial de permissions

Atualizações parciais devem preservar módulos não enviados.

Exemplo:

se apenas `ACCESS_PROFILES` for atualizado, `CHURCHES`, `MEMBERS`, `USERS`, etc. devem permanecer.

O service atual faz merge no nível dos módulos do JSON.

### Delete

No estado atual, delete de AccessProfile é idempotente:

- se existir, remove;
- se não existir, não é necessário revelar essa informação.

Quando usuários estiverem relacionados a perfis, um perfil em uso não deve ser removido. Essa proteção depende da modelagem de User.

---

## 9. Domínio: User — issue atual

### Estado atual

Issue em desenvolvimento:

**#9 — `feat: implementar gerenciamento de usuários`**

Branch atual observada no GitHub:

**`feat/usuarios`**

A branch já possui:

- estrutura do módulo `users`;
- entity inicial;
- controller inicial;
- service ainda sem implementação relevante;
- testes iniciais, especialmente cenários de criação.

A estratégia atual é escrever os comportamentos esperados antes de implementar as regras.

### Objetivo da issue #9

Permitir cadastro e gerenciamento das pessoas que acessarão o sistema.

Escopo:

- cadastrar usuários;
- associar perfil de acesso;
- permitir vínculo opcional com igreja;
- permitir usuário de escopo geral;
- permitir vínculo opcional com membro;
- ativar/inativar;
- garantir unicidade de email;
- armazenar senha de forma segura;
- validações e testes.

### Modelo previsto para APP_USER

Conceitualmente:

- `id`
- `access_profile_id`
- `church_id` opcional
- `member_id` opcional
- `name`
- `email`
- `password` somente hash
- `status`
- `last_access_at` opcional
- timestamps

Um usuário da aplicação **não precisa ser membro**.

`church_id` opcional é usado para representar usuário de escopo geral versus vínculo com igreja.

### Criação de usuário — regras definidas até agora

Dados de entrada planejados:

- name
- email
- password
- access profile
- church opcional
- member opcional

Fluxo de criação definido:

1. verificar se já existe usuário com o email;
2. validar o AccessProfile usando `AccessProfileService`;
3. aplicar a regra especial de OWNER;
4. gerar hash da senha antes de persistir;
5. criar usuário com status inicial apropriado;
6. salvar somente depois que as validações passarem.

#### Regra de email

Email de usuário deve ser único.

A proteção amigável fica no service; a proteção de banco deverá existir também na modelagem/migration.

#### Regra de AccessProfile

`UsersService` deve usar **`AccessProfileService`**, e não acessar diretamente o repository de AccessProfile para regras pertencentes ao domínio de perfil.

Exemplo:

`UsersService -> AccessProfileService -> AccessProfileRepository`

#### Regra de OWNER

Não é proibido criar um OWNER.

A regra correta é:

> somente um usuário da instalação pode possuir o perfil OWNER ao mesmo tempo.

Portanto:

- primeiro OWNER pode ser criado;
- tentativa de criar um segundo OWNER deve ser bloqueada.

A regra pertence ao domínio de Users porque trata da quantidade de usuários associados ao perfil OWNER.

Não confundir:

- “existe um AccessProfile chamado OWNER”
- com
- “já existe um usuário usando o perfil OWNER”.

#### Hash de senha

Senha nunca deve ser persistida em texto puro.

O comportamento obrigatório é:

- receber senha em texto na entrada;
- gerar hash;
- persistir apenas o hash.

Nunca retornar ou logar senha, hash sensível, token ou segredo desnecessariamente.

### Testes de criação já planejados

Os cenários iniciais definidos são:

1. cadastro válido;
2. email já cadastrado -> conflito;
3. AccessProfile inexistente -> erro de recurso inexistente;
4. segundo usuário OWNER -> conflito.

Ao usar o mesmo `repository.exists()` para consultas diferentes no mesmo teste, configurar retornos sequenciais quando necessário.

Exemplo conceitual da regra OWNER:

- `exists(email)` -> false
- `findOneOrFail(accessProfile)` -> OWNER
- `exists(user owner)` -> true
- resultado -> ConflictException
- `save` não deve ocorrer

### CRUD inicial previsto

Além de create:

- `findAll`
- `findOne` / `findOneOrFail`
- update
- inativação

A aplicação tende a preferir **inativação** a exclusão destrutiva de usuários.

---

## 10. Módulos previstos no MVP

### #10 — autenticação de usuários

- autenticar credenciais;
- mecanismo de autenticação;
- logout/encerramento de sessão;
- atualizar último acesso;
- proteger rotas privadas;
- impedir login/acesso de usuário inativo;
- testes.

### #11 — autorização por perfil e igreja

- verificar permissões do perfil;
- aplicar escopo GLOBAL ou de igreja;
- impedir acesso de usuário local a dados indevidos;
- permitir acesso geral quando autorizado;
- testes positivos e negativos.

Autenticação responde **quem é o usuário**.

Autorização responde **o que ele pode fazer e acessar**.

### #12 — membros

- CRUD de membros;
- associação obrigatória a Church;
- inativação sem apagar histórico;
- escopo conforme usuário;
- testes.

### #13 — jornada do membro

- histórico cronológico;
- usuário responsável;
- acontecimentos importantes;
- registros não devem ser alterados indevidamente.

### #14 — transferência de membros

- alterar igreja atual;
- validar origem/destino;
- respeitar permissões;
- registrar transferência na jornada;
- preservar histórico.

### #15 — liderança pastoral

- líder principal;
- co-líder opcional;
- mesma pessoa não pode ocupar ambas posições;
- períodos históricos;
- vínculos com membros.

### #16 — auditoria

- usuário;
- operação;
- recurso;
- resource_id;
- estado anterior/novo quando necessário;
- sem informações sensíveis;
- registros imutáveis.

### #17 — padronização de validações e erros

- formato consistente;
- recursos inexistentes;
- conflitos;
- não autorizado;
- não expor detalhes internos.

### #18 — testes de fluxos principais do MVP

Integração/E2E dos fluxos principais.

### #19 — documentação de instalação e uso

Deve permitir que outra pessoa:

- configure ambiente;
- rode Docker;
- execute migrations;
- inicialize o sistema;
- execute testes;
- entenda endpoints e limitações.

---

## 11. Modelos de domínio previstos

### MEMBER

Campos conceituais:

- id
- church_id
- full_name
- birth_date
- marital_status
- phone
- email
- address
- baptism_date
- member_since
- status
- observations
- timestamps

Status:

- ACTIVE
- INACTIVE

Membro inativo não deve ser apagado apenas por mudança de status.

### PASTORAL_LEADERSHIP

- id
- church_id
- primary_member_id obrigatório
- co_leader_member_id opcional
- started_at
- ended_at opcional
- status
- timestamps

Regras:

- líder principal e co-líder não podem ser a mesma pessoa;
- histórico deve ser preservado.

### MEMBER_JOURNEY

- member_id
- church_id
- recorded_by_user_id
- event_type
- description
- event_date
- timestamps

É histórico de domínio, diferente de auditoria técnica/administrativa.

### AUDIT_LOG

- user_id
- operation
- resource
- resource_id
- observation
- previous_data JSON
- new_data JSON
- created_at

Regras:

- imutável;
- nunca armazenar senhas, tokens ou segredos.

---

## 12. MVP e fora do MVP

### MVP

Foco atual:

- configuração de igrejas;
- perfis/permissões;
- usuários;
- autenticação;
- autorização;
- membros;
- histórico/jornada;
- transferência;
- liderança pastoral;
- auditoria;
- padronização;
- testes principais;
- documentação/deploy.

### Fora do MVP / backlog futuro

Não antecipar estes módulos sem issue explícita:

- células / pequenos grupos;
- financeiro;
- eventos/cultos;
- visitantes;
- carteirinhas;
- PWA/offline;
- notificações;
- funcionalidades avançadas adicionais.

Evitar overengineering do MVP para suportar funcionalidades ainda não existentes.

---

## 13. Segurança e integridade

Princípios obrigatórios:

- senha apenas em hash;
- não registrar segredo em log;
- não retornar senha/hash em respostas públicas;
- secrets nunca commitados;
- `.env` não deve ser versionado;
- constraints críticas também no banco;
- autorização deverá considerar permission + scope;
- histórico importante não deve ser destruído;
- erros não devem expor detalhes internos.

---

## 14. Convenções e preferências de implementação

### Simplicidade

Priorizar implementação simples e clara para o MVP.

Não introduzir padrões arquiteturais apenas por prestígio.

Se repository pattern, abstração adicional, interface ou factory não trouxer benefício concreto, não adicionar automaticamente.

### Nomes e código

- manter nomes em inglês no código;
- mensagens e testes podem estar em português conforme padrão atual;
- seguir Prettier/ESLint do repositório;
- manter consistência com módulos já existentes.

### TypeORM

Conhecimentos/decisões já estabelecidos:

- `Repository.create()` não é obrigatório antes de `save()`;
- `merge()` é síncrono e muta target;
- não usar `merge()` cegamente em JSON parcial quando isso puder sobrescrever dados;
- `findOne()` usa opções/`where`;
- `Not(...)` pode ser usado para excluir o próprio id em validações de unicidade durante update;
- `delete(id)` pode ser usado quando não há necessidade de carregar entity antes.

### HTTP

Quando uma rota retorna `204 No Content`, não devolver body.

Deletes que deliberadamente não revelam existência podem ser idempotentes.

---

## 15. Como agentes de IA devem trabalhar neste projeto

O mantenedor mudou o fluxo de colaboração para acelerar produção.

O agente **pode implementar código diretamente** quando solicitado.

Porém, o objetivo não é produzir código opaco: o mantenedor fará revisão e precisa compreender e conseguir explicar a implementação.

### Ao receber uma tarefa

1. leia a issue;
2. leia os arquivos afetados;
3. identifique regras já definidas;
4. implemente a menor solução completa;
5. escreva/atualize testes relevantes;
6. preserve conventions existentes;
7. informe decisões técnicas importantes de forma resumida;
8. aponte qualquer decisão de domínio que ainda dependa do mantenedor.

### Não fazer

- não reescrever módulos inteiros sem necessidade;
- não trocar stack;
- não introduzir arquitetura nova sem justificativa;
- não inventar regra de negócio;
- não transformar defaults em regras rígidas sem decisão;
- não remover histórico por conveniência;
- não esconder alteração importante atrás de `refactor` genérico;
- não expor segredos;
- não assumir que código gerado está correto sem testes.

### Revisão humana

O mantenedor quer ser capaz de responder em entrevista:

- por que essa decisão foi tomada?
- como o fluxo funciona?
- qual regra o teste protege?
- o que o banco garante?
- o que aconteceria em um cenário de erro?

Quando implementar algo não trivial, fornecer uma explicação suficiente para permitir essa revisão.

---

## 16. Estado atual resumido para próxima sessão

Data de contexto deste arquivo: **2026-09-04**.

Concluído:

- setup inicial;
- documentação inicial;
- PostgreSQL/Docker;
- camada de persistência;
- módulo Church;
- módulo AccessProfile.

Em desenvolvimento:

- **Issue #9 — Users**
- branch GitHub: **`feat/usuarios`**
- testes iniciais de criação já foram escritos;
- `UsersService` ainda deve ser implementado conforme os testes e regras acima.

Próxima sequência prevista do roadmap:

`Users -> Authentication -> Authorization -> Members -> Member Journey -> Transfers -> Pastoral Leadership -> Audit -> Error Standardization -> Main Flow Tests -> MVP Docs`

---

## 17. Checklist rápido antes de concluir uma issue

Antes de considerar uma issue pronta:

- [ ] escopo da issue foi coberto;
- [ ] regras de negócio relevantes possuem testes;
- [ ] testes passam;
- [ ] DTOs validam entrada;
- [ ] entity representa corretamente persistência;
- [ ] migration existe quando há mudança de schema;
- [ ] constraints críticas existem no banco;
- [ ] módulo está registrado no Nest/DataSource quando necessário;
- [ ] migrations `up` e `down` foram verificadas;
- [ ] fluxo principal foi testado manualmente quando aplicável;
- [ ] nenhuma informação sensível está sendo exposta;
- [ ] PR descreve as principais mudanças;
- [ ] PR usa `Closes #N` quando conclui a issue.

---

## 18. Regra final para agentes

EkklesHub deve permanecer um projeto compreensível, defensável tecnicamente e executável por terceiros.

A prioridade não é produzir a maior quantidade de código possível.

A prioridade é:

**entregar funcionalidade real, com regra clara, persistência consistente, testes úteis e decisões que o mantenedor consiga explicar.**
