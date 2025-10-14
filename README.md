# Projeto C.E.R.F (Cadastro Escolar com Reconhecimento Facial)

### Descrição

Bem vindo ao repositório do projeto C.E.R.F. Um projeto dedicado para a Feira de Ciências 2025 do CETEP de Ipirá, Bahia. Embora seja de propósito acadêmico, existe a intenção de escalá-lo para torná-lo pronto para uso em cenários reais das instituições acadêmicas.

O objetivo do C.E.R.F é reforçar a segurança das escolas, através do uso de um sistema web que faz cadastro de alunos, professores e outras pessoas que frequentam instalações de caráter escolar. Com a funcionalidade de cadastro biométrico facial, ao invés de usar senhas convencionais.

Com a funcionalidade de reconhecimento facial do C.E.R.F, buscamos controlar o fluxo de entrada de indivíduos em escolas, permitindo quem entra e barrando acesso não autorizado dentro da unidade escolar, utilizando o reconhecimento facial para verificar se o rosto escaneado foi cadastro anteriormente no sistema ou não. Dessa forma, o C.E.R.F ajudará a portaria das escolas a não permitir que pessoas que não fazem parte da unidade escolar entrarem, criando assim um ambiente de segurança entre os alunos, professores e outros integrantes da escola que possuirá o sistema C.E.R.F em atividade.

****

### Ferramentas Usadas

- React Vite + TailwindCSS (front-end)

- NodeJs (back-end)

- MongoDB (banco de dados)

- Git e GitHub (versionamento de código e salvamento em nuvem respectivamente)

****

### Como Executar o Projeto

**OBS:** Como o C.E.R.F não se encontra em produção no atual momento, só se pode interagir com projeto executando ele no seu computador. Para isso, é necessário que você tenha instalado o framework Javascript NodeJs e o MongoDB em sua máquina. Recomendável ter também instalado o Git caso queira fazer clone do projeto.

<br>

1. Baixe o arquivo .zip deste repositório ou faça fork e clone usando:

   ```bash
   https://github.com/lucas-gomes-santana/Reconhecimento-Facial-Para-Escolas.git
   ```

<br>

2. Instale o gerenciador de pacotes pnpm. Pois este mesmo foi o gerenciador usado neste projeto:

   ```bash
   npm install -g pnpm
   ```

<br>

3. Instale as dependências necessárias usando este comando dentro das pastas **front-end** e **back-end**:

   ```bash
   pnpm install
   ```

   O pnpm irá detectar automaticamente as bibliotecas usadas na aplicação lendo os arquivos **package-json** presentes em ambos os diretórios citados

<br>

4. Execute o projeto:


   Começando pelo back-end:

   ```bash
   cd backend && node server.js
   ```

   E execute o front-end React:

   ```bash
   cd frontend && pnpm dev
   ```

   Copie e cole o link gerado no **front-end** na barra de endereços do seu navegador:

   ```bash
   http://localhost:5173/
   ```

   OBS: Use esses comandos pelo terminal do seu sistema operacional, como o CMD do Windows, dentro da pasta da aplicação.

****

### Avisos Finais

O projeto está licenciado pela licença CC BY-NC-ND 4.0(Attribution-NonCommercial-NoDerivatives 4.0 International) da Creative Commons. Não está autorizado o uso dele para fins comerciais. Apenas compartilhamento sem modificações e com atribuição ao autor original.

Caso tenha disponibilidade. leia o artigo feito a respeito do projeto para mais informações e analise os diagramas disponíveis na pasta **docs**.
