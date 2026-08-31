export const formatarFuncao = (funcao: string): string => {
  switch (funcao.toLowerCase()) {
    case "admin":
      return "Administrador";
    case "seguranca":
    case "segurança":
      return "Segurança";
    case "super-admin":
      return "Super Admin";
    case "desenvolvedor":
      return "Desenvolvedor";
    default:
      return funcao;
  }
};

export const getTipoAdminColor = (tipo: string): string => {
  switch (tipo.toLowerCase()) {
    case "admin":
      return "bg-purple-100 text-purple-800 border border-purple-200";
    case "seguranca":
    case "segurança":
      return "bg-red-100 text-red-800 border border-red-200";
    case "super-admin":
      return "bg-green-100 text-green-800 border border-green-200";
    case "desenvolvedor":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};

export const getTipoUsuarioColor = (tipo: string): string => {
  switch (tipo.toLowerCase()) {
    case "professor":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "aluno":
      return "bg-green-100 text-green-800 border border-green-200";
    case "funcionário":
    case "funcionario":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};
