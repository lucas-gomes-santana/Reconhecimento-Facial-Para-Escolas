# Projeto C.E.R.F (Cadastro Escolar com Reconhecimento Facial)

### Descrição

Bem vindo ao repositório do projeto C.E.R.F. Um projeto dedicado para a Feira de Ciências 2025 do CETEP de Ipirá, Bahia. Embora seja de propósito acadêmico, existe a intenção de escalá-lo para torná-lo pronto para uso em cenários reais das instituições acadêmicas.

O objetivo do C.E.R.F é reforçar a segurança das escolas, através do uso de um sistema web que faz cadastro de alunos, professores e outras pessoas que frequentam instalações de caráter escolar. Com a funcionalidade de cadastro biométrico facial, ao invés de usar senhas convencionais.

Com a funcionalidade de reconhecimento facial do C.E.R.F, buscamos controlar o fluxo de entrada de indivíduos em escolas, permitindo quem entra e barrando acesso não autorizado dentro da unidade escolar, utilizando o reconhecimento facial para verificar se o rosto escaneado foi cadastro anteriormente no sistema ou não. Dessa forma, o C.E.R.F ajudará a portaria das escolas a não permitir que pessoas que não fazem parte da unidade escolar entrarem, criando assim um ambiente de segurança entre os alunos, professores e outros integrantes da escola que possuirá o sistema C.E.R.F em atividade.

O sistema C.E.R.F agora possui também um aplicativo mobile em desenvolvimento que está sendo integrado com o backend do projeto. No app, os responsáveis dos alunos podem fazer monitoramento dos mesmos na escola, observando os horários de entrada e retirada de merenda do aluno. Código fonte e documentação serão liberadas em breve.

---

### Ferramentas Usadas

- React Vite + TailwindCSS (front-end)

- NodeJs + Express (back-end)

- MongoDB (banco de dados)

- Git e GitHub (versionamento de código e salvamento em nuvem respectivamente)

---

### Como Executar o Projeto

Como o C.E.R.F não está em produção, só se pode interagir com projeto executando ele no seu computador. Para isso, é necessário que você tenha instalado o Git, NodeJs, npm, pnpm e o MongoDB em sua máquina.

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

3. Execute o script de instalação das dependências nas pastas **front-end** e **back-end**:

   ```bash
   ./scripts/setup.sh
   ```

   <br>

4. Execute o script para rodar o projeto:

   ```bash
   ./scripts/dev.sh
   ```

   Copie e cole o link gerado no **front-end** na barra de endereços do seu navegador:

   ```bash
   http://localhost:5173/
   ```

---

### Avisos finais

Este projeto NÃO é uma iniciativa open-source e está protegido por direitos autorais.

Para mais informações, consulte **LICENSE** e o resto da documentação na pasta **docs**.
