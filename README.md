# Projeto C.E.R.F (Cadastro Escolar com Reconhecimento Facial)

### Descrição

Bem vindo ao repositório do projeto C.E.R.F. Um projeto dedicado para a Feira de Ciências 2025 do CETEP de Ipirá, Bahia. Embora seja de propósito acadêmico, existe a intenção de escalá-lo para torná-lo pronto para uso em cenários reais das instituições acadêmicas.

O objetivo do C.E.R.F é reforçar a segurança das escolas, através do uso de um sistema web que faz cadastro de alunos, professores e outras pessoas que frequentam instalações de caráter escolar. Com a funcionalidade de cadastro biométrico facial, ao invés de usar senhas convencionais.

Com a funcionalidade de reconhecimento facial do C.E.R.F, buscamos controlar o fluxo de entrada de indivíduos em escolas, permitindo quem entra e barrando acesso não autorizado dentro da unidade escolar, utilizando o reconhecimento facial para verificar se o rosto escaneado foi cadastro anteriormente no sistema ou não. Dessa forma, o C.E.R.F ajudará a portaria das escolas a não permitir que pessoas que não fazem parte da unidade escolar entrarem, criando assim um ambiente de segurança entre os alunos, professores e outros integrantes da escola que possuirá o sistema C.E.R.F em atividade.

O sistema C.E.R.F possui também um aplicativo mobile em desenvolvimento, integrado ao backend deste projeto. No app, os responsáveis dos alunos fazem o monitoramento dos mesmos na escola, observando os horários de entrada e retirada de merenda do aluno. Código fonte e documentação são privados no momento, mas serão liberados em breve.

---

### Ferramentas Usadas

- React Vite + TailwindCSS (front-end)

- NodeJs + Express (back-end)

- MongoDB (banco de dados)

- Git e GitHub (versionamento de código e salvamento em nuvem respectivamente)

---

### Como Executar o Projeto

Como o sistema C.E.R.F não está em produção, só é possível interagir com projeto executando ele no seu computador. Para isso, é necessário que você tenha instalado o Git, NodeJs, npm, pnpm e o MongoDB em sua máquina.

Os comandos abaixo devem ser executados no Git Bash se você estiver no Windows ou no terminal padrão do seu sistema se estiver no Linux ou MacOs.
<br>

1. Faça fork e clone usando:

   ```bash
   git clone https://github.com/lucas-gomes-santana/Reconhecimento-Facial-Para-Escolas.git
   ```

   OBS: Pode baixar também o projeto comprimido como .zip

<br>

2. Instale o gerenciador de pacotes pnpm caso não tenha. Pois este foi o gerenciador usado neste projeto:

   ```bash
   npm install -g pnpm
   ```

<br>

3. Execute esses comandos de instalação das dependências nas pastas **frontend** e **backend**:

   ```bash
   cd frontend && pnpm install
   ```

   ```bash
   cd backend && pnpm install
   ```

   <br>

4. Execute esses comandos para rodar o projeto novamente em ambas as pastas:

**Em backend:**

```bash
node server.ts
```

**Em frontend:**

```bash
pnpm dev
```

Copie e cole o link gerado no **frontend** na barra de endereços do seu navegador:

```bash
http://localhost:5173/
```

**Login padrão (sem `.env`):** usuário `admin`, senha `admin` — criado automaticamente no boot. Pode ser sobrescrito pelas variáveis `DEV_USER_NOME` e `DEV_USER_SENHA` em `backend/.env`.

**OBS:** usuários de Linux e Mac podem executar todos os processos acima através dos scripts bash da pasta **scripts**. Para build de produção: `cd frontend && pnpm build` e `cd backend && pnpm build` (gera `dist/`).

---

### Testes (Vitest)

Os testes usam **Vitest** e `mongodb-memory-server` (backend sem depender de MongoDB local).

**Backend** (`cd backend`):

```bash
pnpm test          # watch mode
pnpm test:run      # executa uma única vez
pnpm test:coverage # executa com relatório de cobertura
```

**Frontend** (`cd frontend`):

```bash
pnpm test          # watch mode
pnpm test:run      # executa uma única vez
```

---

### Aplicativo Mobile

O C.E.R.F também possui um **aplicativo mobile** em desenvolvimento para os responsáveis dos alunos, que consome diretamente este backend em `http://localhost:3000/api`:

- Rotas de responsáveis: `/api/responsaveis/*` (cadastro, login, vincular matrícula, entradas e merenda dos filhos)
- Rotas de logs: `/api/logs/*` (histórico de entrada/saída/merenda)

O código-fonte e a documentação detalhada do app estão no repositório do aplicativo mobile.

---

### Avisos finais

Este projeto NÃO é uma iniciativa open-source e está protegido por direitos autorais.

Para mais informações, consulte **LICENSE** e o resto da documentação na pasta **docs**.

Comandos de instalação de dependências não são permitidos na raiz do projeto. Apenas em **frontend** e **backend**.
