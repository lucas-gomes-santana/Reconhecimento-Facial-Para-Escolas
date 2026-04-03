# 📱 ARQUITETURA DO APP MOBILE — C.E.R.F

## Cadastro Escolar com Reconhecimento Facial — Módulo de Responsáveis

**Versão:** 0.1 (Draft Inicial)
**Data:** Abril de 2026
**Status:** Planejamento — Projeto Acadêmico (CETEP Ipirá, BA)
**Público-alvo:** Equipe de Desenvolvimento, Agentes de IA, Orientadores

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Contexto e Motivação](#contexto-e-motivação)
3. [Stack Tecnológica](#stack-tecnológica)
4. [Regras de Negócio](#regras-de-negócio)
5. [Modelo de Dados](#modelo-de-dados)
6. [Arquitetura do Sistema](#arquitetura-do-sistema)
7. [Fluxos Principais](#fluxos-principais)
8. [Segurança e Autenticação](#segurança-e-autenticação)
9. [Integração com o Sistema Principal](#integração-com-o-sistema-principal)
10. [Estratégia de Dados Mockados (MVP)](#estratégia-de-dados-mockados-mvp)
11. [Possibilidades de Mudança — Curto Prazo](#possibilidades-de-mudança--curto-prazo)
12. [Possibilidades de Mudança — Longo Prazo](#possibilidades-de-mudança--longo-prazo)
13. [Limitações Conhecidas do MVP](#limitações-conhecidas-do-mvp)
14. [Decisões em Aberto](#decisões-em-aberto)

---

## Visão Geral

O app mobile do C.E.R.F é um módulo complementar ao sistema web principal, desenvolvido para ser utilizado pelos **responsáveis legais dos alunos** matriculados em instituições que adotam o sistema C.E.R.F. O app tem caráter informativo e de acompanhamento, não concedendo permissões administrativas ao responsável.

O responsável, através do app, poderá:

- Criar sua conta usando dados pessoais e vinculá-la ao(s) seu(s) aluno(s)
- Acompanhar em tempo real (ou próximo disso) os registros de entrada do aluno na escola
- Verificar se o aluno retirou merenda no dia
- Consultar o histórico desses registros

O app **não** realiza reconhecimento facial, não acessa câmera para identificação e não tem controle administrativo sobre nenhuma parte do sistema C.E.R.F.

---

## Contexto e Motivação

O sistema principal do C.E.R.F já resolve o controle de acesso dentro da escola, gerenciado por administradores e agentes de segurança. No entanto, existe uma lacuna importante: **os responsáveis pelos alunos não têm visibilidade sobre o que acontece com seus filhos na escola no dia a dia**.

Em escolas estaduais de grande porte — que somam centenas ou milhares de alunos entre todos os turnos e anos — qualquer solução que dependa de validação manual por administrador se torna inviável operacionalmente. Por isso, a abordagem adotada para o MVP é o **autocadastro com validação automática por dados mockados**, simulando um banco de dados de matrícula que em um cenário real viria de um sistema oficial de gestão escolar.

---

## Stack Tecnológica

### App Mobile

| Ferramenta             | Papel                                                                     |
| ---------------------- | ------------------------------------------------------------------------- |
| **Ionic Framework**    | Componentes de UI mobile (ainda a decidir)                                |
| **Capacitor**          | Ponte entre web e APIs nativas do dispositivo (ainda a decidir)           |
| **React + TypeScript** | Camada de UI e lógica, aproveitando o conhecimento já existente da equipe |
| **TailwindCSS**        | Estilização, mantendo consistência com o frontend web                     |

> **Nota arquitetural:** A escolha de Capacitor + Ionic (ou só Capacitor com React puro) permite reutilizar grande parte do código do frontend web do C.E.R.F, reduzindo curva de aprendizado e retrabalho. Essa decisão ainda está em aberto e será documentada em versões futuras deste arquivo.

### Backend (compartilhado com sistema principal)

O app mobile **não terá backend próprio**. Ele consumirá a mesma API REST Node.js/Express já existente no C.E.R.F, com a adição de novas rotas exclusivas para o módulo de responsáveis. Nenhuma duplicação de infraestrutura é necessária no MVP.

### Banco de Dados (compartilhado)

O MongoDB já em uso no sistema principal receberá três novas collections:

- `alunomocks` — dados fictícios dos alunos usados para validação no MVP
- `responsaveis` — contas dos responsáveis cadastrados pelo app
- `vinculos` — relação entre responsáveis e seus respectivos alunos

---

## Regras de Negócio

### RN-01 — Autocadastro de Responsável

O responsável realiza seu próprio cadastro no app, informando dados pessoais e os dados do aluno para fins de vinculação. Não há intervenção de administrador nesse processo no MVP.

**Dados obrigatórios para cadastro:**

- Nome completo do responsável
- CPF do responsável _(identificador único da conta)_
- Telefone
- E-mail
- Senha _(mínimo 8 caracteres)_
- Matrícula do aluno
- Nome completo do aluno _(exatamente como consta no sistema)_

### RN-02 — Validação do Vínculo com o Aluno

A validação do vínculo é feita automaticamente pelo sistema cruzando dois dados simultaneamente:

1. **Matrícula informada** deve existir na collection `alunomocks`
2. **Nome completo informado** deve corresponder exatamente ao nome registrado para aquela matrícula

Se ambos os critérios forem satisfeitos, o vínculo é criado automaticamente e o responsável tem acesso imediato. Se qualquer um falhar, o cadastro é rejeitado com mensagem de erro apropriada.

> **Decisão de design:** A dupla validação (matrícula + nome completo) foi escolhida porque, embora nenhum dos dois dados individualmente seja sigiloso, a combinação dos dois funciona como um fator de autenticação razoável para o contexto acadêmico do MVP. Em um cenário real, esse mecanismo deveria ser complementado por validação humana ou integração com sistema oficial.

### RN-03 — Relação Responsável-Aluno

- Um responsável pode ser vinculado a **múltiplos alunos** (ex: irmãos na mesma escola)
- Um aluno pode ter **múltiplos responsáveis** vinculados (ex: pai e mãe com contas separadas)
- O mesmo responsável não pode se vincular duas vezes ao mesmo aluno _(índice único composto no banco)_

### RN-04 — Autenticação do Responsável

O responsável realiza login com **CPF + senha**. O CPF é usado como identificador único da conta pois é um dado que o responsável dificilmente esquece e é único por pessoa.

A sessão é gerenciada por JWT seguindo o mesmo padrão já implementado no sistema principal:

- **Access Token:** duração de 1 hora
- **Refresh Token:** duração de 7 dias

### RN-05 — Visualização de Registros de Entrada

O responsável pode visualizar o histórico de entradas do(s) seu(s) aluno(s) na escola. Esses registros são gerados automaticamente pelo sistema principal toda vez que a verificação facial de um aluno é realizada na portaria.

**Dados exibidos por registro:**

- Data e hora da entrada
- Turno correspondente _(Matutino, Vespertino, Noturno)_
- Status da verificação _(identificado com sucesso)_

### RN-06 — Visualização de Registros de Merenda

O responsável pode verificar se o aluno retirou merenda no dia e o histórico de retiradas anteriores. Esse dado já é gerado pelo módulo de merenda do sistema principal.

**Dados exibidos:**

- Data e hora da retirada
- Status _(retirou / não retirou no dia atual)_

### RN-07 — Responsável Não Tem Poder Administrativo

O responsável é um tipo de usuário completamente separado dos admins do sistema principal. Ele não pode:

- Cadastrar ou remover usuários
- Acessar estatísticas globais do sistema
- Ver dados de outros alunos que não sejam seus vinculados
- Alterar qualquer dado do sistema

### RN-08 — Isolamento de Dados

O responsável visualiza **exclusivamente** os dados dos alunos vinculados à sua conta. Qualquer tentativa de acessar dados de outros alunos via manipulação de requisição deve ser bloqueada no backend pela verificação do vínculo antes de retornar qualquer dado.

### RN-09 — Notificações (planejado, não implementado no MVP)

No futuro, o app deverá notificar o responsável em tempo real quando:

- O aluno entrar na escola
- O aluno retirar merenda

Isso depende de integração com serviço de push notifications (Firebase Cloud Messaging ou similar) e está fora do escopo do MVP.

---

## Modelo de Dados

### Collection: `alunomocks`

Simula o banco de matrículas que em um cenário real viria de um sistema governamental ou da secretaria escolar. Populada via script de seed na inicialização do servidor.

```
{
  _id: ObjectId,
  matricula: String (unique),        // Ex: "2025001"
  nomeCompleto: String,              // Ex: "Ana Clara Souza"
  turma: String,                     // Ex: "3º Ano A"
  turno: Enum [Matutino, Vespertino, Noturno],
  usuarioId: ObjectId | null         // Ref → Usuario (descriptor facial)
                                     // null se ainda não cadastrado no reconhecimento
}
```

> O campo `usuarioId` é opcional e serve para, no futuro, cruzar os registros de entrada facial com o aluno correto no contexto do app.

### Collection: `responsaveis`

```
{
  _id: ObjectId,
  nomeCompleto: String,
  cpf: String (unique),              // Identificador de login
  telefone: String,
  email: String (unique, lowercase),
  senha: String (bcrypt hash),
  ativo: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Collection: `vinculos`

```
{
  _id: ObjectId,
  responsavelId: ObjectId → Responsavel,
  alunoMockId: ObjectId → AlunoMock,
  createdAt: Date
}

Índice único composto: { responsavelId: 1, alunoMockId: 1 }
```

### Collection: `logsentrada` _(nova, a criar no sistema principal)_

Atualmente o sistema principal registra verificações apenas no contador da collection `estatisticas`. Para o app mobile funcionar, será necessário criar um log detalhado por evento de verificação.

```
{
  _id: ObjectId,
  usuarioId: ObjectId → Usuario,     // Quem entrou
  alunoMockId: ObjectId | null,      // Referência ao mock (quando vinculado)
  tipo: Enum [entrada, merenda],
  timestamp: Date,
  similaridade: Number               // % de confiança do reconhecimento
}
```

> **Impacto no sistema principal:** A criação dessa collection requer modificação nos controllers `usuarioController.js` e no módulo de merenda, para registrar o evento no log além de incrementar o contador de estatísticas. Essa é a principal mudança necessária no backend existente.

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    APP MOBILE                           │
│         (Capacitor + React + TypeScript)                │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐   │
│  │   Login /   │  │  Dashboard   │  │   Histórico   │   │
│  │  Cadastro   │  │  do Aluno    │  │  Entrada /    │   │
│  │             │  │              │  │  Merenda      │   │
│  └─────────────┘  └──────────────┘  └───────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/REST (JSON)
                        │ JWT em cookies httpOnly
                        ▼
┌───────────────────────────────────────────────────────── ┐
│               BACKEND (Node.js + Express)                │
│             [SISTEMA PRINCIPAL — sem alteração]          │
│                                                          │
│  Rotas existentes:          Novas rotas (módulo mob.):   │
│  /api/admin/*               /api/responsaveis/cadastrar  │
│  /api/usuarios/*            /api/responsaveis/login      │
│  /api/estatisticas/*        /api/responsaveis/meus-alunos│
│  /api/verificar-rosto       /api/responsaveis/entradas/:id│
│                             /api/responsaveis/merenda/:id │
└───────────────────────┬─────────────────────────────────┘
                        │ Mongoose
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  MongoDB (Atlas)                        │
│                                                         │
│  Collections existentes:    Novas collections:          │
│  admins                     alunomocks                  │
│  usuarios                   responsaveis                │
│  estatisticas               vinculos                    │
│                             logsentrada                 │
└─────────────────────────────────────────────────────────┘
```

### Novas Rotas do Backend (módulo responsáveis)

| Método | Rota                                      | Autenticação | Descrição                               |
| ------ | ----------------------------------------- | ------------ | --------------------------------------- |
| POST   | `/api/responsaveis/cadastrar`             | Pública      | Cria conta e vínculo automaticamente    |
| POST   | `/api/responsaveis/login`                 | Pública      | Login com CPF + senha, retorna JWT      |
| POST   | `/api/responsaveis/refresh-token`         | Pública      | Renova access token                     |
| POST   | `/api/responsaveis/logout`                | Responsável  | Encerra sessão                          |
| GET    | `/api/responsaveis/perfil`                | Responsável  | Dados da conta logada                   |
| GET    | `/api/responsaveis/meus-alunos`           | Responsável  | Lista alunos vinculados                 |
| GET    | `/api/responsaveis/entradas/:alunoMockId` | Responsável  | Histórico de entradas do aluno          |
| GET    | `/api/responsaveis/merenda/:alunoMockId`  | Responsável  | Histórico de merenda do aluno           |
| POST   | `/api/responsaveis/vincular`              | Responsável  | Adiciona novo vínculo a conta existente |

> Todas as rotas autenticadas verificam no backend se o `alunoMockId` solicitado está de fato vinculado ao responsável da sessão, prevenindo acesso indevido por manipulação da requisição.

### Estrutura de Pastas do App Mobile (proposta)

```
cerf-mobile/
├── src/
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Cadastro.tsx
│   │   ├── Dashboard.tsx          ← Lista de alunos vinculados
│   │   ├── DetalheAluno.tsx       ← Entradas + merenda de um aluno
│   │   └── Perfil.tsx
│   │
│   ├── components/
│   │   ├── CardAluno.tsx
│   │   ├── RegistroEntrada.tsx
│   │   └── StatusMerenda.tsx
│   │
│   ├── hooks/
│   │   ├── useAuthResponsavel.ts
│   │   ├── useMeusAlunos.ts
│   │   ├── useEntradas.ts
│   │   └── useMerenda.ts
│   │
│   ├── types/
│   │   ├── responsavel.types.ts
│   │   ├── alunoMock.types.ts
│   │   └── logs.types.ts
│   │
│   └── config/
│       └── url.ts                 ← Mesma base URL do frontend web
│
├── capacitor.config.ts
└── package.json
```

---

## Fluxos Principais

### Fluxo 1 — Cadastro do Responsável

```
App (Tela de Cadastro)
│
├─ Responsável preenche:
│   nome, CPF, telefone, e-mail, senha
│   matrícula do aluno, nome completo do aluno
│
└─ POST /api/responsaveis/cadastrar
        │
        ▼ Backend
        ├─ Valida campos obrigatórios
        ├─ CPF já cadastrado? → Erro 400: "CPF já possui conta"
        ├─ Busca AlunoMock pela matrícula
        │   └─ Não encontrada? → Erro 404: "Matrícula não encontrada"
        ├─ Nome informado bate com AlunoMock.nomeCompleto?
        │   └─ Não bate? → Erro 400: "Dados do aluno não conferem"
        ├─ Cria documento Responsavel (senha em bcrypt)
        ├─ Cria documento Vinculo { responsavelId, alunoMockId }
        └─ Retorna { success: true, responsavel: { id, nome } }
                │
                ▼ App
                └─ Navega para Login com mensagem de sucesso
```

### Fluxo 2 — Login do Responsável

```
App (Tela de Login)
│
├─ Responsável informa: CPF + senha
│
└─ POST /api/responsaveis/login
        │
        ▼ Backend
        ├─ Busca Responsavel por CPF
        │   └─ Não existe? → Erro 401: "Credenciais inválidas"
        ├─ bcrypt.compare(senha, hash)
        │   └─ Inválida? → Erro 401: "Credenciais inválidas"
        ├─ Gera accessToken (1h) + refreshToken (7d)
        ├─ Define cookies httpOnly
        └─ Retorna { success: true, responsavel: { id, nome } }
                │
                ▼ App
                └─ Navega para Dashboard
```

### Fluxo 3 — Dashboard (Lista de Alunos Vinculados)

```
App (Dashboard — ao carregar)
│
└─ GET /api/responsaveis/meus-alunos
        │
        ▼ Backend
        ├─ Extrai responsavelId do JWT
        ├─ Busca Vinculos onde responsavelId = id da sessão
        ├─ Popula dados dos AlunoMocks vinculados
        └─ Retorna lista de alunos com nome, turma, turno
                │
                ▼ App
                └─ Exibe cards de cada aluno
                   ├─ Clique no card → DetalheAluno
                   └─ Badge: "Entrou hoje?" / "Retirou merenda?"
```

### Fluxo 4 — Detalhe do Aluno (Entradas + Merenda)

```
App (DetalheAluno)
│
├─ GET /api/responsaveis/entradas/:alunoMockId
│       │
│       ▼ Backend
│       ├─ Verifica se alunoMockId está vinculado ao responsável da sessão
│       │   └─ Não está? → Erro 403: "Acesso negado"
│       ├─ Busca LogsEntrada onde alunoMockId = :id e tipo = 'entrada'
│       └─ Retorna lista ordenada por timestamp DESC
│
└─ GET /api/responsaveis/merenda/:alunoMockId
        │
        ▼ Backend
        ├─ Mesma verificação de vínculo
        ├─ Busca LogsEntrada onde tipo = 'merenda'
        └─ Retorna histórico + flag se retirou hoje
                │
                ▼ App
                └─ Exibe timeline de entradas
                   Exibe status de merenda do dia
                   Exibe histórico de merenda
```

### Fluxo 5 — Vincular Aluno Adicional

```
App (Perfil → Adicionar aluno)
│
├─ Responsável informa: matrícula + nome completo do novo aluno
│
└─ POST /api/responsaveis/vincular
        │
        ▼ Backend
        ├─ Mesma validação do cadastro (matrícula + nome)
        ├─ Vínculo já existe? → Erro 400: "Aluno já vinculado"
        └─ Cria novo Vinculo
                │
                ▼ App
                └─ Dashboard atualizado com novo aluno
```

---

## Segurança e Autenticação

### Separação de Contextos de JWT

O app mobile usa um contexto de autenticação completamente separado dos admins do sistema principal. Um responsável logado **nunca** terá acesso às rotas de `/api/admin/*` ou `/api/usuarios/*`, pois:

1. O payload do JWT de responsável contém `{ tipo: 'responsavel', id }`, enquanto o de admin contém `{ funcao: 'admin'/'desenvolvedor'/... }`
2. O middleware `autenticarResponsavel` verifica especificamente o campo `tipo: 'responsavel'`
3. As rotas de responsável usam esse middleware exclusivo, não o `autenticarToken` dos admins

### Proteção de Dados por Vínculo

Toda rota que retorna dados de um aluno específico realiza, antes de qualquer operação no banco, a verificação:

```
Vinculo.findOne({ responsavelId: idDaSessão, alunoMockId: idSolicitado })
```

Se não existir vínculo, retorna 403. Isso garante que mesmo um responsável autenticado não consiga ver dados de alunos que não são seus filhos, mesmo que descubra o `alunoMockId` de outro aluno.

### Dados Sensíveis

- CPF é armazenado como texto mas nunca retornado em listagens, somente no perfil do próprio responsável logado
- Senhas são armazenadas como hash bcrypt com 12 rounds, igual ao padrão dos admins
- Nenhuma informação biométrica (descriptor facial) é transmitida ou acessível pelo app mobile

---

## Integração com o Sistema Principal

O app mobile é um **consumidor passivo** do sistema principal. Ele lê dados gerados pelas operações do sistema web (verificações faciais na portaria, retiradas de merenda), mas não escreve nenhum dado nas collections existentes.

A única modificação necessária no sistema principal é a **criação da collection `logsentrada`** e a atualização dos controllers que hoje só incrementam o contador de estatísticas, para que passem também a gravar um documento de log com os detalhes do evento.

**Impacto no sistema principal:**

| Arquivo                    | Modificação necessária                                                    |
| -------------------------- | ------------------------------------------------------------------------- |
| `usuarioController.js`     | Gravar log em `logsentrada` na verificação facial                         |
| `usuarioController.js`     | Gravar log em `logsentrada` na liberação de merenda                       |
| `server.js`                | Registrar novas rotas de responsáveis                                     |
| `models/`                  | Adicionar `AlunoMock.js`, `Responsavel.js`, `Vinculo.js`, `LogEntrada.js` |
| `routes/`                  | Adicionar `responsavelRoutes.js`                                          |
| `controllers/`             | Adicionar `responsavelController.js`                                      |
| `config/seedAlunosMock.js` | Novo script de seed (dados fictícios)                                     |

---

## Estratégia de Dados Mockados (MVP)

Para o MVP acadêmico, os dados de alunos são fictícios e pré-cadastrados no banco via script de seed que roda na inicialização do servidor — seguindo o mesmo padrão do usuário `desenvolvedor` já existente no `server.js`.

### Critérios dos Dados Mock

- Mínimo de 20 alunos fictícios distribuídos entre turmas e turnos diferentes
- Nomes que não correspondam a pessoas reais identificáveis
- Matrículas no formato `ANO + SEQUENCIAL` (ex: `2025001`, `2025002`)
- Cobertura dos quatro tipos de usuário: Aluno, Professor, Funcionario, Outro
- Ao menos um aluno com `usuarioId` preenchido (vinculado ao reconhecimento facial) para demonstração completa do fluxo

### Comportamento em Desenvolvimento vs Produção

O script de seed deve verificar se os dados já existem antes de inserir, para não duplicar ao reiniciar o servidor — igual ao que já acontece com o `desenvolvedor`.

Em um cenário de produção real (fora do MVP acadêmico), a collection `alunomocks` seria substituída por uma integração com o sistema de matrícula da escola, e o script de seed seria desativado.

---

## Possibilidades de Mudança — Curto Prazo

Estas são mudanças prováveis enquanto o projeto ainda está em fase acadêmica ou logo após sua apresentação.

### CP-01 — Decisão final sobre Capacitor + Ionic

A stack mobile ainda não foi definida. A decisão entre usar **Capacitor puro com React** ou **Capacitor + Ionic Framework** impacta:

- Quantidade de componentes de UI disponíveis prontos (Ionic oferece mais)
- Curva de aprendizado (Ionic tem sua própria camada de componentes)
- Visual do app (Ionic tem estética mobile nativa; Capacitor puro usa TailwindCSS livremente)

**Alternativa considerada:** Expo + React Native, que tem ecossistema mais maduro para apps mobile, mas abandona o Capacitor e exige reaprendizado de sintaxe para componentes.

### CP-02 — Refinamento da validação de vínculo

A validação atual (matrícula + nome exato) pode ser muito rígida se houver variação de grafia. Pode ser necessário:

- Aplicar normalização de string (remover acentos, lowercase) antes de comparar
- Aceitar correspondência parcial com threshold mínimo de similaridade

### CP-03 — Adição de verificação por e-mail no cadastro

Para aumentar a confiabilidade do autocadastro, pode ser adicionado um passo de confirmação de e-mail antes de criar o vínculo — o responsável recebe um link e só após clicar o vínculo é efetivado. Isso exige integração com serviço de envio de e-mail (NodeMailer ou similar).

### CP-04 — Tela de recuperação de senha

Não está no escopo inicial mas é essencial para uso real. Requer fluxo de reset por e-mail ou por CPF + pergunta de segurança.

### CP-05 — Logs de entrada ligados ao AlunoMock

Atualmente, o sistema principal identifica o `usuarioId` (que tem o descriptor facial), mas não o `alunoMockId`. Para o app funcionar corretamente, é necessário criar e manter a relação `AlunoMock.usuarioId → Usuario._id` e usar isso ao gravar logs. Esse cruzamento pode exigir um passo extra no cadastro de alunos no sistema principal.

---

## Possibilidades de Mudança — Longo Prazo

Estas são evoluções esperadas se o projeto for adotado por instituições reais ou escalar além do contexto acadêmico.

### LP-01 — Substituição dos dados mockados por integração real

A collection `alunomocks` e o script de seed seriam substituídos por integração com o sistema de matrícula oficial da escola ou da rede estadual de ensino. Na Bahia, isso envolveria o sistema **SEC (Sistema Educacional Conectado)** da Secretaria de Educação do Estado.

Essa mudança não afeta a arquitetura do app mobile nem do backend de responsáveis — apenas a fonte dos dados de validação muda. O contrato das coleções permanece o mesmo.

### LP-02 — Notificações Push em Tempo Real

Integração com **Firebase Cloud Messaging (FCM)** para notificar o responsável no momento exato em que:

- O aluno tem sua entrada registrada na portaria
- O aluno retira merenda

Isso exige:

- Armazenamento do FCM token por dispositivo na conta do responsável
- Disparo de notificação no backend quando o log de entrada é criado
- Configuração do Capacitor com plugin de push notifications

### LP-03 — Validação por CPF via Receita Federal

Em vez de validar o vínculo apenas por matrícula + nome, adicionar consulta à API da Receita Federal (ou serviço equivalente) para confirmar que o CPF informado pertence a uma pessoa real com o nome declarado. Isso reduziria o risco de cadastros fraudulentos.

### LP-04 — Painel do Responsável com mais dados

Com o sistema em produção, os responsáveis poderiam visualizar também:

- Frequência mensal do aluno
- Notificações de ausência (quando o aluno não entrou em um dia letivo)
- Avisos e comunicados da escola via app

Esses dados exigiriam novos módulos no sistema principal (como integração com calendário letivo e sistema de comunicação).

### LP-05 — App para Alunos

Um módulo separado para o próprio aluno visualizar seu histórico de entradas e merenda, com autenticação pelo próprio reconhecimento facial via câmera do celular — reutilizando a biblioteca `face-api.js` já presente no sistema web.

### LP-06 — Múltiplas Escolas

Se o C.E.R.F for adotado por uma rede de escolas, o sistema precisaria de uma camada de **multi-tenancy**: cada escola teria seu próprio contexto de dados, e um responsável poderia ter filhos em escolas diferentes. Isso exigiria adição do campo `escolaId` em praticamente todos os models e uma separação de banco ou de contexto por instituição.

### LP-07 — Aprovação Híbrida de Vínculos

Combinar o autocadastro automático para a maioria dos responsáveis com um fluxo de revisão humana para casos ambíguos (ex: quando o nome não bate exatamente mas é muito similar). A secretaria receberia uma fila de solicitações pendentes para aprovar ou rejeitar.

---

## Limitações Conhecidas do MVP

| Limitação                            | Impacto                                                             | Quando resolver                   |
| ------------------------------------ | ------------------------------------------------------------------- | --------------------------------- |
| Dados de alunos são fictícios        | Não demonstrável com dados reais da escola                          | Longo prazo (LP-01)               |
| Sem notificações push                | Responsável precisa abrir o app para ver novidades                  | Curto/médio prazo (CP-01 / LP-02) |
| Sem recuperação de senha             | Responsável que esquece a senha perde o acesso                      | Curto prazo (CP-04)               |
| Sem confirmação de e-mail            | Cadastro não verifica se o e-mail é real                            | Curto prazo (CP-03)               |
| Log de entrada não liga ao AlunoMock | Pode haver dificuldade de cruzar quem entrou com o registro do mock | Curto prazo (CP-05)               |
| Sem validação externa do CPF         | Qualquer CPF fictício é aceito                                      | Longo prazo (LP-03)               |
| App roda apenas localmente           | Sem backend em produção, só funciona em ambiente de desenvolvimento | Médio prazo                       |

---

## Decisões em Aberto

Estas questões ainda precisam ser definidas pela equipe antes ou durante o desenvolvimento do app.

| #    | Decisão                              | Opções                                                                       | Impacto                                                     |
| ---- | ------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| D-01 | Stack mobile final                   | Capacitor + React / Capacitor + Ionic / Expo + React Native                  | Alto — afeta toda a estrutura do projeto                    |
| D-02 | Onde hospedar o backend              | Local (MVP) / Railway / Render / VPS                                         | Médio — necessário para o app funcionar em dispositivo real |
| D-03 | Formato do CPF no banco              | Com máscara (`000.000.000-00`) / Apenas números                              | Baixo — mas deve ser definido antes de criar os índices     |
| D-04 | Política de senha esquecida          | E-mail de reset / Pergunta de segurança / Nenhuma no MVP                     | Médio — impacta UX do app                                   |
| D-05 | Como linkar `Usuario` ao `AlunoMock` | Manualmente pelo admin / Campo no cadastro facial / Automaticamente por nome | Alto — essencial para logs funcionarem corretamente         |

---

**Desenvolvido para:** Feira de Ciências 2025 — CETEP Ipirá, BA
**Módulo:** App Mobile — Responsáveis
**Licença:** CC BY-NC-ND 4.0
**Última atualização:** Abril de 2026
