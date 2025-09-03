import { Link } from "react-router-dom";
import clsx from "clsx";
import '../styles/index.css';


const cardStyle = "group bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2.5 hover:shadow-xl border border-gray-100";


function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[90vh] bg-white py-8 px-4">

      {/* Logo + Título */}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-8 md:mb-12">
        <h1 className="text-gray-900 text-2xl md:text-3xl font-bold text-center">
          Bem vindo ao C.E.R.F
        </h1>
        <img
          className="w-24 md:w-32"
          src="https://www.svgrepo.com/show/337741/face-recognition.svg"
          alt="Logo do sistema"
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
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mb-4 transition-all duration-300 group-hover:from-blue-500 group-hover:to-cyan-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 md:w-10 md:h-10 text-blue-600 transition-all duration-300 group-hover:text-white"
              >
                <path fillRule="evenodd" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6Zm-5.03 4.72a.75.75 0 0 0 0 1.06l1.72 1.72H2.25a.75.75 0 0 0 0 1.5h10.94l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 0 0-1.06 0Z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2 transition-colors duration-300 group-hover:text-blue-600">
              Cadastro
            </h3>
            <p className="text-sm text-gray-600">
              Adicionar novos alunos, professores ou funcionários
            </p>
          </Link>

          {/* Card Verificação */}
          <Link
            to={"/verificacao"}
            className={clsx(cardStyle)}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mb-4 transition-all duration-300 group-hover:from-blue-500 group-hover:to-cyan-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 md:w-10 md:h-10 text-blue-600 transition-all duration-300 group-hover:text-white"
              >
                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2 transition-colors duration-300 group-hover:text-blue-600">
              Verificar Rosto
            </h3>
            <p className="text-sm text-gray-600">
              Verificar rostos existentes
            </p>
          </Link>

          {/* Card de Estatísticas */}
          <Link
            to={"/estatisticas"}
            className={clsx(cardStyle)}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mb-4 transition-all duration-300 group-hover:from-blue-500 group-hover:to-cyan-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 md:w-10 md:h-10 text-blue-600 transition-all duration-300 group-hover:text-white"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>

            <h3 className="text-lg font-medium text-gray-800 mb-2 transition-colors duration-300 group-hover:text-blue-600">
              Estatísticas
            </h3>
            <p className="text-sm text-gray-600">
              Consultar quantidades de pessoas que interagiram com o sistema
            </p>

          </Link>

        </div>

      </section>
      
    </main>
  );
}

export default HomePage;