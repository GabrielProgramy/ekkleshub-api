# Modelo inicial de dados

```mermaid
erDiagram
    CHURCH {
        uuid id PK
        string name
        string type
        string address
        string phone
        string email
        string status
        datetime created_at
        datetime updated_at
    }

    MEMBER {
        uuid id PK
        uuid church_id FK
        string full_name
        date birth_date
        string marital_status
        string phone
        string email
        string address
        date baptism_date
        date member_since
        string status
        string observations
        datetime created_at
        datetime updated_at
    }

    PASTORAL_LEADERSHIP {
        uuid id PK
        uuid church_id FK
        uuid primary_member_id FK
        uuid co_leader_member_id FK
        date started_at
        date ended_at
        string status
        datetime created_at
        datetime updated_at
    }

    ACCESS_PROFILE {
        uuid id PK
        string name
        json permissions
        datetime created_at
        datetime updated_at
    }

    APP_USER {
        uuid id PK
        uuid access_profile_id FK
        uuid church_id FK
        uuid member_id FK
        string name
        string email
        string password
        string status
        datetime last_access_at
        datetime created_at
        datetime updated_at
    }

    MEMBER_JOURNEY {
        uuid id PK
        uuid member_id FK
        uuid church_id FK
        uuid recorded_by_user_id FK
        string event_type
        string description
        datetime event_date
        datetime created_at
        datetime updated_at
    }

    AUDIT_LOG {
        uuid id PK
        uuid user_id FK
        string operation
        string resource
        uuid resource_id
        string observation
        json previous_data
        json new_data
        datetime created_at
    }

    CHURCH ||--o{ MEMBER : has
    CHURCH ||--o{ PASTORAL_LEADERSHIP : has
    CHURCH o|--o{ APP_USER : scopes
    CHURCH ||--o{ MEMBER_JOURNEY : relates_to

    MEMBER ||--o{ MEMBER_JOURNEY : has
    MEMBER ||--o{ PASTORAL_LEADERSHIP : serves_as_primary
    MEMBER o|--o{ PASTORAL_LEADERSHIP : serves_as_co_leader
    MEMBER o|--o| APP_USER : may_have

    ACCESS_PROFILE ||--o{ APP_USER : defines_access_for

    APP_USER ||--o{ MEMBER_JOURNEY : records
    APP_USER ||--o{ AUDIT_LOG : performs
```

### Observações da modelagem

#### Identificadores
Todas as entidades utilizam UUID como chave primária.

O uso de UUID reduz a previsibilidade dos identificadores e facilita a geração de IDs sem depender de uma sequência centralizada. Ainda assim, regras de unicidade do negócio devem ser definidas separadamente.

#### Igreja sede

Cada instalação do sistema representa um único ministério.

A entidade CHURCH representa tanto a igreja sede quanto as congregações vinculadas. O campo type diferencia os valores:

- `HEADQUARTERS`
- `CONGREGATION`

Deve existir apenas uma igreja do tipo `HEADQUARTERS` por instalação.

#### Status das igrejas

O campo status da entidade CHURCH pode assumir inicialmente os valores:

- ACTIVE
- CLOSED

Uma igreja encerrada não deve ser removida definitivamente, pois seus membros, lideranças e históricos precisam continuar disponíveis.

#### Membros

Todo membro deve estar vinculado a uma igreja por meio de `church_id`.

Essa igreja pode ser a sede ou uma congregação.

O campo status pode assumir inicialmente os valores:

- `ACTIVE`
- `INACTIVE`

A inativação de um membro não deve apagar seu cadastro nem seu histórico.

#### Liderança pastoral

A entidade `PASTORAL_LEADERSHIP` representa quem é ou foi responsável por uma igreja durante determinado período.

O campo `primary_member_id` é obrigatório e representa o responsável principal.

O campo `co_leader_member_id` é opcional, permitindo representar tanto uma liderança individual quanto a liderança exercida por um casal.

`primary_member_id` e `co_leader_member_id` não podem apontar para o mesmo membro.

O campo `ended_at` permanece vazio enquanto a liderança estiver ativa. Registros de lideranças anteriores devem ser preservados.

#### Usuários e membros

A entidade `APP_USER` representa uma pessoa com acesso ao sistema.

Um usuário não é necessariamente um membro. Por isso, o campo `member_id` é opcional.

Quando preenchido, o campo vincula a conta de acesso ao cadastro correspondente em `MEMBER`.

##### Escopo do usuário

O campo `church_id` em `APP_USER` é opcional.

Quando preenchido, indica que o usuário atua no escopo de uma igreja específica.

Quando não preenchido, pode indicar que o usuário possui acesso geral à instalação, desde que seu perfil de acesso permita esse comportamento.

O escopo final deve ser sempre determinado em conjunto com o `ACCESS_PROFILE`.

#### Senha

O campo password deve armazenar somente o hash da senha.

A senha original nunca deve ser armazenada nem registrada em logs ou auditorias.

#### Status do usuário

O campo status de `APP_USER` pode assumir inicialmente os valores:

- `ACTIVE`
- `INACTIVE`

O campo `last_access_at` é opcional e deve ser atualizado após uma autenticação bem-sucedida.

#### Perfis e permissões

A entidade `ACCESS_PROFILE` define o nível de acesso dos usuários.

No MVP, o campo permissions pode ser armazenado como JSON, relacionando cada módulo a um nível de acesso.

Os níveis iniciais podem ser:

- `FULL`
- `READ`
- `NONE`

Caso as regras se tornem mais complexas, as permissões poderão futuramente ser separadas em uma estrutura relacional.

#### Jornada do membro

A entidade `MEMBER_JOURNEY` registra acontecimentos relevantes da vida do membro dentro da igreja.

Ela representa eventos do domínio, como:

- cadastro inicial;
- batismo;
- mudança de igreja;
- alteração de status;
- início ou encerramento de liderança.

Ela não deve ser utilizada como registro técnico de auditoria.

O campo `church_id` indica em qual igreja o acontecimento ocorreu, preservando o contexto mesmo que o membro seja transferido posteriormente.

#### Auditoria

A entidade `AUDIT_LOG` registra operações realizadas pelos usuários no sistema.

Ela deve armazenar informações como:

- usuário responsável;
- tipo de operação;
- recurso afetado;
- identificador do registro afetado;
- data e hora da ação;
- dados anteriores e novos, quando aplicável.

Os campos `previous_data` e `new_data` são opcionais e não devem armazenar informações sensíveis, como senhas, tokens ou segredos.

#### Datas de criação e atualização

Todas as entidades mutáveis possuem os campos:

- `created_at`
- `updated_at`

`created_at` representa o momento em que o registro foi criado.

`updated_at` representa a última alteração realizada no registro.

Em registros imutáveis, como `AUDIT_LOG`, possuem apenas `created_at`.