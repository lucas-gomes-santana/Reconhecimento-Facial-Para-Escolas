export interface AdminData {
  _id: string;
  nome: string;
  funcao: "admin" | "seguranca" | "super-admin" | "desenvolvedor";
  dataCadastro: string;
}

export interface AdminSign {
  nome: string;
  senha: string;
  funcao: string;
}
