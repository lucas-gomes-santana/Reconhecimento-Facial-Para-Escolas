import { Link } from "react-router-dom";
import {
  UserPlus,
  ScanFace,
  UtensilsCrossed,
  BarChart3,
  Settings,
  Shield,
  Info,
} from "lucide-react";
import "../styles/index.css";

function MenuPage() {
  const menuItems = [
    {
      to: "/cadastro",
      icon: UserPlus,
      title: "Cadastro de Usuário",
      description: "Cadastre novos usuários no sistema",
    },
    {
      to: "/verificacao",
      icon: ScanFace,
      title: "Verificar Rosto",
      description: "Verifique o rosto de um usuário",
    },
    {
      to: "/verificacao-de-merenda",
      icon: UtensilsCrossed,
      title: "Verificação de Merenda",
      description: "Verifique a merenda de um usuário",
    },
    {
      to: "/estatisticas",
      icon: BarChart3,
      title: "Estatísticas",
      description: "Veja as estatísticas do sistema",
    },
    {
      to: "/gerenciar-usuarios",
      icon: Settings,
      title: "Gerenciamento",
      description: "Gerencie os usuários cadastrados no C.E.R.F",
    },
    {
      to: "/pagina-do-admin",
      icon: Shield,
      title: "Página dos ADMs",
      description: "Acesse a página dos administradores",
    },
    {
      to: "/sobre",
      icon: Info,
      title: "Sobre o Projeto",
      description: "Informações sobre o C.E.R.F e desenvolvedores",
    },
  ];

  return (
    <main className="cerf-scan-bg min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-5xl">
        {/* Header com Logo */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <h1 className="cerf-heading-on-dark text-3xl md:text-4xl">Bem vindo ao C.E.R.F</h1>
          <div className="cerf-icon-badge w-14 h-14">
            <ScanFace className="w-8 h-8" />
          </div>
        </div>

        {/* Título da Seção */}
        <div className="text-center mb-10">
          <h2 className="cerf-heading-on-dark text-2xl md:text-3xl font-semibold">
            O que você deseja fazer?
          </h2>
        </div>

        {/* Grid de Cards */}
        <nav className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={index} to={item.to} className="cerf-card group p-6">
                <div className="flex flex-col items-center text-center">
                  {/* Ícone */}
                  <div className="cerf-card-icon w-16 h-16 flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8" />
                  </div>

                  {/* Título */}
                  <h3 className="cerf-heading-on-dark text-lg mb-2">{item.title}</h3>

                  {/* Descrição */}
                  <p className="cerf-subtext-on-dark text-sm">{item.description}</p>
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
