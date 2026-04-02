# 📐 ARQUITETURA DO PROJETO C.E.R.F
## Cadastro Escolar com Reconhecimento Facial

**Versão:** 1.0  
**Data:** 1º de Abril de 2026  
**Status:** Projeto Acadêmico - Feira de Ciências 2025 (CETEP Ipirá, BA)  
**Público-alvo:** Agentes de IA, Equipe Técnica, Desenvolvedores

---

## 📋 ÍNDICE DE CONTEÚDO

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
- ✅ Verificar se um rosto foi cadastrado no sistema
- ✅ Barrar acesso não autorizado
- ✅ Registrar estatísticas de utilização
- ✅ Controlar fluxo de merenda escolar
- ✅ Gerar relatórios de utilização

### Funcionalidades Disponíveis

| Funcionalidade | Descrição | Público |
|---|---|---|
| **Autenticação** | Login de administradores com JWT | Admin |
| **Cadastro Facial** | Registro de novo usuário com descriptor facial | Admin |
| **Verificação de Identidade** | Identificar pessoa por rosto | Admin + Sistema |
| **Controle de Merenda** | Bloqueio automático de acesso por 60s | Admin + Sistema |
| **Estatísticas** | Dashboard com métricas de utilização | Admin |
| **Gerenciamento de Admins** | CRUD de administradores com roles | Super-Admin/Dev |
| **Gerenciamento de Usuários** | CRUD de usuários cadastrados | Admin |
| **Relatórios** | Geração de PDF com dados de cadastros | Admin |

### Stack Tecnológico Resumido

```
┌─────────────┐                    ┌──────────────┐                   ┌──────────────┐
│   Frontend  │                    │   Backend    │                   │   Database   │
│ React + Ts  │◄────HTTP/REST────►│  Node.js +   │◄──MONGOOSE────►  │  MongoDB     │
│ Vite + Face │                    │  Express     │                   │  (Atlas)     │
│ TailwindCSS │                    │              │                   │              │
└─────────────┘                    └──────────────┘                   └──────────────┘
```

### Localização do Repositório

```
GitHub: 
https://github.com/lucas-gomes-santana/Reconhecimento-Facial-Para-Escolas

Pasta Local: 
/home/lucas/Reconhecimento-Facial-Para-Escolas/
```

---

## Ferramentas & Dependências Completas

### Backend (Node.js)

**Arquivo:** `backend/package.json`

| Dependência | Versão | Propósito |
|---|---|---|
| **express** | 5.1.0 | Framework HTTP/REST server |
| **mongoose** | 8.17.1 | ODM (Object Data Modeling) para MongoDB |
| **bcrypt** | 6.0.0 | Hashing de senhas (12 rounds) |
| **jsonwebtoken** | 9.0.2 | Geração e verificação de JWT (Access + Refresh) |
| **cors** | 2.8.5 | Middleware de CORS (permite requisições do frontend) |
| **cookie-parser** | 1.4.7 | Parsing de cookies (armazenamento de JWT) |
| **dotenv** | *dev* | Variáveis de ambiente (.env) |

**Versão do Node.js:** ^18.0.0 (recomendado)

### Frontend (React + TypeScript)

**Arquivo:** `frontend/package.json`

| Dependência | Versão | Propósito |
|---|---|---|
| **react** | 19.1.1 | Library JavaScript para UI componentes |
| **react-dom** | 19.1.1 | Rendering de React no DOM |
| **react-router-dom** | 7.8.2 | Roteamento client-side (SPA) |
| **typescript** | 5.8.3 | Tipagem estática JavaScript |
| **vite** | 7.1.2 | Build tool ultra-rápido (substitui webpack) |
| **tailwindcss** | 4.1.12 | Framework CSS utility-first para estilização |
| **face-api.js** | 0.22.2 | **Reconhecimento facial com TensorFlow.js** |
| **jsPDF** | 3.0.3 | Geração de PDFs no browser |
| **lucide-react** | 0.542.0 | Biblioteca de ícones SVG |
| **clsx** | 2.1.1 | Utility para construir className condicionais |

**Versão do Node.js:** ^18.0.0 (recomendado)

### Banco de Dados

| Sistema | Versão | Detalhes |
|---|---|---|
| **MongoDB** | 6.20.0+ | Banco de dados NoSQL document-oriented |
| **Mongoose** | 8.17.1 | ODM (schema + validações) |
| **Conexão** | Local/Atlas | mongodb://localhost:27017/facedb (local) |

### Ferramentas Externas

| Ferramenta | Versão | Propósito |
|---|---|---|
| **pnpm** | latest | Package manager (mais rápido que npm) |
| **Git** | latest | Controle de versão |
| **ESLint** | ✅ | Linting de código (frontend) |

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
BACKEND (Node.js + Express)
    ├── Routes (Roteamento)
    ├── Middlewares (Validação, Autenticação)
    ├── Controllers (Regras de negócio)
    ├── Services (Algoritmos especializados)
    └── Models (Schemas Mongoose)
         │
    ↓ Mongoose/Driver
    │
DATABASE (MongoDB)
    ├── Collections: Admin, Usuario, Estatistica
    └── Índices (único, partial, etc)
```

### Responsabilidades por Camada

#### **Frontend (React)**
- Captura entrada do usuário (formulários, câmera)
- Renderiza UI baseada em estado
- Gerencia autenticação via JWT tokens
- Integra com face-api.js para detecção facial
- Comunica com backend via fetch/axios

#### **Backend (Node.js)**
- Valida requisições (middlewares)
- Executa lógica de negócio (controllers)
- Implementa algoritmos (services)
- Persiste dados (MongoDB via Mongoose)
- Gerencia autenticação (JWT)

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

### 1. MODELOS (Models)

Os modelos definem a estrutura dos dados persistidos no MongoDB via Mongoose.

#### **Admin.js** - Usuários Administrativos

**Responsabilidade:** Armazenar credenciais e permissões de administradores.

```javascript
// Arquivo: backend/models/Admin.js

Schema {
  nome: {
    type: String,
    required: true,
    unique: true,  // Evita nomes duplicados
    lowercase: true
  },
  
  senha: {
    type: String,
    required: true,
    minlength: 8,  // Mínimo 8 caracteres
    // Armazenada como hash bcrypt, nunca plaintext
  },
  
  funcao: {
    type: String,
    enum: ['admin', 'seguranca', 'super-admin', 'desenvolvedor'],
    required: true
  },
  
  ativo: {
    type: Boolean,
    default: true
  },
  
  ultimoLogin: {
    type: Date,
    default: null
  },
  
  timestamps: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }
}
```

**Índices Especiais:**
- `unique` em `nome` → Busca O(1) por nome
- `unique: true, partialFilterExpression: { funcao: 'super-admin' }` → Garante apenas 1 super-admin
- `unique: true, partialFilterExpression: { funcao: 'desenvolvedor' }` → Garante apenas 1 desenvolvedor

**Métodos Customizados:**
```javascript
// Virtual field
virtual('dataCadastro').get(function() {
  return this.createdAt;
});

// Antes de salvar
pre('save', async function() {
  if (this.isModified('senha')) {
    this.senha = await bcrypt.hash(this.senha, 12);
  }
});

// Serialização
toJSON() {
  // Remove campo senha antes de enviar para frontend
  const obj = this.toObject();
  delete obj.senha;
  return obj;
}
```

#### **Usuario.js** - Usuários do Sistema (Alunos, Professores, etc)

**Responsabilidade:** Armazenar dados de usuários finais com reconhecimento facial.

```javascript
// Arquivo: backend/models/Usuario.js

Schema {
  nome: {
    type: String,
    required: true,
    unique: true  // Evita nomes duplicados
  },
  
  tipoUsuario: {
    type: String,
    enum: ['Aluno', 'Professor', 'Funcionario', 'Outro'],
    required: true
  },
  
  descriptor: {
    type: [Number],  // Array de 128 números
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length === 128;
      },
      message: 'Descriptor deve ter exatamente 128 dimensões'
    }
  },
  
  dataCadastro: {
    type: Date,
    default: Date.now
  },
  
  status: {
    type: String,
    enum: ['liberado', 'bloqueado'],
    default: 'liberado'
  },
  
  bloqueadoAte: {
    type: Date,
    default: null  // null = desbloqueado
  },
  
  timestamps: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }
}
```

**O que é o Descriptor?**
- **Função:** Representação numérica única do rosto (fingerprint facial)
- **Origem:** Extraído por face-recognition-net (modelo neural)
- **Dimensões:** 128 números float (128-D embedding space)
- **Uso:** Comparação com outros descriptors via similaridade cosseno
- **Privacidade:** Não permite reconstrução da face original

**Índices:**
- `unique` em `nome` → Busca rápida de usuários

#### **Estatistica.js** - Métricas do Sistema

**Responsabilidade:** Singleton que armazena estatísticas globais.

```javascript
// Arquivo: backend/models/Estatistica.js

Schema {
  totalVerificacoes: {
    type: Number,
    default: 0  // Incrementado a cada verificação de rosto
  },
  
  ultimaAtualizacao: {
    type: Date,
    default: Date.now
  }
}
```

**Padrão Singleton:**
```javascript
// Garante apenas 1 documento na coleção
static async getInstance() {
  let stats = await Estatistica.findOne();
  if (!stats) {
    stats = await Estatistica.create({});
  }
  return stats;
}

// Incrementa verificações
static async incrementarVerificacoes() {
  const stats = await Estatistica.getInstance();
  stats.totalVerificacoes += 1;
  stats.ultimaAtualizacao = new Date();
  await stats.save();
}
```

---

### 2. CONTROLADORES (Controllers)

Os controladores implementam a lógica de negócio e orquestram modelos + serviços.

#### **usuarioController.js** - Gerenciamento de Usuários

**Responsabilidade:** CRUD de usuários finais + verificação facial.

**Métodos Principais:**

```javascript
// POST /api/usuarios/cadastrar
exportar.cadastrarUsuario = async (req, res) => {
  const { nome, tipoUsuario, descriptor } = req.body;
  
  // 1. Validar duplicação
  const duplicado = await faceRecognitionService.verificarRostoExistente(
    descriptor, 
    0.96  // threshold 96%
  );
  
  if (duplicado) {
    return res.status(400).json({
      erro: 'Rosto já cadastrado no sistema'
    });
  }
  
  // 2. Criar novo usuário
  const usuario = new Usuario({
    nome,
    tipoUsuario,
    descriptor,
    status: 'liberado'
  });
  
  await usuario.save();
  
  res.status(201).json({
    success: true,
    usuario: usuario.toJSON(),
    message: 'Usuário cadastrado com sucesso'
  });
};

// POST /api/verificar-rosto
exports.verificarRosto = async (req, res) => {
  const { descriptor, contexto } = req.body;
  // contexto: 'verificacao', 'merenda', 'cadastro'
  
  // 1. Buscar usuário similar
  const usuario = await faceRecognitionService
    .encontrarUsuarioPorSimilaridade(descriptor, 0.96);
  
  if (!usuario) {
    return res.status(404).json({
      existe: false,
      message: 'Rosto não encontrado no sistema'
    });
  }
  
  // 2. Verificar bloqueio (merenda)
  const bloqueado = usuario.status === 'bloqueado' 
    && usuario.bloqueadoAte > new Date();
  
  // 3. Incrementar estatísticas
  await Estatistica.incrementarVerificacoes();
  
  // 4. Retornar resultado
  res.json({
    existe: true,
    bloqueado,
    dados: {
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        tipoUsuario: usuario.tipoUsuario,
        dataCadastro: usuario.dataCadastro,
        status: usuario.status,
        bloqueadoAte: usuario.bloqueadoAte
      },
      similaridade: usuario.similaridadeCalculada,  // Percentual
      distancia: new Date() - usuario.dataCadastro
    }
  });
};

// GET /api/usuarios/listar?nome=...
exports.listarUsuarios = async (req, res) => {
  const { nome } = req.query;
  
  let query = Usuario.find().select('-descriptor');
  
  if (nome) {
    // Busca case-insensitive com regex
    query = query.where('nome').regex(new RegExp(nome, 'i'));
  }
  
  const usuarios = await query
    .sort({ dataCadastro: -1 })
    .exec();
  
  res.json({
    total: usuarios.length,
    usuarios
  });
};

// DELETE /api/usuarios/remover/:id
exports.removerUsuario = async (req, res) => {
  const { id } = req.params;
  
  await Usuario.findByIdAndDelete(id);
  
  res.json({
    success: true,
    message: 'Usuário removido com sucesso'
  });
};

// PATCH /api/usuarios/bloquear/:id
exports.bloquearUsuario = async (req, res) => {
  const { id } = req.params;
  
  const usuario = await Usuario.findById(id);
  usuario.status = 'bloqueado';
  usuario.bloqueadoAte = new Date(Date.now() + 60000);  // 60 segundos
  
  await usuario.save();
  
  // Agendar desbloqueio automático
  setTimeout(async () => {
    usuario.status = 'liberado';
    usuario.bloqueadoAte = null;
    await usuario.save();
  }, 60000);
  
  res.json({
    success: true,
    message: 'Usuário bloqueado por 60 segundos'
  });
};
```

#### **adminController.js** - Gerenciamento de Administradores

**Responsabilidade:** Autenticação + CRUD de admins.

```javascript
// POST /api/admin/login (PUBLIC)
exports.login = async (req, res) => {
  const { nome, senha } = req.body;
  
  // 1. Buscar admin
  const admin = await Admin.findOne({ nome: nome.toLowerCase() });
  
  if (!admin) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }
  
  // 2. Validar senha
  const senhaValida = await validarSenha(senha, admin.senha);
  
  if (!senhaValida) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }
  
  // 3. Gerar tokens
  const accessToken = gerarAccessToken({
    id: admin._id,
    nome: admin.nome,
    funcao: admin.funcao
  });
  
  const refreshToken = gerarRefreshToken({
    id: admin._id
  });
  
  // 4. Definir cookies httpOnly
  definirTokens(res, accessToken, refreshToken);
  
  admin.ultimoLogin = new Date();
  await admin.save();
  
  res.json({
    success: true,
    admin: {
      id: admin._id,
      nome: admin.nome,
      funcao: admin.funcao
    },
    message: 'Login realizado com sucesso'
  });
};

// POST /api/admin/refresh-token (PUBLIC)
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  
  try {
    const payload = verificarRefreshToken(refreshToken);
    
    const newAccessToken = gerarAccessToken({
      id: payload.id,
      nome: payload.nome,
      funcao: payload.funcao
    });
    
    const newRefreshToken = gerarRefreshToken({
      id: payload.id
    });
    
    definirTokens(res, newAccessToken, newRefreshToken);
    
    res.json({ success: true });
  } catch (error) {
    res.status(401).json({ erro: 'Token inválido' });
  }
};

// POST /api/admin/logout
exports.logout = (req, res) => {
  removerTokens(res);
  res.json({ success: true });
};

// POST /api/admin/cadastrar (requer super-admin/desenvolvedor)
exports.cadastrarAdmin = async (req, res) => {
  const { nome, senha, funcao } = req.body;
  const { funcao: funcaoUser } = req.usuario;
  
  // Apenas super-admin/desenvolvedor
  if (!['super-admin', 'desenvolvedor'].includes(funcaoUser)) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }
  
  // Validar funcao
  if (!['admin', 'seguranca'].includes(funcao)) {
    return res.status(400).json({
      erro: 'Função deve ser "admin" ou "seguranca"'
    });
  }
  
  // Validar duplicação
  const existing = await Admin.findOne({ nome: nome.toLowerCase() });
  if (existing) {
    return res.status(400).json({ erro: 'Nome já existe' });
  }
  
  // Criar admin
  const admin = new Admin({
    nome: nome.toLowerCase(),
    senha,  // bcrypt faz hash no pre('save')
    funcao,
    ativo: true
  });
  
  await admin.save();
  
  res.status(201).json({
    success: true,
    admin: admin.toJSON()
  });
};

// GET /api/admin/verificar (requer autenticação)
exports.verificarAutenticacao = async (req, res) => {
  // req.usuario foi populado por middleware autenticarToken
  res.json({
    autenticado: true,
    admin: req.usuario
  });
};

// GET /api/admin/listar
exports.listarAdmins = async (req, res) => {
  const admins = await Admin.find()
    .select('-senha')
    .sort({ createdAt: -1 });
  
  res.json({
    total: admins.length,
    admins
  });
};

// DELETE /api/admin/remover/:id
exports.removerAdmins = async (req, res) => {
  const { id } = req.params;
  const { id: idUser } = req.usuario;
  
  // Impedir auto-deleção
  if (id === idUser) {
    return res.status(400).json({
      erro: 'Você não pode deletar sua própria conta'
    });
  }
  
  await Admin.findByIdAndDelete(id);
  
  res.json({ success: true });
};

// PUT /api/admin/atualizar-senha
exports.atualizarSenha = async (req, res) => {
  const { nova_senha } = req.body;
  const { id } = req.usuario;
  
  const admin = await Admin.findById(id);
  admin.senha = nova_senha;  // bcrypt faz hash no pre('save')
  await admin.save();
  
  res.json({ success: true, message: 'Senha atualizada' });
};
```

**Startup Function:**
```javascript
// Criada uma única vez ao iniciar o servidor
async function cadastrarDesenvolvedor(Admin) {
  const existing = await Admin.findOne({ funcao: 'desenvolvedor' });
  
  if (!existing) {
    // Fallback: variáveis de ambiente
    const nome = process.env.DEV_USER_NOME || 'desenvolvedor';
    const senha = process.env.DEV_USER_SENHA || 'admin123456';
    
    const admin = new Admin({
      nome,
      senha,
      funcao: 'desenvolvedor'
    });
    
    await admin.save();
    console.log('✅ Usuário desenvolvedor criado com sucesso');
  }
}
```

#### **estatisticaController.js** - Relatórios e Estatísticas

**Responsabilidade:** Agregação de dados para dashboards.

```javascript
// GET /api/estatisticas
exports.obterEstatisticas = async (req, res) => {
  const stats = await Estatistica.getInstance();
  const totalUsuarios = await Usuario.countDocuments();
  
  res.json({
    totalUsuarios,
    totalVerificacoes: stats.totalVerificacoes,
    ultimaAtualizacao: stats.ultimaAtualizacao
  });
};

// GET /api/estatisticas/detalhadas
exports.obterEstatisticasDetalhadas = async (req, res) => {
  const stats = await Estatistica.getInstance();
  
  // Agregação: usuários por tipo
  const usuariosPorTipo = await Usuario.aggregate([
    {
      $group: {
        _id: '$tipoUsuario',
        quantidade: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  // Primeiro e último cadastro
  const primeiroCadastro = await Usuario.findOne()
    .sort({ dataCadastro: 1 })
    .select('dataCadastro');
  
  const ultimoCadastro = await Usuario.findOne()
    .sort({ dataCadastro: -1 })
    .select('dataCadastro');
  
  res.json({
    totalCadastros: await Usuario.countDocuments(),
    totalVerificacoes: stats.totalVerificacoes,
    usuariosPorTipo,
    primeiroCadastro: primeiroCadastro?.dataCadastro || null,
    ultimoCadastro: ultimoCadastro?.dataCadastro || null
  });
};

// POST /api/estatisticas/reset (requer autenticação)
exports.reiniciarVerificacoes = async (req, res) => {
  const stats = await Estatistica.getInstance();
  stats.totalVerificacoes = 0;
  await stats.save();
  
  res.json({ success: true });
};

// POST /api/estatisticas/relatorio
exports.gerarRelatorio = async (req, res) => {
  const dataRelatorio = new Date();
  const totalCadastros = await Usuario.countDocuments();
  
  // Pipeline MongoDB
  const usuariosOrganizados = await Usuario.aggregate([
    {
      $group: {
        _id: '$tipoUsuario',
        usuarios: {
          $push: {
            id: '$_id',
            nome: '$nome',
            dataCadastro: '$dataCadastro',
            status: '$status'
          }
        }
      }
    },
    {
      $project: {
        tipo: '$_id',
        quantidade: { $size: '$usuarios' },
        usuarios: {
          $sortArray: { input: '$usuarios', sortBy: { nome: 1 } }
        },
        _id: 0
      }
    },
    { $match: { quantidade: { $gt: 0 } } },
    { $sort: { tipo: 1 } }
  ]);
  
  const stats = await Estatistica.getInstance();
  
  res.json({
    dataRelatorio,
    totalCadastros,
    totalVerificacoes: stats.totalVerificacoes,
    usuariosOrganizados
  });
};
```

---

### 3. SERVIÇOS (Services)

Services encapsulam lógica de negócio complexa ou algoritmos.

#### **faceRecognitionService.js** - Reconhecimento Facial

**Responsabilidade:** Algoritmo de comparação de faces (similaridade cosseno).

```javascript
// Arquivo: backend/services/faceRecognitionService.js

class FaceRecognitionService {
  constructor() {
    this.threshold = 0.96;  // 96% de similaridade
  }
  
  /**
   * Calcula similaridade entre dois descriptors usando cosseno
   * 
   * @param {number[]} descriptor1 - Array de 128 números
   * @param {number[]} descriptor2 - Array de 128 números
   * @returns {number} Similaridade [0, 1] onde 1 = idêntico
   * 
   * Fórmula: (A·B) / (||A|| × ||B||)
   */
  calcularSimilaridadeCossenos(descriptor1, descriptor2) {
    // Validações
    if (!Array.isArray(descriptor1) || descriptor1.length !== 128) {
      throw new Error('Descriptor1 deve ser array de 128 números');
    }
    if (!Array.isArray(descriptor2) || descriptor2.length !== 128) {
      throw new Error('Descriptor2 deve ser array de 128 números');
    }
    
    // Produto ponto (dot product)
    let dotProduct = 0;
    for (let i = 0; i < 128; i++) {
      dotProduct += descriptor1[i] * descriptor2[i];
    }
    
    // Norma euclidiana
    let norm1 = 0;
    let norm2 = 0;
    for (let i = 0; i < 128; i++) {
      norm1 += descriptor1[i] * descriptor1[i];
      norm2 += descriptor2[i] * descriptor2[i];
    }
    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);
    
    // Proteger divisão por zero
    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }
    
    // Cosseno
    const similaridade = dotProduct / (norm1 * norm2);
    
    // Normalizar para [0, 1]
    return (similaridade + 1) / 2;
  }
  
  /**
   * Busca melhor correspondência de rosto no banco
   * 
   * @param {number[]} descriptorBusca - Descriptor do rosto a verificar
   * @param {number} threshold - Mínimo de similaridade (0.96)
   * @returns {object} Usuário encontrado ou null
   * 
   * Complexidade: O(n) onde n = total de usuários
   * (Implicação: em grandes sistemas, usar índices ou busca vetorial)
   */
  async encontrarUsuarioPorSimilaridade(descriptorBusca, threshold) {
    const Usuario = require('../models/Usuario');
    
    const usuarios = await Usuario.find();
    let melhorMatch = null;
    let maiorSimilaridade = 0;
    
    for (const usuario of usuarios) {
      const similaridade = this.calcularSimilaridadeCossenos(
        descriptorBusca,
        usuario.descriptor
      );
      
      if (similaridade > maiorSimilaridade) {
        maiorSimilaridade = similaridade;
        melhorMatch = usuario;
      }
    }
    
    // Retornar apenas se acima do threshold
    if (maiorSimilaridade >= threshold) {
      melhorMatch.similaridadeCalculada = (maiorSimilaridade * 100).toFixed(2);
      return melhorMatch;
    }
    
    return null;
  }
  
  /**
   * Verifica se rosto já existe (wrapper da função acima)
   */
  async verificarRostoExistente(descriptor, threshold) {
    return this.encontrarUsuarioPorSimilaridade(descriptor, threshold);
  }
}

module.exports = new FaceRecognitionService();
```

**Interpretação da Similaridade:**
```
Valor         | Interpretação
0.96+         | ✅ Mesmo rosto (Usar para cadastro)
0.90-0.95     | ⚠️ Muito similar (revisar)
0.70-0.89     | ⚠️ Alguma semelhança (não usar)
< 0.70        | ❌ Rostos diferentes
```

---

### 4. ROTAS (Routes)

Definem os endpoints HTTP disponíveis.

#### **usuarioRoutes.js**

```javascript
// Arquivo: backend/routes/usuarioRoutes.js

const router = require('express').Router();
const usuarioController = require('../controllers/usuarioController');
const { 
  validateCadastroUsuario,
  validateVerificacaoRosto,
  validateIdParam,
  autenticarToken
} = require('../middlewares/validation');

// POST /api/usuarios/cadastrar
router.post(
  '/cadastrar',
  validateCadastroUsuario,
  autenticarToken,
  usuarioController.cadastrarUsuario
);

// POST /api/verificar-rosto
router.post(
  '/verificar-rosto',
  validateVerificacaoRosto,
  autenticarToken,
  usuarioController.verificarRosto
);

// GET /api/usuarios/listar?nome=...
router.get(
  '/listar',
  autenticarToken,
  usuarioController.listarUsuarios
);

// DELETE /api/usuarios/remover/:id
router.delete(
  '/remover/:id',
  validateIdParam,
  autenticarToken,
  usuarioController.removerUsuario
);

// DELETE /api/usuarios/remover-todos
router.delete(
  '/remover-todos',
  autenticarToken,
  usuarioController.removerTodosOsUsuarios
);

// PATCH /api/usuarios/bloquear/:id
router.patch(
  '/bloquear/:id',
  validateIdParam,
  autenticarToken,
  usuarioController.bloquearUsuario
);

module.exports = router;
```

#### **adminRoutes.js**

```javascript
// Arquivo: backend/routes/adminRoutes.js

const router = require('express').Router();
const adminController = require('../controllers/adminController');
const {
  validateLogin,
  validateCadastroAdmin,
  validateIdParam,
  validateMudancaDeSenha,
  autenticarToken
} = require('../middlewares/validation');

// POST /api/admin/login (PUBLIC - sem autenticação)
router.post(
  '/login',
  validateLogin,
  adminController.login
);

// POST /api/admin/refresh-token (PUBLIC)
router.post(
  '/refresh-token',
  adminController.refreshToken
);

// POST /api/admin/logout
router.post(
  '/logout',
  adminController.logout
);

// GET /api/admin/verificar
router.get(
  '/verificar',
  autenticarToken,
  adminController.verificarAutenticacao
);

// POST /api/admin/cadastrar (requer super-admin/dev)
router.post(
  '/cadastrar',
  validateCadastroAdmin,
  autenticarToken,
  adminController.cadastrarAdmin
);

// POST /api/admin/cadastrar/super-admin (requer dev)
router.post(
  '/cadastrar/super-admin',
  validateCadastroAdmin,
  autenticarToken,
  adminController.cadastrarSuperAdmin
);

// GET /api/admin/listar
router.get(
  '/listar',
  autenticarToken,
  adminController.listarAdmins
);

// DELETE /api/admin/remover/:id
router.delete(
  '/remover/:id',
  validateIdParam,
  autenticarToken,
  adminController.removerAdmins
);

// PUT /api/admin/atualizar-senha
router.put(
  '/atualizar-senha',
  validateMudancaDeSenha,
  autenticarToken,
  adminController.atualizarSenha
);

module.exports = router;
```

#### **estatisticaRoutes.js**

```javascript
// Arquivo: backend/routes/estatisticaRoutes.js

const router = require('express').Router();
const estatisticaController = require('../controllers/estatisticaController');
const { autenticarToken } = require('../middlewares/validation');

// GET /api/estatisticas (PUBLIC)
router.get(
  '/',
  estatisticaController.obterEstatisticas
);

// GET /api/estatisticas/detalhadas
router.get(
  '/detalhadas',
  estatisticaController.obterEstatisticasDetalhadas
);

// POST /api/estatisticas/reset (requer auth)
router.post(
  '/reset',
  autenticarToken,
  estatisticaController.reiniciarVerificacoes
);

// POST /api/estatisticas/relatorio (requer auth)
router.post(
  '/relatorio',
  autenticarToken,
  estatisticaController.gerarRelatorio
);

module.exports = router;
```

---

### 5. MIDDLEWARES (Middlewares)

Intermediários que processam requisições antes de chegarem aos controllers.

#### **validation.js**

```javascript
// Arquivo: backend/middlewares/validation.js

// Validação de login
exports.validateLogin = (req, res, next) => {
  const { nome, senha } = req.body;
  const errors = [];
  
  if (!nome) errors.push('Nome é obrigatório');
  if (!senha) errors.push('Senha é obrigatória');
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

// Validação de cadastro de usuário
exports.validateCadastroUsuario = (req, res, next) => {
  const { nome, tipoUsuario, descriptor } = req.body;
  const errors = [];
  
  if (!nome || typeof nome !== 'string') {
    errors.push('Nome é obrigatório e deve ser string');
  }
  
  if (!tipoUsuario || !['Aluno', 'Professor', 'Funcionario', 'Outro'].includes(tipoUsuario)) {
    errors.push('Tipo de usuário inválido');
  }
  
  if (!Array.isArray(descriptor) || descriptor.length !== 128) {
    errors.push('Descriptor deve ser array com 128 números');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

// Validação de verificação de rosto
exports.validateVerificacaoRosto = (req, res, next) => {
  const { descriptor, contexto } = req.body;
  const errors = [];
  
  if (!Array.isArray(descriptor) || descriptor.length !== 128) {
    errors.push('Descriptor inválido');
  }
  
  if (contexto && !['cadastro', 'verificacao', 'merenda'].includes(contexto)) {
    errors.push('Contexto deve ser: cadastro, verificacao ou merenda');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

// Validação de cadastro de admin
exports.validateCadastroAdmin = (req, res, next) => {
  const { nome, senha, funcao } = req.body;
  const errors = [];
  
  if (!nome || typeof nome !== 'string') {
    errors.push('Nome é obrigatório');
  }
  
  if (!senha || senha.length < 8) {
    errors.push('Senha deve ter mínimo 8 caracteres');
  }
  
  if (!funcao) {
    errors.push('Função é obrigatória');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

// Validação de ID em params
exports.validateIdParam = (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ erro: 'ID é obrigatório' });
  }
  
  next();
};

// Validação de mudança de senha
exports.validateMudancaDeSenha = (req, res, next) => {
  const { nova_senha, confirmacao_senha } = req.body;
  const errors = [];
  
  if (!nova_senha || nova_senha.length < 8) {
    errors.push('Nova senha deve ter mínimo 8 caracteres');
  }
  
  if (nova_senha !== confirmacao_senha) {
    errors.push('As senhas não correspondem');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

// Middleware de autenticação JWT
exports.autenticarToken = (req, res, next) => {
  const token = req.cookies.jwt;
  
  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }
  
  try {
    const payload = verificarAccessToken(token);
    req.usuario = payload;  // Armazena dados do admin
    next();
  } catch (error) {
    return res.status(403).json({ erro: 'Token inválido ou expirado' });
  }
};
```

---

### 6. CONFIGURAÇÕES (Config)

#### **database.js**

```javascript
// Arquivo: backend/config/database.js

class DatabaseConfig {
  static async conectar() {
    const mongoose = require('mongoose');
    
    try {
      await mongoose.connect(
        process.env.MONGO_URI || 'mongodb://localhost:27017/facedb',
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      );
      
      console.log('✅ Conectado ao MongoDB');
    } catch (error) {
      console.error('❌ Erro ao conectar MongoDB:', error.message);
      process.exit(1);
    }
  }
}

module.exports = DatabaseConfig;
```

#### **corsConfig.js**

```javascript
// Arquivo: backend/config/corsConfig.js

const corsConfig = {
  origin: [
    'http://localhost:5173',  // Frontend local
    'https://seu-frontend-react.com'  // Production (ajustar)
  ],
  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  allowedHeaders: ['Content-Type', 'Authorization'],
  
  credentials: true,  // Permite cookies cross-domain
  
  exposedHeaders: ['set-cookie'],
  
  maxAge: 3600  // 1 hora
};

module.exports = corsConfig;
```

#### **jwtConfig.js**

```javascript
// Arquivo: backend/config/jwtConfig.js

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'chave-super-secreta';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'chave-refresh-secreta';

// ==================== GERAÇÃO ====================

function gerarAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h'  // 1 hora
  });
}

function gerarRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: '7d'  // 7 dias
  });
}

// ==================== VERIFICAÇÃO ====================

function verificarAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function verificarRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

// ==================== COOKIES ====================

function definirTokens(res, accessToken, refreshToken) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('jwt', accessToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,  // HTTPS apenas em produção
    maxAge: 3600000  // 1 hora
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    maxAge: 604800000  // 7 dias
  });
}

function removerTokens(res) {
  res.clearCookie('jwt');
  res.clearCookie('refreshToken');
}

module.exports = {
  gerarAccessToken,
  gerarRefreshToken,
  verificarAccessToken,
  verificarRefreshToken,
  definirTokens,
  removerTokens
};
```

---

### 7. SERVIDOR (server.js)

Ponto de entrada da aplicação backend.

```javascript
// Arquivo: backend/server.js

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const DatabaseConfig = require('./config/database');
const corsConfig = require('./config/corsConfig');
const Admin = require('./models/Admin');

const app = express();

// ==================== MIDDLEWARES ====================

app.use(express.json());
app.use(cors(corsConfig));
app.use(cookieParser());

// ==================== ROTAS ====================

const usuarioRoutes = require('./routes/usuarioRoutes');
const adminRoutes = require('./routes/adminRoutes');
const estatisticaRoutes = require('./routes/estatisticaRoutes');

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/estatisticas', estatisticaRoutes);

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// ==================== INICIALIZAÇÃO ====================

async function iniciarServidor() {
  try {
    // Conectar banco de dados
    await DatabaseConfig.conectar();
    
    // Criar usuário desenvolvedor (se não existir)
    const dev = await Admin.findOne({ funcao: 'desenvolvedor' });
    if (!dev) {
      const novoDesenvolvedor = new Admin({
        nome: process.env.DEV_USER_NOME || 'desenvolvedor',
        senha: process.env.DEV_USER_SENHA || 'admin123456',
        funcao: 'desenvolvedor'
      });
      await novoDesenvolvedor.save();
      console.log('✅ Usuário "desenvolvedor" criado');
    }
    
    // Iniciar servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════╗
║  🚀 Sistema de Reconhecimento Facial Inicializado  ║
║  Servidor escutando na porta ${PORT}                  ║
║  MongoDB conectado com sucesso                      ║
╚════════════════════════════════════════════════════╝
      `);
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratament de sinais
process.on('SIGINT', () => {
  console.log('🛑 Encerrando servidor...');
  process.exit(0);
});

iniciarServidor();
```

---

## Documentação do Frontend

### 1. ESTRUTURA DE PASTAS

```
frontend/src/
├── App.tsx                          # Componente raiz + Router
├── main.tsx                         # Entry point
├── vite-env.d.ts                    # Tipos Vite
│
├── pages/                           # Páginas (telas completas)
│   ├── Login.tsx                    # Autenticação admin
│   ├── MenuPage.tsx                 # Dashboard central
│   ├── Cadastrar.tsx                # Cadastro facial
│   ├── Verificacao.tsx              # Verificação de identidade
│   ├── VerificarMerenda.tsx         # Controle de merenda
│   ├── Estatisticas.tsx             # Dashboard de relatórios
│   ├── AdminPage.tsx                # Gerenciamento de admins
│   └── UserManagement.tsx           # Gerenciamento de usuários
│
├── components/                      # Componentes reutilizáveis
│   └── VideoAndCanvas.tsx           # Vídeo + Canvas para detecção
│
├── hooks/                           # Custom hooks (lógica separada)
│   ├── api/
│   │   └── useApi.ts                # Error handling de API
│   │
│   ├── auth/
│   │   ├── useAuth.ts               # Autenticação JWT + estado
│   │   ├── useVerificacao.ts        # Ciclo de vida verificação
│   │   └── useVerificarStatus.ts    # Status bloqueio merenda
│   │
│   ├── detection/
│   │   └── useFaceDetection.ts      # Integração face-api.js
│   │
│   ├── frontend/
│   │   ├── useLogin.ts              # Lógica da página Login
│   │   ├── useCadastro.ts           # Lógica captura facial
│   │   ├── useAdminPage.ts          # Lógica CRUD admins
│   │   ├── useEstatisticas.ts       # Lógica estatísticas
│   │   └── useUserManagement.ts     # Lógica CRUD usuários
│   │
│   ├── validation/
│   │   └── useValidation.ts         # Validações de formulários
│   │
│   └── utils/
│       ├── useFormatData.ts         # Formatação de datas
│       └── useGerarRelatorio.ts     # Geração de PDF
│
├── types/                           # Tipos TypeScript
│   ├── admin.types.ts               # Tipos de admin
│   ├── api.types.ts                 # Tipos de API
│   ├── cadastro.types.ts            # Tipos de cadastro
│   ├── distance.types.ts            # Tipos de detecção
│   ├── estatisticas.types.ts        # Tipos de estatísticas
│   ├── face.type.ts                 # Tipos de rosto
│   ├── login.types.ts               # Tipos de login
│   ├── user.types.ts                # Tipos de usuário
│   └── validation.types.ts          # Tipos de validação
│
├── config/
│   └── url.ts                       # API Base URL
│
├── templates/
│   └── generatePdf.ts               # Gerador de PDF
│
└── styles/
    └── index.css                    # Estilos globais
```

---

### 2. PÁGINAS (Pages)

#### **Login.tsx** - Autenticação de Administradores

```typescript
// Arquivo: frontend/src/pages/Login.tsx

import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/frontend/useLogin';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const {
    nome,
    setNome,
    senha,
    setSenha,
    mostrarSenha,
    setMostrarSenha,
    error,
    loading,
    handleLogin
  } = useLogin(navigate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-96">
        <div className="flex items-center justify-center mb-8">
          <Lock size={32} className="text-blue-900" />
          <h1 className="text-3xl font-bold text-blue-900 ml-3">C.E.R.F</h1>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Acesso Administrativo
        </h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome de Usuário
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

**Responsabilidade:** Formulário de login para administradores. Integra com JWT authentication.

#### **MenuPage.tsx** - Dashboard Central

```typescript
// Arquivo: frontend/src/pages/MenuPage.tsx

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/auth/useAuth';
import { Users, Video, UtensilsCrossed, BarChart3, UserCog, Shield, LogOut } from 'lucide-react';

export default function MenuPage() {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: UserPlus,
      title: 'Cadastro de Usuário',
      description: 'Registrar novo usuário com reconhecimento facial',
      link: '/cadastro'
    },
    {
      icon: Video,
      title: 'Verificar Identidade',
      description: 'Verificar rosto contra banco de usuários',
      link: '/verificacao'
    },
    {
      icon: UtensilsCrossed,
      title: 'Verificação de Merenda',
      description: 'Controle de acesso à merenda escolar',
      link: '/verificacao-de-merenda'
    },
    {
      icon: BarChart3,
      title: 'Estatísticas',
      description: 'Visualizar relatórios e métricas',
      link: '/estatisticas'
    },
    {
      icon: Users,
      title: 'Gerenciar Usuários',
      description: 'CRUD de usuários cadastrados',
      link: '/gerenciar-usuarios'
    },
    {
      icon: Shield,
      title: 'Administração',
      description: 'Gerenciar admins e permissões',
      link: '/pagina-do-admin'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white p-6 shadow">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">C.E.R.F Dashboard</h1>
            <p className="text-blue-200">Bem-vindo, {admin?.nome}!</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </header>

      {/* Menu Items Grid */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.link}
              to={item.link}
              className="group bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition transform hover:scale-105"
            >
              <item.icon size={32} className="text-blue-900 group-hover:text-blue-600 mb-3" />
              <h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
```

**Responsabilidade:** Dashboard central com 6 opções de menu. Exibe nome do admin logado e botão de logout.

#### **Cadastrar.tsx** - Cadastro Facial com Captura

```typescript
// Arquivo: frontend/src/pages/Cadastrar.tsx

import { useState, useRef } from 'react';
import { useCadastro } from '../hooks/frontend/useCadastro';
import { VideoAndCanvas } from '../components/VideoAndCanvas';

export default function Cadastrar() {
  const {
    nome,
    setNome,
    tipoUsuario,
    setTipoUsuario,
    statusMessage,
    canSave,
    isDetecting,
    videoRef,
    canvasRef,
    distanceStatus,
    expressionStatus,
    modelsLoaded,
    handleIniciarReconhecimento,
    handlePararReconhecimento,
    handleSalvarCadastro
  } = useCadastro();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">Cadastro de Usuário</h1>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={isDetecting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Usuário</label>
              <select
                value={tipoUsuario}
                onChange={(e) => setTipoUsuario(e.target.value)}
                disabled={isDetecting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Selecione...</option>
                <option value="Aluno">Aluno</option>
                <option value="Professor">Professor</option>
                <option value="Funcionario">Funcionário</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vídeo + Canvas */}
        {!isDetecting ? (
          <button
            onClick={handleIniciarReconhecimento}
            disabled={!nome || !tipoUsuario || !modelsLoaded}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold"
          >
            Iniciar Reconhecimento
          </button>
        ) : (
          <>
            <VideoAndCanvas
              videoRef={videoRef}
              canvasRef={canvasRef}
              isDetecting={isDetecting}
              distanceStatus={distanceStatus}
              expressionStatus={expressionStatus}
            />
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={handlePararReconhecimento}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
              >
                Parar
              </button>
              <button
                onClick={handleSalvarCadastro}
                disabled={!canSave}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-lg"
              >
                Salvar Cadastro
              </button>
            </div>
          </>
        )}

        {statusMessage && (
          <div className={`mt-6 p-4 rounded-lg ${
            statusMessage.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Responsabilidade:** Captura facial para novo usuário. Integra face-api.js para detecção.

#### **Verificacao.tsx** - Verificação de Identidade

```typescript
// Arquivo: frontend/src/pages/Verificacao.tsx

import { useState, useRef } from 'react';
import { useVerificacao } from '../hooks/auth/useVerificacao';
import { useFaceDetection } from '../hooks/detection/useFaceDetection';
import { VideoAndCanvas } from '../components/VideoAndCanvas';

export default function Verificacao() {
  const {
    isInitialized,
    verificacaoCompleta,
    resultadoVerificacao,
    iniciarSistema,
    realizarVerificacao,
    reiniciarProcesso
  } = useVerificacao();

  const {
    modelsLoaded,
    isDetecting,
    currentDescriptor,
    distanceStatus,
    expressionStatus,
    videoRef,
    canvasRef,
    loadModels,
    startVideo,
    startDetection,
    stopDetection
  } = useFaceDetection();

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <button
          onClick={iniciarSistema}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg"
        >
          Iniciar Verificação
        </button>
      </div>
    );
  }

  if (!verificacaoCompleta) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">Verificação de Identidade</h1>
        
        <VideoAndCanvas
          videoRef={videoRef}
          canvasRef={canvasRef}
          isDetecting={isDetecting}
          distanceStatus={distanceStatus}
          expressionStatus={expressionStatus}
        />
        
        <button
          onClick={realizarVerificacao}
          disabled={!currentDescriptor || distanceStatus.status !== 'ideal'}
          className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold"
        >
          Verificar Identidade
        </button>
      </div>
    );
  }

  // Mostrar resultado
  if (resultadoVerificacao?.existe) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-100 border border-green-400 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-green-900 mb-4">Usuário Identificado!</h2>
          <div className="space-y-2 text-green-900">
            <p><strong>Nome:</strong> {resultadoVerificacao.dados.usuario.nome}</p>
            <p><strong>Tipo:</strong> {resultadoVerificacao.dados.usuario.tipoUsuario}</p>
            <p><strong>Similaridade:</strong> {resultadoVerificacao.dados.usuario.similaridade}%</p>
            <p><strong>Status:</strong> {resultadoVerificacao.bloqueado ? '🔴 Bloqueado' : '🟢 Liberado'}</p>
          </div>
        </div>
        
        <button
          onClick={reiniciarProcesso}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
        >
          Nova Verificação
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl text-red-600">Rosto não encontrado no sistema</h2>
      <button onClick={reiniciarProcesso}>Tentar novamente</button>
    </div>
  );
}
```

**Responsabilidade:** Identificar pessoa por rosto. Mostra resultado com dados do usuário.

---

### 3. HOOKS CUSTOMIZADOS (14 Hooks)

Os hooks encapsulam lógica reutilizável e gerenciam estado.

#### **useAuth.ts** - Autenticação JWT

```typescript
// Arquivo: frontend/src/hooks/auth/useAuth.ts

import { useState, useCallback } from 'react';
import { baseURL } from '../../config/url';
import { AdminData, LoginResponse } from '../../types/admin.types';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('adminData') !== null;
  });
  
  const [admin, setAdmin] = useState<AdminData | null>(() => {
    const stored = localStorage.getItem('adminData');
    return stored ? JSON.parse(stored) : null;
  });
  
  const [loading, setLoading] = useState(false);

  const login = useCallback(
    async (nome: string, senha: string): Promise<LoginResponse> => {
      setLoading(true);
      try {
        const response = await fetch(`${baseURL}/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',  // Envia cookies
          body: JSON.stringify({ nome, senha })
        });

        if (!response.ok) {
          throw new Error('Credenciais inválidas');
        }

        const data = await response.json();
        setAdmin(data.admin);
        setIsAuthenticated(true);
        localStorage.setItem('adminData', JSON.stringify(data.admin));

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`${baseURL}/admin/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setAdmin(null);
      setIsAuthenticated(false);
      localStorage.removeItem('adminData');
    }
  }, []);

  const verifyToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${baseURL}/admin/verificar`, {
        credentials: 'include'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${baseURL}/admin/refresh-token`, {
        method: 'POST',
        credentials: 'include'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }, []);

  const authenticatedFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const response = await fetch(`${baseURL}${url}`, {
        ...options,
        credentials: 'include'
      });

      if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return fetch(`${baseURL}${url}`, {
            ...options,
            credentials: 'include'
          });
        }
      }

      return response;
    },
    [refreshAccessToken]
  );

  return {
    isAuthenticated,
    admin,
    loading,
    login,
    logout,
    verifyToken,
    refreshAccessToken,
    authenticatedFetch
  };
}
```

#### **useFaceDetection.ts** - Integração face-api.js

```typescript
// Arquivo: frontend/src/hooks/detection/useFaceDetection.ts

import { useState, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { DistanceResult, ExpressionStatus } from '../../types/distance.types';

export function useFaceDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentDescriptor, setCurrentDescriptor] = useState<number[] | null>(null);
  const [distanceStatus, setDistanceStatus] = useState<DistanceResult>({
    status: 'sem_face',
    isIdeal: false
  });
  const [expressionStatus, setExpressionStatus] = useState<ExpressionStatus>({
    expression: 'unknown',
    isNeutral: false,
    confidence: 0
  });

  // Configs de distância
  const minFaceSize = 150;
  const maxFaceSize = 350;
  const idealMinSize = 180;
  const idealMaxSize = 280;

  // Carregar modelos face-api
  const loadModels = useCallback(async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
      ]);
      setModelsLoaded(true);
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
    }
  }, []);

  // Iniciar vídeo
  const startVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
    }
  }, []);

  // Detecção contínua
  const startDetection = useCallback(async () => {
    setIsDetecting(true);
    
    const detectLoop = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()
        .withFaceExpressions();

      // Limpar canvas
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }

      if (!detections) {
        setDistanceStatus({ status: 'sem_face', isIdeal: false });
        setCurrentDescriptor(null);
        return;
      }

      // Calcular tamanho da face
      const box = detections.detection.box;
      const width = box.width;

      // Determinar status de distância
      let status: 'sem_face' | 'muito_perto' | 'muito_longe' | 'ideal' = 'ideal';
      if (width < minFaceSize) {
        status = 'muito_longe';
      } else if (width > maxFaceSize) {
        status = 'muito_perto';
      } else if (width < idealMinSize || width > idealMaxSize) {
        status = 'ideal';  // Dentro do range mas não ideal
      }

      // Avaliar expressão
      const expressions = detections.expressions;
      const isNeutral = expressions.neutral > 0.7;
      const topExpression = Object.entries(expressions).sort(
        ([, a], [, b]) => b - a
      )[0];

      setDistanceStatus({
        status,
        isIdeal: status === 'ideal' && width >= idealMinSize && width <= idealMaxSize
      });

      setExpressionStatus({
        expression: topExpression[0],
        isNeutral,
        confidence: topExpression[1]
      });

      // Extrair descriptor se ideal
      if (status === 'ideal' && isNeutral) {
        setCurrentDescriptor(Array.from(detections.descriptor));
      }

      // Desenhar detecção no canvas
      faceapi.draw.drawDetections(canvasRef.current, [detections]);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, [detections]);
    }, 100);

    return () => clearInterval(detectLoop);
  }, []);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  }, []);

  return {
    videoRef,
    canvasRef,
    modelsLoaded,
    isDetecting,
    currentDescriptor,
    distanceStatus,
    expressionStatus,
    loadModels,
    startVideo,
    startDetection,
    stopDetection
  };
}
```

#### **useCadastro.ts** - Orquestração de Cadastro

```typescript
// Arquivo: frontend/src/hooks/frontend/useCadastro.ts

import { useState, useRef } from 'react';
import { useFaceDetection } from '../detection/useFaceDetection';
import { useAuth } from '../auth/useAuth';
import { useValidation } from '../validation/useValidation';
import { baseURL } from '../../config/url';

export function useCadastro() {
  const [nome, setNome] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [canSave, setCanSave] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    modelsLoaded,
    isDetecting,
    currentDescriptor,
    distanceStatus,
    expressionStatus,
    loadModels,
    startVideo,
    startDetection,
    stopDetection
  } = useFaceDetection();

  const { authenticatedFetch } = useAuth();
  const { validateCadastroForm } = useValidation();

  const handleIniciarReconhecimento = async () => {
    const { isValid, errors } = validateCadastroForm(nome, tipoUsuario);
    
    if (!isValid) {
      setStatusMessage(`Erro: ${errors.join(', ')}`);
      return;
    }

    await loadModels();
    await startVideo();
    // Iniciar detecção assim que vídeo carregar
    videoRef.current?.addEventListener('loadedmetadata', startDetection, { once: true });
  };

  const handlePararReconhecimento = () => {
    stopDetection();
  };

  const handleSalvarCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentDescriptor) {
      setStatusMessage('Erro: Nenhum rosto detectado');
      return;
    }

    try {
      const response = await authenticatedFetch('/usuarios/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          tipoUsuario,
          descriptor: currentDescriptor
        })
      });

      if (!response.ok) {
        const error = await response.json();
        setStatusMessage(`Erro: ${error.erro || 'Erro ao salvar'}`);
        return;
      }

      setStatusMessage('✅ Usuário cadastrado com sucesso!');
      setNome('');
      setTipoUsuario('');
      setCanSave(false);
      stopDetection();
    } catch (error) {
      setStatusMessage(`Erro: ${(error as Error).message}`);
    }
  };

  // Atualizar canSave quando descriptor ideal for detectado
  React.useEffect(() => {
    if (currentDescriptor && distanceStatus.isIdeal && expressionStatus.isNeutral) {
      setCanSave(true);
      setStatusMessage('✅ Posição ideal! Clique em "Salvar Cadastro"');
    } else {
      setCanSave(false);
    }
  }, [currentDescriptor, distanceStatus, expressionStatus]);

  return {
    nome,
    setNome,
    tipoUsuario,
    setTipoUsuario,
    statusMessage,
    canSave,
    isDetecting,
    videoRef,
    canvasRef,
    distanceStatus,
    expressionStatus,
    modelsLoaded,
    handleIniciarReconhecimento,
    handlePararReconhecimento,
    handleSalvarCadastro
  };
}
```

---

### 4. TIPOS TYPESCRIPT

#### **face.type.ts** - Tipos de Resposta de Rosto

```typescript
// Arquivo: frontend/src/types/face.type.ts

export interface VerificarRostoResponse {
  existe: boolean;
  bloqueado?: boolean;
  dados?: {
    usuario: {
      id: string;
      nome: string;
      tipoUsuario: 'Aluno' | 'Professor' | 'Funcionario' | 'Outro';
      dataCadastro: string;
      status: 'liberado' | 'bloqueado';
      bloqueadoAte: string | null;
    };
    similaridade: number;  // Percentual (0-100)
    distancia: number;     // Millisegundos desde cadastro
  };
  message?: string;
}

export interface FaceDescriptor {
  descriptor: number[];  // Array de 128 números
  confidence: number;
}
```

#### **admin.types.ts** - Tipos de Administrador

```typescript
// Arquivo: frontend/src/types/admin.types.ts

export interface AdminData {
  id: string;
  nome: string;
  funcao: 'admin' | 'seguranca' | 'super-admin' | 'desenvolvedor';
}

export interface AdminSign {
  nome: string;
  senha: string;
  funcao: 'admin' | 'seguranca';
}

export interface LoginResponse {
  success: boolean;
  error?: string;
}
```

---

### 5. COMPONENTES

#### **VideoAndCanvas.tsx** - Elemento de Vídeo e Detecção

```typescript
// Arquivo: frontend/src/components/VideoAndCanvas.tsx

import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { DistanceResult, ExpressionStatus } from '../types/distance.types';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isDetecting: boolean;
  distanceStatus: DistanceResult;
  expressionStatus: ExpressionStatus;
  getDistanceMessage?: (status: string) => string;
}

export function VideoAndCanvas({
  videoRef,
  canvasRef,
  isDetecting,
  distanceStatus,
  expressionStatus,
  getDistanceMessage
}: Props) {
  const borderColor = {
    'ideal': distanceStatus.isIdeal && expressionStatus.isNeutral ? 'border-green-500' : 'border-yellow-500',
    'muito_perto': 'border-red-500',
    'muito_longe': 'border-red-500',
    'sem_face': 'border-red-500'
  }[distanceStatus.status];

  return (
    <div className={`relative border-4 ${borderColor} rounded-lg overflow-hidden bg-black w-full aspect-video`}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Indicadores */}
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        {/* Distância */}
        <div className={`flex items-center gap-2 p-2 rounded ${
          distanceStatus.isIdeal ? 'bg-green-500' : 'bg-yellow-500'
        } text-white font-semibold`}>
          {distanceStatus.isIdeal ? (
            <CheckCircle size={24} />
          ) : (
            <AlertCircle size={24} />
          )}
          <span>
            {distanceStatus.status === 'muito_perto' && 'Afaste-se da câmera'}
            {distanceStatus.status === 'muito_longe' && 'Aproxime-se da câmera'}
            {distanceStatus.status === 'ideal' && 'Posição ideal!'}
            {distanceStatus.status === 'sem_face' && 'Nenhum rosto detectado'}
          </span>
        </div>

        {/* Expressão */}
        {expressionStatus.expression !== 'neutral' && (
          <div className={`flex items-center gap-2 p-2 rounded text-white font-semibold ${
            expressionStatus.isNeutral ? 'bg-green-500' : 'bg-yellow-500'
          }`}>
            <AlertCircle size={20} />
            <span>
              {expressionStatus.isNeutral ? 'Expressão neutra ✓' : 'Mantenha expressão neutra'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### 6. CONFIGURAÇÃO & TEMPLATES

#### **url.ts** - Base URL da API

```typescript
// Arquivo: frontend/src/config/url.ts

export const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

#### **generatePdf.ts** - Gerador de Relatório PDF

```typescript
// Arquivo: frontend/src/templates/generatePdf.ts

import jsPDF from 'jspdf';

export function generatePdf(dadosRelatorio: any) {
  const doc = new jsPDF();
  
  // Cabeçalho
  doc.setFontSize(16);
  doc.text('Relatório de Usuários Cadastrados', 10, 10);
  
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleString('pt-BR')}`, 10, 20);
  doc.text(`Total de Cadastros: ${dadosRelatorio.totalCadastros}`, 10, 30);
  doc.text(`Total de Verificações: ${dadosRelatorio.totalVerificacoes}`, 10, 40);
  
  // Tabelas por tipo
  let yPosition = 60;
  
  dadosRelatorio.usuariosOrganizados.forEach((grupo: any) => {
    doc.setFontSize(12);
    doc.text(`${grupo.tipo} (${grupo.quantidade} usuários)`, 10, yPosition);
    yPosition += 10;
    
    grupo.usuarios.forEach((usuario: any) => {
      doc.setFontSize(9);
      doc.text(`• ${usuario.nome}`, 15, yPosition);
      yPosition += 6;
    });
    
    yPosition += 5;
  });
  
  // Salvar
  doc.save(`relatorio_${new Date().toISOString().split('T')[0]}.pdf`);
}
```

---

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
│ UI: "✅ Cadastro com sucesso!"  │
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
│ │ ✅ Usuário Identificado!   │
│ │ Nome: João Silva           │
│ │ Tipo: Aluno                │
│ │ Similaridade: 98.5%        │
│ │ Status: 🟢 Liberado        │
│ └────────────────────────────┘
│                              │
│ Se não encontrado:           │
│ ┌────────────────────────────┐
│ │ ❌ Rosto não encontrado    │
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
           │  └─ "⏳ Já pegou merenda"
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
│ "⏳ Bloqueado por 60 segundos"    │
│                                  │
│ [Wait 60s]                       │
│           ▼                      │
│ "✅ Desbloqueado automaticamente" │
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
```javascript
// Estatistica.getInstance() garante apenas 1 doc
static async getInstance() {
  let doc = await Estatistica.findOne();
  if (!doc) doc = await Estatistica.create({});
  return doc;
}
```

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

| Tipo | Duração | Armazenamento | Propósito |
|---|---|---|---|
| **Access Token** | 1 hora | Cookie httpOnly | Autenticação de requisições |
| **Refresh Token** | 7 dias | Cookie httpOnly | Geração de novo accessToken |

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
```javascript
{
  credentials: true,      // Permite cookies
  methods: GET, POST, PUT, DELETE, PATCH,
  headers: Content-Type, Authorization,
  maxAge: 3600
}
```

### Proteção contra Ataques

| Ameaça | Proteção |
|---|---|---|
| **CSRF** | httpOnly cookies + SameSite: strict |
| **XSS** | React escapa automaticamente |
| **Força Bruta** | (Não implementado - considerar) |
| **SQL Injection** | Mongoose previne (não é SQL) |
| **Senha fraca** | Validação min 8 caracteres |

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

```javascript
// Buscar usuário por nome (case-insensitive)
Usuario.findOne({ nome: /regex/i })

// Agregação: Usuários por tipo
Usuario.aggregate([
  { $group: { _id: '$tipoUsuario', quantidade: { $sum: 1 } } }
])

// Incrementar contador
Estatistica.findByIdAndUpdate(id, { $inc: { totalVerificacoes: 1 } })

// Buscar todos excluindo field
Usuario.find().select('-descriptor')
```

---

## Fluxo de Inicialização

### Backend

```bash
# 1. Instalação
$ cd backend
$ npm install  # ou pnpm install

# 2. Configuração (.env)
DATABASE_URL=mongodb://localhost:27017/facedb
JWT_SECRET=sua-chave-secreta
REFRESH_TOKEN_SECRET=sua-chave-refresh
DEV_USER_NOME=desenvolvedor
DEV_USER_SENHA=admin123456

# 3. Startup
$ node server.js
# Output:
# ✅ Conectado ao MongoDB
# ✅ Usuário "desenvolvedor" criado
# 🚀 Servidor escutando na porta 3000
```

### Frontend

```bash
# 1. Instalação
$ cd frontend
$ npm install  # ou pnpm install

# 2. Configuração de URL (src/config/url.ts)
export const baseURL = 'http://localhost:3000/api'

# 3. Dev Server
$ npm run dev  # ou pnpm dev
# Output:
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help

# 4. Build para produção
$ npm run build
$ npm run preview
```

### Sequência Completa

```
Terminal 1: MongoDB
$ mongod  # Inicia MongoDB na porta 27017

Terminal 2: Backend
$ cd backend && npm install && node server.js
# Conecta MongoDB
# Cria desenvolvedor
# Escuta :3000

Terminal 3: Frontend
$ cd frontend && npm install && npm run dev
# Vite dev server :5173
# Hot reload ativo
# Conecta em localhost:3000/api

Browser:
$ Acessa http://localhost:5173
$ Vê tela de login
$ Login com desenvolvedor/admin123456
```

---

## Guia de Suporte para Agentes IA

### Como Usar Este Documento

Este arquivo foi estruturado para facilitar:

1. **Busca Rápida de Contexto:**
   - Use Ctrl+F para buscar por: `interface`, `class`, `function`, `endpoint`
   - Cabeçalhos estruturados com ✅ ✅ ✅ para fácil scanning

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

| Tarefa | Seção | Arquivos Chave |
|---|---|---|
| **Adicionar rota** | 4.4 | routes/*.js, controllers/*.js |
| **Adicionar validação** | 4.5 | middlewares/validation.js |
| **Adicionar página** | 5.2 | pages/*.tsx, hooks/frontend/*.ts |
| **Adicionar hook** | 5.3 | hooks/**/*.ts |
| **Alterar modelo** | 4.1 | models/*.js |
| **Bug em autenticação** | 8 | auth/useAuth.ts, jwtConfig.js |
| **Bug em face detection** | 5.3 | useFaceDetection.ts, face-api.js |
| **Relatório/Agregação** | 4.2.3 | estatisticaController.js, MongoDB |

### Exemplos de Busca Rápida

```
Buscar por:                    Vá para:
"POST /api/usuarios"           Seção 4.4 - usuarioRoutes.js
"face-api"                     Seção 5.3 - useFaceDetection.ts
"similaridade cosseno"         Seção 4.3 - faceRecognitionService.js
"JWT"                          Seção 8 - Segurança
"descriptor"                   Seção 4.1 - Usuario.js
```

### Versioning & Manutenção

**Última atualização:** 1º de Abril de 2026  
**Versão:** 1.0  
**Próximas versões devem:**
- Atualizar versões de dependências
- Adicionar novas funcionalidades aqui
- Re-validar fluxos de dados
- Atualizar exemplos de código

---

## Conclusão

Este documento fornece uma visão completa e estruturada da arquitetura do C.E.R.F. Todos os componentes, fluxos, padrões e decisões arquiteturais foram documentados de forma acessível tanto para agentes de IA quanto para humanos.

**Para suporte ou dúvidas sobre a arquitetura, consulte:**
- [README.md](../README.md) - Guia de execução
- [docs/](../) - Diagramas visuais
- Código fonte - Comentários inline em arquivos críticos

---

**Desenvolvido para:** Feira de Ciências 2025 - CETEP Ipirá, BA  
**Status:** Projeto Acadêmico com potencial de escalabilidade  
**Licença:** CC BY-NC-ND 4.0
