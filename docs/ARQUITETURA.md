# ARQUITETURA DO PROJETO C.E.R.F (Cadastro Escolar com Reconhecimento Facial)

## SUMÁRIO

1. [Informações do Projeto](#informações-do-projeto)
2. [Ferramentas & Dependências Completas](#ferramentas--dependências-completas)
3. [Arquitetura Geral do Sistema](#arquitetura-geral-do-sistema)
4. [Documentação do Backend](#documentação-do-backend)
5. [Documentação do Frontend](#documentação-do-frontend)
6. [Fluxos de Dados Principais](#fluxos-de-dados-principais)
7. [Padrões Arquiteturais](#padrões-arquiteturais)
8. [Segurança & Autenticação](#segurança--autenticação)
9. [Banco de Dados MongoDB](#banco-de-dados-mongodb)
10. [Fluxo de Inicialização](#fluxo-de-inicialização)
11. [Guia de Suporte para Agentes IA](#guia-de-suporte-para-agentes-ia)

---

## Informações do Projeto

### Descrição Executiva

**C.E.R.F** é um sistema web de reconhecimento e cadastro biométrico facial desenvolvido para reforçar a segurança em instituições escolares. O sistema permite o cadastro de alunos, professores e funcionários utilizando reconhecimento facial como forma de autenticação biométrica, eliminando a necessidade de senhas convencionais.

### Objetivo Principal

Controlar o fluxo de entrada de indivíduos em escolas através de reconhecimento facial, permitindo:

- Verificar se um rosto foi cadastrado no sistema
- Barrar acesso não autorizado
- Registrar estatísticas de utilização
- Controlar fluxo de merenda escolar
- Gerar relatórios de utilização

### Funcionalidades Disponíveis

| Funcionalidade                | Descrição                                      | Público         |
| ----------------------------- | ---------------------------------------------- | --------------- |
| **Autenticação**              | Login de administradores com JWT               | Admin           |
| **Cadastro Facial**           | Registro de novo usuário com descriptor facial | Admin           |
| **Verificação de Identidade** | Identificar pessoa por rosto                   | Admin + Sistema |
| **Controle de Merenda**       | Bloqueio automático de acesso por 60s          | Admin + Sistema |
| **Estatísticas**              | Dashboard com métricas de utilização           | Admin           |
| **Gerenciamento de Admins**   | CRUD de administradores com roles              | Super-Admin/Dev |
| **Gerenciamento de Usuários** | CRUD de usuários cadastrados                   | Admin           |
| **Relatórios**                | Geração de PDF com dados de cadastros          | Admin           |

### Resumo das stacks usadas

```
┌─────────────┐                    ┌─────────────┐                   ┌──────────────┐
│   Frontend  │                    │   Backend   │                   │   Database   │
│ React + Ts  │◄────HTTP/REST────► │ Node.js +   │ ◄──MONGOOSE────►  │   MongoDB    │
│ Vite + Face │                    │ Express +   │                   │ (local:      │
│ TailwindCSS │                    │ TypeScript  │                   │  facedb)     │
└─────────────┘                    └─────────────┘                   └──────────────┘
```

---

## Ferramentas & Dependências Completas

### Backend (Node.js)

**Arquivo:** `backend/package.json`

| Dependência       | Versão | Propósito                                            |
| ----------------- | ------ | ---------------------------------------------------- |
| **express**       | 5.1.0  | Framework HTTP/REST server                           |
| **mongoose**      | 8.17.1 | ODM (Object Data Modeling) para MongoDB              |
| **mongodb**       | 6.20.0 | Driver oficial do MongoDB                            |
| **bcrypt**        | 6.0.0  | Hashing de senhas (12 rounds)                        |
| **jsonwebtoken**  | 9.0.2  | Geração e verificação de JWT (Access + Refresh)      |
| **cors**          | 2.8.5  | Middleware de CORS (permite requisições do frontend) |
| **cookie-parser** | 1.4.7  | Parsing de cookies (armazenamento de JWT)            |

#### Backend — Desenvolvimento & Testes (devDependencies)

| Ferramenta                | Versão | Propósito                                       |
| ------------------------- | ------ | ----------------------------------------------- |
| **typescript**            | 6.0.3  | Tipagem estática (projeto 100% em `.ts`)        |
| **tsx**                   | 4.22.3 | Execução direta de TypeScript (`tsx watch`)     |
| **ts-node**               | 10.9.2 | Execução de TypeScript no Node.js               |
| **vitest**                | 4.1.6  | Framework de testes unitários/integração        |
| **@vitest/coverage-v8**   | 4.1.6  | Relatório de cobertura de código                |
| **supertest**             | 7.2.2  | Testes de requisições HTTP (controllers/routes) |
| **mongodb-memory-server** | 11.1.0 | MongoDB em memória para testes isolados         |
| **prettier**              | 3.8.2  | Formatação de código                            |
| **eslint**                | 10.2.0 | Linting (com plugins de segurança/imports)      |

### Frontend (React + TypeScript)

**Arquivo:** `frontend/package.json`

| Dependência           | Versão  | Propósito                                     |
| --------------------- | ------- | --------------------------------------------- |
| **react**             | 19.1.1  | Library JavaScript para UI componentes        |
| **react-dom**         | 19.1.1  | Rendering de React no DOM                     |
| **react-router-dom**  | 7.8.2   | Roteamento client-side (SPA)                  |
| **tailwindcss**       | 4.1.12  | Framework CSS utility-first para estilização  |
| **@tailwindcss/vite** | 4.1.12  | Plugin do Tailwind CSS para Vite              |
| **face-api.js**       | 0.22.2  | **Reconhecimento facial com TensorFlow.js**   |
| **jsPDF**             | 3.0.3   | Geração de PDFs no browser                    |
| **lucide-react**      | 0.542.0 | Biblioteca de ícones SVG                      |
| **clsx**              | 2.1.1   | Utility para construir className condicionais |

#### Frontend — Desenvolvimento & Testes (devDependencies)

| Ferramenta                      | Versão | Propósito                                   |
| ------------------------------- | ------ | ------------------------------------------- |
| **typescript**                  | 5.8.3  | Tipagem estática JavaScript                 |
| **vite**                        | 7.1.2  | Build tool ultra-rápido (substitui webpack) |
| **@vitejs/plugin-react**        | 5.0.0  | Integração React + Vite (Fast Refresh)      |
| **vitest**                      | 4.1.11 | Framework de testes unitários               |
| **@testing-library/react**      | 16.3.2 | Testes de componentes React                 |
| **@testing-library/jest-dom**   | 7.0.1  | Matchers DOM para testes                    |
| **@testing-library/user-event** | 14.6.6 | Simulação de interações do usuário          |
| **jsdom**                       | 30.0.1 | Ambiente DOM para testes                    |
| **eslint**                      | 9.33.0 | Linting de código                           |

### Testes & Qualidade

Além do linting com ESLint, a qualidade é garantida por suítes de testes automatizados com **Vitest**.

**Backend** (`backend/package.json`):

| Comando              | Descrição                                         |
| -------------------- | ------------------------------------------------- |
| `pnpm test`          | Executa os testes em modo watch (desenvolvimento) |
| `pnpm test:run`      | Executa todos os testes uma única vez             |
| `pnpm test:coverage` | Executa os testes com relatório de cobertura (v8) |
| `pnpm lint`          | Linting do código backend                         |

**Frontend** (`frontend/package.json`):

| Comando         | Descrição                             |
| --------------- | ------------------------------------- |
| `pnpm test`     | Executa os testes em modo watch       |
| `pnpm test:run` | Executa todos os testes uma única vez |
| `pnpm lint`     | Linting do código frontend            |

### Banco de Dados

| Sistema      | Detalhes                                 |
| ------------ | ---------------------------------------- |
| **MongoDB**  | Banco de dados NoSQL document-oriented   |
| **Mongoose** | ODM (schema + validações)                |
| **Conexão**  | mongodb://localhost:27017/facedb (local) |

### Ferramentas Externas

| Ferramenta | Propósito                                         |
| ---------- | ------------------------------------------------- |
| **pnpm**   | Package manager (mais rápido e otimizado que npm) |
| **Git**    | Controle de versão                                |
| **ESLint** | Linting de código (frontend e backend)            |

### Modelo de Reconhecimento Facial

**face-api.js** incorpora os seguintes modelos pré-treinados (TensorFlow.js):

```
Modelos no diretório /frontend/public/models/:
├── tiny_face_detector_model*    → Detecção rápida de rostos
├── face_landmark_68_model*      → Pontos de referência facial (68 landmarks)
├── face_landmark_68_tiny_model* → Landmarks otimizado para performance
├── face_recognition_model*      → Extração de descriptor (128 dimensões)
└── face_expression_model*       → Detecção de expressão emocional
```

**Saída:** Array de 128 números (descriptor) representando características faciais únicas.

---

## Arquitetura Geral do Sistema

### Padrão Arquitetural

O projeto segue a arquitetura **MVC (Model-View-Controller) com Service Layer Pattern**:

```
CLIENTE (Browser)
    ↓
FRONTEND (React + TypeScript)
    ├── Pages (Telas/Views)
    ├── Components (UI reutilizáveis)
    └── Hooks Customizados (Lógica encapsulada)
         │
    ↓ HTTP/REST (JSON)
    │
BACKEND (Node.js + Express + TypeScript)
    ├── Routes (Roteamento) — 5 routers: usuarios, admin,
    │        estatisticas, responsaveis, logs
    ├── Middlewares (Validação, Autenticação)
    ├── Controllers (Regras de negócio)
    ├── Services (Algoritmos especializados)
    └── Models (Schemas Mongoose)
         │
    ↓ Mongoose/Driver
    │
DATABASE (MongoDB)
    ├── Collections: Admin, Usuario, Estatistica, Responsavel,
    │        AlunoMatricula, Vinculo, LogEntrada
    └── Índices (único, partial, etc)
```

### Responsabilidades por Camada

#### **Frontend (React)**

- Captura entrada do usuário (formulários, câmera)
- Renderiza UI baseada em estado
- Gerencia autenticação via JWT tokens
- Integra com face-api.js para detecção facial
- Comunica com backend via fetch/axios

#### **Backend (Node.js + TypeScript)**

- Valida requisições (middlewares)
- Executa lógica de negócio (controllers)
- Implementa algoritmos (services)
- Persiste dados (MongoDB via Mongoose)
- Gerencia autenticação (JWT)
- No boot, conecta ao MongoDB, cria o usuário `desenvolvedor` e executa `seedAlunosMockados()`

#### **Database (MongoDB)**

- Armazena usuários, admins, estatísticas
- Índices para otimizar buscas
- Schemas com validações Mongoose

### Padrão de Comunicação

```
Frontend                          Backend

POST /api/usuarios/cadastrar
├─ Headers: { Authorization: "Bearer token" }
├─ Body: {
│    nome: "João Silva",
│    tipoUsuario: "Aluno",
│    descriptor: [0.45, -0.12, ...(128 valores)]
│  }
└──────────────────────────────► Controller
                                  ├─ Valida token
                                  ├─ Valida dados
                                  ├─ Service: Verifica duplicação
                                  ├─ Save no MongoDB
                                  │
                        ◄────────── Response {
                                    success: true,
                                    usuario: { _id, nome, ... }
                                  }
```

---

## Documentação do Backend

> **Subsistema do Aplicativo Mobile:** Os models `Responsavel`, `AlunoMatricula`, `Vinculo` e `LogEntrada`, os controllers `responsavelController.ts` e `logEntradaController.ts`, as rotas `/api/responsaveis/*` e `/api/logs/*` e o middleware `authResponsavel.ts` fazem parte do subsistema do **aplicativo mobile do C.E.R.F**, destinado aos responsáveis dos alunos — permitindo o vínculo com a matrícula dos filhos e o monitoramento de entradas e retirada de merenda. A documentação detalhada desse subsistema está no repositório do aplicativo mobile; este backend apenas expõe os endpoints consumidos pelo app.

### 1. MODELOS (Models)

Os modelos definem a estrutura dos dados persistidos no MongoDB via Mongoose.

#### **Admin.ts** - Usuários Administrativos

**Arquivo:** backend/models/Admin.ts

**Responsabilidade:** Armazenar credenciais e permissões de administradores.

**Schema:** Campos para nome (único, lowercase), senha (bcrypt hash), funcao (enum), ativo, ultimoLogin, timestamps.

**Índices Especiais:**

- `unique` em `nome` → Busca O(1) por nome
- `unique: true, partialFilterExpression: { funcao: { $in: ['desenvolvedor', 'super-admin'] } }` → Garante apenas 1 desenvolvedor e 1 super-admin (índice parcial único)

**Hashing de senha:** A criptografia é centralizada na função `criptografarSenha()` em `backend/utils/utils.ts` (12 rounds), chamada nos controllers antes do `save()`.

**Métodos:** Virtual `dataCadastro`, `toJSON()` sem senha

#### **Usuario.ts** - Usuários do Sistema (Alunos, Professores, etc)

**Arquivo:** backend/models/Usuario.ts

**Responsabilidade:** Armazenar dados de usuários finais com reconhecimento facial.

**Schema:** Campos para nome (único), tipoUsuario (string — **sem enum aplicado no schema**; os valores utilizados são Aluno, Professor, Funcionario, Outro), descriptor (array de 128 números), dataCadastro, status (enum: liberado/bloqueado), bloqueadoAte, timestamps.

**O que é o Descriptor?**

- **Função:** Representação numérica única do rosto (fingerprint facial)
- **Origem:** Extraído por face-recognition-net (modelo neural)
- **Dimensões:** 128 números float (128-D embedding space)
- **Uso:** Comparação com outros descriptors via similaridade cosseno
- **Privacidade:** Não permite reconstrução da face original

**Índices:**

- `unique` em `nome` → Busca rápida de usuários

#### **Estatistica.ts** - Métricas do Sistema

**Arquivo:** backend/models/Estatistica.ts

**Responsabilidade:** Singleton que armazena estatísticas globais.

**Schema:** Contadores `totalVerificacoes`, `totalEntradas`, `totalSaidas` e `totalMerendas` (número, default 0) + `ultimaAtualizacao` (data).

**Padrão Singleton:** Static methods `getInstance()` (garante apenas 1 documento), `incrementarVerificacoes()`, `incrementarEntrada()` e `incrementarMerenda()` — cada um incrementa o respectivo contador e atualiza o timestamp.

---

### 2. CONTROLADORES (Controllers)

Os controladores implementam a lógica de negócio e orquestram modelos + serviços.

#### **usuarioController.ts** - Gerenciamento de Usuários

**Arquivo:** backend/controllers/usuarioController.ts

**Responsabilidade:** CRUD de usuários finais + verificação facial.

**Métodos Principais:**

- `cadastrarUsuario()` - POST /api/usuarios/cadastrar (valida duplicação facial 96%)
- `verificarRosto()` - POST /api/verificar-rosto (encontra usuário similar por contexto)
- `listarUsuarios()` - GET /api/usuarios/listar?nome=... (busca regex case-insensitive)
- `removerUsuario()` - DELETE /api/usuarios/remover/:id
- `removerTodosOsUsuarios()` - DELETE /api/usuarios/remover-todos
- `bloquearUsuario()` - PATCH /api/usuarios/bloquear/:id (bloqueio 60s automático)

**Contextos de Verificação (`verificarRosto`):**

- `cadastro` — apenas checa a existência do rosto, sem incrementar estatísticas
- `verificacao` — valida o rosto e incrementa `totalVerificacoes`
- `entrada` — valida o rosto, registra `LogEntrada` tipo `entrada` e incrementa `totalEntradas`
- `saida` — valida o rosto e registra `LogEntrada` tipo `saida`
- `merenda` — valida o rosto (se não bloqueado), registra `LogEntrada` tipo `merenda` e incrementa `totalMerendas`

**Observação:** além dos incrementos específicos, cada verificação com contexto diferente de `cadastro` também incrementa `totalVerificacoes`.

#### **adminController.ts** - Gerenciamento de Administradores

**Arquivo:** backend/controllers/adminController.ts

**Responsabilidade:** Autenticação + CRUD de admins.

**Métodos Principais:**

- `login()` - POST /api/admin/login (cria dev com fallback .env)
- `refreshToken()` - POST /api/admin/refresh-token
- `logout()` - POST /api/admin/logout
- `cadastrarAdmin()` - POST /api/admin/cadastrar (requer super-admin/dev)
- `cadastrarSuperAdmin()` - POST /api/admin/cadastrar/super-admin (requer dev)
- `verificarAutenticacao()` - GET /api/admin/verificar
- `listarAdmins()` - GET /api/admin/listar
- `removerAdmins()` - DELETE /api/admin/remover/:id
- `atualizarSenha()` - PUT /api/admin/atualizar-senha

#### **estatisticaController.ts** - Relatórios e Estatísticas

**Arquivo:** backend/controllers/estatisticaController.ts

**Responsabilidade:** Agregação de dados para dashboards.

**Métodos Principais:**

- `obterEstatisticas()` - GET /api/estatisticas (total cadastros + verificações)
- `obterEstatisticasDetalhadas()` - GET /api/estatisticas/detalhadas (agregação por tipo + primeiro/último cadastro)
- `reiniciarVerificacoes()` - POST /api/estatisticas/reset (requer autenticação)
- `gerarRelatorio()` - POST /api/estatisticas/relatorio (agregação MongoDB com pipeline)

**Respostas:** os endpoints retornam os campos `totalCadastros`, `totalVerificacoes`, `totalEntradas`, `totalSaidas`, `totalMerendas` e `ultimaAtualizacao`.

#### **responsavelController.ts** - Responsáveis (App Mobile)

**Arquivo:** backend/controllers/responsavelController.ts

**Responsabilidade:** Cadastro, login/logout e vínculo de responsáveis com alunos, além do monitoramento de entradas e merenda dos filhos.

**Métodos Principais:** `cadastrar`, `login`, `logout`, `perfil`, `meusAlunos`, `entradas`, `merenda`, `vincular`, `validarMatricula`.

**Obs.:** pertence ao subsistema do app mobile — detalhes na nota no início desta seção e no repositório do aplicativo.

#### **logEntradaController.ts** - Logs de Entrada/Saída/Merenda

**Arquivo:** backend/controllers/logEntradaController.ts

**Responsabilidade:** Consulta e registro de logs de entrada/saída/merenda (`LogEntrada`).

**Métodos Principais:** `buscarLogsPorUsuario`, `buscarLogsPorAlunoMatricula`, `buscarLogsPorData`, `registrarLog`.

---

### 3. SERVIÇOS (Services)

Services encapsulam lógica de negócio complexa ou algoritmos.

#### **faceRecognitionService.js** - Reconhecimento Facial

**Arquivo:** backend/services/faceRecognitionService.js

**Responsabilidade:** Algoritmo de comparação de faces (similaridade cosseno).

**Métodos:**

- `calcularSimilaridadeCossenos(descriptor1, descriptor2)` - Calcula similaridade entre dois descritores (fórmula: (A·B) / (||A|| × ||B||))
- `encontrarUsuarioPorSimilaridade(descriptorBusca, threshold)` - Busca melhor match no banco (O(n) complexity)
- `verificarRostoExistente(descriptor, threshold)` - Wrapper da função acima

**Interpretação da Similaridade:**

```
Valor         | Interpretação
0.96+         | Mesmo rosto (Usar para cadastro)
0.90-0.95     | Muito similar (revisar)
0.70-0.89     | Alguma semelhança (não usar)
< 0.70        | Rostos diferentes
```

---

### 4. ROTAS (Routes)

Definem os endpoints HTTP disponíveis.

**Ordem de middlewares:** nas rotas protegidas, o middleware de validação (`validate*`) é aplicado **antes** de `autenticarToken`.

#### **usuarioRoutes.ts**

**Arquivo:** backend/routes/usuarioRoutes.ts

**Endpoints:**

- POST /api/usuarios/cadastrar - validateCadastroUsuario, autenticarToken
- POST /api/verificar-rosto - validateVerificacaoRosto, autenticarToken
- GET /api/usuarios/listar?nome=... - autenticarToken
- DELETE /api/usuarios/remover/:id - validateIdParam, autenticarToken
- DELETE /api/usuarios/remover-todos - autenticarToken
- PATCH /api/usuarios/bloquear/:id - validateIdParam, autenticarToken

#### **adminRoutes.ts**

**Arquivo:** backend/routes/adminRoutes.ts

**Endpoints:**

- POST /api/admin/login - validateLogin (PUBLIC)
- POST /api/admin/refresh-token - (PUBLIC)
- POST /api/admin/logout - (PUBLIC)
- GET /api/admin/verificar - autenticarToken
- POST /api/admin/cadastrar - validateCadastroAdmin, autenticarToken
- POST /api/admin/cadastrar/super-admin - validateCadastroAdmin, autenticarToken
- GET /api/admin/listar - autenticarToken
- DELETE /api/admin/remover/:id - validateIdParam, autenticarToken
- PUT /api/admin/atualizar-senha - validateMudancaDeSenha, autenticarToken

#### **estatisticaRoutes.ts**

**Arquivo:** backend/routes/estatisticaRoutes.ts

**Endpoints:**

- GET /api/estatisticas - (PUBLIC)
- GET /api/estatisticas/detalhadas
- POST /api/estatisticas/reset - autenticarToken
- POST /api/estatisticas/relatorio - autenticarToken

#### **responsavelRoutes.ts**

**Arquivo:** backend/routes/responsavelRoutes.ts

**Endpoints (subsistema app mobile):**

- POST /api/responsaveis/cadastrar - (PUBLIC)
- POST /api/responsaveis/login - (PUBLIC)
- POST /api/responsaveis/logout - autenticarResponsavel
- GET /api/responsaveis/perfil - autenticarResponsavel
- GET /api/responsaveis/meus-alunos - autenticarResponsavel
- GET /api/responsaveis/entradas/:id - autenticarResponsavel
- GET /api/responsaveis/merenda/:id - autenticarResponsavel
- POST /api/responsaveis/vincular - autenticarResponsavel
- POST /api/responsaveis/validar-matricula - (PUBLIC)

#### **logEntradaRoutes.ts**

**Arquivo:** backend/routes/logEntradaRoutes.ts

**Endpoints:**

- GET /api/logs/entrada/usuario/:usuarioId - autenticarToken
- GET /api/logs/entrada/aluno/:alunoMatriculaId - autenticarToken
- GET /api/logs/entrada - autenticarToken
- POST /api/logs/entrada - autenticarToken

---

### 5. MIDDLEWARES (Middlewares)

Intermediários que processam requisições antes de chegarem aos controllers.

#### **validation.ts**

**Arquivo:** backend/middlewares/validation.ts

**Validações Implementadas:**

- `validateLogin` - Valida nome + senha
- `validateCadastroUsuario` - Valida presença de nome, tipoUsuario e descriptor (não valida o tamanho/length do descritor)
- `validateVerificacaoRosto` - Valida descriptor (array) + contexto (cadastro/verificacao/merenda)
- `validateCadastroAdmin` - Valida nome, senha (min 8 chars), funcao
- `validateId` - Valida ID no body
- `validateIdParam` - Valida ID em params
- `validateMudancaDeSenha` - Valida nova_senha + confirmacao
- `autenticarToken` - Middleware JWT (verifica cookie 'jwt')

#### **authResponsavel.ts**

**Arquivo:** backend/middlewares/authResponsavel.ts

**Responsabilidade:** Autenticação de responsáveis (app mobile). Verifica o cookie `jwt`, exige que o payload tenha `tipo: "responsavel"` e injeta `req.responsavel` com os dados do token.

> **Obs.:** o `autenticarResponsavel` roda em todas as rotas `/api/responsaveis/*` protegidas, exceto cadastrar/login/validar-matricula.

---

### 6. CONFIGURAÇÕES (Config)

#### **database.ts**

**Arquivo:** backend/config/database.ts

**Responsável por:** Conexão MongoDB (mongodb://localhost:27017/facedb)

#### **corsConfig.ts**

**Arquivo:** backend/config/corsConfig.ts

**Configuração:** Origem permitida `http://localhost:5173` (frontend local) — requisições sem origin (não-browser, ex.: Postman) também são aceitas; **desativar em produção**. Credenciais true, métodos GET/POST/PUT/PATCH/DELETE/OPTIONS, headers Content-Type/Authorization, expõe `set-cookie`.

#### **jwtConfig.ts**

**Arquivo:** backend/config/jwtConfig.ts

**Tokens:** generateAccessToken (1h), generateRefreshToken (7d), verify, definirTokens/removerTokens (httpOnly cookies), autenticarToken (verifica o cookie `jwt`).

#### **seedAlunos.ts**

**Arquivo:** backend/config/seedAlunos.ts

**Responsável por:** Inserir 20 matrículas de alunos fictícios no boot (somente desenvolvimento/testes). **Atenção:** desativar em produção — em produção, as matrículas são cadastradas pelos gestores da escola.

#### **threshold.ts**

**Arquivo:** backend/utils/threshold.ts

**Responsável por:** Constante global de similaridade mínima (`0.96`) para considerar dois rostos como o mesmo.

---

### 7. SERVIDOR (server.ts)

**Arquivo:** backend/server.ts

**Responsabilidade:** Ponto de entrada da aplicação backend.

**Inicialização:**

1. Conecta ao MongoDB via DatabaseConfig.conectar()
2. Cria usuário "desenvolvedor" (fallback .env: DEV_USER_NOME, DEV_USER_SENHA)
3. Monta middlewares: express.json(), CORS, cookie-parser
4. Monta rotas: /api/usuarios, /api/admin, /api/estatisticas
5. Health check: GET /health
6. Escuta na porta 3000 (ou env.PORT)

**Tratamento de Sinais:** SIGINT para graceful shutdown

---

## Documentação do Frontend

### 1. ESTRUTURA DE PASTAS

```

frontend/src/
├── App.tsx # Componente raiz + Router
├── main.tsx # Entry point
├── vite-env.d.ts # Tipos Vite
│
├── pages/ # Páginas (telas completas)
│ ├── Login.tsx # Autenticação admin
│ ├── MenuPage.tsx # Dashboard central
│ ├── Cadastrar.tsx # Cadastro facial
│ ├── Verificacao.tsx # Verificação de identidade
│ ├── VerificarMerenda.tsx # Controle de merenda
│ ├── Estatisticas.tsx # Dashboard de relatórios
│ ├── AdminPage.tsx # Gerenciamento de admins
│ └── UserManagement.tsx # Gerenciamento de usuários
│
├── components/ # Componentes reutilizáveis
│ └── VideoAndCanvas.tsx # Vídeo + Canvas para detecção
│
├── hooks/ # Custom hooks (lógica separada)
│ ├── api/
│ │ └── useApi.ts # Error handling de API
│ │
│ ├── auth/
│ │ ├── useAuth.ts # Autenticação JWT + estado
│ │ ├── useVerificacao.ts # Ciclo de vida verificação
│ │ └── useVerificarStatus.ts # Status bloqueio merenda
│ │
│ ├── detection/
│ │ └── useFaceDetection.ts # Integração face-api.js
│ │
│ ├── frontend/
│ │ ├── useLogin.ts # Lógica da página Login
│ │ ├── useCadastro.ts # Lógica captura facial
│ │ ├── useAdminPage.ts # Lógica CRUD admins
│ │ ├── useEstatisticas.ts # Lógica estatísticas
│ │ └── useUserManagement.ts # Lógica CRUD usuários
│ │
│ ├── validation/
│ │ └── useValidation.ts # Validações de formulários
│ │
│ └── utils/
│ ├── useFormatData.ts # Formatação de datas
│ └── useGerarRelatorio.ts # Geração de PDF
│
├── types/ # Tipos TypeScript
│ ├── admin.types.ts # Tipos de admin
│ ├── api.types.ts # Tipos de API
│ ├── cadastro.types.ts # Tipos de cadastro
│ ├── distance.types.ts # Tipos de detecção
│ ├── estatisticas.types.ts # Tipos de estatísticas
│ ├── face.type.ts # Tipos de rosto
│ ├── login.types.ts # Tipos de login
│ ├── user.types.ts # Tipos de usuário
│ └── validation.types.ts # Tipos de validação
│
├── config/
│ └── url.ts # API Base URL
│
├── templates/
│ └── generatePdf.ts # Gerador de PDF
│
└── styles/
└── index.css # Estilos globais

```

---

### 2. PÁGINAS (Pages)

#### **Login.tsx** - Autenticação de Administradores

**Responsabilidade:** Formulário de login para administradores. Integra com JWT authentication.

#### **MenuPage.tsx** - Dashboard Central

**Arquivo:** frontend/src/pages/MenuPage.tsx

**Responsabilidade:** Dashboard central com 6 opções de menu. Exibe nome do admin logado e botão de logout.

---

#### **Cadastrar.tsx** - Cadastro Facial com Captura

**Responsabilidade:** Captura facial para novo usuário. Integra face-api.js para detecção.

#### **Verificacao.tsx** - Verificação de Identidade

**Responsabilidade:** Identificar pessoa por rosto. Mostra resultado com dados do usuário.

---

### 3. HOOKS CUSTOMIZADOS (14 Hooks)

Os hooks encapsulam lógica reutilizável e gerenciam estado.

#### **useAuth.ts** - Autenticação JWT

### **useFaceDetection.ts** - Integração face-api.js

#### **useCadastro.ts** - Orquestração de Cadastro

### 4. TIPOS TYPESCRIPT

#### **face.type.ts** - Tipos de Resposta de Rosto

#### **admin.types.ts** - Tipos de Administrador

---

### 5. COMPONENTES

#### **VideoAndCanvas.tsx** - Elemento de Vídeo e Detecção

### 6. CONFIGURAÇÃO & TEMPLATES

#### **url.ts** - Base URL da API

#### **generatePdf.ts** - Gerador de Relatório PDF

## Fluxos de Dados Principais

### 1. Fluxo de Autenticação

```
┌─────────────────────────────────┐
│ 1. Login Page                   │
│ Usuario digita nome + senha     │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ 2. POST /admin/login            │
│ Envia { nome, senha }           │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ 3. Backend                      │
│ ├─ Busca admin no DB            │
│ ├─ Valida senha (bcrypt)        │
│ └─ Gera tokens JWT              │
└──────────┬──────────────────────┘
           │
           ▼ Resposta com cookies
┌─────────────────────────────────┐
│ 4. Frontend                     │
│ ├─ Recebe admin data            │
│ ├─ Armazena em localStorage     │
│ ├─ Cookie: jwt (1 hora)         │
│ ├─ Cookie: refreshToken (7 dias)│
│ └─ Navigate → /menu             │
└─────────────────────────────────┘

Refresh Token Flow (quando accessToken expirar):
┌──────────────────────────────────┐
│ 1. detecta erro 401              │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ 2. POST /admin/refresh-token     │
│ (cookie refreshToken enviado)    │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ 3. Gera novo accessToken         │
│ Retorna new jwt cookie           │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ 4. Requisição original retry     │
│ com novo token                   │
└──────────────────────────────────┘
```

### 2. Fluxo de Cadastro de Usuário

```
┌────────────────────────────────┐
│ 1. Cadastrar Page              │
│ ├─ Nome: "João Silva"          │
│ ├─ Tipo: "Aluno"               │
│ └─ Clica "Iniciar Reconhecimento│
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 2. Face Detect Loop            │
│ (100ms interval)               │
│ ├─ faceapi.detectSingleFace()  │
│ ├─ Calcula bounding box        │
│ ├─ Extrai landmarks            │
│ ├─ Extrai descriptor (128)     │
│ └─ Valida distância + expressão│
└────────────┬───────────────────┘
             │
             ▼ (quando ideal + neutral)
┌────────────────────────────────┐
│ 3. currentDescriptor =         │
│ [0.45, -0.12, ...(128 números)]│
│ canSave = true                 │
└────────────┬───────────────────┘
             │
             ▼ Clica "Salvar"
┌────────────────────────────────┐
│ 4. POST /usuarios/cadastrar    │
│ {                              │
│   "nome": "João Silva",        │
│   "tipoUsuario": "Aluno",      │
│   "descriptor": [...128...]    │
│ }                              │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 5. Backend validação           │
│ ├─ verificarRostoExistente()   │
│ │  (threshold 96%)             │
│ │  └─ Se duplicado: erro 400   │
│ ├─ Validações de formato       │
│ └─ Save no MongoDB             │
└────────────┬───────────────────┘
             │
             ▼ Sucesso
┌────────────────────────────────┐
│ 6. Response { success: true,   │
│    usuario: { _id, nome, ... } │
│ }                              │
│                                │
│ UI: "Cadastro com sucesso!"  │
└────────────────────────────────┘
```

### 3. Fluxo de Verificação de Identidade

```
┌──────────────────────────────┐
│ 1. Verificacao Page          │
│ Clica "Iniciar Verificação"  │
└──────────┬───────────────────┘
           │
           ▼ Carrega modelos + abre câmera
┌──────────────────────────────┐
│ 2. Face Detection Loop       │
│ Igual ao fluxo de cadastro   │
│ Extrai descriptor quando ok  │
└──────────┬───────────────────┘
           │
           ▼ Clica "Verificar"
┌──────────────────────────────┐
│ 3. POST /verificar-rosto     │
│ {                            │
│   "descriptor": [...128...], │
│   "contexto": "verificacao"  │
│ }                            │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ 4. Backend - Service Layer   │
│ faceRecognitionService       │
│ .encontrarUsuarioPorSimilaridade(
│   descriptor, 0.96 threshold │
│ )                            │
│                              │
│ Loop: for cada usuario {     │
│  similaridade =              │
│  calcularSimilaridadeCossenos(
│    descriptorBusca,          │
│    usuario.descriptor        │
│  )                           │
│  if (similaridade > max)     │
│    melhorMatch = usuario     │
│ }                            │
└──────────┬───────────────────┘
           │
           ├─ Se encon trado:
           │  ├─ Verifica bloqueio
           │  ├─ Incrementa totalVerificações
           │  └─ Retorna usuário + %
           │
           └─ Se não encontrado:
              └─ Retorna exists: false
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ 5. Frontend - Resultado      │
│                              │
│ Se encontrado:               │
│ ┌────────────────────────────┐
│ │ Usuário Identificado!   │
│ │ Nome: João Silva           │
│ │ Tipo: Aluno                │
│ │ Similaridade: 98.5%        │
│ │ Status: Liberado        │
│ └────────────────────────────┘
│                              │
│ Se não encontrado:           │
│ ┌────────────────────────────┐
│ │ Rosto não encontrado    │
│ └────────────────────────────┘
└──────────────────────────────┘
```

### 4. Fluxo de Bloqueio de Merenda (60 segundos)

```
┌──────────────────────────────────┐
│ 1. VerificarMerenda Page         │
│ (similar a Verificacao)          │
│ POST /verificar-rosto            │
│ { descriptor, contexto: 'merenda'}
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ 2. Resultado da Verificação      │
│ {                                │
│   existe: true,                  │
│   bloqueado: false,              │
│   usuario: { nome, ... }         │
│ }                                │
└──────────┬───────────────────────┘
           │
           ├─ Se bloqueado:
           │  └─ "Já pegou merenda"
           │
           └─ Se liberado:
              └─ Mostra botão "Liberar Merenda"
└──────────┬───────────────────────┘
           │
           ▼ Frontend clica "Liberar"
┌──────────────────────────────────┐
│ 3. PATCH /usuarios/bloquear/:id  │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ 4. Backend - bloquearUsuario()   │
│ usuario.status = 'bloqueado'     │
│ usuario.bloqueadoAte =           │
│   new Date() + 60000ms           │
│ await usuario.save()             │
│                                  │
│ setTimeout(() => {               │
│   usuario.status = 'liberado'    │
│   usuario.bloqueadoAte = null    │
│   usuario.save()                 │
│ }, 60000)  // 1 minuto            │
└──────────┬───────────────────────┘
           │
           ▼ Response { success: true }
┌──────────────────────────────────┐
│ 5. UI Feedback                   │
│ "Bloqueado por 60 segundos"    │
│                                  │
│ [Wait 60s]                       │
│           ▼                      │
│ "Desbloqueado automaticamente" │
└──────────────────────────────────┘
```

### 5. Fluxo de Geração de Relatório PDF

```
┌────────────────────────────────┐
│ 1. Estatisticas Page           │
│ Display estatísticas gerais    │
│ Clica "Gerar Relatório PDF"    │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 2. POST /estatisticas/relatorio│
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 3. Backend - gerarRelatorio()  │
│                                │
│ Pipeline MongoDB Aggregation:  │
│ $group por tipoUsuario         │
│ $project: { tipo, usuarios[] } │
│ $sort: { tipo: 1 }             │
│                                │
│ SELECT:                        │
│ • totalCadastros               │
│ • totalVerificacoes            │
│ • usuarios organizado por tipo │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 4. Response {                  │
│   dataRelatorio: '2026-04-01', │
│   totalCadastros: 145,         │
│   totalVerificacoes: 1240,     │
│   usuariosOrganizados: [       │
│     {                          │
│       tipo: "Aluno",           │
│       quantidade: 98,          │
│       usuarios: [              │
│         { nome, dataCadastro } │
│         ...                    │
│       ]                        │
│     },                         │
│     ...                        │
│   ]                            │
│ }                              │
└────────────┬───────────────────┘
             │
             ▼ Frontend
┌────────────────────────────────┐
│ 5. useGerarRelatorio()         │
│ generatePdf(dadosRelatorio)    │
│                                │
│ jsPDF:                         │
│ - Cabeçalho                    │
│ - Data do relatório            │
│ - Tabelas por tipo             │
│ - Lista de usuários alfabética │
│                                │
│ doc.save(                      │
│   'relatorio_2026-04-01.pdf'   │
│ )                              │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 6. Download automático do PDF  │
│                                │
│ relatorio_relatorio_2026-04-01 │
│ .pdf                           │
└────────────────────────────────┘
```

---

## Padrões Arquiteturais

### 1. **MVC (Model-View-Controller)**

Separação clara de responsabilidades:

- **Model:** Mongoose schemas (Admin, Usuario, Estatistica)
- **View:** React components e páginas TSX
- **Controller:** Funções em Controllers que orquestram Models + Services

### 2. **Service Layer Pattern**

Encapsula lógica de negócio specializada:

- `FaceRecognitionService.ts` → Algoritmos de reconhecimento
- Separação entre Controllers (HTTP) e Services (lógica)

### 3. **Hook-Based State Management**

Frontend usa custom hooks para:

- Encapsular lógica de páginas
- Gerenciar estado local com useState
- Reutilizar lógica entre componentes
- Sem necessidade de Redux/Zustand

### 4. **Factory Pattern**

Singleton para modelo único:

### 5. **Middleware Pattern**

Camada intermediária para processamento:

- Express middlewares de validação
- JWT authentication middleware
- CORS middleware global

### 6. **Singleton Pattern**

Apenas 1 instância no banco:

- Classe `Estatistica` com padrão singleton
- Garante integral database

### 7. **Observer Pattern (Implícito)**

- `useEffect()` reage a mudanças de estado
- Face detection loops observam frames de vídeo em tempo real

---

## Segurança & Autenticação

### JWT (JSON Web Tokens)

| Tipo              | Duração | Armazenamento   | Propósito                   |
| ----------------- | ------- | --------------- | --------------------------- |
| **Access Token**  | 1 hora  | Cookie httpOnly | Autenticação de requisições |
| **Refresh Token** | 7 dias  | Cookie httpOnly | Geração de novo accessToken |

**Payload do Token:**

```json
{
  "id": "admin_id_mongodb",
  "nome": "desenvolvedor",
  "funcao": "desenvolvedor",
  "iat": 1712001234,
  "exp": 1712004834
}
```

### Hashing de Senhas

- **Algoritmo:** bcrypt
- **Salt rounds:** 12
- **Armazenamento:** Apenas hash, nunca plaintext
- **Validação:** Comparação hash vs entrada via `bcrypt.compare()`

### Hierarquia de Permissões

```
Desenvolvedor (ÚNICO)
├─ Criar: Super-Admin, Admin, Segurança
└─ Deletar: Super-Admin, Admin, Segurança

Super-Admin (ÚNICO, criado por Dev)
├─ Criar: Admin, Segurança
└─ Deletar: Admin, Segurança

Admin
├─ Cadastra usuários
├─ Verifica identidade
└─ Gera relatórios

Segurança
└─ Verifica rosto

Usuários Finais (Aluno, Professor, etc)
└─ Sem acesso administrativo
```

### CORS (Cross-Origin Resource Sharing)

**Allowed Origins:**

- `http://localhost:5173` (frontend local)
- `https://seu-frontend-react.com` (production)

**Configuração:**

### Proteção contra Ataques

| Ameaça            | Proteção                            |
| ----------------- | ----------------------------------- |
| **CSRF**          | httpOnly cookies + SameSite: strict |
| **XSS**           | React escapa automaticamente        |
| **Força Bruta**   | (Não implementado - considerar)     |
| **SQL Injection** | Mongoose previne (não é SQL)        |
| **Senha fraca**   | Validação min 8 caracteres          |

---

## Banco de Dados MongoDB

### Schema: Admin

```json
{
  "_id": ObjectId,
  "nome": "string (unique, lowercase)",
  "senha": "string (bcrypt hash)",
  "funcao": "enum: [admin, seguranca, super-admin, desenvolvedor]",
  "ativo": "boolean (default: true)",
  "ultimoLogin": "Date (nullable)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Índices:**

- `unique: nome`
- `unique: funcao, partialFilterExpression: { funcao: 'super-admin' }`
- `unique: funcao, partialFilterExpression: { funcao: 'desenvolvedor' }`

### Schema: Usuario

```json
{
  "_id": ObjectId,
  "nome": "string (unique)",
  "tipoUsuario": "enum: [Aluno, Professor, Funcionario, Outro]",
  "descriptor": "number[] (length: 128)",
  "dataCadastro": "Date",
  "status": "enum: [liberado, bloqueado] (default: liberado)",
  "bloqueadoAte": "Date (nullable)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Índices:**

- `unique: nome`

### Schema: Estatistica

```json
{
  "_id": ObjectId,
  "totalVerificacoes": "number (default: 0)",
  "ultimaAtualizacao": "Date"
}
```

**Padrão:** Singleton (apenas 1 documento)

### Operações MongoDB Principais

---

## Fluxo de Inicialização

**OBS:** O servidor MongoDB deve estar rodando no computador antes de executar esses comandos

### Backend

```bash
# 1. Instalação
$ cd backend
$ pnpm install

# 2. Configuração (.env)
DATABASE_URL=mongodb://localhost:27017/facedb
JWT_SECRET=sua-chave-secreta
REFRESH_TOKEN_SECRET=sua-chave-refresh
DEV_USER_NOME=desenvolvedor
DEV_USER_SENHA=admin123456

# 3. Startup
$ node server.ts
# Output:
# Conectado ao MongoDB
# Usuário "desenvolvedor" criado
# Servidor escutando na porta 3000
```

### Frontend

```bash
# 1. Instalação
$ cd frontend
$ pnpm install

# 2. Rodar em modo de desenvolvimento
$ pnpm dev
# Output:
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help

# 3. Build para produção
$ pnpm build
$ pnpm preview
```

### Sequência Completa

```
Terminal 1: Backend
$ cd backend && pnpm install && node server.ts
# Conecta MongoDB
# Cria desenvolvedor
# Escuta :3000

Terminal 2: Frontend
$ cd frontend && pnpm install && pnpm dev
# Vite dev server :5173
# Hot reload ativo
# Conecta em localhost:3000/api

Browser:
$ Acessa http://localhost:5173
$ Vê tela de login
$ Login com desenvolvedor(usuário)/admin123456(senha)
```

---

## Guia de Suporte para Agentes IA

### Como Usar Este Documento

Este arquivo foi estruturado para facilitar:

1. **Busca Rápida de Contexto:**
   - Use Ctrl+F para buscar por: `interface`, `class`, `function`, `endpoint`

2. **Implementação de Features Novas:**
   - Seção 4: Backend → Models/Controllers/Services/Routes
   - Seção 5: Frontend → Pages/Hooks/Types
   - Seção 6: Fluxos de Dados → Entenda integração

3. **Debug de Erros:**
   - Verifique: rotas corretas? JWT válido? Validações passando?
   - Consulte seção de Segurança para auth issues
   - Consulte banco de dados para schema issues

4. **Adicionar Nova Funcionalidade:**
   - Crie Model (MongoDB schema)
   - Crie Controller (lógica)
   - Crie Service se lógica complexa
   - Crie Route (endpoint)
   - Crie Pages/Hooks no frontend
   - Atualize Types (TypeScript)

### Pontos de Entrada por Tipo de Tarefa

| Tarefa                    | Seção | Arquivos Chave                    |
| ------------------------- | ----- | --------------------------------- |
| **Adicionar rota**        | 4.4   | routes/_.js, controllers/_.js     |
| **Adicionar validação**   | 4.5   | middlewares/validation.js         |
| **Adicionar página**      | 5.2   | pages/_.tsx, hooks/frontend/_.ts  |
| **Adicionar hook**        | 5.3   | hooks/\*_/_.ts                    |
| **Alterar modelo**        | 4.1   | models/\*.js                      |
| **Bug em autenticação**   | 8     | auth/useAuth.ts, jwtConfig.js     |
| **Bug em face detection** | 5.3   | useFaceDetection.ts, face-api.js  |
| **Relatório/Agregação**   | 4.2.3 | estatisticaController.js, MongoDB |

### Exemplos de Busca Rápida

```
Buscar por:                    Vá para:
"POST /api/usuarios"           Seção 4.4 - usuarioRoutes.js
"face-api"                     Seção 5.3 - useFaceDetection.ts
"similaridade cosseno"         Seção 4.3 - faceRecognitionService.js
"JWT"                          Seção 8 - Segurança
"descriptor"                   Seção 4.1 - Usuario.js
```

---

**Caso aind tenha dúvidas, consulte:**

- [README.md](../README.md) - Guia de execução
- [docs/](../) - Diagramas visuais
