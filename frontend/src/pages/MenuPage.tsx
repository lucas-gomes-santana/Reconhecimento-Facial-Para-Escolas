import { Link } from "react-router-dom";
import { UserPlus, ScanFace, UtensilsCrossed, BarChart3, Settings, Shield } from "lucide-react";
import '../styles/index.css';

function MenuPage() {
  const menuItems = [
    {
      to: "/cadastro",
      icon: UserPlus,
      title: "Cadastro de Usuário",
      description: "Cadastre novos usuários no sistema"
    },
    {
      to: "/verificacao",
      icon: ScanFace,
      title: "Verificar Rosto",
      description: "Verifique o rosto de um usuário"
    },
    {
      to: "/verificacao-de-merenda",
      icon: UtensilsCrossed,
      title: "Verificação de Merenda",
      description: "Verifique a merenda de um usuário"
    },
    {
      to: "/estatisticas",
      icon: BarChart3,
      title: "Estatísticas",
      description: "Veja as estatísticas do sistema"
    },
    {
      to: "/gerenciar-usuarios",
      icon: Settings,
      title: "Gerenciamento",
      description: "Gerencie os usuários cadastrados no C.E.R.F"
    },
    {
      to: "/pagina-do-admin",
      icon: Shield,
      title: "Página dos ADMs",
      description: "Acesse a página dos administradores"
    }
  ];

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-5xl">
        {/* Header com Logo */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1E3A8A]">
            Bem vindo ao C.E.R.F
          </h1>
          <div className="w-14 h-14 bg-white border-2 border-[#1E3A8A] rounded-xl flex items-center justify-center">
            <ScanFace className="w-8 h-8 text-[#1E3A8A]" />
          </div>
        </div>

        {/* Título da Seção */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#1E3A8A]">
            O que você deseja fazer?
          </h2>
        </div>

        {/* Grid de Cards */}
        <nav className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.to}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-[#1E3A8A]/20 hover:border-[#1E3A8A]"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Ícone */}
                  <div className="w-16 h-16 bg-[#1E3A8A] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Título */}
                  <h3 className="text-lg font-semibold text-[#1E3A8A] mb-2">
                    {item.title}
                  </h3>
                  
                  {/* Descrição */}
                  <p className="text-sm text-gray-600">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </main>
  );
}

export default MenuPage;