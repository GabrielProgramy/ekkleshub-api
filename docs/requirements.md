# Requisitos do MVP

## Requisitos funcionais

- **RF01**: O sistema deve permitir a configuração inicial da igreja matriz, que representará o ministério responsável pela instância instalada.
- **RF02**: O sistema deve permitir o cadastro de igrejas vinculadas à igreja matriz.
- **RF03**: O sistema deve permitir consultar, atualizar e inativar os dados da igreja matriz e das igrejas vinculadas.
- **RF04**: O sistema deve permitir o cadastro de membros vinculados à igreja matriz ou a uma igreja vinculada.
- **RF05**: O sistema deve permitir consultar, atualizar e inativar membros.
- **RF06**: O sistema deve permitir alterar a igreja à qual um membro está vinculado, preservando o histórico dessa alteração.
- **RF07**: O sistema deve permitir o cadastro e o gerenciamento de usuários responsáveis pelo acesso à aplicação.
- **RF08**: O sistema deve permitir associar o usuário à igreja matriz ou a uma igreja vinculada.
- **RF09**: O sistema deve permitir que usuários de escopo geral não estejam vinculado a uma igreja específica.
- **RF10**: O sistema deve permitir definir papéis de acesso para os usuários.
- **RF11**: O sistema deve disponibilizar papéis básicos de acesso, como administrador do sistema, administrador da igreja e usuário de consulta.
- **RF12**: O sistema deve restringir as funcionalidades disponíveis conforme o papel atribuído ao usuário.
- **RF13**: O sistema deve permitir vincular um ou dois responsáveis a uma igreja.
- **RF14**: O sistema deve permitir definir o período de atuação de um responsável em uma igreja, preservando o histórico de liderança.
- **RF15**: O sistema deve permitir que usuários realizem autenticação para acessar as funcionalidades protegidas.
- **RF16**: O sistema deve permitir o encerramento da sessão do usuário.
- **RF17**: O sistema deve registrar operações relevantes realizadas pelos usuários.
- **RF18**: O registro de operações deve armazenar, no mínimo, o usuário responsável, a operação realizada, o recurso afetado e a data da ação.
- **RF19**: O sistema deve preservar registros históricos relevantes, evitando a exclusão definitiva de informações necessárias para auditoria ou consulta futura.

## Requisitos não funcionais

- **RNF01**: A aplicação deve ser executada como uma instância independente para cada ministério que realizar sua instalação.
- **RNF02**: Os dados de diferentes ministérios devem permanecer isolados por meio de instalações e bancos de dados independentes.
- **RNF03**: O acesso às funcionalidades do sistema deve exigir autenticação, exceto nas rotas explicitamente públicas.
- **RNF04**: As credenciais dos usuários devem ser armazenadas de forma segura e nunca em texto puro.
- **RNF05**: O sistema deve aplicar regras de autorização de acordo com o papel e a igreja associados ao usuário.
- **RNF06**: Usuários vinculados a uma igreja devem acessar apenas os dados permitidos para sua responsabilidade.
- **RNF07**: O administrador geral da instância deve poder acessar os dados da igreja matriz e das igrejas vinculadas.
- **RNF08**: Toda entrada externa recebida pela API deve ser validada antes do processamento.
- **RNF09**: A API deve retornar respostas de erro padronizadas e compreensíveis.
- **RNF10**: Regras de negócio críticas devem possuir testes automatizados.
- **RNF11**: Os principais fluxos da aplicação devem possuir testes de integração ou testes de ponta a ponta.
- **RNF12**: A aplicação deve poder ser instalada e executada por meio de contêineres Docker.
- **RNF13**: A instalação deve disponibilizar instruções claras de configuração e inicialização do ambiente.
- **RNF14**: A aplicação deve utilizar um banco de dados relacional para persistência dos dados do sistema.
- **RNF15**: Tecnologias adicionais de armazenamento ou cache só devem ser incorporadas quando houver necessidade técnica comprovada.
- **RNF16**: O sistema deve manter desempenho adequado nas operações principais, considerando o ambiente mínimo recomendado para execução.
- **RNF17**: As operações comuns de cadastro, consulta e atualização não devem apresentar atrasos perceptíveis em condições normais de uso.
- **RNF18**: A aplicação deve ser compatível com ambientes capazes de executar Docker e Docker Compose.
- **RNF19**: Configurações sensíveis, senhas e chaves de acesso não devem ser armazenadas diretamente no código-fonte.
- **RNF20**: A aplicação deve registrar erros relevantes para facilitar diagnóstico e manutenção.
- **RNF21**: A documentação da aplicação deve informar os requisitos mínimos de infraestrutura para execução.