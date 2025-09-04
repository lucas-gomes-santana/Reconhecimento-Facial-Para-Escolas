import { Link } from "react-router-dom";
import clsx from "clsx";
import '../styles/index.css';


const cardStyle = "group bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2.5 hover:shadow-xl border border-gray-100";
const divStyle = "w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mb-4 transition-all duration-300 group-hover:from-blue-500 group-hover:to-cyan-400";
const svgStyle = "w-8 h-8 md:w-10 md:h-10 text-blue-600 transition-all duration-300 group-hover:text-white";
const subtitleStyle = "text-lg font-medium text-gray-800 mb-2 transition-colors duration-300 group-hover:text-blue-600";
const paragraphStyle = "text-sm text-gray-600";


function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[100vh] bg-white py-8 px-4">

      {/* Logo + Título */}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-8 md:mb-12">
        <h1 className="text-gray-900 text-2xl md:text-3xl font-bold text-center">
          Bem vindo ao C.E.R.F
        </h1>
        <img
          className="w-24 md:w-32"
          src="https://www.svgrepo.com/show/337741/face-recognition.svg"
          alt="Logo do sistema C.E.R.F"
        />
      </div>

      {/* Seção de Ações */}
      <section className="bg-gray-200 p-6 md:p-8 rounded-2xl shadow-md max-w-4xl w-full">
        <h2 className="text-center text-purple-800 text-xl md:text-2xl font-semibold mb-8 md:mb-12 relative after:content-[''] after:block after:w-full after:h-1 after:bg-cyan-400 after:mt-4 after:rounded">
          O que você deseja fazer?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* Card Cadastro */}
          <Link
            to={"/cadastro"}
            className={clsx(cardStyle)}
          >
            <div className={clsx(divStyle)}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" viewBox="0 0 24 24" 
                stroke-width="1.5" 
                stroke="currentColor" 
                className={clsx(svgStyle)}
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
            </div>

            <h3 className={clsx(subtitleStyle)}>
              Cadastro
            </h3>
            <p className={clsx(paragraphStyle)}>
              Adicionar novos alunos, professores ou funcionários
            </p>
          </Link>

          {/* Card Verificação */}
          <Link
            to={"/verificacao"}
            className={clsx(cardStyle)}
          >
            <div className={clsx(divStyle)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 md:w-10 md:h-10 text-blue-600 transition-all duration-300 group-hover:text-white"
              >
                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
              </svg>
            </div>

            <h3 className={clsx(subtitleStyle)}>
              Verificar Rosto
            </h3>
            <p className={clsx(paragraphStyle)}>
              Verificar rostos existentes
            </p>
          </Link>

          {/* Card de Estatísticas */}
          <Link
            to={"/estatisticas"}
            className={clsx(cardStyle)}
          >
            <div className={clsx(divStyle)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={clsx(svgStyle)}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>

            <h3 className={clsx(subtitleStyle)}>
              Estatísticas
            </h3>
            <p className={clsx(paragraphStyle)}>
              Consultar quantidades de pessoas que interagiram com o sistema
            </p>

          </Link>

          {/* Card de Gerenciamento de Usuários */}
          <Link
            to={"/gerenciar-usuarios"}
            className={clsx(cardStyle)}
          >
            <div className={clsx(divStyle)}>
              <svg xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke-width="1.5" 
                stroke="currentColor" 
                className={clsx(svgStyle)}
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>

            </div>

            <h3 className={clsx(subtitleStyle)}>
              Gerenciamento
            </h3>
            <p className={clsx(paragraphStyle)}>
              Gerencie os usuários cadastrados no C.E.R.F
            </p>
          </Link>

        </div>

      </section>
      
    </main>
  );
}

export default HomePage;