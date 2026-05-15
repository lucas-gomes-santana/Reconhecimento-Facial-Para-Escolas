# Estratégia de Testes - Backend C.E.R.F

## Visão Geral

Este documento define a estratégia inicial de testes para o backend do sistema de reconhecimento facial C.E.R.F. O objetivo é garantir cobertura focada nas partes mais críticas do sistema, com compatibilidade entre JavaScript e TypeScript para facilitar a futura migração.

---

## 1. Ferramentas Recomendadas

| Ferramenta                | Propósito                                  | Versão Sugerida |
| ------------------------- | ------------------------------------------ | --------------- |
| **Vitest**                | Framework de testes (unidade + integração) | ^2.0.0          |
| **Supertest**             | Testes de API HTTP                         | ^7.0.0          |
| **mongodb-memory-server** | Banco de dados em memória para testes      | ^11.0.0         |
| **Vitest Coverage V8**    | Cobertura de código                        | (builtin)       |

**Justificativa:**

- **Vitest**: Já conhece, extremamente rápido, API compatível com Jest, suporte nativo a TypeScript
- **Supertest**: Padrão da indústria para testes de API Express, funciona tanto com JS quanto TS
- **mongodb-memory-server**: Permite testes de integração sem dependência de MongoDB externo

---

## 2. Partes Críticas para Testar (Prioridade)

### Prioridade 1 - Crítico (Testar primeiro)

| Módulo                    | Arquivo                              | Por que testar                                                         |
| ------------------------- | ------------------------------------ | ---------------------------------------------------------------------- |
| **Reconhecimento Facial** | `services/faceRecognitionService.js` | Algoritmo核心 do sistema - falhas comprometem toda a lógica biométrica |
| **Autenticação JWT**      | `config/jwtConfig.js`                | Segurança do sistema - tokens inválidos podem expor dados              |
| **Validação de Entrada**  | `middlewares/validation.js`          | Primeira linha de defesa contra dados maliciosos                       |
| **Utilitários de Senha**  | `utils/utils.js`                     | bcrypt é crítico para segurança das credenciais                        |

### Prioridade 2 - Importante

| Módulo                    | Arquivo                            | Por que testar                             |
| ------------------------- | ---------------------------------- | ------------------------------------------ |
| **Controller de Admin**   | `controllers/adminController.js`   | Login, registro, manipulação de permissões |
| **Controller de Usuário** | `controllers/usuarioController.js` | Cadastro e verificação facial              |
| **Modelo Admin**          | `models/Admin.js`                  | Validações de schema, índices únicos       |
| **Modelo Usuario**        | `models/Usuario.js`                | Estrutura de dados faciais                 |

### Prioridade 3 -nice to have

- Controllers de estatísticas
- Rotas ( testes de integração )
- Middleware de autenticação

---

## 3. Estrutura dos Testes

```
backend/
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   │   └── faceRecognitionService.test.js
│   │   ├── utils/
│   │   │   └── utils.test.js
│   │   ├── config/
│   │   │   └── jwtConfig.test.js
│   │   └── middlewares/
│   │       └── validation.test.js
│   │
│   ├── integration/
│   │   ├── controllers/
│   │   │   ├── adminController.test.js
│   │   │   └── usuarioController.test.js
│   │   └── routes/
│   │       └── api.test.js
│   │
│   ├── fixtures/
│   │   ├── descriptors.js      # Descriptors faciais de teste
│   │   ├── usuarios.js         # Dados de usuários mock
│   │   └── admins.js           # Dados de admins mock
│   │
│   ├── setup/
│   │   ├── global.js           # Configuração global Vitest
│   │   └── mongodb.js          # Setup MongoDB Memory Server
│   │
│   └── helpers/
│       └── mockRequest.js      # mocks de req/res/next
│
├── vitest.config.js            # Configuração do Vitest
└── package.json                # Scripts de teste
```

---

## 4. Estratégia de Testes por Módulo

### 4.1 FaceRecognitionService (CRÍTICO)

```javascript
// tests/unit/services/faceRecognitionService.test.js

describe("FaceRecognitionService", () => {
  let service;

  beforeEach(() => {
    service = new FaceRecognitionService();
  });

  describe("calcularSimilaridadeCossenos", () => {
    // Testar casos de borda
    // - Descriptors de mesmo rosto (similaridade ~0.98-1.0)
    // - Descriptors de rostos diferentes (similaridade < 0.90)
    // - Arrays de tamanhos diferentes
    // - Arrays vazios
    // - Valores zero/nulos
  });

  describe("encontrarUsuarioPorSimilaridade", () => {
    // Testar com banco mock
    // - Usuário encontrado com alta similaridade
    // - Usuário não encontrado
    // - Threshold variation
  });
});
```

**O que testar:**

| Cenário           | Input                      | Output Esperado |
| ----------------- | -------------------------- | --------------- |
| Mesmo rosto       | descriptor1 ~= descriptor2 | ~0.98+          |
| Rostos diferentes | descriptor1 ≠ descriptor2  | < 0.90          |
| Arrays diferentes | [1,2], [1,2,3]             | 0               |
| Arrays vazios     | [], []                     | 0               |
| Magnitude zero    | [0,0,0], [1,1,1]           | 0               |

### 4.2 JWT Config (CRÍTICO)

```javascript
// tests/unit/config/jwtConfig.test.js

describe("JWT Config", () => {
  describe("gerarAccessToken", () => {
    // Gerar token válido
    // Token contém payload correto
    // Expiração correta (1h)
  });

  describe("verificarAccessToken", () => {
    // Token válido retorna payload
    // Token expirado retorna null
    // Token inválido retorna null
  });

  describe("autenticarToken middleware", () => {
    // Token presente -> next()
    // Token ausente -> 401
    // Token inválido -> 403
  });
});
```

### 4.3 Validation Middleware (CRÍTICO)

```javascript
// tests/unit/middlewares/validation.test.js

describe("ValidationMiddleware", () => {
  const validation = new ValidationMiddleware();

  describe("validateLogin", () => {
    // Campos completos -> next()
    // Campos faltando -> 400
  });

  describe("validateCadastroUsuario", () => {
    // Dados válidos -> next()
    // Descriptor não array -> 400
    // Campos faltando -> 400
  });

  describe("validateVerificacaoRosto", () => {
    // Contexto válido: 'cadastro', 'verificacao', 'merenda'
    // Contexto inválido -> 400
  });

  describe("validateCadastroAdmin", () => {
    // Senha < 8 chars -> 400
    // Senha >= 8 chars -> next()
  });
});
```

### 4.4 Utils - Bcrypt (CRÍTICO)

```javascript
// tests/unit/utils/utils.test.js

describe("Utils", () => {
  describe("criptografarSenha", () => {
    // Senha hashada corretamente
    // Hash diferente a cada chamada (salt único)
    // Hash pode ser verificado com bcrypt.compare
  });

  describe("validarSenha", () => {
    // Senha correta retorna true
    // Senha incorreta retorna false
  });

  describe("validarFuncaoCadastrada", () => {
    // Funções válidas: admin, seguranca, super-admin
    // Função inválida retorna false
    // Case insensitive
  });
});
```

### 4.5 Controllers (IMPORTANTE)

Testar via **Supertest** com MongoDB Memory Server:

```javascript
// tests/integration/controllers/adminController.test.js

describe("AdminController (integração)", () => {
  let app;
  let adminModel;

  beforeAll(async () => {
    // Setup MongoDB Memory Server
    // Setup Express app injetando dependências
  });

  describe("POST /admin/login", () => {
    // Login bem-sucedido
    // Login senha incorreta (401)
    // Login usuário não existe (404)
  });

  describe("POST /admin/refresh-token", () => {
    // Refresh válido
    // Refresh expirado -> 403
  });
});
```

---

## 5. Compatibilidade JavaScript / TypeScript

Para garantir compatibilidade futura com TypeScript:

### 5.1 Estrutura de Arquivos

```
// Usar extensão .js para testes (compatível com ambos)
// Vitest detecta automaticamente

tests/
├── unit/
│   └── faceRecognitionService.test.js  ← Funciona em JS e TS
```

### 5.2 Configuração Vitest

```javascript
// vitest.config.js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    // Suporte a TypeScript via tsconfig
    deps: {
      inline: ["mongoose"], // Optional: inline se houver issues
    },
  },
});
```

### 5.3 Tipo de Dados para Descriptors

```javascript
// tests/fixtures/descriptors.js

// Descriptor válido de 128 números (mock do face-api.js)
export const descriptorValido = Array(128)
  .fill(0)
  .map(() => Math.random() * 2 - 1);

// Descriptor similar (mesma pessoa)
export const descriptorSimilar = descriptorValido.map((v) => v + (Math.random() * 0.02 - 0.01));

// Descriptor diferente (pessoa diferente)
export const descriptorDiferente = Array(128)
  .fill(0)
  .map(() => Math.random() * 2 - 1);
```

---

## 6. Scripts npm Sugeridos

```json
// backend/package.json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui"
  }
}
```

---

## 7. Instalação de Dependências

```bash
cd backend
pnpm add -D vitest @vitest/coverage-v8 supertest mongodb-memory-server
```

---

## 8. Próximos Passos Após Aprovação

1. Criar estrutura de pastas `tests/`
2. Configurar `vitest.config.js`
3. Criar fixtures (descriptors, usuários mock)
4. Implementar testes unitários do FaceRecognitionService
5. Implementar testes unitários do JWT Config
6. Implementar testes unitários de Validação
7. Implementar testes unitários de Utils
8. Implementar testes de integração dos Controllers
9. Executar testes e verificar coverage

---

## 9. Coverage Alvo Inicial

| Módulo                    | Coverage Desejado |
| ------------------------- | ----------------- |
| faceRecognitionService.js | 90%+              |
| jwtConfig.js              | 85%+              |
| validation.js             | 80%+              |
| utils.js                  | 85%+              |
| Controllers (unit)        | 70%+              |

**Total esperado: ~40-50% do codebase**, focado nas partes críticas.

---

## 10. Considerações Importantes

1. **Não testar dependências externas**: Não testar mongoose, express, bcrypt diretamente - confiar nos testes das bibliotecas
2. **Mocks**: Utilizar mocks apenas para dependências externas (face-api.js não existe no backend)
3. **Testes de integração**: Precisam de MongoDB em memória - configurar beforeAll/afterAll corretamente
4. **Isolamento**: Cada teste deve ser independente - limpar banco entre testes

---
