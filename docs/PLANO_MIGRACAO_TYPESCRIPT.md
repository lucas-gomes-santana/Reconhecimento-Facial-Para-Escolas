# Plano de Migração: JavaScript → TypeScript (Backend)

## Objetivo

Migrar incrementalmente o backend de JavaScript para TypeScript, começando pelas partes menos críticas e progredindo até as mais essenciais, mantendo JS e TS coexistindo até a conclusão.

## Pré-requisitos (já instalados)

| Dependência | Versão |
|---|---|
| `typescript` | ^6.0.3 |
| `ts-node` | ^10.9.2 |
| `@types/node` | ^25.9.1 |
| `@types/express` | ^5.0.6 |

**Pendente (necessário para dev workflow):**
```bash
cd backend && pnpm add -D tsx
```

> `tsx` é recomendado sobre `ts-node` por ter melhor suporte a ESM (`type: "module"`) e ser mais rápido no modo watch. Permite rodar `.ts` e `.js` misturados sem build step.

---

## Estratégia Geral

```
  1. Models Novos (mobile)    ← menos crítico
  2. Estatísticas (completo)
  3. Config + Utils
  4. Segurança (middleware/JWT)
  5. Core Business (services/controllers)
  6. Rotas + Models Core + Entry Point   ← mais crítico
```

### Regras da Migração

1. **Arquivos .ts importam .js sem problemas** — com `allowJs: true`, o TS compiler enxerga os .js existentes.
2. **Arquivos .js importam .ts via compilação** — o output `dist/` contém ambos, ou usa-se `tsx` para rodar diretamente.
3. **Workflow durante a migração:** `tsx watch server.ts` (roda tudo, JS + TS).
4. **Não mudar imports em arquivos não-migrados** — a extensão `.js` nos imports continua funcionando (TS com `module: nodenext` resolve `.ts` a partir de `.js`).
5. **Cada fase gera um PR/MR** — testar antes de avançar.

---

## Fase 0 — Configuração Inicial

### 0.1 Ajustar `tsconfig.json`

```jsonc
{
  "compilerOptions": {
    // File Layout
    "rootDir": ".",
    "outDir": "./dist",

    // Environment
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "target": "esnext",
    "lib": ["esnext"],
    "types": ["node"],

    // Output
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,

    // Strict — false durante migração, true ao final
    "strict": false,

    // Critical for coexistence
    "allowJs": true,
    "checkJs": false,

    // Style
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": false,  // desligado durante migração
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "skipLibCheck": true,
    "noEmit": false
  },
  "include": ["./**/*.ts", "./**/*.js"],
  "exclude": ["node_modules", "dist", "coverage"]
}
```

### 0.2 Atualizar `package.json`

```jsonc
{
  "scripts": {
    // Dev — roda tsx com suporte a JS + TS
    "dev": "tsx watch server.js",
    "dev:ts": "tsx watch src/server.ts",  // usar quando server.js for migrado

    // Build
    "build": "tsc",
    "start": "node dist/server.js",

    // Testes (já configurados com Vitest — funcionam com .ts nativamente)
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch"
  }
}
```

### 0.3 Atualizar `vitest.config.js`

```javascript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.{js,ts}"],      // ← aceita .ts agora
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "services/**/*.{js,ts}",
        "utils/**/*.{js,ts}",
        "config/**/*.{js,ts}",
        "middlewares/**/*.{js,ts}",
        "controllers/**/*.{js,ts}",
      ],
    },
    deps: {
      inline: ["mongoose"],
    },
    globals: true,
  },
});
```

### 0.4 Adicionar `dist/` ao `.eslintignore`

```
dist/
```

---

## Fase 1 — Modelos Novos (Menos Críticos)

**Justificativa:** São os módulos adicionados recentemente para o app mobile (responsáveis, vínculos, matrículas, logs de entrada). Não afetam o fluxo principal de reconhecimento facial.

**Dependências:** Nenhuma interna (só `mongoose`).

### Arquivos a migrar

| .js (original) | → .ts (novo) | Dependências |
|---|---|---|
| `models/Responsavel.js` | `models/Responsavel.ts` | mongoose, bcrypt |
| `models/Vinculo.js` | `models/Vinculo.ts` | mongoose |
| `models/AlunoMatricula.js` | `models/AlunoMatricula.ts` | mongoose |
| `models/LogEntrada.js` | `models/LogEntrada.ts` | mongoose |

### Tipos a criar

```typescript
// models/Responsavel.ts
export interface IResponsavel {
  nomeCompleto: string;
  parentesco: "Pai" | "Mãe" | "Tio" | "Avô" | "Outro";
  cpf: string;
  telefone: string;
  email: string;
  senha: string;
}

// models/Vinculo.ts
export interface IVinculo {
  responsavelId: Types.ObjectId;
  alunoMatriculaId: Types.ObjectId;
}

// models/AlunoMatricula.ts
export interface IAlunoMatricula {
  matricula: string;
  cpf: string;
  nomeCompleto: string;
  turma: string;
  turno: "Matutino" | "Vespertino" | "Noturno";
  usuarioId?: Types.ObjectId;
}

// models/LogEntrada.ts
export interface ILogEntrada {
  usuarioId: Types.ObjectId;
  alunoMatriculaId?: Types.ObjectId;
  tipo: "entrada" | "saida" | "merenda";
  timestamp: Date;
  similaridade: number;
}
```

### Tipo compartilhado (descriptor)

```typescript
// types/descriptor.ts (novo)
export type Descriptor = number[];  // Array de 128 números
```

### Como testar

```bash
pnpm test:run  # testes existentes em .js continuam passando
pnpm dev       # servidor roda com .js + .ts
```

---

## Fase 2 — Estatísticas (Baixa Criticalidade)

**Justificativa:** O módulo de estatísticas e relatórios não impacta a autenticação nem o reconhecimento facial. Pode ser migrado independentemente.

### Dependências do módulo

```
models/Estatistica.js  → mongoose
routes/estatisticaRoutes.js → config/jwtConfig, models/Estatistica, models/Usuario, controllers/estatisticaController
controllers/estatisticaController.js → (DI — nenhuma dep interna direta)
```

### Arquivos a migrar

| .js → .ts | Ordem |
|---|---|
| `models/Estatistica.ts` | 1º (sem deps) |
| `controllers/estatisticaController.ts` | 2º |
| `routes/estatisticaRoutes.ts` | 3º |

### Interface

```typescript
// models/Estatistica.ts
export interface IEstatistica {
  totalVerificacoes: number;
  totalEntradas: number;
  totalMerendas: number;
  ultimaAtualizacao: Date;
}
```

---

## Fase 3 — Config e Utilitários (Média Criticalidade)

**Justificativa:** Utilitários e configurações são partes isoladas que não contêm lógica de negócio. Migrá-los cedo permite que as fases seguintes usem tipos.

### Dependências

```
config/database.js    → mongoose
config/corsConfig.js  → cors
config/seedAlunos.js  → models/AlunoMatricula  (já migrado na Fase 1)
utils/utils.js        → bcrypt
```

### Arquivos a migrar

| .js → .ts | Observação |
|---|---|
| `config/database.ts` | Interface para config DB |
| `config/corsConfig.ts` | Tipagem do cors options |
| `config/seedAlunos.ts` | Já importa AlunoMatricula (TS na Fase 1) |
| `utils/utils.ts` | Tipar parâmetros e retornos |

### Interfaces

```typescript
// config/database.ts
export interface DatabaseConfig {
  connect(): Promise<void>;
}

// utils/utils.ts
export type FuncaoAdmin = "admin" | "seguranca" | "super-admin" | "desenvolvedor";

export function validarFuncaoCadastrada(funcao: string): funcao is FuncaoAdmin;
export function criptografarSenha(senha: string): Promise<string>;
export function validarSenha(senha: string, hash: string): Promise<boolean>;
```

---

## Fase 4 — Segurança (Alta Criticalidade)

**Justificativa:** JWT, validação de entrada e autenticação são camadas de segurança. Devem ser migradas *antes* dos módulos de negócio que dependem delas, para que os controllers e rotas já possam consumir tipos seguros.

### Dependências

```
config/jwtConfig.js         → jsonwebtoken
middlewares/validation.js    → (nenhuma)
middlewares/authResponsavel.js → jsonwebtoken
```

### Arquivos a migrar

| .js → .ts | Observação |
|---|---|
| `config/jwtConfig.ts` | Tipar tokens, payloads, cookies |
| `middlewares/validation.ts` | Tipar req/res/next |
| `middlewares/authResponsavel.ts` | Tipar req com usuário |

### Interfaces

```typescript
// config/jwtConfig.ts
export interface TokenPayload {
  id: string;
  nome: string;
  funcao: string;
}

export interface AuthRequest extends Request {
  usuario?: TokenPayload;
}

// middlewares/validation.ts
export class ValidationMiddleware {
  validateLogin(req: Request, res: Response, next: NextFunction): void;
  validateCadastroUsuario(req: Request, res: Response, next: NextFunction): void;
  validateVerificacaoRosto(req: Request, res: Response, next: NextFunction): void;
  validateCadastroAdmin(req: Request, res: Response, next: NextFunction): void;
  validateId(req: Request, res: Response, next: NextFunction): void;
  validateIdParam(req: Request, res: Response, next: NextFunction): void;
  validateMudancaDeSenha(req: Request, res: Response, next: NextFunction): void;
}
```

---

## Fase 5 — Core Business (Muito Alta Criticalidade)

**Justificativa:** Serviço de reconhecimento facial e controllers principais. Esta fase lida com o algoritmo biométrico e a lógica de negócio central.

### Dependências

```
services/faceRecognitionService.js → models/Usuario (ainda .js, migrado na Fase 6)
controllers/adminController.js     → config/jwtConfig (TS Fase 4), utils/utils (TS Fase 3)
controllers/usuarioController.js   → models/Usuario (.js), models/LogEntrada (TS Fase 1), models/AlunoMatricula (TS Fase 1)
controllers/logEntradaController.js → (DI)
controllers/responsavelController.js → models/Responsavel (TS Fase 1), models/Vinculo (TS Fase 1), config/jwtConfig (TS Fase 4)
```

### Arquivos a migrar

| .js → .ts | Ordem |
|---|---|
| `services/faceRecognitionService.ts` | 1º (depende só de Usuario model, que ainda é .js → `allowJs` resolve) |
| `controllers/adminController.ts` | 2º |
| `controllers/usuarioController.ts` | 3º |
| `controllers/logEntradaController.ts` | 4º |
| `controllers/responsavelController.ts` | 5º |

### Interface

```typescript
// services/faceRecognitionService.ts
export class FaceRecognitionService {
  calcularSimilaridadeCossenos(
    descriptor1: number[],
    descriptor2: number[]
  ): number;

  encontrarUsuarioPorSimilaridade(
    descriptorBusca: number[],
    threshold?: number
  ): Promise<{ usuario: IUsuario; similaridade: number } | null>;

  verificarRostoExistente(
    descriptor: number[],
    threshold?: number
  ): Promise<boolean>;
}
```

---

## Fase 6 — Rotas, Models Core e Entry Point (Crítico)

**Justificativa:** Última fase porque envolve os models fundamentais (Admin, Usuario) e o ponto de entrada da aplicação (server.js). Tudo depende deles, então devem ser os últimos a mudar para evitar conflitos.

### Dependências

```
models/Admin.js       → mongoose
models/Usuario.js     → mongoose
routes/adminRoutes.js → controllers/adminController (TS Fase 5), config/jwtConfig (TS Fase 4), middlewares/validation (TS Fase 4), models/Admin (TS)
routes/usuarioRoutes.js → controllers/usuarioController (TS Fase 5), config/jwtConfig (TS Fase 4), middlewares/validation (TS Fase 4), services/faceRecognitionService (TS Fase 5), models/Estatistica (TS Fase 2)
server.js              → TUDO (último)
```

### Arquivos a migrar (ordem)

| # | .js → .ts | Motivo |
|---|---|---|
| 1 | `models/Admin.ts` | Sem dependências internas |
| 2 | `models/Usuario.ts` | Sem dependências internas |
| 3 | `routes/adminRoutes.ts` | Depende de Admin, jwtConfig, validation — todos TS |
| 4 | `routes/usuarioRoutes.ts` | Depende de Usuario, jwtConfig, validation, faceRecognitionService — todos TS |
| 5 | `routes/logEntradaRoutes.ts` | Depende de LogEntradaController (TS Fase 5) |
| 6 | `routes/responsavelRoutes.ts` | Depende de ResponsavelController (TS Fase 5) |
| 7 | **`server.ts`** | Último — entry point |

---

## Fase 7 — Finalização

Após todas as fases concluídas:

### 7.1 Limpeza

```bash
# Remover arquivos .js originais (já migrados)
find . -name "*.js" ! -path "./node_modules/*" ! -path "./dist/*" ! -path "./tests/*" ! -path "./coverage/*" -delete
```

> **Importante:** Manter os arquivos `.js` de teste (`tests/**/*.test.js`) como estão. Eles podem ser migrados para `.ts` opcionalmente depois.

### 7.2 Ajustar tsconfig.json

```jsonc
{
  "compilerOptions": {
    "allowJs": false,        // ← desligar — só .ts agora
    "checkJs": false,
    "strict": true,          // ← ligar — tipo seguro completo
    "exactOptionalPropertyTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 7.3 Atualizar scripts do package.json

```jsonc
{
  "scripts": {
    "dev": "tsx watch server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### 7.4 Migrar testes (opcional)

Os testes em `.js` funcionam com Vitest mesmo após a migração. A migração para `.ts` é opcional e pode ser feita separadamente:

```bash
tests/**/*.test.js → tests/**/*.test.ts
```

### 7.5 Remover dependências dev desnecessárias

```bash
pnpm remove ts-node  # se tsx substituiu
```

---

## Mapa de Dependências entre Fases

```
Fase 1 ──► Fase 2 ──► Fase 3 ──► Fase 4 ──► Fase 5 ──► Fase 6 ──► Fase 7
  │                    │            │            │            │
  ▼                    ▼            ▼            ▼            ▼
Models           Config        Segurança    Core Bus.    Rotas + Entry
(Mobile)         + Utils       (JWT,        (Service,    (Admin, User,
  │                            Validação)   Controllers)  server.js)
  ▼
Seed Alunos
```

**Observação:** A Fase 5 (faceRecognitionService) importa `models/Usuario.js` que ainda será .js até a Fase 6. Com `allowJs: true`, isso funciona — o TypeScript infere tipos básicos do JS. Para melhor experiência, pode-se criar um arquivo de tipos temporário:

```typescript
// types/global.d.ts (temporário — removido na Fase 7)
declare module "../models/Usuario.js" {
  import { Model, Document } from "mongoose";
  interface IUsuario extends Document {
    nome: string;
    tipoUsuario: string;
    descriptor: number[];
    status: string;
    bloqueadoAte: Date | null;
  }
  const Usuario: Model<IUsuario>;
  export default Usuario;
}
```

---

## Checklist por Fase

### Fase 0 ☐
- [ ] Instalar `tsx`
- [ ] Ajustar `tsconfig.json`
- [ ] Atualizar `package.json` scripts
- [ ] Atualizar `vitest.config.js` (include .ts)
- [ ] Adicionar `dist/` ao `.eslintignore`
- [ ] Rodar `pnpm dev` e verificar que funciona

### Fase 1 ☐
- [ ] Migrar `models/Responsavel.js` → `.ts`
- [ ] Migrar `models/Vinculo.js` → `.ts`
- [ ] Migrar `models/AlunoMatricula.js` → `.ts`
- [ ] Migrar `models/LogEntrada.js` → `.ts`
- [ ] Rodar testes existentes

### Fase 2 ☐
- [ ] Migrar `models/Estatistica.js` → `.ts`
- [ ] Migrar `controllers/estatisticaController.js` → `.ts`
- [ ] Migrar `routes/estatisticaRoutes.js` → `.ts`
- [ ] Rodar testes

### Fase 3 ☐
- [ ] Migrar `config/database.js` → `.ts`
- [ ] Migrar `config/corsConfig.js` → `.ts`
- [ ] Migrar `config/seedAlunos.js` → `.ts`
- [ ] Migrar `utils/utils.js` → `.ts`
- [ ] Rodar testes

### Fase 4 ☐
- [ ] Migrar `config/jwtConfig.js` → `.ts`
- [ ] Migrar `middlewares/validation.js` → `.ts`
- [ ] Migrar `middlewares/authResponsavel.js` → `.ts`
- [ ] Rodar testes

### Fase 5 ☐
- [ ] Migrar `services/faceRecognitionService.js` → `.ts`
- [ ] Migrar `controllers/adminController.js` → `.ts`
- [ ] Migrar `controllers/usuarioController.js` → `.ts`
- [ ] Migrar `controllers/logEntradaController.js` → `.ts`
- [ ] Migrar `controllers/responsavelController.js` → `.ts`
- [ ] Rodar testes

### Fase 6 ☐
- [ ] Migrar `models/Admin.js` → `.ts`
- [ ] Migrar `models/Usuario.js` → `.ts`
- [ ] Migrar `routes/adminRoutes.js` → `.ts`
- [ ] Migrar `routes/usuarioRoutes.js` → `.ts`
- [ ] Migrar `routes/logEntradaRoutes.js` → `.ts`
- [ ] Migrar `routes/responsavelRoutes.js` → `.ts`
- [ ] Migrar `server.js` → `server.ts`
- [ ] Rodar testes completos

### Fase 7 ☐
- [ ] Remover arquivos .js originais
- [ ] Ajustar `tsconfig.json` (strict: true, allowJs: false)
- [ ] Atualizar scripts finais
- [ ] Rodar build de produção (`pnpm build`)
- [ ] Rodar testes (`pnpm test:run`)

---

## Referências

- [Estratégia de Testes](./ESTRATEGIA_TESTES_BACKEND.md) — alinhamento de prioridades
- [Arquitetura](./ARQUITETURA.md) — visão geral do sistema
- [AGENTS.md](../AGENTS.md) — comandos e estrutura
- [README.md](../README.md) — guia de execução
